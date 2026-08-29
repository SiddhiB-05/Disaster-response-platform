#!/usr/bin/env bash
set -e

# ==============================================================================
# Automated Deployment Script for Disaster Response Platform on AWS (Bash/Linux/Mac)
# ==============================================================================

AWS_REGION="${AWS_REGION:-ap-south-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
PROJECT_NAME="${PROJECT_NAME:-disaster-response-platform}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$ROOT_DIR/terraform"

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;36m 🚀 AWS Terraform Deployment: $PROJECT_NAME ($ENVIRONMENT)\033[0m"
echo -e "\033[1;36m========================================================\033[0m"

# 1. Check Prerequisites
echo -e "\n\033[1;33m[1/5] Checking prerequisites...\033[0m"
command -v aws >/dev/null 2>&1 || { echo >&2 "AWS CLI is required but not installed. Aborting."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo >&2 "Terraform is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "\033[1;32m✓ AWS Account ID: $AWS_ACCOUNT_ID (Region: $AWS_REGION)\033[0m"

# 2. Terraform Init & ECR Target Creation
echo -e "\n\033[1;33m[2/5] Initializing Terraform and preparing ECR repositories...\033[0m"
cd "$TERRAFORM_DIR"
terraform init

terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend -auto-approve

ECR_BACKEND_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend"
ECR_FRONTEND_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-frontend"

# 3. Docker Login & Build/Push
echo -e "\n\033[1;33m[3/5] Authenticating Docker with Amazon ECR...\033[0m"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo -e "\n\033[1;33mBuilding & Pushing Backend Docker Image...\033[0m"
docker build -t "$ECR_BACKEND_URL:$IMAGE_TAG" "$ROOT_DIR/backend"
docker push "$ECR_BACKEND_URL:$IMAGE_TAG"

echo -e "\n\033[1;33mBuilding & Pushing Frontend Production Docker Image...\033[0m"
docker build -f "$ROOT_DIR/frontend/Dockerfile.prod" -t "$ECR_FRONTEND_URL:$IMAGE_TAG" "$ROOT_DIR/frontend"
docker push "$ECR_FRONTEND_URL:$IMAGE_TAG"

echo -e "\033[1;32m✓ Images pushed successfully to ECR!\033[0m"

# 4. Terraform Apply Full Stack
echo -e "\n\033[1;33m[4/5] Provisioning full infrastructure with Terraform...\033[0m"
EXTRA_VARS=()
if [ -n "$GEMINI_API_KEY" ]; then
    EXTRA_VARS+=("-var=gemini_api_key=$GEMINI_API_KEY")
fi

terraform apply "${EXTRA_VARS[@]}"

# 5. Output Results
echo -e "\n\033[1;32m========================================================\033[0m"
echo -e "\033[1;32m 🎉 Deployment Completed Successfully!\033[0m"
echo -e "\033[1;32m========================================================\033[0m"
terraform output

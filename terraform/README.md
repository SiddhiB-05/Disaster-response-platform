# 🌐 Disaster Response Platform - AWS Terraform Infrastructure

This directory contains production-ready **Infrastructure-as-Code (IaC)** using **Terraform** to deploy the complete containerized Disaster Response Platform on **Amazon Web Services (AWS)**.

---

## 🏛️ Architecture Overview

The infrastructure provisions the following AWS resources:

- **Custom Multi-AZ VPC**:
  - 2 Public Subnets (for Application Load Balancer and optional NAT Gateway).
  - 2 Private Application Subnets (for ECS Fargate backend and frontend container tasks).
  - 2 Private Database Subnets (isolated for RDS PostgreSQL).
  - Internet Gateway & Route Tables.
- **Security & Access (Least Privilege)**:
  - ALB Security Group: Inbound HTTP (80) & HTTPS (443) from internet.
  - Backend ECS Security Group: Inbound port 8000 from ALB only; outbound HTTPS for Gemini AI API and CloudWatch.
  - Frontend ECS Security Group: Inbound port 80 from ALB only.
  - RDS PostgreSQL Security Group: Inbound port 5432 from Backend ECS tasks only.
- **Application Load Balancer (ALB)**:
  - Single public DNS endpoint routing traffic intelligently:
    - `/` $\rightarrow$ React SPA Frontend (Nginx).
    - `/api/*`, `/api/v1/*` $\rightarrow$ FastAPI Backend.
    - `/ws*`, `/api/v1/ws*` $\rightarrow$ Real-Time WebSocket stream with stickiness.
    - `/docs`, `/openapi.json`, `/redoc` $\rightarrow$ Interactive Swagger UI.
- **Amazon ECS (Fargate)**:
  - Serverless container execution (no EC2 instances to manage or patch).
  - Backend Task (FastAPI + SciPy Optimizer + SQLAlchemy + Gemini AI integration).
  - Frontend Task (Production React build served with high-performance Nginx Alpine).
  - CloudWatch Log Groups with automated 7-day log retention.
- **Amazon RDS PostgreSQL**:
  - Fully managed PostgreSQL 15 database instance (`db.t4g.micro` / `db.t3.micro` Free Tier eligible).
  - Automated secure credential generation and injection into backend environment variables.
- **Amazon Elastic Container Registry (ECR)**:
  - Private container registries for backend and frontend Docker images.
  - Automated image vulnerability scanning on push and lifecycle retention policies.

---

## 📋 Prerequisites

1. **AWS CLI** installed and configured (`aws configure`).
   - Default region: `ap-south-1` (Mumbai).
2. **Terraform** installed ($\ge$ `v1.5.0`).
3. **Docker** installed and running (for building and pushing container images).

---

## 🚀 Quick Start Deployment

### Option A: One-Command Automated Script

From the project root:

**On Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1 -AwsRegion "ap-south-1" -GeminiApiKey "YOUR_GEMINI_API_KEY"
```

**On Linux / macOS (Bash):**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

### Option B: Step-by-Step Manual Deployment

#### Step 1: Initialize Terraform & Create ECR Repositories
```bash
cd terraform
terraform init
terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend -auto-approve
```

#### Step 2: Build & Push Docker Images to ECR
```bash
# Get your AWS Account ID & ECR Login
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# Build & Push Backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/disaster-response-platform-backend:latest ../backend
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/disaster-response-platform-backend:latest

# Build & Push Frontend Production Image
docker build -f ../frontend/Dockerfile.prod -t $AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/disaster-response-platform-frontend:latest ../frontend
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/disaster-response-platform-frontend:latest
```

#### Step 3: Apply Full Infrastructure
```bash
# Copy and edit sample variables if desired
cp terraform.tfvars.example terraform.tfvars

terraform apply
```

---

## 🔍 Accessing the Deployed Application

Once `terraform apply` completes, the terminal will display the outputs:

| Output | Description |
|---|---|
| `app_url` | Public URL for the Citizen React UI |
| `api_docs_url` | Interactive Swagger API docs (`/docs`) |
| `alb_dns_name` | Public DNS name of the Load Balancer |
| `rds_endpoint` | PostgreSQL database connection endpoint |

---

## ⚙️ Customization & Configuration

All options can be customized in `terraform.tfvars`:

```hcl
aws_region          = "ap-south-1"
environment         = "production"
enable_nat_gateway  = false  # Set true if strict private subnets with NAT GW is preferred

# Sizing & Scaling
db_instance_class   = "db.t4g.micro"
backend_cpu         = 256    # 0.25 vCPU
backend_memory      = 512    # 512 MB RAM
frontend_cpu        = 256
frontend_memory     = 512

# Optional Gemini AI API Key
gemini_api_key      = "YOUR_GEMINI_API_KEY"
```

---

## 🧹 Teardown / Destroy Infrastructure

To delete all provisioned AWS resources and avoid incurring any ongoing cloud costs:

```bash
cd terraform
terraform destroy -auto-approve
```

<#
.SYNOPSIS
    Automated Deployment Script for Disaster Response Platform on AWS with Terraform.
.DESCRIPTION
    1. Authenticates Docker with Amazon ECR.
    2. Provisions ECR repositories if not yet created.
    3. Builds and pushes Backend and Frontend production Docker images to ECR.
    4. Runs Terraform init and apply to provision complete infrastructure (VPC, ALB, RDS, ECS).
#>

param (
    [string]$AwsRegion = "ap-south-1",
    [string]$Environment = "production",
    [string]$ProjectName = "disaster-response-platform",
    [string]$ImageTag = "latest",
    [string]$GeminiApiKey = "",
    [switch]$SkipImageBuild = $false,
    [switch]$AutoApprove = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " 🚀 AWS Terraform Deployment: $ProjectName ($Environment)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI is required but not found in PATH."
}
if (-not (Get-Command "terraform" -ErrorAction SilentlyContinue)) {
    Write-Error "Terraform is required but not found in PATH."
}
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is required to build container images."
}

# Verify AWS credentials
$callerIdentity = aws sts get-caller-identity | ConvertFrom-Json
$awsAccountId = $callerIdentity.Account
Write-Host "✓ AWS Account ID: $awsAccountId (Region: $AwsRegion)" -ForegroundColor Green

# 2. Terraform Initialization & Target ECR Creation
Write-Host "`n[2/5] Initializing Terraform and preparing ECR repositories..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$terraformDir = Join-Path $rootDir "terraform"

Set-Location $terraformDir
terraform init

# Target provision ECR repositories first so we can push images before ECS starts
Write-Host "Ensuring ECR repositories exist..." -ForegroundColor Yellow
terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend -auto-approve

$ecrBackendUrl = "$awsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/$ProjectName-backend"
$ecrFrontendUrl = "$awsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/$ProjectName-frontend"

# 3. Docker Login & Build/Push
if (-not $SkipImageBuild) {
    Write-Host "`n[3/5] Authenticating Docker with Amazon ECR..." -ForegroundColor Yellow
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin "$awsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

    Write-Host "`nBuilding & Pushing Backend Docker Image..." -ForegroundColor Yellow
    $backendDir = Join-Path $rootDir "backend"
    docker build -t "$ecrBackendUrl`:$ImageTag" "$backendDir"
    docker push "$ecrBackendUrl`:$ImageTag"

    Write-Host "`nBuilding & Pushing Frontend Production Docker Image..." -ForegroundColor Yellow
    $frontendDir = Join-Path $rootDir "frontend"
    docker build -f "$frontendDir/Dockerfile.prod" -t "$ecrFrontendUrl`:$ImageTag" "$frontendDir"
    docker push "$ecrFrontendUrl`:$ImageTag"

    Write-Host "✓ Images pushed successfully to ECR!" -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Skipping image build step (-SkipImageBuild specified)." -ForegroundColor Yellow
}

# 4. Terraform Apply Full Stack
Write-Host "`n[4/5] Provisioning full infrastructure with Terraform..." -ForegroundColor Yellow
$extraVars = @()
if ($GeminiApiKey -ne "") {
    $extraVars += "-var=gemini_api_key=$GeminiApiKey"
}

if ($AutoApprove) {
    terraform apply -auto-approve @extraVars
} else {
    terraform apply @extraVars
}

# 5. Output Results
Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " 🎉 Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
terraform output

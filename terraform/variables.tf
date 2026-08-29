variable "aws_region" {
  type        = string
  description = "AWS Region to deploy the platform"
  default     = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "production"
}

variable "project_name" {
  type        = string
  description = "Project name used for tagging and resource naming"
  default     = "disaster-response-platform"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type (t3.small: 2 vCPU/2GB RAM ~$7.50/mo, t3.micro: Free Tier $0.00/mo, t4g.small: ARM64 ~$6.00/mo)"
  default     = "t3.small"
}

variable "volume_size" {
  type        = number
  description = "EBS Root Volume size in GB (gp3 SSD)"
  default     = 20
}

variable "github_repo_url" {
  type        = string
  description = "GitHub repository URL to clone on the server"
  default     = "https://github.com/smit45-m/Disaster-response-platform.git"
}

variable "gemini_api_key" {
  type        = string
  description = "Google Gemini API key for AI-based disaster report analysis (optional)"
  default     = ""
  sensitive   = true
}

variable "gemini_model" {
  type        = string
  description = "Gemini model version"
  default     = "gemini-2.5-flash"
}

variable "postgres_password" {
  type        = string
  description = "PostgreSQL password for local database container"
  default     = "disaster_secure_pass_2026"
  sensitive   = true
}

variable "aws_region" {
  type        = string
  description = "AWS region to deploy infrastructure"
  default     = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g. dev, staging, production)"
  default     = "production"
}

variable "project_name" {
  type        = string
  description = "Base project name used for resource naming and tagging"
  default     = "disaster-response-platform"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones for multi-AZ deployment"
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets (ALB, NAT)"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private application subnets (ECS tasks)"
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "private_db_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private database subnets (RDS PostgreSQL)"
  default     = ["10.0.21.0/24", "10.0.22.0/24"]
}

variable "enable_nat_gateway" {
  type        = bool
  description = "Whether to provision a NAT Gateway for ECS tasks in private subnets. Set false for cost-effective deployment with tasks placed in public subnets with public IP."
  default     = false
}

# --- Database Variables ---
variable "db_allocated_storage" {
  type        = number
  description = "Allocated storage for RDS PostgreSQL (in GB)"
  default     = 20
}

variable "db_max_allocated_storage" {
  type        = number
  description = "Maximum storage limit for RDS auto-scaling (in GB)"
  default     = 50
}

variable "db_instance_class" {
  type        = string
  description = "RDS PostgreSQL instance type (Free Tier eligible: db.t4g.micro or db.t3.micro)"
  default     = "db.t4g.micro"
}

variable "db_engine_version" {
  type        = string
  description = "PostgreSQL engine version"
  default     = "15.7"
}

variable "db_name" {
  type        = string
  description = "PostgreSQL database name"
  default     = "disaster_db"
}

variable "db_username" {
  type        = string
  description = "Master username for PostgreSQL database"
  default     = "disaster_admin"
}

variable "db_password" {
  type        = string
  description = "Master password for PostgreSQL. If left empty, a secure random password is generated."
  default     = ""
  sensitive   = true
}

# --- ECS Container Specifications ---
variable "backend_cpu" {
  type        = number
  description = "CPU units for backend ECS task (256 = 0.25 vCPU)"
  default     = 256
}

variable "backend_memory" {
  type        = number
  description = "Memory (in MB) for backend ECS task (512 = 0.5 GB)"
  default     = 512
}

variable "backend_desired_count" {
  type        = number
  description = "Desired number of running backend container instances"
  default     = 1
}

variable "frontend_cpu" {
  type        = number
  description = "CPU units for frontend ECS task (256 = 0.25 vCPU)"
  default     = 256
}

variable "frontend_memory" {
  type        = number
  description = "Memory (in MB) for frontend ECS task (512 = 0.5 GB)"
  default     = 512
}

variable "frontend_desired_count" {
  type        = number
  description = "Desired number of running frontend container instances"
  default     = 1
}

# --- Application Configuration ---
variable "gemini_api_key" {
  type        = string
  description = "Google Gemini API Key for disaster report NLP analysis (optional; heuristic fallback active if blank)"
  default     = ""
  sensitive   = true
}

variable "gemini_model" {
  type        = string
  description = "Gemini model version for disaster incident extraction"
  default     = "gemini-2.5-flash"
}

variable "backend_image_tag" {
  type        = string
  description = "Docker image tag for backend container"
  default     = "latest"
}

variable "frontend_image_tag" {
  type        = string
  description = "Docker image tag for frontend container"
  default     = "latest"
}

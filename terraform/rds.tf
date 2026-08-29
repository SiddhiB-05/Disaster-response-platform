# ==============================================================================
# Amazon RDS PostgreSQL Database Configuration
# ==============================================================================

# Generate secure random password if one is not provided in variables
resource "random_password" "db_password" {
  length           = 20
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

locals {
  db_password = length(var.db_password) > 0 ? var.db_password : random_password.db_password.result
}

# DB Subnet Group across private DB subnets
resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "Database subnet group for Disaster Response PostgreSQL instance"
  subnet_ids  = aws_subnet.private_db[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# Custom DB Parameter Group
resource "aws_db_parameter_group" "postgres" {
  name        = "${var.project_name}-${var.environment}-pg-params"
  family      = "postgres15"
  description = "Custom parameter group for Disaster Response PostgreSQL"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-pg-params"
  }
}

# Amazon RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-${var.environment}-db"
  allocated_storage = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type      = "gp3"
  engine            = "postgres"
  engine_version    = var.db_engine_version
  instance_class    = var.db_instance_class
  db_name           = var.db_name
  username          = var.db_username
  password          = local.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres.name

  publicly_accessible = false
  skip_final_snapshot = true
  deletion_protection = false

  auto_minor_version_upgrade = true
  backup_retention_period   = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-rds"
  }
}

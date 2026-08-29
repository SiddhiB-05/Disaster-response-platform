# ==============================================================================
# Terraform Outputs
# ==============================================================================

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "app_url" {
  description = "Public URL to access the Disaster Response Web Application"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_docs_url" {
  description = "Interactive Swagger API documentation endpoint"
  value       = "http://${aws_lb.main.dns_name}/docs"
}

output "ecr_backend_repository_url" {
  description = "Amazon ECR Repository URL for Backend Docker Image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "Amazon ECR Repository URL for Frontend Docker Image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "Amazon RDS PostgreSQL instance connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_database_name" {
  description = "PostgreSQL Database Name"
  value       = aws_db_instance.postgres.db_name
}

output "ecs_cluster_name" {
  description = "Amazon ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

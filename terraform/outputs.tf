# ==============================================================================
# Terraform Outputs
# ==============================================================================

output "server_public_ip" {
  description = "Public Elastic IP address of the server"
  value       = aws_eip.server_ip.public_ip
}

output "app_url" {
  description = "Public URL to access the Disaster Response Web Application"
  value       = "http://${aws_eip.server_ip.public_ip}"
}

output "api_docs_url" {
  description = "Interactive Swagger API documentation endpoint"
  value       = "http://${aws_eip.server_ip.public_ip}/docs"
}

output "instance_id" {
  description = "EC2 Instance ID for AWS Systems Manager and CI/CD"
  value       = aws_instance.server.id
}

output "ssm_connect_command" {
  description = "AWS CLI command to start an instant terminal session without SSH keys"
  value       = "aws ssm start-session --target ${aws_instance.server.id} --region ${var.aws_region}"
}

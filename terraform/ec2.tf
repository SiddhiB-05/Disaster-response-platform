# ==============================================================================
# Amazon EC2 Instance & Elastic IP Configuration (Ultra Low-Cost <$10/mo)
# ==============================================================================

# Look up latest official Ubuntu 24.04 LTS AMI in the target region
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance
resource "aws_instance" "server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.web.id]

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-root-ebs"
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 1. Update and install Docker & Git
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg git

              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
              chmod a+r /etc/apt/keyrings/docker.asc

              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
                tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              systemctl enable docker
              systemctl start docker

              # 2. Clone user's GitHub repository
              mkdir -p /opt/disaster-response-platform
              cd /opt/disaster-response-platform
              git clone ${var.github_repo_url} . || git pull origin main

              # 3. Create .env file for Docker Compose
              cat << 'ENVFILE' > /opt/disaster-response-platform/.env
              POSTGRES_USER=disaster_admin
              POSTGRES_PASSWORD=${var.postgres_password}
              POSTGRES_DB=disaster_db
              GEMINI_API_KEY=${var.gemini_api_key}
              GEMINI_MODEL=${var.gemini_model}
              ENVFILE

              # 4. Build and start production stack
              docker compose -f docker-compose.prod.yml up -d --build

              # 5. Configure systemd unit for automatic startup on reboot
              cat << 'SERVICEFILE' > /etc/systemd/system/disaster-platform.service
              [Unit]
              Description=Disaster Response Platform Docker Compose Stack
              Requires=docker.service
              After=docker.service

              [Service]
              Type=oneshot
              RemainAfterExit=yes
              WorkingDirectory=/opt/disaster-response-platform
              ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
              ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down

              [Install]
              WantedBy=multi-user.target
              SERVICEFILE

              systemctl daemon-reload
              systemctl enable disaster-platform.service
              EOF

  tags = {
    Name    = "${var.project_name}-${var.environment}-server"
    Project = var.project_name
  }
}

# Static Public Elastic IP attached to the instance
resource "aws_eip" "server_ip" {
  instance = aws_instance.server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }
}

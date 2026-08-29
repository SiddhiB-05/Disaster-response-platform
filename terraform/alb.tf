# ==============================================================================
# Application Load Balancer (ALB) and Routing Configuration
# ==============================================================================

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "drp-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# --- Backend Target Group (FastAPI & WebSockets) ---
resource "aws_lb_target_group" "backend" {
  name        = "drp-${var.environment}-be-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/"
    port                = "8000"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }

  # Stickiness for stable WebSocket connections
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  tags = {
    Name = "${var.project_name}-backend-tg"
  }
}

# --- Frontend Target Group (React SPA / Nginx) ---
resource "aws_lb_target_group" "frontend" {
  name        = "drp-${var.environment}-fe-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "80"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.project_name}-frontend-tg"
  }
}

# --- HTTP Listener (Port 80) ---
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Default action forwards to Frontend
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# --- Listener Rules ---

# Rule 1: Route /api/* and /api/v1/* to Backend
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/api/v1/*"]
    }
  }
}

# Rule 2: Route /ws* and WebSocket paths to Backend
resource "aws_lb_listener_rule" "ws_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/ws*", "/api/v1/ws*"]
    }
  }
}

# Rule 3: Route Swagger Docs & OpenAPI JSON to Backend
resource "aws_lb_listener_rule" "docs_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/docs*", "/openapi.json*", "/redoc*"]
    }
  }
}

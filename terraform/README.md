# 🌐 Disaster Response Platform - Ultra Low-Cost AWS Deployment (<$10/mo)

Production-ready **Infrastructure-as-Code (Terraform)** optimized specifically for **Hackathons, Demos, and 30–50 Concurrent Users** on **Amazon Web Services (AWS)** for **under $10 / month**.

---

## 🏛️ Architecture & Cost Breakdown

| Component | AWS Resource | Monthly Cost (`ap-south-1`) |
|---|---|---|
| **Compute** | Amazon EC2 `t3.small` (2 vCPU, 2 GB RAM) | **~$7.50 / month** *(or $0.00 if Free Tier)* |
| **Storage** | 20 GB gp3 SSD (Encrypted) | **~$1.60 / month** |
| **Network & IP** | Elastic IP (Static Public IPv4) | **~$0.00 / month** |
| **Containers** | Docker Compose (FastAPI + React + Nginx + PostgreSQL) | **$0.00** *(No expensive ALB or RDS needed)* |
| **CI/CD** | GitHub Actions + AWS Systems Manager (SSM) | **$0.00** |
| **Total Bill** | | **~$8.00 – $9.10 / month** (≈ ₹670 – ₹760) |

---

## 🚀 Quick Start Deployment

### 1. Initialize & Apply Terraform
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

### 2. Access the Application
Once complete, Terraform outputs the live URLs:
- **Web Portal**: `http://<SERVER_PUBLIC_IP>`
- **Interactive API Docs**: `http://<SERVER_PUBLIC_IP>/docs`

---

## 🔄 Automated CI/CD Pipeline

Whenever you push code changes to your GitHub repository `smit45-m/Disaster-response-platform`, GitHub Actions will:
1. Run backend unit tests and frontend production build check.
2. Connect securely to your AWS EC2 instance via **AWS Systems Manager (SSM)**.
3. Automatically pull the latest code, rebuild containers, and verify health check in under 60 seconds.

---

## 🧹 Teardown / Stop Charges

To stop all AWS charges when the hackathon concludes:
```bash
cd terraform
terraform destroy -auto-approve
```

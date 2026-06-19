# Deployment Guide

Aether is designed to be deployed on Kubernetes.

## Infrastructure Provisioning

We use Terraform to provision the necessary infrastructure on AWS.

```bash
cd infra/terraform
terraform init
terraform apply
```

This creates:
- VPC and Networking
- EKS Cluster
- RDS (PostgreSQL)
- ElastiCache (Redis)
- S3 Buckets
- CloudFront Distribution

## Kubernetes Deployment

We use Helm to package and deploy our services.

```bash
cd infra/helm/aether
helm upgrade --install aether . -f values.yaml
```

### Services Deployed:
- `api`: GraphQL backend.
- `web`: Next.js frontend.
- `realtime`: WebSocket server.
- `agent-worker`: Background worker for AI tasks.

## CI/CD Pipeline

Our GitHub Actions pipeline automates the entire process:

1. **Lint & Test:** Runs on every PR.
2. **Build Docker Images:** Pushes to ECR on merge to `main`.
3. **Deploy:** Updates the Kubernetes cluster using Helm.

## Local Deployment

For local development, use Docker Compose:

```bash
docker-compose up -d
```

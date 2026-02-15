# Terraform — AWS Infrastructure

## Overview

Terraform modules provision the complete AWS infrastructure for production deployment. The code lives in `infra/`.

```
infra/
├── modules/
│   ├── vpc/              # VPC, subnets, NAT gateway, route tables
│   ├── eks/              # EKS cluster, node groups, OIDC
│   ├── rds/              # PostgreSQL RDS Multi-AZ
│   ├── elasticache/      # Redis cluster
│   ├── alb/              # Application Load Balancer
│   └── security-groups/  # SG rules for all components
├── environments/         # Per-environment tfvars
└── global/               # S3 backend, DynamoDB lock table
```

## Prerequisites

```bash
# AWS CLI configured
aws configure

# Terraform installed
terraform version  # 1.6+

# Create S3 bucket for state
aws s3 mb s3://codearena-terraform-state

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name codearena-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Modules

### VPC Module
- 1 VPC (10.0.0.0/16)
- 2 public subnets (for ALB, NAT gateway)
- 2 private subnets (for EKS nodes, RDS, ElastiCache)
- NAT Gateway in each AZ for outbound internet from private subnets
- Internet Gateway for public subnets

### EKS Module
- EKS cluster (Kubernetes 1.28)
- 2 node groups:
  - `general`: t3.medium, on-demand (controller workloads)
  - `execution`: c5.xlarge, spot instances (execution-service workers)
- OIDC provider for IAM roles for service accounts
- CoreDNS, kube-proxy, vpc-cni add-ons

### RDS Module
- PostgreSQL 15.4
- Instance: db.t3.medium
- Multi-AZ deployment
- Automated backups (7-day retention)
- Deployed in private subnets

### ElastiCache Module
- Redis 7.0
- Instance: cache.t3.medium
- 2-node cluster
- Automatic failover
- Deployed in private subnets

## Deployment

```bash
cd infra

# Initialize
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# This takes ~20-25 minutes (EKS alone takes 15-20 min)
```

## Estimated Monthly Cost

| Resource | Monthly Cost |
|----------|-------------|
| NAT Gateway (2 AZ) | ~$97 |
| EKS Control Plane | ~$73 |
| EC2 Nodes (2× t3.medium + spot) | ~$200 |
| RDS Multi-AZ (db.t3.medium) | ~$65 |
| ElastiCache (2× cache.t3.medium) | ~$50 |
| ALB + data transfer | ~$25 |
| **Total** | **~$510/month** |

> **Tip**: For development, use a single-AZ RDS and 1 ElastiCache node to cut costs to ~$300/month.

## Teardown

```bash
terraform destroy

# Verify nothing is left
aws eks list-clusters
aws rds describe-db-instances
aws elasticache describe-cache-clusters
```

> **Warning**: `terraform destroy` deletes everything including the database. Take a final RDS snapshot before destroying.

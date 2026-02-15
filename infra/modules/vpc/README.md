# VPC Module

Creates a production-grade VPC with:
- Public and private subnets across multiple AZs
- NAT Gateways for HA (one per AZ)
- Internet Gateway
- Route tables with proper routing
- VPC Flow Logs (optional)

## Usage


module "vpc" {
  source = "../../modules/vpc"
  
  name_prefix        = "codearena-prod"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true
  enable_flow_logs   = true
  
  tags = {
    Environment = "Production"
    Project     = "CodeArena"
  }
}
Internet
    ↓
Internet Gateway
    ↓
┌─────────────────────────────────────┐
│  Public Subnets (3 AZs)             │
│  - Load Balancers                   │
│  - NAT Gateways                     │
└─────────────────────────────────────┘
    ↓ (NAT Gateway)
┌─────────────────────────────────────┐
│  Private Subnets (3 AZs)            │
│  - EKS Nodes                        │
│  - RDS Databases                    │
│  - ElastiCache                      │
└─────────────────────────────────────┘

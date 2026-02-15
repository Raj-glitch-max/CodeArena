# environments/dev/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "codearena-terraform-state-888577067561"
    key            = "dev/vpc/terraform.tfstate" # Different state path
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "codearena-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CodeArena"
      Environment = "Development"
      ManagedBy   = "Terraform"
    }
  }
}

locals {
  name_prefix = "codearena-dev"

  common_tags = {
    Environment = "Development"
    Project     = "CodeArena"
  }
}

# VPC Module (smaller CIDR, 2 AZs instead of 3)
module "vpc" {
  source = "../../modules/vpc"

  name_prefix        = local.name_prefix
  vpc_cidr           = "10.1.0.0/16"                # Different from prod (10.0.0.0/16)
  availability_zones = ["us-east-1a", "us-east-1b"] # Only 2 AZs (cheaper)
  enable_nat_gateway = true
  enable_flow_logs   = false # Disable for cost savings

  tags = local.common_tags
}

# Security Groups Module
module "security_groups" {
  source = "../../modules/security-groups"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = module.vpc.vpc_cidr

  tags = local.common_tags
}

# environments/production/main.tf

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "codearena-terraform-state-123456789012"  # Replace
    key            = "production/vpc/terraform.tfstate"
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
      Environment = "Production"
      ManagedBy   = "Terraform"
      Owner       = "DevOps-Team"
      CostCenter  = "Engineering"
    }
  }
}

# Local variables
locals {
  name_prefix = "codearena-prod"
  
  common_tags = {
    Environment = "Production"
    Project     = "CodeArena"
  }
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  
  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = true
  enable_flow_logs   = true
  
  tags = local.common_tags
}

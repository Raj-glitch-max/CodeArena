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
    bucket         = "codearena-terraform-state-888577067561"
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

# Security Groups Module
module "security_groups" {
  source = "../../modules/security-groups"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = module.vpc.vpc_cidr

  tags = local.common_tags
}

# ========== COMPUTE ==========

module "eks" {
  source = "../../modules/eks"
  
  cluster_name       = "${local.name_prefix}-cluster"
  cluster_version    = "1.29"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_app_subnet_ids
  
  enable_public_access = true  # Set false in real production (use VPN)
  public_access_cidrs  = ["0.0.0.0/0"]
  
  enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  node_groups = {
    general = {
      instance_types      = ["t3.medium"]
      capacity_type       = "ON_DEMAND"
      desired_size        = 3
      min_size            = 2
      max_size            = 10
      disk_size           = 50
      labels              = { role = "general" }
      taints              = []
      tags                = { "k8s.io/cluster-autoscaler/enabled" = "true" }
      bootstrap_arguments = "--kubelet-extra-args '--max-pods=110'"
    }
    
    compute = {
      instance_types      = ["c5.xlarge"]
      capacity_type       = "SPOT"
      desired_size        = 2
      min_size            = 1
      max_size            = 20
      disk_size           = 50
      labels              = { role = "compute", workload = "execution" }
      taints              = [{ key = "workload", value = "execution", effect = "NO_SCHEDULE" }]
      tags                = { "k8s.io/cluster-autoscaler/enabled" = "true" }
      bootstrap_arguments = "--kubelet-extra-args '--max-pods=110'"
    }
  }
  
  enable_ebs_csi_driver = true
  
  tags = local.common_tags
}

# ========== DATABASE ==========

module "rds" {
  source = "../../modules/rds"
  
  identifier     = "${local.name_prefix}-db"
  engine_version = "15"
  instance_class = "db.t3.medium"
  
  allocated_storage = 100
  storage_type      = "gp3"
  
  database_name   = "codearena"
  master_username = "codearena_admin"
  
  subnet_ids         = module.vpc.private_db_subnet_ids
  security_group_ids = [module.security_groups.rds_security_group_id]
  
  multi_az = true
  
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  performance_insights_enabled    = true
  
  deletion_protection = false # Set to true in real production
  
  # Read Replica Configuration (temporarily disabled for stable deployment)
  create_read_replica         = false
  read_replica_count          = 1
  read_replica_instance_class = "db.t3.medium"
  
  tags = local.common_tags
}

# ========== CACHE ==========

module "redis" {
  source = "../../modules/elasticache"
  
  cluster_id     = "${local.name_prefix}-redis"
  engine_version = "7.0"
  node_type      = "cache.t3.medium"
  
  num_cache_nodes = 2
  multi_az        = true
  
  subnet_ids         = module.vpc.private_db_subnet_ids
  security_group_ids = [module.security_groups.redis_security_group_id]
  
  snapshot_retention_limit = 5
  snapshot_window          = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"
  
  auth_token_enabled = true
  auth_token         = random_password.redis_auth.result
  
  tags = local.common_tags
}

resource "random_password" "redis_auth" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "redis_auth" {
  name                    = "${local.name_prefix}-redis-auth"
  recovery_window_in_days = 7
  tags                    = local.common_tags
}

resource "aws_secretsmanager_secret_version" "redis_auth" {
  secret_id = aws_secretsmanager_secret.redis_auth.id
  secret_string = jsonencode({
    host     = module.redis.primary_endpoint_address
    port     = module.redis.port
    password = random_password.redis_auth.result
  })
}

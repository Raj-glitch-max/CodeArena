# environments/production/outputs.tf

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Private Application subnet IDs"
  value       = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "Private Database subnet IDs"
  value       = module.vpc.private_db_subnet_ids
}

# ========== COMPUTE OUTPUTS ==========

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_oidc_provider_arn" {
  description = "OIDC provider ARN"
  value       = module.eks.oidc_provider_arn
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

# ========== DATABASE OUTPUTS ==========

output "rds_endpoint" {
  description = "RDS connection endpoint"
  value       = module.rds.db_instance_endpoint
}

output "rds_password_secret_arn" {
  description = "ARN of secret containing database password"
  value       = module.rds.db_password_secret_arn
}

output "rds_read_replica_endpoints" {
  description = "Read replica endpoints"
  value       = module.rds.read_replica_endpoints
}

# ========== CACHE OUTPUTS ==========

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = module.redis.primary_endpoint_address
}

output "redis_auth_secret_arn" {
  description = "ARN of secret containing Redis password"
  value       = aws_secretsmanager_secret.redis_auth.arn
}

output "nat_gateway_ips" {
  description = "NAT Gateway public IPs (for whitelisting)"
  value       = module.vpc.nat_gateway_ips
}



output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = module.security_groups.alb_security_group_id
}

output "eks_security_group_id" {
  description = "EKS security group ID"
  value       = module.security_groups.eks_nodes_security_group_id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.security_groups.rds_security_group_id
}

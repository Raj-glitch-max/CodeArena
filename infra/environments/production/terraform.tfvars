# environments/production/terraform.tfvars

aws_region    = "us-east-1"
vpc_cidr      = "10.2.0.0/16"
environment   = "production"
instance_type = "t3.medium"

availability_zones = [
  "us-east-1a",
  "us-east-1b",
  "us-east-1c"
]

tags = {
  Project     = "CodeArena"
  Environment = "production"
  Owner       = "Raj"
  ManagedBy   = "Terraform"
}

# environments/staging/terraform.tfvars

aws_region = "us-east-1"
vpc_cidr   = "10.1.0.0/16"
environment = "staging"
instance_type = "t3.small"

availability_zones = [
  "us-east-1a",
  "us-east-1b",
  "us-east-1c"
]

tags = {
  Project     = "CodeArena"
  Environment = "staging"
  Owner       = "Raj"
  ManagedBy   = "Terraform"
}

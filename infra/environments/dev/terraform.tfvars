# environments/dev/terraform.tfvars

aws_region    = "us-east-1"
vpc_cidr      = "10.0.0.0/16"
environment   = "dev"
instance_type = "t3.micro"

availability_zones = [
  "us-east-1a",
  "us-east-1b"
]

tags = {
  Project     = "CodeArena"
  Environment = "dev"
  Owner       = "Raj"
  ManagedBy   = "Terraform"
}

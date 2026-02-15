# global/state-backend/backend.tf

terraform {
  backend "s3" {
    bucket         = "codearena-terraform-state-888577067561"
    key            = "global/state-backend/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "codearena-terraform-locks"
  }
}
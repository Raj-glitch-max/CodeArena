#global/state-backend/main.tf

terraform {
    required_providers {
        aws ={
            source = "hashicorp/aws"
            version = "~>5.0"
        }
    }
}

provider "aws" {
    region = "us-east-1"

    default_tags {
        tags = {
            Project = "CodeArena"
            ManagedBy = "Terraform"
            Enviroment = "TerraformStateBackend"
        }
    }
}

# S3 Bucket for state
resource "aws_s3_bucket" "terraform_state" {
    bucket = "codearena-terraform-state-${data.aws_caller_identity.current.account_id}"

    lifecycle {
        prevent_destroy = true
    }

    tags = {
        Name = "Terraform State Bucket"
    }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
    bucket = aws_s3_bucket.terraform_state.id

    rule {
        apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"
        }
    }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
    bucket = aws_s3_bucket.terraform_state.id

    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
    name = "codearena-terraform-locks"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "LockID"

    attribute {
        name = "LockID"
        type = "S"
    }

    lifecycle {
        prevent_destroy = true
    }


    tags = {
        Name = "Terraform State Locks Table"
    }
}

data "aws_caller_identity" "current" {}

output "s3_bucket_name" {
    value = aws_s3_bucket.terraform_state.id
    description = "S3 bucket for Terraform state"
}

output "dynamodb_table_name" {
    value = aws_dynamodb_table.terraform_locks.name
    description = "Dynamodb table for state locking"
}

output "aws_account_id" {
    value = data.aws_caller_identity.current.account_id
    description = "AWS Account ID"
}
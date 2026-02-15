# Terraform Brutal Test

**Total:** 600 points

## Level 1: Basics (100 pts - 10 each)

1.1 What is Infrastructure as Code?
1.2 Terraform vs CloudFormation vs Pulumi?
1.3 What is a provider in Terraform?
1.4 Explain: resource, data source, module
1.5 What is terraform.tfstate and why important?
1.6 What does `terraform plan` do?
1.7 Difference between `terraform apply` and `terraform apply -auto-approve`?
1.8 What is `terraform destroy`?
1.9 How to reference output from one resource in another?
1.10 What are variables in Terraform?

## Level 2: Building Infrastructure (150 pts)

2.1 Create EC2 instance with Ubuntu AMI, t3.medium, 30GB storage (25 pts)
2.2 Create VPC with 2 public subnets in different AZs (25 pts)
2.3 Create security group allowing HTTP, HTTPS, SSH (25 pts)
2.4 Define variable for instance_type with validation (25 pts)
2.5 Create module for reusable EC2 setup (25 pts)
2.6 Configure S3 backend for remote state (25 pts)

## Level 3: Debugging (150 pts)

3.1 Error: "Error acquiring state lock". What happened? Fix it. (25 pts)
3.2 `terraform apply` creates new resource instead of updating. Why? (25 pts)
3.3 Accidentally deleted terraform.tfstate. How to recover? (25 pts)
3.4 Resource exists in AWS but not in state. How to import? (25 pts)
3.5 Circular dependency error. What is it? How to fix? (25 pts)
3.6 Plan shows unexpected destroy. How to investigate? (25 pts)

## Level 4: Advanced (150 pts)

4.1 Design complete AWS infrastructure for CodeArena (VPC, subnets, EC2, RDS, security groups) (50 pts)
4.2 Implement different configs for dev/staging/prod using workspaces (50 pts)
4.3 Create custom module with variables, outputs, and documentation (50 pts)

## Level 5: Production (50 pts)

5.1 Design complete Terraform setup with CI/CD, state locking, disaster recovery (50 pts)

**Scoring:** 420+ to pass

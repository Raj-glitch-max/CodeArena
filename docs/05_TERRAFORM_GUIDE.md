# Terraform - Infrastructure as Code

**Goal:** Define entire AWS infrastructure in code

## Part 1: Why Terraform?

**Problem with ClickOps (console):**
- Not reproducible
- No version control
- Hard to audit
- Manual = errors

**Terraform solution:**
- Infrastructure in .tf files
- Git version control
- Reproducible
- Automated

---

## Part 2: Installation

```bash
# Ubuntu
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Verify
terraform version
```

---

## Part 3: Basic Syntax

**main.tf**
```hcl
# Provider (AWS)
provider "aws" {
  region = "us-east-1"
}

# Resource (EC2)
resource "aws_instance" "web" {
  ami           = "ami-0c7217cdde317cfec"
  instance_type = "t3.medium"
  
  tags = {
    Name = "CodeArena-Server"
  }
}

# Output
output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

---

## Part 4: Terraform Workflow

```bash
# Initialize (download providers)
terraform init

# Plan (preview changes)
terraform plan

# Apply (create infrastructure)
terraform apply

# Destroy (delete everything)
terraform destroy
```

---

## Part 5: Variables

**variables.tf**
```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "environment" {
  description = "Environment name"
  type        = string
}
```

**terraform.tfvars**
```hcl
instance_type = "t3.large"
environment   = "production"
```

**Usage:**
```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
  
  tags = {
    Environment = var.environment
  }
}
```

---

## Part 6: Complete EC2 Setup

**main.tf**
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "codearena-vpc"
  }
}

# Subnet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  
  tags = {
    Name = "codearena-public"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

# Security Group
resource "aws_security_group" "web" {
  name        = "codearena-web"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = aws_key_pair.deployer.key_name
  
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
  
  user_data = file("user-data.sh")
  
  tags = {
    Name = "codearena-server"
  }
}

# Key Pair
resource "aws_key_pair" "deployer" {
  key_name   = "codearena-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# Data source for latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# Elastic IP
resource "aws_eip" "web" {
  instance = aws_instance.web.id
  domain   = "vpc"
}

# Outputs
output "public_ip" {
  value = aws_eip.web.public_ip
}
```

**user-data.sh**
```bash
#!/bin/bash
apt update
apt install -y docker.io docker-compose
usermod -aG docker ubuntu
```

---

## Part 7: State Management

**Terraform State:**
- Tracks real resources
- Stored in `terraform.tfstate`
- Contains secrets!

**Backend (S3):**
```hcl
terraform {
  backend "s3" {
    bucket = "codearena-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}
```

---

## Part 8: Modules

**Structure:**
```
modules/
  ec2/
    main.tf
    variables.tf
    outputs.tf
main.tf
```

**modules/ec2/main.tf:**
```hcl
resource "aws_instance" "this" {
  ami           = var.ami
  instance_type = var.instance_type
}
```

**Usage:**
```hcl
module "web_server" {
  source        = "./modules/ec2"
  ami           = "ami-12345"
  instance_type = "t3.medium"
}
```

---

## Commands

```bash
terraform init          # Initialize
terraform plan          # Preview
terraform apply         # Create
terraform destroy       # Delete
terraform fmt           # Format code
terraform validate      # Check syntax
terraform show          # Show state
terraform output        # Show outputs
```

---

Next: 05_TERRAFORM_TEST.md then 06_KUBERNETES_GUIDE.md

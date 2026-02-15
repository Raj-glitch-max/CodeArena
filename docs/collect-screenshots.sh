#!/bin/bash

# CodeArena Infrastructure Documentation - Screenshot Collection Script
# This script helps you collect all necessary screenshots for documentation

set -e

DOCS_DIR="$HOME/Documents/PROJECTS/codebattle/docs/infrastructure-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create directory structure
echo "📁 Creating documentation directory structure..."
mkdir -p "$DOCS_DIR"/{01_aws_console,02_terminal,03_code,04_architecture}

echo ""
echo "🎯 CodeArena Infrastructure Documentation Guide"
echo "================================================"
echo ""
echo "Screenshots will be saved to: $DOCS_DIR"
echo ""

# AWS Console Screenshots
echo "📸 PART 1: AWS CONSOLE SCREENSHOTS"
echo "===================================="
echo ""
echo "Open AWS Console and take the following screenshots:"
echo ""
echo "1. VPC Dashboard"
echo "   → Navigate to: VPC → Your VPCs"
echo "   → Show: codearena-prod VPC with CIDR 10.0.0.0/16"
echo "   → Save as: 01_aws_console/01_vpc_overview.png"
echo ""
read -p "Press Enter when screenshot 1 is saved..."

echo "2. Subnets List"
echo "   → Navigate to: VPC → Subnets"
echo "   → Show: All 9 subnets (3 public, 3 private app, 3 private db)"
echo "   → Save as: 01_aws_console/02_subnets.png"
echo ""
read -p "Press Enter when screenshot 2 is saved..."

echo "3. NAT Gateways"
echo "   → Navigate to: VPC → NAT Gateways"
echo "   → Show: 3 NAT gateways with Elastic IPs"
echo "   → Save as: 01_aws_console/03_nat_gateways.png"
echo ""
read -p "Press Enter when screenshot 3 is saved..."

echo "4. Route Tables"
echo "   → Navigate to: VPC → Route Tables"
echo "   → Show: Public and private route tables"
echo "   → Save as: 01_aws_console/04_route_tables.png"
echo ""
read -p "Press Enter when screenshot 4 is saved..."

echo "5. Security Groups"
echo "   → Navigate to: VPC → Security Groups"
echo "   → Show: ALB, EKS, RDS, Redis security groups"
echo "   → Save as: 01_aws_console/05_security_groups.png"
echo ""
read -p "Press Enter when screenshot 5 is saved..."

echo "6. EKS Cluster Overview"
echo "   → Navigate to: EKS → Clusters → codearena-prod-cluster"
echo "   → Show: Cluster status, version, endpoint"
echo "   → Save as: 01_aws_console/06_eks_cluster.png"
echo ""
read -p "Press Enter when screenshot 6 is saved..."

echo "7. EKS Node Groups"
echo "   → Navigate to: EKS → Cluster → Compute → Node groups"
echo "   → Show: Both node groups (general, compute)"
echo "   → Save as: 01_aws_console/07_eks_node_groups.png"
echo ""
read -p "Press Enter when screenshot 7 is saved..."

echo "8. EKS Add-ons"
echo "   → Navigate to: EKS → Cluster → Add-ons"
echo "   → Show: VPC CNI, CoreDNS, kube-proxy, EBS CSI"
echo "   → Save as: 01_aws_console/08_eks_addons.png"
echo ""
read -p "Press Enter when screenshot 8 is saved..."

echo "9. RDS Instance"
echo "   → Navigate to: RDS → Databases → codearena-prod-db"
echo "   → Show: Multi-AZ, engine, storage, monitoring"
echo "   → Save as: 01_aws_console/09_rds_instance.png"
echo ""
read -p "Press Enter when screenshot 9 is saved..."

echo "10. ElastiCache Redis Cluster"
echo "    → Navigate to: ElastiCache → Redis clusters"
echo "    → Show: Cluster nodes (primary + replica)"
echo "    → Save as: 01_aws_console/10_redis_cluster.png"
echo ""
read -p "Press Enter when screenshot 10 is saved..."

echo "11. CloudWatch Alarms"
echo "    → Navigate to: CloudWatch → Alarms"
echo "    → Show: All RDS and Redis alarms"
echo "    → Save as: 01_aws_console/11_cloudwatch_alarms.png"
echo ""
read -p "Press Enter when screenshot 11 is saved..."

echo "12. Secrets Manager"
echo "    → Navigate to: Secrets Manager → Secrets"
echo "    → Show: Database and Redis secrets (without values)"
echo "    → Save as: 01_aws_console/12_secrets_manager.png"
echo ""
read -p "Press Enter when screenshot 12 is saved..."

# Terminal Screenshots
echo ""
echo "📸 PART 2: TERMINAL SCREENSHOTS"
echo "================================"
echo ""
echo "Now we'll generate terminal outputs. Keep your screenshot tool ready!"
echo ""

cd ~/Documents/PROJECTS/codebattle/infra/environments/production

echo "13. Terraform State List"
echo "    Running: terraform state list"
echo "    → Save output as: 02_terminal/13_terraform_state_list.png"
echo ""
terraform state list
echo ""
read -p "Press Enter when screenshot 13 is saved..."

echo "14. Terraform Outputs"
echo "    Running: terraform output"
echo "    → Save output as: 02_terminal/14_terraform_outputs.png"
echo ""
terraform output
echo ""
read -p "Press Enter when screenshot 14 is saved..."

echo "15. kubectl Get Nodes"
echo "    Running: kubectl get nodes -o wide"
echo "    → Save output as: 02_terminal/15_kubectl_nodes.png"
echo ""
kubectl get nodes -o wide 2>/dev/null || echo "⚠️  Configure kubectl first: aws eks update-kubeconfig --region us-east-1 --name codearena-prod-cluster"
echo ""
read -p "Press Enter when screenshot 15 is saved..."

echo "16. kubectl System Pods"
echo "    Running: kubectl get pods -n kube-system"
echo "    → Save output as: 02_terminal/16_kubectl_system_pods.png"
echo ""
kubectl get pods -n kube-system 2>/dev/null || echo "⚠️  Configure kubectl first"
echo ""
read -p "Press Enter when screenshot 16 is saved..."

echo "17. AWS CLI Verification"
echo "    Running AWS CLI commands..."
echo "    → Save output as: 02_terminal/17_aws_cli_verification.png"
echo ""
echo "VPC Info:"
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=codearena-prod-vpc" --query 'Vpcs[0].{VpcId:VpcId,CidrBlock:CidrBlock,State:State}' --output table 2>/dev/null || echo "VPC not found"
echo ""
echo "EKS Cluster Info:"
aws eks describe-cluster --name codearena-prod-cluster --query 'cluster.{Name:name,Status:status,Version:version}' --output table 2>/dev/null || echo "EKS cluster not found"
echo ""
echo "RDS Instance Info:"
aws rds describe-db-instances --db-instance-identifier codearena-prod-db --query 'DBInstances[0].{Endpoint:Endpoint.Address,MultiAZ:MultiAZ,Status:DBInstanceStatus}' --output table 2>/dev/null || echo "RDS instance not found"
echo ""
read -p "Press Enter when screenshot 17 is saved..."

# Code Screenshots
echo ""
echo "📸 PART 3: CODE SCREENSHOTS"
echo "============================"
echo ""

echo "18. Module Structure"
echo "    Running: tree of modules directory"
echo "    → Save output as: 03_code/18_module_structure.png"
echo ""
cd ~/Documents/PROJECTS/codebattle/infra
tree modules -L 2 2>/dev/null || find modules -maxdepth 2 -type d
echo ""
read -p "Press Enter when screenshot 18 is saved..."

echo "19. Production Configuration"
echo "    Showing: environments/production/main.tf"
echo "    → Save output as: 03_code/19_production_config.png"
echo ""
cat environments/production/main.tf
echo ""
read -p "Press Enter when screenshot 19 is saved..."

echo "20. VPC Module Code"
echo "    Showing: modules/vpc/main.tf (first 50 lines)"
echo "    → Save output as: 03_code/20_vpc_module.png"
echo ""
head -n 50 modules/vpc/main.tf
echo ""
read -p "Press Enter when screenshot 20 is saved..."

echo ""
echo "✅ Screenshot collection complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Review all screenshots in: $DOCS_DIR"
echo "2. Create architecture diagrams using draw.io:"
echo "   - Network architecture (VPC, subnets, routing)"
echo "   - EKS architecture (control plane, node groups, add-ons)"
echo "   - Database architecture (RDS Multi-AZ, read replica)"
echo "   - Security architecture (security groups, IAM)"
echo ""
echo "3. Generate PDF report:"
echo "   - Use the prompt in docs/INFRASTRUCTURE_REPORT.md"
echo "   - Copy to ChatGPT/Gemini"
echo "   - Export as PDF"
echo ""
echo "4. Create LinkedIn post:"
echo "   - Highlight key achievements"
echo "   - Include architecture diagram"
echo "   - Add project link"
echo ""
echo "Documentation directory: $DOCS_DIR"
echo ""

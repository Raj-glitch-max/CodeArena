#!/bin/bash
# CodeArena AWS Deployment Script with Cost Optimization
# This will launch a t3.small (cheaper!) instead of t3.medium

set -e  # Exit on any error

echo "=== CodeArena AWS Deployment ==="
echo "Cost-optimized setup: t3.small (~$15/month instead of $30)"
echo ""

# Variables
INSTANCE_TYPE="t3.small"  # 2 vCPU, 2GB RAM (enough for CodeArena)
AMI_ID="ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS us-east-1
KEY_NAME="codearena-prod-key"
SG_ID="sg-0fe11ec3cef74bc2c"
VOLUME_SIZE=20  # 20GB instead of 30GB to save money

echo "Step 1: Finding available subnet..."
# Get first available subnet
SUBNET_ID=$(aws ec2 describe-subnets --query 'Subnets[0].SubnetId' --output text)

if [ "$SUBNET_ID" == "None" ] || [ -z "$SUBNET_ID" ]; then
  echo "❌ ERROR: No subnets available!"
  echo "Creating a subnet in default VPC..."
  
  # Get default VPC
  VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
  
  # Create subnet
  SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block "172.31.0.0/20" \
    --availability-zone "us-east-1a" \
    --query 'Subnet.SubnetId' \
    --output text)
  
  echo "✅ Created subnet: $SUBNET_ID"
fi

echo "Using Subnet: $SUBNET_ID"
echo ""

echo "Step 2: Launching EC2 Instance..."
echo "Instance Type: $INSTANCE_TYPE"
echo "Storage: ${VOLUME_SIZE}GB"
echo ""

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
  --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":$VOLUME_SIZE,\"VolumeType\":\"gp3\"}}]" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=codearena-production}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ Instance launched: $INSTANCE_ID"
echo "Waiting for instance to be running..."

# Wait for running state
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

echo "✅ Instance is running!"
echo ""

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "========================================="
echo "🎉 EC2 Instance Ready!"
echo "========================================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Instance Type: $INSTANCE_TYPE"
echo "Monthly Cost: ~$15 (t3.small)"
echo "========================================="
echo ""
echo "Next: SSH into instance and set up Docker"
echo "Command: ssh -i ~/.ssh/codearena-prod.pem ubuntu@$PUBLIC_IP"
echo ""

# Save details
echo "INSTANCE_ID=$INSTANCE_ID" > .aws-deployment-info
echo "PUBLIC_IP=$PUBLIC_IP" >> .aws-deployment-info
echo "SSH_COMMAND=\"ssh -i ~/.ssh/codearena-prod.pem ubuntu@$PUBLIC_IP\"" >> .aws-deployment-info

echo "✅ Details saved to .aws-deployment-info"

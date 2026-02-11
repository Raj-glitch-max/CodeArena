#!/bin/bash


SG_ID="sg-0fe11ec3cef74bc2c"
MY_IP="223.233.87.46"

echo "Adding rules to security gorup: $SG_ID"

echo "adding ssh rule port 22 - restricted to your IP"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32

echo "adding http rule port 80 - open to world"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr "0.0.0.0/0"

echo "adding https rule port 443 - open to world"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr "0.0.0.0/0"

echo "adding WEBSOCKET rule port 3000 - open to world"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3000 \
    --cidr "0.0.0.0/0"

echo "adding Auth rule port 3001 - open to world"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3001 \
    --cidr "0.0.0.0/0"

echo "adding battle rule port 3002 - open to world"
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3002 \
    --cidr "0.0.0.0/0"


# Execution Service
echo "Adding Execution Service rule (port 3003)"
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3003 \
  --cidr 0.0.0.0/0

# Rating Service
echo "Adding Rating Service rule (port 3004)"
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3004 \
  --cidr 0.0.0.0/0

# Frontend
echo "Adding Frontend rule (port 8083)"
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8083 \
  --cidr 0.0.0.0/0

echo "All rules added successfully!"
echo "Verifying..."

aws ec2 describe-security-groups --group-ids $SG_ID --query "SecurityGroups[0].IpPermissions"

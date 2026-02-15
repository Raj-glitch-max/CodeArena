#!/bin/bash
# scripts/deploy.sh

set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: ./scripts/deploy.sh <dev|staging|production>"
  exit 1
fi

if [ ! -d "infra/environments/$ENV" ]; then
  echo "❌ Environment '$ENV' does not exist"
  exit 1
fi

echo "🚀 Deploying to $ENV environment..."

cd "infra/environments/$ENV"

# Init if needed
if [ ! -d ".terraform" ]; then
    echo "📦 Initializing Terraform..."
    terraform init
fi

# Validate
echo "📝 Validating Terraform configuration..."
terraform validate

# Format check
echo "🎨 Checking code formatting..."
terraform fmt -check -recursive || {
  echo "⚠️  Code not formatted. Auto-formatting..."
  terraform fmt -recursive
}

# Plan
echo "📊 Creating execution plan..."
terraform plan -out=tfplan

# Production requires approval
if [ "$ENV" == "production" ]; then
  echo ""
  echo "⚠️  WARNING: You are deploying to PRODUCTION"
  read -p "Type 'DEPLOY-PROD' to confirm: " CONFIRM
  
  if [ "$CONFIRM" != "DEPLOY-PROD" ]; then
    echo "❌ Deployment cancelled"
    rm tfplan
    exit 1
  fi
fi

# Apply
echo "✅ Applying changes..."
terraform apply tfplan

# Cleanup
rm tfplan

echo "🎉 Deployment to $ENV completed successfully!"

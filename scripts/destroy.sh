#!/bin/bash
# scripts/destroy.sh

set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: ./scripts/destroy.sh <dev|staging|production>"
  exit 1
fi

if [ "$ENV" == "production" ]; then
  echo "🚨 DANGER: You are about to DESTROY PRODUCTION infrastructure"
  echo "This action is IRREVERSIBLE and will cause DOWNTIME"
  echo ""
  read -p "Type 'DESTROY-PRODUCTION' to confirm: " CONFIRM
  
  if [ "$CONFIRM" != "DESTROY-PRODUCTION" ]; then
    echo "❌ Destruction cancelled"
    exit 1
  fi
  
  # Second confirmation
  echo ""
  echo "⚠️  FINAL WARNING: All data will be lost!"
  read -p "Type the environment name '$ENV' to proceed: " CONFIRM2
  
  if [ "$CONFIRM2" != "$ENV" ]; then
    echo "❌ Destruction cancelled"
    exit 1
  fi
fi

if [ ! -d "infra/environments/$ENV" ]; then
  echo "❌ Environment '$ENV' does not exist"
  exit 1
fi

cd "infra/environments/$ENV"

echo "🔥 Destroying $ENV environment..."
terraform destroy -auto-approve

echo "✅ Destruction completed"

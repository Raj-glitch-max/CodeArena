#!/bin/bash
# Setup Docker on EC2 - This runs ON the EC2 instance

echo "=== Setting up Docker on CodeArena Server ==="
echo ""

# Update system packages
echo "Step 1: Updating system packages..."
sudo apt update

echo ""
echo "Step 2: Installing Docker..."
# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo ""
echo "Step 3: Adding ubuntu user to docker group..."
# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu

echo ""
echo "Step 4: Installing Docker Compose..."
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo ""
echo "✅ Docker installation complete!"
echo ""
echo "Docker version:"
docker --version
echo ""
echo "Docker Compose version:"
docker-compose --version
echo ""
echo "⚠️  IMPORTANT: You need to logout and login again for docker group changes to take effect!"
echo "Run: exit (then SSH again)"

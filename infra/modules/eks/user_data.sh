#!/bin/bash
# modules/eks/user_data.sh

set -ex

# Bootstrap node
/etc/eks/bootstrap.sh ${cluster_name} \
  --b64-cluster-ca ${cluster_ca} \
  --apiserver-endpoint ${cluster_endpoint} \
  ${bootstrap_arguments}

# Custom configurations
echo "fs.file-max = 1048576" >> /etc/sysctl.conf
sysctl -p

# Install CloudWatch agent (optional)
# wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
# rpm -U ./amazon-cloudwatch-agent.rpm

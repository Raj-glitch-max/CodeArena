# AWS Deployment - Error Log & Fixes

**Date:** 2026-02-11
**Goal:** Deploy CodeArena to AWS EC2

---

## Current Status Check

### ✅ What's Working:
1. AWS CLI configured with credentials
2. Region set to `us-east-1`
3. Security Group created: `codearena-prod-sg` (sg-0fe11ec3cef74bc2c)
4. Script ready: `add-sg-rules.sh`

### 🔍 Checking:
- EC2 instances status
- SSH key pairs
- Security group rules

---

## Deployment Steps & Issues Encountered

Will document all errors and fixes here as we proceed...

---

## Step 1: Pre-Deployment Checks

[Adding checks here...]
Adding rules to security gorup: sg-0fe11ec3cef74bc2c
adding ssh rule port 22 - restricted to your IP

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 223.233.87.46/32, TCP, from port: 22, to port: 22, ALLOW" already exists
adding http rule port 80 - open to world

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 80, to port: 80, ALLOW" already exists
adding https rule port 443 - open to world

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 443, to port: 443, ALLOW" already exists
adding WEBSOCKET rule port 3000 - open to world

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 3000, to port: 3000, ALLOW" already exists
adding Auth rule port 3001 - open to world

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 3001, to port: 3001, ALLOW" already exists
adding battle rule port 3002 - open to world

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 3002, to port: 3002, ALLOW" already exists
Adding Execution Service rule (port 3003)

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 3003, to port: 3003, ALLOW" already exists
Adding Rating Service rule (port 3004)

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 3004, to port: 3004, ALLOW" already exists
Adding Frontend rule (port 8083)

An error occurred (InvalidPermission.Duplicate) when calling the AuthorizeSecurityGroupIngress operation: the specified rule "peer: 0.0.0.0/0, TCP, from port: 8083, to port: 8083, ALLOW" already exists
All rules added successfully!
Verifying...
[
    {
        "IpProtocol": "tcp",
        "FromPort": 80,
        "ToPort": 80,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 8083,
        "ToPort": 8083,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 22,
        "ToPort": 22,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "223.233.87.46/32"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 3002,
        "ToPort": 3002,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 3001,
        "ToPort": 3001,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 3004,
        "ToPort": 3004,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 3000,
        "ToPort": 3000,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 443,
        "ToPort": 443,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    },
    {
        "IpProtocol": "tcp",
        "FromPort": 3003,
        "ToPort": 3003,
        "UserIdGroupPairs": [],
        "IpRanges": [
            {
                "CidrIp": "0.0.0.0/0"
            }
        ],
        "Ipv6Ranges": [],
        "PrefixListIds": []
    }
]

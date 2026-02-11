# AWS Deployment - Errors & Fixes Learning Log

## 🔴 ERROR #1: No Subnets in Default VPC

### What Happened:
```
An error occurred (MissingInput) when calling the RunInstances operation: 
No subnets found for the default VPC 'vpc-0a6bfedd1c09ef8c5'. 
Please specify a subnet.
```

### Why This Happened:
**VPC (Virtual Private Cloud)** needs **subnets** to launch EC2 instances.
- **VPC** = Your private network in AWS (like your house)
- **Subnet** = Subdivisions of VPC (like rooms in your house)
- EC2 instances need to be in a subnet (you can't launch an instance in empty space!)

Your default VPC exists BUT has no subnets created.

### How to Fix:
**Option 1:** Specify an existing subnet manually
**Option 2:** Create a new subnet in the VPC
**Option 3:** Use a different VPC that has subnets

### What I'm Doing:
1. Finding all available subnets in your AWS account
2. Using one of them in the launch command

### Learning Points:
📚 **VPC Architecture:**
```
VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24) → Can access internet
└── Private Subnet (10.0.2.0/24) → No direct internet
```

📚 **Why subnets matter:**
- **Public subnet** = EC2 gets public IP, can be accessed from internet (we need this!)
- **Private subnet** = EC2 only has private IP, more secure for databases

---

## Checking Available Subnets...

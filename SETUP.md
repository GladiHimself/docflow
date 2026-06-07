# 🔧 DocFlow — Complete AWS Setup Guide

Use this guide to rebuild the entire AWS infrastructure from scratch.
All code is in GitHub — only AWS resources need to be recreated.
GitHub: https://github.com/GladiHimself/docflow

---

## ⚠️ Before You Start

- AWS Free Tier account (12 months)
- Set $1 billing alarm immediately
- Region: ap-south-1 (Mumbai)
- Delete everything after use!

---

## 📋 Daily Startup Checklist

```
□ Start RDS → wait for available
□ Start EC2 → wait for running
□ Check IP → curl ifconfig.me
□ Update docflow-rds-sg → My IP
□ Update launch-wizard-1 → SSH My IP
□ Update frontend/.env → new EC2 IP
□ Update Lambda API_URL → new EC2 IP
□ Rebuild React → npm run build
□ Redeploy → aws s3 sync dist/ s3://docflow-frontend-pranav --delete
□ SSH → docker start docflow-backend
```

## 📋 Daily Shutdown Checklist

```
□ EC2 → Stop instance
□ RDS → Stop temporarily
□ Check billing dashboard
```

---

## 1️⃣ IAM Setup

```
AWS Console → IAM → Users → Create User
Username: docflow-dev
Policies:
  ✅ AmazonRDSFullAccess
  ✅ AmazonS3FullAccess
  ✅ AmazonEC2FullAccess
  ✅ AWSLambda_FullAccess
  ✅ AmazonSQSFullAccess
  ✅ AmazonSNSFullAccess
  ✅ CloudWatchFullAccess
```

Download access keys → configure AWS CLI:
```bash
aws configure
# Region: ap-south-1
# Output: json
```

---

## 2️⃣ RDS PostgreSQL

```
Engine: PostgreSQL 16
Template: Free tier ← IMPORTANT!
Instance: db.t3.micro
DB name: docflowdb
Username: docflow_user
Password: docflow123
Public access: YES
Security group: docflow-rds-sg (create new)
```

### RDS Security Group Rules:
```
PostgreSQL | 5432 | My IP        (your Mac)
PostgreSQL | 5432 | EC2 SG ID    (EC2 access)
```

### Where to find RDS Endpoint:
```
AWS Console → RDS → Databases → docflow-db
→ Connectivity & security tab
→ Endpoint field
Looks like: docflow-db.xxxxxxxxxx.ap-south-1.rds.amazonaws.com
```

---

## 3️⃣ S3 Buckets

### Bucket 1 — File Storage:
```
Name: docflow-files-pranav-2026
Region: ap-south-1
Block public access: ALL BLOCKED ✅
```

CORS Policy:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "GET", "POST"],
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://docflow-frontend-pranav.s3-website.ap-south-1.amazonaws.com"
  ],
  "ExposeHeaders": ["ETag"]
}]
```

### Bucket 2 — React Frontend:
```
Name: docflow-frontend-pranav
Region: ap-south-1
Block public access: ALL UNBLOCKED ← React needs public!
Static website hosting: ENABLED
Index document: index.html
Error document: index.html
```

Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::docflow-frontend-pranav/*"
  }]
}
```

---

## 4️⃣ EC2

```
AMI: Ubuntu 24.04 LTS
Instance: t2.micro (free tier)
Key pair: docflow-key (download .pem!)
Security group: launch-wizard-1
```

### Security Group Rules:
```
SSH        | 22   | My IP
Custom TCP | 8081 | 0.0.0.0/0
Custom TCP | 8081 | ::/0
```

### Install Docker on EC2:
```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
# Exit and reconnect!
```

### Where to find EC2 Public IP:
```
AWS Console → EC2 → Instances → docflow-server
→ Public IPv4 address column
Note: IP changes every time EC2 restarts!
```

### Build and Deploy Spring Boot:
```bash
# On Mac:
cd docflow
docker build --platform linux/amd64 -t docflow-backend ./backend
docker save docflow-backend | gzip > docflow-backend.tar.gz
scp -i ~/.ssh/docflow-key.pem docflow-backend.tar.gz ubuntu@EC2_IP:~/

# On EC2:
docker load < docflow-backend.tar.gz
docker run -d \
  --name docflow-backend \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://RDS_ENDPOINT:5432/docflowdb \
  -e SPRING_DATASOURCE_USERNAME=docflow_user \
  -e SPRING_DATASOURCE_PASSWORD=docflow123 \
  -e SPRING_PROFILES_ACTIVE=local \
  docflow-backend
```

### SSH Config (prevent broken pipe):
```bash
echo "ServerAliveInterval 60" >> ~/.ssh/config
echo "ServerAliveCountMax 3" >> ~/.ssh/config
```

---

## 5️⃣ Lambda

```
Name: docflow-file-processor
Runtime: Python 3.12
Architecture: arm64
```

### Environment Variables:
```
API_URL       → http://EC2_IP:8081/graphql
              → EC2 IP from: EC2 → Instances → Public IPv4

SNS_TOPIC_ARN → arn:aws:sns:ap-south-1:ACCOUNT_ID:docflow-notifications
              → From: SNS → Topics → docflow-notifications → ARN field
```

### IAM Permissions for Lambda Role:
```
✅ AmazonS3ReadOnlyAccess
✅ AmazonSQSFullAccess
✅ AmazonSNSFullAccess
✅ AWSLambdaVPCAccessExecutionRole
```

### Lambda Code:
See lambda/file_processor.py in repository.

---

## 6️⃣ SQS

```
Name: docflow-file-queue
Type: Standard
Visibility timeout: 30 seconds
Message retention: 4 days
Receive wait time: 20 seconds (long polling)
```

### Where to find SQS ARN:
```
AWS Console → SQS → docflow-file-queue
→ Details section → ARN field
Looks like: arn:aws:sqs:ap-south-1:122814843279:docflow-file-queue
```

### SQS Access Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "s3.amazonaws.com"},
    "Action": "SQS:SendMessage",
    "Resource": "SQS_QUEUE_ARN",
    "Condition": {
      "ArnLike": {
        "aws:SourceArn": "arn:aws:s3:::docflow-files-pranav-2026"
      }
    }
  }]
}
```

### S3 Event Notification:
```
Bucket: docflow-files-pranav-2026
Event: PUT
Prefix: uploads/
Destination: SQS → docflow-file-queue
```

### Lambda SQS Trigger:
```
Trigger: SQS
Queue: docflow-file-queue
Batch size: 1
```

---

## 7️⃣ SNS

```
Name: docflow-notifications
Type: Standard
```

Subscribe your email → confirm subscription link in email.

### Where to find SNS ARN:
```
AWS Console → SNS → Topics → docflow-notifications
→ ARN field at top of page
Looks like: arn:aws:sns:ap-south-1:122814843279:docflow-notifications
```

---

## 8️⃣ CloudWatch Alarms

```
Alarm 1: EC2 CPU > 80%     → SNS notification
Alarm 2: Lambda Errors > 0  → SNS notification
Alarm 3: RDS Storage < 2GB  → SNS notification
```

---

## 🔥 Teardown Order (Delete Everything)

```
1. Empty S3 buckets → delete buckets
2. Delete Lambda function
3. Delete SQS queue
4. Delete SNS topic
5. Terminate EC2 instance
6. Delete RDS → delete snapshots
7. Delete Security Groups
8. Release Elastic IPs (if any)
9. Check billing → $0
```

---

## 🐛 Common Errors and Fixes

| Error | Fix |
|-------|-----|
| Connection timed out (RDS) | IP changed → update Security Group → My IP |
| Broken pipe (SSH) | Just reconnect → docker still running |
| Platform mismatch (Docker) | Add --platform linux/amd64 to build command |
| S3 CORS error | Add S3 frontend URL to CORS policy |
| Lambda KeyError Records | Old SQS messages → Purge queue |
| Port 8081 in use | Change server.port in application.properties |
| tar.gz too large for GitHub | Add *.tar.gz to .gitignore |
| RDS connection timed out | Update Security Group with new IP |
| EC2 IP changed | Rebuild React + redeploy to S3 |

---

## 💰 Cost Management

```
Free Tier limits:
  EC2 t2.micro    → 750 hrs/month
  RDS db.t3.micro → 750 hrs/month
  S3              → 5GB storage
  Lambda          → 1M requests/month
  SQS             → 1M requests/month
  SNS             → 1000 emails/month

Always:
  □ Stop EC2 after each session
  □ Stop RDS after each session
  □ Set $1 billing alarm
  □ Check billing weekly
```

---

## 📞 Getting Help

Share this file + GitHub repo when asking for help.
GitHub: https://github.com/GladiHimself/docflow
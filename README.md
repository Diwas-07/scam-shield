# ScamShield — AWS Deployment Guide

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: AWS DynamoDB (NoSQL, serverless)
- **Deployment**: AWS Elastic Beanstalk OR Amazon EC2
- **Charting**: Recharts
- **Hosting**: Node.js 20

---

## AWS DynamoDB Setup

### 1. Create DynamoDB Tables

**Option A: Via API (recommended)**
Once deployed, call:
```
POST /api/setup
```
This auto-creates both required tables.

**Option B: Manually via AWS Console**

Create table `scamshield-reports`:
- Partition key: `id` (String)
- Billing mode: On-demand (PAY_PER_REQUEST)

Create table `scamshield-stats`:
- Partition key: `statKey` (String)
- Billing mode: On-demand

### 2. IAM Permissions

Create an IAM role or user with this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable",
        "dynamodb:CreateTable",
        "dynamodb:ListTables"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-1:*:table/scamshield-*"
      ]
    }
  ]
}
```

---

## Deployment: Elastic Beanstalk

### Prerequisites
- AWS CLI installed
- EB CLI installed: `pip install awsebcli`

### Steps

```bash
# 1. Build the app
npm run build

# 2. Initialize EB
eb init scam-shield --platform node.js-20 --region ap-southeast-1

# 3. Create environment
eb create scam-shield-prod --instance-type t3.small

# 4. Set environment variables
eb setenv \
  AWS_REGION=ap-southeast-1 \
  AWS_ACCESS_KEY_ID=your_key \
  AWS_SECRET_ACCESS_KEY=your_secret \
  DYNAMODB_REPORTS_TABLE=scamshield-reports \
  DYNAMODB_STATS_TABLE=scamshield-stats \
  NODE_ENV=production

# 5. Deploy
eb deploy

# 6. Open app
eb open
```

---

## Deployment: Amazon EC2

### Steps

```bash
# 1. Launch EC2 instance
# - AMI: Amazon Linux 2023
# - Instance: t3.small or t3.medium
# - Security Group: Allow port 80, 443, 3000

# 2. SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 4. Clone and install
git clone https://github.com/your-org/scam-shield.git
cd scam-shield
npm ci
npm run build

# 5. Set environment variables
cp .env.example .env
nano .env  # Edit with your AWS credentials

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start application
pm2 start npm --name "scam-shield" -- start
pm2 save
pm2 startup

# 8. (Optional) Nginx reverse proxy
sudo yum install -y nginx
# Configure /etc/nginx/conf.d/scamshield.conf
```

### Docker on EC2 (Alternative)
```bash
# Build and run with Docker
docker build -t scam-shield .
docker run -p 3000:3000 --env-file .env scam-shield
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region (e.g., ap-southeast-1) | Yes |
| `AWS_ACCESS_KEY_ID` | IAM access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key | Yes |
| `DYNAMODB_REPORTS_TABLE` | DynamoDB table for reports | Yes |
| `USE_MOCK_DATA` | Set `true` for demo mode | No |
| `NODE_ENV` | `production` for deployment | Yes |

---

## Architecture Diagram

```
Internet
    │
    ▼
[Route 53 DNS]
    │
    ▼
[Application Load Balancer]
    │
    ▼
[Elastic Beanstalk / EC2]
[Next.js App : Port 3000]
    │
    ├── GET/POST /api/reports ──────▶ [AWS DynamoDB]
    ├── GET /api/stats ─────────────▶ [AWS DynamoDB]  
    └── POST /api/setup ────────────▶ [AWS DynamoDB]
                                     (scamshield-reports)
                                     (scamshield-stats)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | Fetch all scam reports |
| `POST` | `/api/reports` | Submit a new scam report |
| `GET` | `/api/stats` | Get dashboard statistics |
| `POST` | `/api/setup` | Initialize DynamoDB tables |
| `GET` | `/api/setup` | List existing tables |

---

## Demo Mode

Set `USE_MOCK_DATA=true` in `.env` to run without AWS credentials. 
The app will use realistic sample data from `/lib/mockData.ts`.

---

## Pages

| Route | Description |
|-------|-------------|
| `/home` | Landing page with overview |
| `/dashboard` | Live analytics dashboard |
| `/report` | Scam reporting form (3-step) |
| `/trends` | Trend analysis & emerging threats |
| `/learn` | Educational guides & resources |

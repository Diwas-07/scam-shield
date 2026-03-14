# ScamShield — Deployment Guide

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: AWS RDS (MySQL)
- **Deployment**: AWS EC2
- **Charting**: Recharts
- **Hosting**: Node.js 20

---

## Database Setup (AWS RDS)

### 1. Create RDS Instance
- Engine: MySQL 8.x
- Instance: db.t3.micro or higher
- Enable public access or place in same VPC as EC2

### 2. Initialize Tables
Once deployed, call:
```
POST /api/setup
```
This auto-creates the `scam_reports` table.

---

## Deployment: Amazon EC2

```bash
# 1. Launch EC2 instance (Amazon Linux 2023, t3.small, port 3000 open)

# 2. SSH in
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 4. Clone and build
git clone https://github.com/your-org/scam-shield.git
cd scam-shield
npm ci && npm run build

# 5. Configure env
cp .env.example .env && nano .env

# 6. Run with PM2
sudo npm install -g pm2
pm2 start npm --name "scam-shield" -- start
pm2 save && pm2 startup
```

### Docker (Alternative)
```bash
docker build -t scam-shield .
docker run -p 3000:3000 --env-file .env scam-shield
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RDS_HOST` | RDS endpoint | Yes |
| `RDS_PORT` | MySQL port (default 3306) | Yes |
| `RDS_DATABASE` | Database name | Yes |
| `RDS_USER` | Database user | Yes |
| `RDS_PASSWORD` | Database password | Yes |
| `USE_MOCK_DATA` | Set `true` for demo mode | No |
| `NODE_ENV` | `production` for deployment | Yes |

---

## Architecture

```
Internet
    |
    v
[EC2 Instance - Next.js App : Port 3000]
    |
    |-- GET/POST /api/reports --> [AWS RDS MySQL]
    |-- GET /api/stats        --> [AWS RDS MySQL]
    `-- POST /api/setup       --> [AWS RDS MySQL]
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | Fetch all scam reports |
| `POST` | `/api/reports` | Submit a new scam report |
| `GET` | `/api/stats` | Get dashboard statistics |
| `POST` | `/api/setup` | Initialize database tables |
| `GET` | `/api/setup` | List existing tables |

---

## Pages

| Route | Description |
|-------|-------------|
| `/home` | Landing page |
| `/dashboard` | Live analytics dashboard |
| `/report` | Scam reporting form |
| `/trends` | Trend analysis |
| `/learn` | Educational guides |

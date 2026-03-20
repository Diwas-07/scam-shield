# ScamShield — Online Scam Awareness Platform

A full-stack Next.js application for reporting, tracking, and analyzing online scams with real-time analytics, user authentication, and admin management.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + NextAuth.js v4
- **Database**: AWS DynamoDB (NoSQL)
- **State Management**: TanStack Query (React Query) v5
- **Authentication**: NextAuth.js with JWT + bcrypt
- **Deployment**: AWS EC2
- **Charting**: Recharts
- **Runtime**: Node.js 20

---

## Features

### 🔐 Authentication & Authorization
- User registration and login with secure password hashing (bcrypt)
- JWT-based session management
- Role-based access control (User, Moderator, Admin)
- Protected routes with middleware
- Session persistence

### 👥 User Management
- User registration with email validation
- Secure password requirements (min 8 characters)
- Profile display in navbar with logout
- Role-based permissions

### 🛡️ Admin Panel
- **User Management**: View, edit roles, and delete users
- **Report Moderation**: Review and update report statuses
- **Server-side Pagination**: Efficient data loading (10 items per page)
- **Real-time Updates**: TanStack Query with optimistic updates
- **Data Caching**: Automatic cache invalidation and prefetching
- **Self-Protection**: Admins cannot modify their own role or delete themselves

### 📊 Dashboard
- Real-time scam statistics and analytics
- Interactive charts (trends, breakdowns, age groups)
- Financial loss tracking
- Platform and scam type analysis
- Paginated reports table

### 📝 Scam Reporting
- Multi-step reporting form
- Evidence upload support
- Anonymous reporting option
- Automatic severity classification


---

## Database Schema

### DynamoDB Tables

#### Users Table
- **Table Name**: `users`
- **Partition Key**: `id` (String)
- **GSI**: `email-index` with partition key `email` (String)
- **Attributes**:
  - `id`: Unique user identifier (UUID)
  - `name`: User's full name
  - `email`: User's email address (unique)
  - `passwordHash`: Hashed password
  - `role`: User role (user, admin, moderator)
  - `createdAt`: ISO timestamp

#### Scam Reports Table
- **Table Name**: `scam_reports`
- **Partition Key**: `id` (String)
- **Attributes**:
  - `id`: Unique report identifier (UUID)
  - `scamType`: Type of scam
  - `platform`: Platform where scam occurred
  - `description`: Detailed description
  - `financialLoss`: Amount lost (Number)
  - `currency`: Currency code
  - `victimAge`: Age group of victim
  - `reportedAt`: ISO timestamp
  - `severity`: low, medium, or high
  - `status`: pending, verified, investigating, resolved, rejected
  - `contactMethod`: How scammer contacted victim
  - `evidence`: Evidence details
  - `region`: Geographic region
  - `anonymous`: Boolean flag
  - `imageUrls`: Array of image URLs (optional)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | App URL (e.g., http://localhost:3000) | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing (generate with `openssl rand -base64 32`) | Yes |
| `AWS_REGION` | AWS region (e.g., us-east-1) | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | Yes |
| `AWS_SESSION_TOKEN` | AWS session token (optional) | No |
| `USE_MOCK_DATA` | Set `true` for demo mode | No |
| `NODE_ENV` | `production` for deployment | Yes |

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/scam-shield.git
cd scam-shield
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### 4. Initialize DynamoDB Tables
Create the required DynamoDB tables in your AWS account:
- `users` table with partition key `id` and GSI on `email`
- `scam_reports` table with partition key `id`

You can use AWS Console, AWS CLI, or Infrastructure as Code (Terraform/CloudFormation).

### 5. Create First Admin User
After registering a user, update their role to admin using AWS DynamoDB Console or CLI.

### 6. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000


---

## Deployment: Amazon EC2

### Quick Deploy
```bash
# 1. Launch EC2 instance (Amazon Linux 2023, t3.small, ports 22, 80, 3000 open)

# 2. SSH in
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git

# 4. Clone and build
git clone https://github.com/your-org/scam-shield.git
cd scam-shield
npm ci
npm run build

# 5. Configure environment
cp .env.example .env
nano .env  # Add your production credentials

# 6. Run with PM2
sudo npm install -g pm2
pm2 start npm --name "scam-shield" -- start
pm2 save
pm2 startup
```

### Docker Deployment (Alternative)
```bash
docker build -t scam-shield .
docker run -d -p 3000:3000 --env-file .env --name scam-shield scam-shield
```

---

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth authentication |
| `GET` | `/api/auth/session` | Get current session |

### Protected Endpoints (Requires Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | Fetch scam reports (paginated) |
| `POST` | `/api/reports` | Submit new scam report |
| `GET` | `/api/stats` | Get dashboard statistics |

### Admin Endpoints (Requires Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List all users |
| `PATCH` | `/api/admin/users` | Update user role |
| `DELETE` | `/api/admin/users` | Delete user |
| `GET` | `/api/admin/reports` | List reports (paginated) |
| `PATCH` | `/api/admin/reports` | Update report status |
| `DELETE` | `/api/admin/reports` | Delete report |

### Setup Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/setup` | Initialize database tables |
| `GET` | `/api/setup` | List existing tables |

---

## Pages & Routes

### Public Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | User login | Public |
| `/register` | User registration | Public |

### Protected Pages (Requires Authentication)
| Route | Description | Access |
|-------|-------------|--------|
| `/home` | Home dashboard | Authenticated |
| `/dashboard` | Analytics dashboard | Authenticated |
| `/report` | Scam reporting form | Authenticated |
| `/trends` | Trend analysis | Authenticated |
| `/learn` | Educational guides | Authenticated |

### Admin Pages (Requires Admin Role)
| Route | Description | Access |
|-------|-------------|--------|
| `/admin` | Admin control panel | Admin only |


---

## Architecture

```
Internet
    |
    v
[Next.js Middleware - Auth Check]
    |
    v
[EC2 Instance - Next.js App : Port 3000]
    |
    |-- NextAuth.js (JWT Sessions)
    |-- TanStack Query (Data Caching)
    |
    |-- GET/POST /api/reports      --> [AWS DynamoDB]
    |-- GET /api/stats              --> [AWS DynamoDB]
    |-- GET/PATCH/DELETE /api/admin --> [AWS DynamoDB]
    `-- POST /api/auth/register     --> [AWS DynamoDB]
```

---

## Key Technologies

### TanStack Query Features
- **Automatic Caching**: Reduces unnecessary API calls
- **Optimistic Updates**: Instant UI feedback
- **Prefetching**: Next page loads instantly
- **Cache Invalidation**: Automatic data synchronization
- **Error Recovery**: Automatic rollback on failures

### NextAuth.js Features
- **JWT Sessions**: Stateless authentication
- **Secure Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Middleware protection
- **Session Management**: Automatic token refresh

---

## Development

### Run Tests
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

### DynamoDB Management
```bash
# Use AWS CLI to manage DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Update user role to admin
aws dynamodb update-item --table-name users \
  --key '{"id": {"S": "user-id-here"}}' \
  --update-expression "SET #role = :admin" \
  --expression-attribute-names '{"#role": "role"}' \
  --expression-attribute-values '{":admin": {"S": "admin"}}'
```

---

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication
- ✅ Protected API routes with middleware
- ✅ Role-based authorization
- ✅ SQL injection prevention (prepared statements)
- ✅ CSRF protection (NextAuth built-in)
- ✅ Secure session management
- ✅ Admin self-protection (cannot delete/modify self)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@scamshield.com

---

**Built with ❤️ for online safety and scam awareness**

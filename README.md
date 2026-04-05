<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

# 🔐 NestJS Full Authentication System

A comprehensive, production-ready authentication and authorization system built with **NestJS**, **Drizzle ORM**, and **PostgreSQL**. This project demonstrates advanced backend architecture patterns and security best practices for modern web applications.


## ✨ Features

### 🔑 Authentication & Authorization
- **JWT-based Authentication** with refresh tokens
- **OAuth 2.0 Integration** (Google, GitHub, etc.)
- **Multi-factor Authentication (2FA)** 
- **Role-based Access Control (RBAC)**
- **Session Management** with device tracking
- **Email & Phone Verification**

### 🛡️ Security Features
- **Password Hashing** with bcrypt
- **Rate Limiting** and brute-force protection
- **Device Fingerprinting**
- **IP Geolocation Tracking**
- **Secure Token Management**
- **KYC (Know Your Customer) Integration**

### 📊 Advanced Features
- **User Profile Management**
- **File Upload & Management**
- **Audit Trails** for all operations
- **Comprehensive Logging**
- **Database Migrations** with Drizzle
- **Environment-based Configuration**

## 🏗️ Architecture

### Database Schema
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    Users    │────│ UserProfiles │    │    Roles    │
│             │    │              │    │             │
├─────────────┤    ├──────────────┤    ├─────────────┤
│ id (PK)     │    │ userId (FK)  │    │ id (PK)     │
│ email       │    │ firstName    │    │ name        │
│ phoneNumber │    │ lastName     │    │ description │
│ password    │    │ bio          │    └─────────────┘
│ 2FA enabled │    │ photoId (FK) │           │
│ verified    │    └──────────────┘           │
└─────────────┘                               │
       │                                      │
       ├──────────────┬─────────────────────────┘
       │              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Sessions   │ │ CodeTokens  │ │    KYC      │
│             │ │             │ │             │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ refreshToken│ │ codeOrToken │ │ provider    │
│ deviceId    │ │ type        │ │ status      │
│ ipAddress   │ │ expiresAt   │ │ details     │
│ userAgent   │ │ used        │ └─────────────┘
│ geolocation │ └─────────────┘
└─────────────┘
```

### Technology Stack
- **Backend Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT + OAuth 2.0
- **Configuration**: @nestjs/config
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nest-full-auth.git
   cd nest-full-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your database and JWT secrets
   nano .env.local
   ```

4. **Database setup**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## 📋 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT=3000
API_BASE_URL="http://localhost:3000"
```

## 🧪 API Endpoints

### Authentication
```http
POST /auth/register          # User registration
POST /auth/login            # User login
POST /auth/refresh          # Refresh JWT token
POST /auth/logout           # User logout
POST /auth/verify-email     # Email verification
POST /auth/forgot-password  # Password reset request
POST /auth/reset-password   # Password reset confirmation
```

### OAuth
```http  
GET  /auth/google           # Google OAuth login
GET  /auth/github           # GitHub OAuth login
GET  /auth/callback/:provider # OAuth callback handler
```

### User Management
```http
GET    /users/profile       # Get user profile
PATCH  /users/profile       # Update user profile  
POST   /users/upload-avatar # Upload profile picture
GET    /users/sessions      # Get active sessions
DELETE /users/sessions/:id  # Revoke session
```

### Admin (RBAC)
```http
GET    /admin/users         # List all users
PATCH  /admin/users/:id/role # Update user role
GET    /admin/analytics     # Authentication analytics
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests  
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 📦 Project Structure

```
src/
├── app.module.ts           # Main application module
├── main.ts                 # Application entry point
│
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── guards/             # JWT, OAuth guards
│   ├── strategies/         # Passport strategies
│   └── dto/                # Data transfer objects
│
├── users/                  # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│
├── roles/                  # RBAC system
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   └── decorators/
│
├── drizzle/               # Database layer
│   ├── schema.ts          # Database schema
│   ├── migrations/        # Database migrations
│   └── drizzle.service.ts # Database service
│
├── common/                # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters  
│   ├── interceptors/      # Response interceptors
│   └── pipes/             # Validation pipes
│
└── config/                # Configuration
    ├── database.config.ts
    ├── jwt.config.ts
    └── oauth.config.ts
```

## 🔧 Configuration

The application supports multiple environment configurations:

- **Development**: `.env.local`
- **Staging**: `.env.staging` 
- **Production**: `.env.production`

Configuration is automatically loaded based on the `NODE_ENV` variable.

## 🛡️ Security Best Practices

This project implements numerous security measures:

- ✅ **Password Security**: Bcrypt hashing with salt rounds
- ✅ **JWT Security**: Short-lived access tokens + refresh tokens
- ✅ **Rate Limiting**: Brute-force protection on sensitive endpoints
- ✅ **Input Validation**: Comprehensive DTO validation with class-validator
- ✅ **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- ✅ **CORS Configuration**: Proper cross-origin resource sharing setup
- ✅ **Helmet Integration**: Security headers middleware
- ✅ **Environment Variables**: Sensitive data in environment files
- ✅ **Audit Logging**: Complete audit trail for all operations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Full API Documentation](docs/api.md)
- **Postman Collection**: [Download Collection](docs/postman_collection.json)
- **Architecture Diagrams**: [System Design](docs/architecture.md)

## 🙋‍♂️ Support

If you have any questions or need help, please:

1. Check the [FAQ](docs/faq.md)
2. Search existing [Issues](https://github.com/yourusername/nest-full-auth/issues)
3. Create a new issue with detailed information

---

**Built with ❤️ by [Your Name](https://github.com/yourusername)**

*This project demonstrates production-ready backend development with modern technologies and security best practices.*

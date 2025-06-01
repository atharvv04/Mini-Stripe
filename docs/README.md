# Mini-Stripe Backend API

A simplified Stripe-like payment processing platform built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Payment Link Creation**: Generate unique, shareable payment links
- **Mock Payment Processing**: Simulate payment transactions with a mock bank API
- **Transaction Management**: Track and manage payment transactions
- **Security**: Password hashing, input validation, rate limiting, and data masking
- **RESTful API**: Well-structured endpoints following REST conventions

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional, for containerized setup)

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mini-Stripe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb mini_stripe
   
   # Run migrations
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Option 2: Docker Setup

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd Mini-Stripe
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**
   ```bash
   docker-compose exec api npm run migrate
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Payment Link Endpoints

#### Create Payment Link
```http
POST /api/payments/links
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "USD",
  "description": "Payment for services",
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxUses": 10
}
```

#### Get Payment Links
```http
GET /api/payments/links?page=1&limit=10&status=active
Authorization: Bearer <jwt-token>
```

#### Get Payment Link Details
```http
GET /api/payments/links/:linkId
Authorization: Bearer <jwt-token>
```

#### Update Payment Link
```http
PUT /api/payments/links/:linkId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false
}
```

### Transaction Endpoints

#### Get Transactions
```http
GET /api/transactions?page=1&limit=10&status=completed
Authorization: Bearer <jwt-token>
```

#### Get Transaction Details
```http
GET /api/transactions/:transactionId
Authorization: Bearer <jwt-token>
```

#### Get Transaction Summary
```http
GET /api/transactions/summary?period=30
Authorization: Bearer <jwt-token>
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

#### Get Dashboard Data
```http
GET /api/users/dashboard
Authorization: Bearer <jwt-token>
```

### Public Payment Endpoints

#### Get Payment Link Details (Public)
```http
GET /pay/:linkId
```

#### Process Payment (Public)
```http
POST /pay/:linkId/process
Content-Type: application/json

{
  "payerEmail": "payer@example.com",
  "payerName": "John Payer",
  "cardNumber": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123"
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `tests/auth.test.js` - Authentication tests
- `tests/payments.test.js` - Payment link tests
- `tests/transactions.test.js` - Transaction tests
- `tests/users.test.js` - User management tests

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues

# Database
npm run migrate     # Run database migrations
npm run migrate:create # Create new migration

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_stripe
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Payment Link Configuration
PAYMENT_LINK_EXPIRY_HOURS=24
PAYMENT_LINK_BASE_URL=http://localhost:3000/pay
```

## 🗄 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `is_active` (BOOLEAN)
- `email_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Payment Links Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `link_id` (VARCHAR, Unique)
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `description` (TEXT)
- `expires_at` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `max_uses` (INTEGER)
- `current_uses` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Transactions Table
- `id` (UUID, Primary Key)
- `payment_link_id` (UUID, Foreign Key)
- `payer_email` (VARCHAR)
- `payer_name` (VARCHAR)
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `status` (VARCHAR)
- `payment_method` (VARCHAR)
- `card_last4` (VARCHAR)
- `card_brand` (VARCHAR)
- `bank_response_code` (VARCHAR)
- `bank_response_message` (TEXT)
- `failure_reason` (TEXT)
- `processed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Data Masking**: Sensitive data (card numbers) are masked in responses
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers middleware
- **SQL Injection Prevention**: Parameterized queries

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with multiple transports
- **Request Logging**: Morgan HTTP request logger
- **Error Tracking**: Comprehensive error handling and logging
- **Health Check**: `/health` endpoint for monitoring

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use production PostgreSQL instance
3. **SSL/TLS**: Enable HTTPS in production
4. **Rate Limiting**: Adjust rate limits for production traffic
5. **Logging**: Configure production logging levels
6. **Monitoring**: Set up application monitoring

### Docker Deployment

```bash
# Build production image
docker build -t mini-stripe-backend .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:port/db \
  -e JWT_SECRET=your-secret \
  mini-stripe-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples 
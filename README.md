# Mini-Stripe Payment Platform

A simplified Stripe-like payment processing platform built with Node.js, Express, and PostgreSQL. This project demonstrates secure payment processing, user authentication, and transaction management in a production-ready architecture.

## 🎯 Project Overview

Mini-Stripe is a comprehensive payment platform that allows users to:
- Register and authenticate securely
- Create shareable payment links
- Process mock payments through a simulated bank API
- Track transactions and payment history
- Manage user profiles and settings

## 🏗 Architecture

```
Mini-Stripe/
├── src/                    # Source code
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── database/          # Database connection and utilities
│   └── utils/             # Utility functions and logger
├── migrations/            # Database migration files
├── tests/                 # Unit and integration tests
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services configuration
├── Dockerfile            # Container configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Mini-Stripe
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database setup**
   ```bash
   createdb mini_stripe
   npm run migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate
```

The API will be available at `http://localhost:3000`

## 📚 Documentation

- [API Documentation](./docs/README.md) - Complete API reference
- [Database Schema](./docs/README.md#database-schema) - Database structure
- [Security Features](./docs/README.md#security-features) - Security implementation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
npm run migrate     # Run database migrations
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Configurable rate limiting for API protection
- **Data Masking**: Sensitive data (card numbers) are masked in responses
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet middleware for security headers

## 📊 Key Features

### User Management
- Secure user registration and login
- JWT token-based authentication
- Password change functionality
- User profile management

### Payment Links
- Create unique, shareable payment links
- Configurable expiry dates and usage limits
- Link status management (active/inactive)
- Payment link analytics

### Payment Processing
- Mock bank API integration
- Card validation and processing
- Transaction status tracking
- Payment failure handling

### Transaction Management
- Complete transaction history
- Transaction status tracking
- Payment analytics and reporting
- Export capabilities

## 🗄 Database

The application uses PostgreSQL with the following main tables:
- **users**: User account information
- **payment_links**: Payment link details
- **transactions**: Payment transaction records

See [Database Schema](./docs/README.md#database-schema) for complete details.

## 🚀 Deployment

### Production Setup

1. Set production environment variables
2. Configure production PostgreSQL database
3. Enable HTTPS/SSL
4. Set up monitoring and logging
5. Configure rate limiting for production traffic

### Docker Deployment

```bash
# Build and run
docker build -t mini-stripe-backend .
docker run -d -p 3000:3000 mini-stripe-backend
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

For questions and support:
- Check the [documentation](./docs/README.md)
- Review the test files for usage examples
- Create an issue in the repository

---

**Note**: This is a demonstration project for educational purposes. It includes mock payment processing and should not be used for real financial transactions without proper security audits and compliance measures. 
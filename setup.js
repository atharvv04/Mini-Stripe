const fs = require('fs');
const path = require('path');

console.log('🚀 Mini-Stripe Setup Script');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_stripe
DB_USER=postgres
DB_PASSWORD=Greenpear@24
DATABASE_URL=postgresql://postgres:Greenpear@24@localhost:5432/mini_stripe

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Mock Bank API Configuration
MOCK_BANK_API_URL=http://localhost:3001
MOCK_BANK_API_KEY=your-mock-bank-api-key

# Payment Link Configuration
PAYMENT_LINK_EXPIRY_HOURS=24
PAYMENT_LINK_BASE_URL=http://localhost:3000/pay

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Optional: Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Check if logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('📁 Creating logs directory...');
  fs.mkdirSync(logsDir);
  console.log('✅ Logs directory created successfully!');
} else {
  console.log('✅ Logs directory already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Verify your database "mini_stripe" exists');
console.log('3. Run: npm run migrate');
console.log('4. Run: npm run dev');
console.log('\n�� Setup complete!'); 
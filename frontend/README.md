# Mini-Stripe Frontend

A modern, responsive React frontend for the Mini-Stripe payment processing platform. Built with TypeScript, Tailwind CSS, and React Router for a seamless user experience.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Type Safety**: Full TypeScript support for better development experience
- **Authentication**: Secure login/register with JWT token management
- **Dashboard**: Comprehensive overview with analytics and quick actions
- **Payment Links**: Create, manage, and share payment links
- **Transaction History**: View and filter payment transactions
- **Public Payment Page**: Secure payment processing for customers
- **Real-time Notifications**: Toast notifications for user feedback
- **Dark Mode Support**: Toggle between light and dark themes with smooth transitions
- **Profile Management**: Update user information and change passwords
- **Application Settings**: Configure notifications, appearance, and security preferences

## 🛠 Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.1
- **Routing**: React Router DOM 6
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Mini-Stripe backend running (see backend README)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card, etc.)
│   └── layout/         # Layout components (Header, DashboardLayout)
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useTheme.tsx    # Theme management hook
├── lib/                # Utility libraries
│   ├── api.ts          # API client and endpoints
│   └── utils.ts        # Utility functions
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── PaymentLinks.tsx # Payment links management
│   ├── CreatePaymentLink.tsx # Create payment link form
│   ├── Transactions.tsx # Transaction history
│   ├── PublicPay.tsx   # Public payment page
│   ├── Profile.tsx     # User profile management
│   └── Settings.tsx    # Application settings
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── App.tsx             # Main app component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎨 UI Components

### Base Components

- **Button**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Input**: Form inputs with icons, validation states, and helper text
- **Card**: Content containers with header, body, and footer sections

### Layout Components

- **Header**: Navigation bar with user menu and theme toggle
- **DashboardLayout**: Wrapper for authenticated pages

## 🔐 Authentication

The frontend uses JWT tokens for authentication with automatic token management:

- **Token Storage**: Secure localStorage with automatic cleanup
- **Token Refresh**: Automatic token validation on app load
- **Route Protection**: Protected routes redirect to login
- **Auto Logout**: Automatic logout on token expiration

## 🌙 Theme Management

The application supports both light and dark themes:

- **Theme Persistence**: Theme preference saved in localStorage
- **System Preference**: Automatically detects system theme preference
- **Smooth Transitions**: All theme changes have smooth CSS transitions
- **Theme Toggle**: Easy toggle in the header navigation

## 📱 Pages Overview

### Public Pages

1. **Home** (`/`): Landing page with features and call-to-action
2. **Login** (`/login`): User authentication
3. **Register** (`/register`): User registration
4. **PublicPay** (`/pay/:linkId`): Payment processing for customers

### Protected Pages

1. **Dashboard** (`/dashboard`): Overview with stats and recent activity
2. **Payment Links** (`/payment-links`): Manage payment links
3. **Create Payment Link** (`/payment-links/new`): Create new payment links
4. **Transactions** (`/transactions`): View transaction history
5. **Profile** (`/profile`): Manage user profile and password
6. **Settings** (`/settings`): Configure application preferences

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with React hooks
- **Prettier**: Automatic code formatting
- **Tailwind**: Utility-first CSS approach

### Component Guidelines

1. **Functional Components**: Use React hooks and functional components
2. **TypeScript**: Define proper types for all props and state
3. **Props Interface**: Always define interfaces for component props
4. **Error Handling**: Implement proper error boundaries and loading states
5. **Accessibility**: Use semantic HTML and ARIA attributes

## 🎯 Key Features

### Payment Link Management

- Create payment links with custom amounts and descriptions
- Set expiry dates and usage limits
- Copy links to clipboard with proper frontend URLs
- View link analytics and usage statistics
- Activate/deactivate links

### Transaction Tracking

- Real-time transaction status updates
- Filter transactions by status
- Search transactions by customer or ID
- Export transaction data (UI ready)
- View detailed transaction information

### User Experience

- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Toast notifications for actions
- **Responsive Design**: Works on all device sizes
- **Keyboard Navigation**: Full keyboard accessibility
- **Dark Mode**: Complete dark theme support

## 🔒 Security Features

- **Input Validation**: Client-side validation with React Hook Form
- **XSS Prevention**: Proper data sanitization
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: JWT tokens in localStorage
- **HTTPS Ready**: Configured for production HTTPS

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Set the following environment variables for production:

```env
VITE_API_URL=https://your-api-domain.com
```

### Static Hosting

The frontend can be deployed to any static hosting service:

- **Vercel**: Automatic deployment from Git
- **Netlify**: Drag and drop deployment
- **AWS S3**: Static website hosting
- **GitHub Pages**: Free hosting for public repos

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
- Check the documentation
- Review the backend README
- Create an issue in the repository

## 🔗 Related

- [Backend API](../README.md) - Mini-Stripe backend documentation
- [API Documentation](../docs/README.md) - Complete API reference 


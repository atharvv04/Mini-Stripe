// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Payment Link types
export interface PaymentLink {
  id: string;
  linkId: string;
  amount: number;
  currency: string;
  description?: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  transactionCount?: number;
  totalCollected?: number;
  paymentUrl: string;
  merchantName?: string;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  currency?: string;
  description?: string;
  expiresAt?: string;
  maxUses?: number;
}

// Transaction types
export interface Transaction {
  id: string;
  paymentLinkId: string;
  linkId: string;
  payerEmail: string;
  payerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  bankResponseCode?: string;
  bankResponseMessage?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
  paymentDescription?: string;
  description?: string;
  originalAmount?: number;
  originalCurrency?: string;
}

export interface TransactionSummary {
  period: string;
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  averageAmount: number;
  successRate: string;
}

// Dashboard types
export interface DashboardStats {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  totalTransactions: number;
  completedTransactions: number;
  totalAmount: number;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  recentTransactions: Transaction[];
  recentLinks: PaymentLink[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    paymentLinks?: T[];
    transactions?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PaymentForm {
  payerEmail: string;
  payerName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon: any; // Simplified to avoid React import issues
} 
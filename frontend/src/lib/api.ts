import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  AuthResponse, 
  PaymentLink, 
  Transaction, 
  TransactionSummary, 
  DashboardData,
  CreatePaymentLinkRequest,
  PaymentForm,
  PaginatedResponse,
  User
} from '../types';

// Define ApiResponse locally to avoid import issues
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return response.data;
  },
};

// Payment Links API
export const paymentLinksAPI = {
  create: async (data: CreatePaymentLinkRequest): Promise<ApiResponse<{ paymentLink: PaymentLink }>> => {
    const response = await api.post<ApiResponse<{ paymentLink: PaymentLink }>>('/api/payments/links', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'expired' | 'inactive';
  }): Promise<PaginatedResponse<PaymentLink>> => {
    const response = await api.get<PaginatedResponse<PaymentLink>>('/api/payments/links', { params });
    return response.data;
  },

  getById: async (linkId: string): Promise<ApiResponse<{ paymentLink: PaymentLink }>> => {
    const response = await api.get<ApiResponse<{ paymentLink: PaymentLink }>>(`/api/payments/links/${linkId}`);
    return response.data;
  },

  update: async (linkId: string, data: {
    description?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ paymentLink: PaymentLink }>> => {
    const response = await api.put<ApiResponse<{ paymentLink: PaymentLink }>>(`/api/payments/links/${linkId}`, data);
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentLinkId?: string;
  }): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get<PaginatedResponse<Transaction>>('/api/transactions', { params });
    return response.data;
  },

  getById: async (transactionId: string): Promise<ApiResponse<{ transaction: Transaction }>> => {
    const response = await api.get<ApiResponse<{ transaction: Transaction }>>(`/api/transactions/${transactionId}`);
    return response.data;
  },

  getSummary: async (period?: number): Promise<ApiResponse<{ summary: TransactionSummary }>> => {
    const response = await api.get<ApiResponse<{ summary: TransactionSummary }>>('/api/transactions/summary', {
      params: { period },
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/users/profile');
    return response.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/api/users/profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{}>> => {
    const response = await api.put<ApiResponse<{}>>('/api/users/password', data);
    return response.data;
  },

  getDashboard: async (): Promise<ApiResponse<{ dashboard: DashboardData }>> => {
    const response = await api.get<ApiResponse<{ dashboard: DashboardData }>>('/api/users/dashboard');
    return response.data;
  },
};

// Public Payment API
export const publicPaymentAPI = {
  getPaymentLink: async (linkId: string): Promise<ApiResponse<{ paymentLink: PaymentLink }>> => {
    const response = await api.get<ApiResponse<{ paymentLink: PaymentLink }>>(`/pay/${linkId}`);
    return response.data;
  },

  processPayment: async (linkId: string, data: PaymentForm): Promise<ApiResponse<{
    transaction: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      createdAt: string;
      processedAt: string;
    };
    bankResponse: {
      responseCode: string;
      responseMessage: string;
      failureReason?: string;
    };
  }>> => {
    const response = await api.post<ApiResponse<{
      transaction: {
        id: string;
        status: string;
        amount: number;
        currency: string;
        createdAt: string;
        processedAt: string;
      };
      bankResponse: {
        responseCode: string;
        responseMessage: string;
        failureReason?: string;
      };
    }>>(`/pay/${linkId}/process`, data);
    return response.data;
  },
};

export default api; 
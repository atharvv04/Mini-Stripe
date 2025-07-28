import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usersAPI } from '../lib/api';
import { formatCurrency, formatRelativeTime, getStatusColor, getStatusIcon } from '../lib/utils';
import toast from 'react-hot-toast';

// Define types locally to avoid import issues
interface DashboardData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  stats: {
    totalLinks: number;
    activeLinks: number;
    expiredLinks: number;
    totalTransactions: number;
    completedTransactions: number;
    totalAmount: number;
  };
  recentTransactions: Transaction[];
  recentLinks: PaymentLink[];
}

interface Transaction {
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

interface PaymentLink {
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

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const response = await usersAPI.getDashboard();
        console.log('Dashboard response:', response);
        
        if (response.success && response.data) {
          setDashboardData(response.data.dashboard);
        } else {
          console.error('Dashboard response not successful:', response);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show a more user-friendly error message
        toast.error('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentTransactions, recentLinks } = dashboardData;

  const getStatusIconComponent = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {dashboardData.user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your payments today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-gray-600">
                From {stats.completedTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLinks}</div>
              <p className="text-xs text-gray-600">
                Out of {stats.totalLinks} total links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTransactions > 0 
                  ? Math.round((stats.completedTransactions / stats.totalTransactions) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-600">
                {stats.completedTransactions} of {stats.totalTransactions} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-gray-600">
                All time transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Create a new payment link or view your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/payment-links/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Payment Link</span>
                </Button>
              </Link>
              <Link to="/transactions">
                <Button variant="outline" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>View All Transactions</span>
                </Button>
              </Link>
              <Link to="/payment-links">
                <Button variant="outline" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Manage Payment Links</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest payment activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIconComponent(transaction.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.description || 'Payment'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(transaction.createdAt)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Create your first payment link to get started</p>
                  </div>
                )}
              </div>
              {recentTransactions.length > 0 && (
                <div className="mt-4">
                  <Link to="/transactions">
                    <Button variant="outline" className="w-full">
                      View All Transactions
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payment Links */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payment Links</CardTitle>
              <CardDescription>
                Your latest payment links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLinks.length > 0 ? (
                  recentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(link.amount, link.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {link.description || 'Payment Link'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {link.currentUses} uses
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(link.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No payment links yet</p>
                    <p className="text-sm">Create your first payment link to start accepting payments</p>
                  </div>
                )}
              </div>
              {recentLinks.length > 0 && (
                <div className="mt-4">
                  <Link to="/payment-links">
                    <Button variant="outline" className="w-full">
                      View All Payment Links
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 
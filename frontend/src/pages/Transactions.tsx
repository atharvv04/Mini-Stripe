import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Filter,
  Download,
  Search,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { transactionsAPI } from '../lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor, maskCardNumber } from '../lib/utils';
import toast from 'react-hot-toast';
// Add jsPDF and autoTable imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define Transaction interface locally to avoid import issues
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

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await transactionsAPI.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });

      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.payerName.toLowerCase().includes(searchLower) ||
      transaction.payerEmail.toLowerCase().includes(searchLower) ||
      transaction.id.toLowerCase().includes(searchLower) ||
      transaction.linkId.toLowerCase().includes(searchLower)
    );
  });

  // PDF Export function
  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const doc = new jsPDF();
    doc.text('Transaction History', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [[
        'Transaction ID',
        'Customer',
        'Email',
        'Amount',
        'Status',
        'Date',
      ]],
      body: filteredTransactions.map((t) => [
        t.id,
        t.payerName,
        t.payerEmail,
        formatCurrency(t.amount, t.currency),
        t.status,
        formatDate(t.createdAt),
      ]),
    });
    doc.save('transactions.pdf');
    toast.success('Transactions exported as PDF');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">
              View and manage your payment transactions
            </p>
          </div>
          <Button variant="outline" className="flex items-center space-x-2 text-gray-900" onClick={exportToPDF}>
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === '' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'failed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('failed')}
                >
                  Failed
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {filteredTransactions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transactions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.id.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.paymentDescription || 'Payment'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.payerName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.payerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.cardLast4 && (
                            <div className="text-sm text-gray-600">
                              {maskCardNumber(transaction.cardLast4)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(transaction.createdAt)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatRelativeTime(transaction.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first payment link to start seeing transactions'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-gray-600">
                All time transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  transactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
              <p className="text-xs text-gray-600">
                From completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.length > 0 
                  ? Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-600">
                Successful payments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 
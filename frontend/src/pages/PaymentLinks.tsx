import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Plus, 
  Copy, 
  ExternalLink, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { paymentLinksAPI } from '../lib/api';
import { formatCurrency, formatDate, formatRelativeTime, copyToClipboard } from '../lib/utils';
import toast from 'react-hot-toast';

// Define PaymentLink interface locally to avoid import issues
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

export function PaymentLinks() {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');

  useEffect(() => {
    fetchPaymentLinks();
  }, [currentPage, statusFilter]);

  const fetchPaymentLinks = async () => {
    try {
      setIsLoading(true);
      const response = await paymentLinksAPI.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.success && response.data) {
        setPaymentLinks(response.data.paymentLinks || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching payment links:', error);
      toast.error('Failed to load payment links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async (linkId: string) => {
    const frontendUrl = `http://localhost:5173/pay/${linkId}`;
    const success = await copyToClipboard(frontendUrl);
    if (success) {
      toast.success('Payment link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    try {
      const response = await paymentLinksAPI.update(linkId, {
        isActive: !currentStatus,
      });

      if (response.success) {
        toast.success(`Payment link ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchPaymentLinks(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to update payment link');
    }
  };

  const getStatusBadge = (link: PaymentLink) => {
    if (!link.isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }
    
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
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
            <h1 className="text-3xl font-bold text-gray-900">Payment Links</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your payment links
            </p>
          </div>
          <Link to="/payment-links/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Payment Link</span>
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex space-x-2">
                {(['all', 'active', 'expired', 'inactive'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Links Grid */}
        {paymentLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentLinks.map((link) => (
              <Card key={link.id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {formatCurrency(link.amount, link.currency)}
                      </CardTitle>
                      <CardDescription>
                        {link.description || 'Payment Link'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(link)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Link ID */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Link ID:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {link.linkId}
                      </span>
                    </div>

                    {/* Usage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Usage:</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {link.currentUses}
                          {link.maxUses && ` / ${link.maxUses}`}
                        </span>
                      </div>
                    </div>

                    {/* Expiry */}
                    {link.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(link.expiresAt)}</span>
                        </div>
                      </div>
                    )}

                    {/* Created */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{formatRelativeTime(link.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(link.linkId)}
                          className="flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`http://localhost:5173/pay/${link.linkId}`, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </Button>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(link.linkId, link.isActive)}
                        >
                          {link.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment links yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first payment link to start accepting payments
              </p>
              <Link to="/payment-links/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment Link
                </Button>
              </Link>
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
      </div>
    </DashboardLayout>
  );
} 
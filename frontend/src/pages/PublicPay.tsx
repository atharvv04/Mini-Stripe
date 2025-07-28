import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  Mail, 
  User, 
  Lock, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { publicPaymentAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

// Define types locally to avoid import issues
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

interface PaymentForm {
  payerEmail: string;
  payerName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

export function PublicPay() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    transactionId?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentForm>();

  const cardNumber = watch('cardNumber');

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!linkId) return;

      try {
        const response = await publicPaymentAPI.getPaymentLink(linkId);
        if (response.success && response.data) {
          setPaymentLink(response.data.paymentLink);
        } else {
          toast.error(response.message || 'Payment link not found or expired');
          navigate('/');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to load payment link';
        toast.error(errorMessage);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentLink();
  }, [linkId, navigate]);

  const onSubmit = async (data: PaymentForm) => {
    if (!linkId || !paymentLink) return;

    setIsProcessing(true);
    try {
      const response = await publicPaymentAPI.processPayment(linkId, data);
      
      if (response.success && response.data) {
        setPaymentResult({
          success: response.data.transaction.status === 'completed',
          message: response.data.transaction.status === 'completed' 
            ? 'Payment processed successfully!' 
            : 'Payment failed',
          transactionId: response.data.transaction.id,
        });

        if (response.data.transaction.status === 'completed') {
          toast.success('Payment completed successfully!');
        } else {
          toast.error(response.data.bankResponse?.failureReason || 'Payment failed');
        }
      } else {
        toast.error('Payment processing failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Payment processing failed';
      toast.error(errorMessage);
      setPaymentResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Link Not Found</h1>
          <p className="text-gray-600">This payment link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {paymentResult.success ? (
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            )}
            <CardTitle className={paymentResult.success ? 'text-green-600' : 'text-red-600'}>
              {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
            </CardTitle>
            <CardDescription>
              {paymentResult.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {paymentResult.transactionId && (
              <p className="text-sm text-gray-600 mb-4">
                Transaction ID: {paymentResult.transactionId}
              </p>
            )}
            <Button onClick={() => window.close()} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600">Secure payment powered by Mini-Stripe</p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{formatCurrency(paymentLink.amount, paymentLink.currency)}</span>
              </div>
              {paymentLink.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{paymentLink.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Merchant:</span>
                <span className="font-medium">{paymentLink.merchantName}</span>
              </div>
              {paymentLink.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{formatDate(paymentLink.expiresAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Enter your payment details to complete the transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.payerEmail?.message}
                {...register('payerEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Input
                label="Full name"
                type="text"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.payerName?.message}
                {...register('payerName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />

              <Input
                label="Card number"
                type="text"
                leftIcon={<CreditCard className="w-4 h-4" />}
                placeholder="1234 5678 9012 3456"
                error={errors.cardNumber?.message}
                value={cardNumber ? formatCardNumber(cardNumber) : ''}
                {...register('cardNumber', {
                  required: 'Card number is required',
                  pattern: {
                    value: /^\d{13,19}$/,
                    message: 'Please enter a valid card number',
                  },
                  setValueAs: (value) => value.replace(/\s/g, ''),
                })}
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Expiry month"
                  type="number"
                  leftIcon={<Calendar className="w-4 h-4" />}
                  placeholder="MM"
                  min="1"
                  max="12"
                  error={errors.expiryMonth?.message}
                  {...register('expiryMonth', {
                    required: 'Expiry month is required',
                    min: { value: 1, message: 'Invalid month' },
                    max: { value: 12, message: 'Invalid month' },
                    valueAsNumber: true,
                  })}
                />

                <Input
                  label="Expiry year"
                  type="number"
                  placeholder="YYYY"
                  min={new Date().getFullYear()}
                  error={errors.expiryYear?.message}
                  {...register('expiryYear', {
                    required: 'Expiry year is required',
                    min: { 
                      value: new Date().getFullYear(), 
                      message: 'Card has expired' 
                    },
                    valueAsNumber: true,
                  })}
                />

                <Input
                  label="CVV"
                  type="text"
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="123"
                  maxLength={4}
                  error={errors.cvv?.message}
                  {...register('cvv', {
                    required: 'CVV is required',
                    pattern: {
                      value: /^\d{3,4}$/,
                      message: 'Please enter a valid CVV',
                    },
                  })}
                />
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(paymentLink.amount, paymentLink.currency)}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This payment is processed securely by Mini-Stripe. 
            Your card information is encrypted and never stored.
          </p>
        </div>
      </div>
    </div>
  );
} 
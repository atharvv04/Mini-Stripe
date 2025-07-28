import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Users, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { paymentLinksAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface CreatePaymentLinkForm {
  amount: number;
  currency: string;
  description?: string;
  expiresAt?: string;
  maxUses?: number;
}

export function CreatePaymentLink() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePaymentLinkForm>({
    defaultValues: {
      currency: 'USD',
    },
  });

  const amount = watch('amount');

  const onSubmit = async (data: CreatePaymentLinkForm) => {
    setIsLoading(true);
    try {
      const response = await paymentLinksAPI.create(data);
      
      if (response.success && response.data) {
        toast.success('Payment link created successfully!');
        navigate('/payment-links');
      } else {
        toast.error(response.message || 'Failed to create payment link');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create payment link';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/payment-links')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Payment Links</span>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Payment Link</h1>
          <p className="text-gray-600 mt-2">
            Create a new payment link to start accepting payments
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Link Details</span>
            </CardTitle>
            <CardDescription>
              Configure your payment link settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  error={errors.amount?.message}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be at least $0.01' },
                    valueAsNumber: true,
                  })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    {...register('currency')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <Input
                label="Description (optional)"
                type="text"
                placeholder="What is this payment for?"
                error={errors.description?.message}
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must be less than 500 characters' },
                })}
              />

              {/* Expiry Date */}
              <Input
                label="Expiry Date (optional)"
                type="datetime-local"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.expiresAt?.message}
                {...register('expiresAt', {
                  validate: (value) => {
                    if (value && new Date(value) <= new Date()) {
                      return 'Expiry date must be in the future';
                    }
                    return true;
                  },
                })}
              />

              {/* Max Uses */}
              <Input
                label="Maximum Uses (optional)"
                type="number"
                min="1"
                leftIcon={<Users className="w-4 h-4" />}
                placeholder="Leave empty for unlimited"
                error={errors.maxUses?.message}
                {...register('maxUses', {
                  min: { value: 1, message: 'Maximum uses must be at least 1' },
                  valueAsNumber: true,
                })}
              />

              {/* Preview */}
              {amount && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: watch('currency') || 'USD',
                          }).format(amount)}
                        </span>
                      </div>
                      {watch('description') && (
                        <div className="flex justify-between">
                          <span>Description:</span>
                          <span className="font-medium">{watch('description')}</span>
                        </div>
                      )}
                      {watch('expiresAt') && (
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="font-medium">
                            {new Date(watch('expiresAt')!).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {watch('maxUses') && (
                        <div className="flex justify-between">
                          <span>Max Uses:</span>
                          <span className="font-medium">{watch('maxUses')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  <span>Create Payment Link</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/payment-links')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 
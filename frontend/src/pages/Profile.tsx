import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Calendar, 
  Save,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { usersAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface ProfileForm {
  firstName: string;
  lastName: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm<ProfileForm>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm,
  } = useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.updateProfile(data);
      
      if (response.success && response.data) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const response = await usersAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        resetPasswordForm();
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    type="text"
                    leftIcon={<User className="w-4 h-4" />}
                    error={profileErrors.firstName?.message}
                    {...registerProfile('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                  />

                  <Input
                    label="Last name"
                    type="text"
                    leftIcon={<User className="w-4 h-4" />}
                    error={profileErrors.lastName?.message}
                    {...registerProfile('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                  />
                </div>

                <Input
                  label="Email address"
                  type="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={user.email}
                  disabled
                  helperText="Email cannot be changed"
                />

                <Input
                  label="Member since"
                  type="text"
                  leftIcon={<Calendar className="w-4 h-4" />}
                  value={new Date(user.createdAt).toLocaleDateString()}
                  disabled
                  helperText="Account creation date"
                />

                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <Input
                  label="Current password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Eye className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                />

                <Input
                  label="New password"
                  type={showNewPassword ? 'text' : 'password'}
                  leftIcon={<Eye className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={passwordErrors.newPassword?.message}
                  helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number',
                    },
                  })}
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  leftIcon={<Eye className="w-4 h-4" />}
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />

                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                  loading={isPasswordLoading}
                  disabled={isPasswordLoading}
                >
                  <Save className="w-4 h-4" />
                  <span>Change Password</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 
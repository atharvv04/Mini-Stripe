import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette,
  ArrowLeft,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

interface SettingsState {
  emailNotifications: boolean;
  paymentNotifications: boolean;
  securityAlerts: boolean;
  darkMode: boolean;
  autoLogout: boolean;
}

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    paymentNotifications: true,
    securityAlerts: true,
    darkMode: false,
    autoLogout: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your application preferences and notifications
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive important updates via email
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleSetting('emailNotifications')}
                  className="flex items-center space-x-2"
                >
                  {settings.emailNotifications ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Payment Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Get notified when payments are received
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleSetting('paymentNotifications')}
                  className="flex items-center space-x-2"
                >
                  {settings.paymentNotifications ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Receive alerts for suspicious activity
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleSetting('securityAlerts')}
                  className="flex items-center space-x-2"
                >
                  {settings.securityAlerts ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-600">
                    Switch between light and dark themes
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleSetting('darkMode')}
                  className="flex items-center space-x-2"
                >
                  {settings.darkMode ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto Logout</h3>
                  <p className="text-sm text-gray-600">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleSetting('autoLogout')}
                  className="flex items-center space-x-2"
                >
                  {settings.autoLogout ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              loading={isLoading}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
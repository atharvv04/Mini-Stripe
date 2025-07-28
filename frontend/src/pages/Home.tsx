import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Home() {
  const features = [
    {
      icon: CreditCard,
      title: 'Payment Links',
      description: 'Create shareable payment links in seconds. No coding required.',
    },
    {
      icon: Shield,
      title: 'Secure Processing',
      description: 'Bank-level security with encrypted transactions and fraud protection.',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Get started in minutes with our simple onboarding process.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track payments, view insights, and manage your business growth.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Mini-Stripe</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Accept Payments
            <span className="text-blue-600"> Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create payment links, process transactions, and grow your business with our 
            simplified payment platform. No complex integrations required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Accepting Payments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/atharvv04/Mini-Stripe" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Source Code
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to accept payments
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you grow your business and streamline payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Look Around (Free) */}
          <div className="border rounded-2xl p-8 bg-white flex flex-col items-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Look Around (Free)</h3>
            <p className="text-gray-600 mb-4">$0</p>
            <Button variant="outline" className="mb-6">Get Started</Button>
            <ul className="space-y-2 text-gray-700 text-left w-full max-w-xs mx-auto">
              <li>✔️ Test the functionalities</li>
              <li>✔️ Try sending money to <span className="font-mono">atharvbhatt10@gmail.com</span></li>
            </ul>
          </div>
          {/* Hire Me (Most Popular) */}
          <div className="border-2 border-blue-500 rounded-2xl p-8 bg-white flex flex-col items-center shadow-lg relative">
            <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Hire Me</h3>
            <p className="text-gray-900 text-3xl font-bold mb-1">Price: Salary</p>
            <p className="text-gray-600 mb-4">Let's work together!</p>
            <Button className="mb-6 bg-blue-600 hover:bg-blue-900 text-white">Contact</Button>
            <ul className="space-y-2 text-gray-700 text-left w-full max-w-xs mx-auto">
              <li>✔️ Great employee</li>
              <li>✔️ Fast learner</li>
              <li>✔️ Team player</li>
              <li>✔️ 24/7 Support</li>
              <li>✔️ 100% Money Back Guarantee</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using Mini-Stripe to accept payments online.
            Set up your account in minutes and start accepting payments today.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Your Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Mini-Stripe</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 Mini-Stripe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
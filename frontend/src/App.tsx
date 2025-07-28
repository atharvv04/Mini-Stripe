import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PaymentLinks } from './pages/PaymentLinks';
import { CreatePaymentLink } from './pages/CreatePaymentLink';
import { Transactions } from './pages/Transactions';
import { PublicPay } from './pages/PublicPay';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

function App() {
  console.log('App component is rendering');
  
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment-links" element={<PaymentLinks />} />
          <Route path="/payment-links/new" element={<CreatePaymentLink />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/pay/:linkId" element={<PublicPay />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test" element={
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
              <h1>Test Route</h1>
              <p>If you can see this, routing is working!</p>
            </div>
          } />
                  </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

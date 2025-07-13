import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;

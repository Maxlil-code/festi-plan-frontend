import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardOrganizer from './DashboardOrganizer';
import DashboardProvider from './DashboardProvider';
import DashboardAdmin from './DashboardAdmin';

const DashboardRouter = () => {
  const { role } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          role === 'organizer' ? (
            <DashboardOrganizer />
          ) : role === 'provider' ? (
            <DashboardProvider />
          ) : role === 'admin' ? (
            <DashboardAdmin />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default DashboardRouter;

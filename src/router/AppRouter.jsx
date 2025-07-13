import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Layout, ErrorBoundary } from '../components';
import PrivateRoute from './PrivateRoute';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardRouter from '../pages/DashboardRouter';
import CreateEventWizard from '../pages/CreateEventWizard';
import EventDetail from '../pages/EventDetail';
import VenueListPage from '../pages/VenueListPage';
import VenueDetail from '../pages/VenueDetail';
import ChatPage from '../pages/ChatPage';
import QuoteDetailPage from '../pages/QuoteDetailPage';
import QuoteListPage from '../pages/QuoteListPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import SocketTestPage from '../pages/SocketTestPage';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <Router>
                <Layout>
                  <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <DashboardRouter />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/events/new"
              element={
                <PrivateRoute requiredRole="organizer">
                  <CreateEventWizard />
                </PrivateRoute>
              }
            />
            
            {/* Draft editing route (section 10.8) */}
            <Route
              path="/events/edit/:eventId"
              element={
                <PrivateRoute requiredRole="organizer">
                  <CreateEventWizard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/events/:id"
              element={
                <PrivateRoute requiredRole="organizer">
                  <EventDetail />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/venues"
              element={
                <PrivateRoute>
                  <VenueListPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/venues/:id"
              element={
                <PrivateRoute>
                  <VenueDetail />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/chat/:conversationId"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/quotes"
              element={
                <PrivateRoute requiredRole="organizer">
                  <QuoteListPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/quotes/:id"
              element={
                <PrivateRoute>
                  <QuoteDetailPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/bookings/:id"
              element={
                <PrivateRoute>
                  <BookingDetailPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/socket-test"
              element={
                <PrivateRoute>
                  <SocketTestPage />
                </PrivateRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
      </SocketProvider>
      </ToastProvider>
    </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppRouter;

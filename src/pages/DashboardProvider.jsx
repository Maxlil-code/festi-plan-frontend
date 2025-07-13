import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { quoteService } from '../services/quoteService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const DashboardProvider = () => {
  const [quotes, setQuotes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quotesResponse, bookingsResponse] = await Promise.all([
        quoteService.getQuotes(),
        bookingService.getBookings(),
      ]);

      const quotesData = quotesResponse.quotes || [];
      const bookingsData = bookingsResponse.bookings || [];

      setQuotes(quotesData);
      setBookings(bookingsData);

      // Calculate stats
      const totalQuotes = quotesData.length;
      const pendingQuotes = quotesData.filter(q => q.status === 'pending').length;
      const acceptedQuotes = quotesData.filter(q => q.status === 'accepted').length;
      const totalBookings = bookingsData.length;
      const revenue = bookingsData
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + (booking.total || 0), 0);

      setStats({
        totalQuotes,
        pendingQuotes,
        acceptedQuotes,
        totalBookings,
        revenue,
      });
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Provider'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your quotes and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedQuotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quotes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Quotes</h2>
            </div>
            
            {quotes.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quote requests will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {quotes.slice(0, 5).map((quote) => (
                  <li key={quote.id}>
                    <Link
                      to={`/quotes/${quote.id}`}
                      className="block hover:bg-gray-50 px-6 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {quote.event?.title || 'Event Quote'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {quote.service} - {formatCurrency(quote.amount)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(quote.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
            </div>
            
            {bookings.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Confirmed bookings will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <li key={booking.id}>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="block hover:bg-gray-50 px-6 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {booking.event?.title || 'Event Booking'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(booking.event?.date)} - {formatCurrency(booking.total)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {booking.service}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProvider;

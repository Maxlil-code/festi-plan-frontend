import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { bookingService } from '../services/bookingService';
import { Button, Card, Badge, Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getBooking(id);
      setBooking(response.booking);
    } catch (error) {
      setError('Failed to fetch booking details');
      console.error('Error fetching booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setIsActionLoading(true);
      await bookingService.cancelBooking(id);
      await fetchBooking(); // Refresh data
    } catch (error) {
      setError('Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsActionLoading(true);
      await bookingService.confirmBooking(id);
      await fetchBooking(); // Refresh data
    } catch (error) {
      setError('Failed to confirm booking');
      console.error('Error confirming booking:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const canCancelBooking = () => {
    return booking?.status === 'confirmed' || booking?.status === 'pending';
  };

  const canConfirmBooking = () => {
    return booking?.status === 'pending' && user?.role === 'provider';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Booking not found</h2>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking #{booking.id}
              </h1>
              <p className="mt-2 text-gray-600">
                {booking.service} for {booking.event?.title}
              </p>
            </div>
            <Badge variant={getStatusColor(booking.status)} size="large">
              {booking.status}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Event Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{booking.event?.title}</p>
                      {booking.event?.description && (
                        <p className="text-gray-600 mt-1">{booking.event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {formatDate(booking.event?.date)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {booking.event?.startTime} - {booking.event?.endTime}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {booking.event?.location || booking.venue?.name}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {booking.event?.guestCount} guests
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Details */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{booking.service}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-xl text-primary-600">
                      {formatCurrency(booking.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>

                  {booking.confirmedAt && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Confirmed Date</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(booking.confirmedAt)}
                      </span>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="py-3">
                      <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(booking.subtotal || booking.total)}
                    </span>
                  </div>
                  
                  {booking.tax && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(booking.tax)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-primary-600">
                      {formatCurrency(booking.total)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {booking.paymentStatus || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Provider/Client Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {user?.role === 'provider' ? 'Client Information' : 'Provider Information'}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-900">
                      {user?.role === 'provider' 
                        ? `${booking.organizer?.firstName} ${booking.organizer?.lastName}`
                        : booking.provider?.name
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">
                      {user?.role === 'provider' 
                        ? booking.organizer?.email
                        : booking.provider?.email
                      }
                    </span>
                  </div>
                  
                  {((user?.role === 'provider' && booking.organizer?.phone) || 
                    (user?.role !== 'provider' && booking.provider?.phone)) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">
                        {user?.role === 'provider' 
                          ? booking.organizer.phone
                          : booking.provider.phone
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  {canConfirmBooking() && (
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isActionLoading}
                      className="w-full"
                      variant="primary"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  
                  <Link
                    to={`/chat?user=${user?.role === 'provider' ? booking.organizer?.id : booking.provider?.id}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="w-full"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print Booking
                  </Button>
                  
                  {canCancelBooking() && (
                    <Button
                      onClick={handleCancelBooking}
                      disabled={isActionLoading}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Booking Summary */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg text-primary-600">
                        {formatCurrency(booking.total)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.event?.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;

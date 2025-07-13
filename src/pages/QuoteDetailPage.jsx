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
  PencilIcon
} from '@heroicons/react/24/outline';
import { quoteService } from '../services/quoteService';
import { Button, Card, Badge, Modal, Input, Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Edit quote modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    notes: '',
    validUntil: ''
  });
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      const response = await quoteService.getQuote(id);
      setQuote(response.quote);
      
      // Initialize edit form with current values
      setEditForm({
        amount: response.quote?.amount?.toString() || '',
        notes: response.quote?.notes || '',
        validUntil: response.quote?.validUntil 
          ? new Date(response.quote.validUntil).toISOString().split('T')[0] 
          : ''
      });
    } catch (error) {
      setError('Failed to fetch quote details');
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    try {
      setIsActionLoading(true);
      await quoteService.updateQuoteStatus(id, 'accepted');
      await fetchQuote(); // Refresh data
    } catch (error) {
      setError('Failed to accept quote');
      console.error('Error accepting quote:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    try {
      setIsActionLoading(true);
      await quoteService.updateQuoteStatus(id, 'rejected', rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchQuote(); // Refresh data
    } catch (error) {
      setError('Failed to reject quote');
      console.error('Error rejecting quote:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateQuote = async () => {
    try {
      setIsActionLoading(true);
      await quoteService.updateQuote(id, {
        amount: parseFloat(editForm.amount),
        notes: editForm.notes,
        validUntil: editForm.validUntil ? new Date(editForm.validUntil).toISOString() : null
      });
      setShowEditModal(false);
      await fetchQuote(); // Refresh data
    } catch (error) {
      setError('Failed to update quote');
      console.error('Error updating quote:', error);
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
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const canModifyQuote = () => {
    return quote?.status === 'pending' && user?.role === 'provider';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Quote not found</h2>
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
                Quote #{quote.id}
              </h1>
              <p className="mt-2 text-gray-600">
                {quote.service} for {quote.event?.title}
              </p>
            </div>
            <Badge variant={getStatusColor(quote.status)} size="large">
              {quote.status}
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
                      <p className="font-medium text-gray-900">{quote.event?.title}</p>
                      {quote.event?.description && (
                        <p className="text-gray-600 mt-1">{quote.event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {formatDate(quote.event?.date)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {quote.event?.startTime} - {quote.event?.endTime}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {quote.event?.location || quote.venue?.name}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {quote.event?.guestCount} guests
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quote Details */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quote Details
                  </h2>
                  {canModifyQuote() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditModal(true)}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Quote
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{quote.service}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-xl text-primary-600">
                      {formatCurrency(quote.amount)}
                    </span>
                  </div>

                  {quote.validUntil && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Valid Until</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(quote.validUntil)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(quote.createdAt)}
                    </span>
                  </div>

                  {quote.notes && (
                    <div className="py-3">
                      <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Client Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Information
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-900">
                      {quote.organizer?.firstName} {quote.organizer?.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">
                      {quote.organizer?.email}
                    </span>
                  </div>
                  
                  {quote.organizer?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">
                        {quote.organizer.phone}
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
            {canModifyQuote() && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleAcceptQuote}
                      disabled={isActionLoading}
                      className="w-full"
                      variant="primary"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Accept Quote
                    </Button>
                    
                    <Button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isActionLoading}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Quote
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Quote Summary */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quote Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg text-primary-600">
                        {formatCurrency(quote.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Client */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Client
                </h3>
                
                <div className="space-y-3">
                  <Link
                    to={`/chat?user=${quote.organizer?.id}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Send Message
                    </Button>
                  </Link>
                  
                  <a
                    href={`mailto:${quote.organizer?.email}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Send Email
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Quote Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Quote"
        >
          <div className="space-y-4">
            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              placeholder="Enter amount"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                value={editForm.validUntil}
                onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add any additional notes or terms..."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleUpdateQuote}
                disabled={isActionLoading}
                className="flex-1"
              >
                Update Quote
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Quote Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Quote"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for rejecting this quote. This will help the client understand your decision.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Explain why you're rejecting this quote..."
                required
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleRejectQuote}
                disabled={isActionLoading || !rejectionReason.trim()}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                Reject Quote
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default QuoteDetailPage;

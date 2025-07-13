import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { quoteService } from '../services/quoteService';
import { Button, Card, Badge, Input, Spinner } from '../components';

const QuoteListPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterAndSortQuotes();
  }, [quotes, searchTerm, statusFilter, sortBy]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await quoteService.getQuotes();
      setQuotes(response.quotes || []);
    } catch (error) {
      setError('Failed to fetch quotes');
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortQuotes = () => {
    let filtered = [...quotes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high':
          return (b.amount || 0) - (a.amount || 0);
        case 'amount-low':
          return (a.amount || 0) - (b.amount || 0);
        case 'event-date':
          return new Date(a.event?.date || 0) - new Date(b.event?.date || 0);
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
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
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getStatusCounts = () => {
    return {
      all: quotes.length,
      pending: quotes.filter(q => q.status === 'pending').length,
      accepted: quotes.filter(q => q.status === 'accepted').length,
      rejected: quotes.filter(q => q.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
          <p className="mt-2 text-gray-600">
            Manage all your quote requests from service providers
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status ({statusCounts.all})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                  <option value="accepted">Accepted ({statusCounts.accepted})</option>
                  <option value="rejected">Rejected ({statusCounts.rejected})</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">Highest Amount</option>
                  <option value="amount-low">Lowest Amount</option>
                  <option value="event-date">Event Date</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.accepted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Quote</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.length > 0 
                    ? formatCurrency(quotes.reduce((sum, q) => sum + (q.amount || 0), 0) / quotes.length)
                    : '$0'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quote List */}
        {filteredQuotes.length === 0 ? (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No quotes found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Quote requests from providers will appear here'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <Link to={`/quotes/${quote.id}`} className="block p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {quote.service}
                        </h3>
                        <Badge variant={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>{quote.event?.title || 'Event'}</span>
                        </div>

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span>{quote.provider?.name || 'Provider'}</span>
                        </div>

                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          <span className="font-semibold text-primary-600">
                            {formatCurrency(quote.amount || 0)}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          <span>{formatDate(quote.createdAt)}</span>
                        </div>
                      </div>

                      {quote.notes && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {quote.notes}
                        </p>
                      )}

                      {quote.validUntil && new Date(quote.validUntil) > new Date() && (
                        <div className="mt-3 flex items-center text-sm text-amber-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Valid until {formatDate(quote.validUntil)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteListPage;

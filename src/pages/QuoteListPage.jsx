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
      setQuotes(response.data.quotes || []);
    } catch (error) {
      setError('Échec du chargement des devis');
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
        quote.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.provider?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.provider?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
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
          return parseFloat(b.total || 0) - parseFloat(a.total || 0);
        case 'amount-low':
          return parseFloat(a.total || 0) - parseFloat(b.total || 0);
        case 'event-date':
          return new Date(a.event?.date || 0) - new Date(b.event?.date || 0);
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
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
      draft: quotes.filter(q => q.status === 'draft').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Devis d'événements</h1>
          <p className="mt-2 text-gray-600">
            Gérez tous vos devis de fournisseurs de services
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
                    placeholder="Rechercher des devis..."
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
                  <option value="all">Tous les statuts ({statusCounts.all})</option>
                  <option value="draft">Brouillon ({statusCounts.draft})</option>
                  <option value="pending">En attente ({statusCounts.pending})</option>
                  <option value="accepted">Accepté ({statusCounts.accepted})</option>
                  <option value="rejected">Rejeté ({statusCounts.rejected})</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="amount-high">Montant décroissant</option>
                  <option value="amount-low">Montant croissant</option>
                  <option value="event-date">Date d'événement</option>
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
                <p className="text-sm font-medium text-gray-500">Total des devis</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pending + statusCounts.draft}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Acceptés</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.accepted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Devis moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.length > 0 
                    ? formatCurrency(quotes.reduce((sum, q) => sum + parseFloat(q.total || 0), 0) / quotes.length)
                    : '0€'
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun devis trouvé</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : 'Les demandes de devis des fournisseurs apparaîtront ici'
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
                          {quote.venue?.name || 'Lieu non spécifié'}
                        </h3>
                        <Badge variant={getStatusColor(quote.status)}>
                          {quote.status === 'draft' ? 'Brouillon' : 
                           quote.status === 'pending' ? 'En attente' :
                           quote.status === 'accepted' ? 'Accepté' :
                           quote.status === 'rejected' ? 'Rejeté' : quote.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>{quote.event?.name || 'Événement'}</span>
                        </div>

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span>{quote.provider ? `${quote.provider.firstName} ${quote.provider.lastName}` : 'Fournisseur'}</span>
                        </div>

                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          <span className="font-semibold text-primary-600">
                            {formatCurrency(quote.total || 0)}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          <span>{formatDate(quote.createdAt)}</span>
                        </div>
                      </div>

                      {/* Quote details */}
                      {quote.items && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            {JSON.parse(quote.items).length} article(s) - 
                            Sous-total: {formatCurrency(quote.subtotal)} + 
                            TVA: {formatCurrency(quote.vat)}
                          </p>
                        </div>
                      )}

                      {quote.validUntil && new Date(quote.validUntil) > new Date() && (
                        <div className="mt-3 flex items-center text-sm text-amber-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Valide jusqu'au {formatDate(quote.validUntil)}</span>
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

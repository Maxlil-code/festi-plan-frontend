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
      setQuote(response.data);
      
      // Initialize edit form with current values
      setEditForm({
        amount: response.data?.total?.toString() || '',
        notes: response.data?.notes || '',
        validUntil: response.data?.validUntil 
          ? new Date(response.data.validUntil).toISOString().split('T')[0] 
          : ''
      });
    } catch (error) {
      setError('Échec du chargement des détails du devis');
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
      setError('Échec de l\'acceptation du devis');
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
      setError('Échec du rejet du devis');
      console.error('Error rejecting quote:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateQuote = async () => {
    try {
      setIsActionLoading(true);
      await quoteService.updateQuote(id, {
        total: parseFloat(editForm.amount),
        notes: editForm.notes,
        validUntil: editForm.validUntil ? new Date(editForm.validUntil).toISOString() : null
      });
      setShowEditModal(false);
      await fetchQuote(); // Refresh data
    } catch (error) {
      setError('Échec de la mise à jour du devis');
      console.error('Error updating quote:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CF', {
      style: 'currency',
      currency: 'XAF',
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
      default:
        return 'neutral';
    }
  };

  const canModifyQuote = () => {
    return (quote?.status === 'pending' || quote?.status === 'draft') && 
           (user?.role === 'provider' || user?.id === quote?.providerId);
  };

  const canAcceptRejectQuote = () => {
    return quote?.status === 'pending' && user?.role === 'organizer' && 
           user?.id === quote?.event?.organizerId;
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
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Devis introuvable</h2>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4"
          >
            Retour au tableau de bord
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
              Retour au tableau de bord
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Devis #{quote.id}
              </h1>
              <p className="mt-2 text-gray-600">
                {quote.venue?.name} pour {quote.event?.name}
              </p>
            </div>
            <Badge variant={getStatusColor(quote.status)} size="large">
              {quote.status === 'draft' ? 'Brouillon' : 
               quote.status === 'pending' ? 'En attente' :
               quote.status === 'accepted' ? 'Accepté' :
               quote.status === 'rejected' ? 'Rejeté' : quote.status}
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
                  Détails de l'événement
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{quote.event?.name}</p>
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
                      {quote.venue?.name} - {quote.venue?.address}, {quote.venue?.city}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {quote.event?.guestCount} invités
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
                    Détails du devis
                  </h2>
                  {canModifyQuote() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditModal(true)}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Modifier le devis
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Quote Items */}
                  {quote.items && (
                    <div className="py-3 border-b">
                      <h3 className="font-medium text-gray-900 mb-2">Articles</h3>
                      {(() => {
                        try {
                          const items = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
                          return Array.isArray(items) ? items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <div className="flex-1">
                                <span className="text-gray-900">{item.description || item.name || 'Article sans nom'}</span>
                                {item.quantity && item.quantity > 1 && (
                                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                )}
                              </div>
                              <div className="text-right">
                                {item.quantity && item.quantity > 1 && item.unitPrice && (
                                  <div className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} × {item.quantity}</div>
                                )}
                                <span className="font-medium">{formatCurrency(item.total || item.price || 0)}</span>
                              </div>
                            </div>
                          )) : <p className="text-gray-500 text-sm">Aucun article détaillé</p>;
                        } catch (e) {
                          console.error('Error parsing quote items:', e);
                          return <p className="text-gray-500 text-sm">Erreur lors du chargement des articles</p>;
                        }
                      })()}
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium text-gray-900">{formatCurrency(quote.subtotal || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">TVA ({((quote.vat || 0) / (quote.subtotal || 1) * 100).toFixed(1)}%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(quote.vat || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b bg-gray-50 -mx-6 px-6">
                    <span className="text-lg font-semibold text-gray-900">Total TTC</span>
                    <span className="font-bold text-xl text-primary-600">
                      {formatCurrency(quote.total || 0)}
                    </span>
                  </div>

                  {quote.validUntil && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Valide jusqu'au</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(quote.validUntil)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Créé le</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(quote.createdAt)}
                    </span>
                  </div>

                  {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Modifié le</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(quote.updatedAt)}
                      </span>
                    </div>
                  )}

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
            {user?.role === 'provider' && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations du client
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nom</span>
                      <span className="font-medium text-gray-900">
                        {quote.event?.organizer?.firstName || quote.organizer?.firstName || 'N/A'} {quote.event?.organizer?.lastName || quote.organizer?.lastName || ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">
                        {quote.event?.organizer?.email || quote.organizer?.email || 'N/A'}
                      </span>
                    </div>
                    
                    {(quote.event?.organizer?.phone || quote.organizer?.phone) && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Téléphone</span>
                        <span className="font-medium text-gray-900">
                          {quote.event?.organizer?.phone || quote.organizer?.phone}
                        </span>
                      </div>
                    )}
                    
                    {(quote.event?.organizer?.company || quote.organizer?.company) && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Entreprise</span>
                        <span className="font-medium text-gray-900">
                          {quote.event?.organizer?.company || quote.organizer?.company}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Provider Information */}
            {user?.role === 'organizer' && quote.provider && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations du prestataire
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nom</span>
                      <span className="font-medium text-gray-900">
                        {quote.provider.name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">
                        {quote.provider.email || 'N/A'}
                      </span>
                    </div>
                    
                    {quote.provider.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Téléphone</span>
                        <span className="font-medium text-gray-900">
                          {quote.provider.phone}
                        </span>
                      </div>
                    )}
                    
                    {quote.provider.description && (
                      <div className="pt-2">
                        <span className="text-gray-600 text-sm">Description</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {quote.provider.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {(canModifyQuote() || canAcceptRejectQuote()) && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    {canAcceptRejectQuote() && (
                      <>
                        <Button
                          onClick={handleAcceptQuote}
                          disabled={isActionLoading}
                          className="w-full"
                          variant="primary"
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Accepter le devis
                        </Button>
                        
                        <Button
                          onClick={() => setShowRejectModal(true)}
                          disabled={isActionLoading}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircleIcon className="h-5 w-5 mr-2" />
                          Rejeter le devis
                        </Button>
                      </>
                    )}
                    
                    {canModifyQuote() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditModal(true)}
                        className="w-full"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Modifier le devis
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quote Summary */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé du devis
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Montant total</p>
                      <p className="font-bold text-lg text-primary-600">
                        {formatCurrency(quote.total)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <Badge variant={getStatusColor(quote.status)}>
                        {quote.status === 'draft' ? 'Brouillon' : 
                         quote.status === 'pending' ? 'En attente' :
                         quote.status === 'accepted' ? 'Accepté' :
                         quote.status === 'rejected' ? 'Rejeté' : quote.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Client */}
            {user?.role === 'provider' && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contacter le client
                  </h3>
                  
                  <div className="space-y-3">
                    <Link
                      to={`/chat?user=${quote.event?.organizer?.id || quote.organizerId}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        Envoyer un message
                      </Button>
                    </Link>
                    
                    <a
                      href={`mailto:${quote.event?.organizer?.email || quote.organizer?.email}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        Envoyer un email
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            )}

            {/* Contact Provider */}
            {user?.role === 'organizer' && quote.provider && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contacter le prestataire
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{quote.provider.name}</p>
                      {quote.provider.email && (
                        <p className="text-gray-600">{quote.provider.email}</p>
                      )}
                      {quote.provider.phone && (
                        <p className="text-gray-600">{quote.provider.phone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        to={`/chat?user=${quote.providerId}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Envoyer un message
                        </Button>
                      </Link>
                      
                      {quote.provider.email && (
                        <a
                          href={`mailto:${quote.provider.email}`}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            Envoyer un email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Quote Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Modifier le devis"
        >
          <div className="space-y-4">
            <Input
              label="Montant (XAF)"
              type="number"
              step="0.01"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              placeholder="Entrez le montant"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valide jusqu'au
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
                placeholder="Ajoutez des notes ou conditions supplémentaires..."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleUpdateQuote}
                disabled={isActionLoading}
                className="flex-1"
              >
                Mettre à jour le devis
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Quote Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Rejeter le devis"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Veuillez fournir une raison pour rejeter ce devis. Cela aidera le client à comprendre votre décision.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Expliquez pourquoi vous rejetez ce devis..."
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
                Rejeter le devis
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default QuoteDetailPage;

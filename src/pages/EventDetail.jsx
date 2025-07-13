import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Spinner } from '../components';
import { eventService } from '../services/eventService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch event details
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);
        
        // Fetch event stats if not a draft
        if (eventData.status !== 'draft') {
          try {
            const statsData = await eventService.getEventStats(id);
            setStats(statsData);
          } catch (statsError) {
            // Stats might not be available for all events, ignore error
            console.warn('Could not fetch event stats:', statsError);
          }
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Impossible de charger les détails de l\'événement');
        addToast('Erreur lors du chargement de l\'événement', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, addToast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Heure non définie';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Budget non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { 
          label: 'Brouillon', 
          color: 'bg-gray-100 text-gray-800',
          icon: DocumentTextIcon,
          description: 'Cet événement est en cours de préparation'
        };
      case 'planning':
        return { 
          label: 'Planification', 
          color: 'bg-blue-100 text-blue-800',
          icon: ClockIcon,
          description: 'Cet événement est en cours de planification'
        };
      case 'confirmed':
        return { 
          label: 'Confirmé', 
          color: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
          description: 'Cet événement est confirmé et prêt'
        };
      case 'completed':
        return { 
          label: 'Terminé', 
          color: 'bg-purple-100 text-purple-800',
          icon: CheckCircleIcon,
          description: 'Cet événement s\'est déroulé avec succès'
        };
      case 'cancelled':
        return { 
          label: 'Annulé', 
          color: 'bg-red-100 text-red-800',
          icon: XCircleIcon,
          description: 'Cet événement a été annulé'
        };
      default:
        return { 
          label: status || 'Statut inconnu', 
          color: 'bg-gray-100 text-gray-800',
          icon: ExclamationTriangleIcon,
          description: 'Statut de l\'événement non défini'
        };
    }
  };

  const handleEdit = () => {
    if (event.status === 'draft') {
      navigate(`/events/edit/${id}`);
    } else {
      addToast('Seuls les brouillons peuvent être modifiés', 'warning');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.')) {
      try {
        await eventService.deleteEvent(id);
        addToast('Événement supprimé avec succès', 'success');
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting event:', err);
        addToast('Erreur lors de la suppression de l\'événement', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || 'L\'événement demandé n\'existe pas ou n\'est plus disponible.'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(event.status);
  const StatusIcon = statusInfo.icon;
  const canEdit = event.status === 'draft' && user?.id === event.organizerId;
  const canDelete = user?.id === event.organizerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.name || event.title || 'Événement sans titre'}
                </h1>
                <div className="flex items-center mt-2 space-x-3">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-gray-500">{statusInfo.description}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              {canEdit && (
                <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
              
              <Link to="/quotes" className="inline-flex">
                <Button variant="outline">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Voir les devis
                </Button>
              </Link>
              
              <Link to="/chat/demo-conversation" className="inline-flex">
                <Button variant="outline">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
              
              {canDelete && (
                <Button onClick={handleDelete} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails de l'événement</h2>
                
                {event.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-gray-900">{formatDate(event.date)}</p>
                        {event.startTime && (
                          <p className="text-sm text-gray-500">à {formatTime(event.startTime)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Lieu</p>
                        <p className="text-gray-900">{event.location || event.city || 'Lieu non défini'}</p>
                        {event.address && (
                          <p className="text-sm text-gray-500">{event.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <UsersIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Invités</p>
                        <p className="text-gray-900">{event.expectedGuests || event.guestCount || 'Non défini'} personnes</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-gray-900">{formatCurrency(event.budget)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Type and Services */}
                {(event.eventType || event.services) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {event.eventType && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Type d'événement</p>
                        <Badge className="bg-blue-100 text-blue-800">{event.eventType}</Badge>
                      </div>
                    )}
                    
                    {event.services && event.services.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Services requis</p>
                        <div className="flex flex-wrap gap-2">
                          {event.services.map((service, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Requirements */}
            {event.requirements && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Exigences particulières</h2>
                  <p className="text-gray-600">{event.requirements}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-4">
                    {stats.quotesReceived !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Devis reçus</span>
                        <span className="font-semibold">{stats.quotesReceived}</span>
                      </div>
                    )}
                    {stats.quotesAccepted !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Devis acceptés</span>
                        <span className="font-semibold">{stats.quotesAccepted}</span>
                      </div>
                    )}
                    {stats.totalSpent !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dépensé</span>
                        <span className="font-semibold">{formatCurrency(stats.totalSpent)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <Link to="/venues" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Rechercher des lieux
                    </Button>
                  </Link>
                  
                  <Link to="/quotes" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Gérer les devis
                    </Button>
                  </Link>
                  
                  <Link to="/chat/demo-conversation" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Assistant IA
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Event Timeline */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronologie</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Événement créé</span>
                  </div>
                  
                  {event.status !== 'draft' && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Planification en cours</span>
                    </div>
                  )}
                  
                  {event.status === 'confirmed' && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Événement confirmé</span>
                    </div>
                  )}
                  
                  {event.status === 'completed' && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Événement terminé</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

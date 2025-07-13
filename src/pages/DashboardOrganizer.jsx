import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  ChatBubbleBottomCenterIcon
} from '@heroicons/react/24/outline';
import { eventService } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';

const DashboardOrganizer = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalBudget: 0,
    completedEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents();
      console.log("Fetched events:", response);
      setEvents(response.data.events || []);
      
      // Calculate stats
      const totalEvents = response.data.events?.length || 0;
      const upcomingEvents = response.data.events?.filter(event =>
        new Date(event.date) > new Date()
      ).length || 0;
      const completedEvents = response.data.events?.filter(event =>
        event.status === 'completed'
      ).length || 0;
      const totalBudget = response.data.events?.reduce((sum, event) =>
        sum + (event.budget || 0), 0
      ) || 0;

      setStats({
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalBudget,
      });
    } catch (error) {
      setError('Échec du chargement des événements');
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Section 10.8: Separate drafts from published events
  const draftEvents = events.filter(event => event.status === 'draft');
  const publishedEvents = events.filter(event => event.status !== 'draft');

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
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
            Bienvenue, {user?.firstName || 'Organisateur'} !
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez vos événements et suivez leur progression
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Budget Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            to="/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Créer un nouvel événement
          </Link>
          
          <Link
            to="/quotes"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Voir les devis
          </Link>
          
          <Link
            to="/venues"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Parcourir les lieux
          </Link>
          
          <Link
            to="/chat/demo-conversation"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ChatBubbleBottomCenterIcon className="h-4 w-4 mr-2" />
            Test Chat
          </Link>
        </div>

        {/* Events List */}
        <div className="bg-white shadow rounded-lg">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {events.length === 0 ? (
            <div className="p-6 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first event.
              </p>
              <div className="mt-6">
                <Link
                  to="/events/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Section 10.8: Drafts Header */}
              {draftEvents.length > 0 && (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                    <h2 className="text-lg font-medium text-orange-900">Brouillons</h2>
                    <p className="text-sm text-orange-700">Continuez la modification de vos brouillons d'événements</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {draftEvents.map((event) => (
                        <Link
                          key={event.id}
                          to={`/events/edit/${event.id}`}
                          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-orange-200"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {event.name || event.title || 'Untitled Event'}
                              </h3>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 flex-shrink-0 ml-2">
                                Draft
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                              {event.description || 'No description'}
                            </p>
                            <div className="space-y-2 text-sm text-gray-500">
                              {event.date && (
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{formatDate(event.date)}</span>
                                </div>
                              )}
                              {event.city && (
                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{event.city}</span>
                                </div>
                              )}
                              {event.guestCount && (
                                <div className="flex items-center">
                                  <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{event.guestCount} guests</span>
                                </div>
                              )}
                              {event.budget && (
                                <div className="flex items-center">
                                  <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{formatCurrency(event.budget)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Published Events */}
              {publishedEvents.length > 0 && (
                <div className={draftEvents.length > 0 ? 'border-t border-gray-200' : ''}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">My Events</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {publishedEvents.map((event) => (
                        <Link
                          key={event.id}
                          to={`/events/${event.id}`}
                          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {event.name || event.title}
                              </h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)} flex-shrink-0 ml-2`}>
                                {event.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="space-y-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.location || event.city}</span>
                              </div>
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.expectedGuests || event.guestCount} guests</span>
                              </div>
                              <div className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{formatCurrency(event.budget)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOrganizer;

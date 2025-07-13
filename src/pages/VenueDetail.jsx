import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService } from '../services/venueService';
import { Button, Card, Badge, Spinner, Modal } from '../components';
import { 
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  CalendarIcon,
  PhotoIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchVenueData();
  }, [id]);

  const fetchVenueData = async () => {
    try {
      setIsLoading(true);
      const [venueResponse, availabilityResponse] = await Promise.all([
        venueService.getVenueById(id),
      ]);
      console.log("Venue Response: ", venueResponse)
      setVenue(venueResponse.data);
    } catch (error) {
      setError('Échec du chargement des détails du lieu');
      console.error('Error fetching venue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Static availability calendar
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isPast = new Date(year, month, day) < new Date();
      const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
      
      // Simulate some booked dates (static for demo)
      const isBooked = [3, 7, 14, 21, 28].includes(day);
      
      days.push({
        day,
        isToday,
        isPast,
        isWeekend,
        isBooked,
        isAvailable: !isPast && !isBooked
      });
    }
    
    return days;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lieu introuvable</h2>
          <p className="text-gray-600 mb-6">{error || 'Le lieu que vous recherchez n\'existe pas.'}</p>
          <Button onClick={() => navigate('/venues')}>
            Retour aux lieux
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card padding="p-0">
              <div className="relative">
                <div className="h-96 bg-gray-200 rounded-t-2xl overflow-hidden">
                  {venue?.images && venue?.images.length > 0 ? (
                    <img
                      src={venue?.images[selectedImage]}
                      alt={venue.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Image Counter */}
                  {venue?.images && venue?.images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {venue?.images.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {Array.isArray(venue?.images) && venue?.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {Array.isArray(venue?.images) && venue?.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-primary-500' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${venue.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Venue Info */}
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    {venue.address}, {venue.city}
                  </div>
                  
                  {venue.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(venue.rating)}
                      </div>
                      <span className="text-lg font-semibold">{venue.rating}</span>
                      <span className="text-gray-600">({venue.reviewCount || 0} avis)</span>
                    </div>
                  )}
                </div>
                
                <Badge 
                  variant={venue.isAvailable ? 'success' : 'danger'}
                  size="lg"
                >
                  {venue.isAvailable ? 'Disponible' : 'Réservé'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <UsersIcon className="h-6 w-6 mx-auto text-primary-600 mb-1" />
                  <div className="text-sm text-gray-600">Capacité</div>
                  <div className="font-semibold">{venue.capacity} invités</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 mx-auto text-primary-600 mb-1" />
                  <div className="text-sm text-gray-600">À partir de</div>
                  <div className="font-semibold">{formatPrice(venue.pricePerHour || venue.basePrice)}</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <MapPinIcon className="h-6 w-6 mx-auto text-primary-600 mb-1" />
                  <div className="text-sm text-gray-600">Quartier</div>
                  <div className="font-semibold">{venue.neighborhood || venue.city}</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-6 w-6 mx-auto text-primary-600 mb-1" />
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold capitalize">{venue.type || 'Espace événementiel'}</div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">À propos de ce lieu</h3>
                <p className="text-gray-600">{venue.description}</p>
              </div>
            </Card>

            {/* Availability Calendar */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Calendrier de disponibilité</h3>
              
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays(currentMonth).map((day, index) => (
                  <div
                    key={index}
                    className={`
                      h-10 flex items-center justify-center text-sm rounded cursor-pointer transition-colors
                      ${!day ? '' : 
                        day.isToday ? 'bg-primary-500 text-white font-bold' :
                        day.isPast ? 'text-gray-300 cursor-not-allowed' :
                        day.isBooked ? 'bg-red-100 text-red-600 cursor-not-allowed' :
                        day.isAvailable ? 'hover:bg-green-100 text-green-600' :
                        'text-gray-500'
                      }
                    `}
                  >
                    {day?.day}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                  <span>Réservé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-primary-500 rounded mr-2"></div>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </Card>

            {/* Amenities */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Équipements et services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {venue.amenities && venue.amenities.split(', ').map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews Section */}
            {venue.reviews && venue.reviews.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Avis récents</h3>
                <div className="space-y-4">
                  {venue.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium">{review.userName}</span>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <h3 className="text-xl font-semibold mb-4">Demander un devis</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Prix de base :</span>
                  <span className="font-semibold">{formatPrice(venue.pricePerHour || venue.basePrice)}/heure</span>
                </div>
                
                {venue.cleaningFee && (
                  <div className="flex justify-between">
                    <span>Frais de ménage :</span>
                    <span>{formatPrice(venue.cleaningFee)}</span>
                  </div>
                )}
                
                {venue.securityDeposit && (
                  <div className="flex justify-between">
                    <span>Caution :</span>
                    <span>{formatPrice(venue.securityDeposit)}</span>
                  </div>
                )}
              </div>

              <Button 
                className="w-full mb-3"
                onClick={() => setShowQuoteModal(true)}
                disabled={!venue.isAvailable}
              >
                Demander un devis
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/venues/${id}/calendar`)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Vérifier la disponibilité
              </Button>
            </Card>

            {/* Contact Info */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
              
              <div className="space-y-3">
                {venue.contactEmail && (
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="h-5 w-5 mr-3" />
                    <a href={`mailto:${venue.contactEmail}`} className="hover:text-primary-600">
                      {venue.contactEmail}
                    </a>
                  </div>
                )}
                
                {venue.contactPhone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-5 w-5 mr-3" />
                    <a href={`tel:${venue.contactPhone}`} className="hover:text-primary-600">
                      {venue.contactPhone}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-3" />
                  <span>{venue.address}</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Envoyer un message
              </Button>
            </Card>

            {/* Policies */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Conditions</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Annulation :</strong> {venue.cancellationPolicy || 'Flexible'}</div>
                <div><strong>Installation :</strong> {venue.setupTime || '2 heures incluses'}</div>
                <div><strong>Nettoyage :</strong> {venue.cleanupPolicy || 'À la charge du client'}</div>
                {venue.alcoholPolicy && (
                  <div><strong>Alcool :</strong> {venue.alcoholPolicy}</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Image Modal */}
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          size="xl"
          showCloseButton={true}
        >
          {venue?.images && venue?.images.length > 0 && (
            <div className="text-center">
              <img
                src={venue?.images[selectedImage]}
                alt={venue.name}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
              
              {venue?.images.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    disabled={selectedImage === 0}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(Math.min(venue?.images.length - 1, selectedImage + 1))}
                    disabled={selectedImage === venue?.images.length - 1}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Quote Request Modal */}
        <Modal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          title="Demander un devis"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Demander un devis personnalisé pour <strong>{venue.name}</strong>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de l'événement
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'invités
                </label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'événement
              </label>
              <select className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500">
                <option>Mariage</option>
                <option>Événement d'entreprise</option>
                <option>Anniversaire</option>
                <option>Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exigences particulières
              </label>
              <textarea
                rows={3}
                placeholder="Parlez-nous de vos besoins spécifiques..."
                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowQuoteModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={() => setShowQuoteModal(false)} className="flex-1">
                Envoyer la demande
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default VenueDetail;

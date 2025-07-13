import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { venueService } from '../services/venueService';
import { Button, Input, Card, Badge, Spinner } from '../components';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const VenueListPage = () => {
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    capacity: '',
    priceRange: '',
    venueType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    // Apply filters from URL params
    const city = searchParams.get('city');
    const capacity = searchParams.get('capacity');
    if (city) setFilters(prev => ({ ...prev, city }));
    if (capacity) setFilters(prev => ({ ...prev, capacity }));
  }, [searchParams]);

  const fetchVenues = async (searchFilters = {}) => {
    try {
      setIsLoading(true);
      const params = {
        search: searchTerm,
        ...filters,
        ...searchFilters,
      };
      
      const response = await venueService.getVenues(params);
      console.log("Venues: ", response)
      setVenues(response.data.venues || []);
    } catch (error) {
      setError('Failed to fetch venues');
      console.error('Error fetching venues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    fetchVenues(newFilters);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CF', {
      style: 'currency',
      currency: 'XAF',
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const venueTypes = [
    { value: '', label: 'All Types' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'conference_center', label: 'Conference Center' },
    { value: 'banquet_hall', label: 'Banquet Hall' },
    { value: 'outdoor', label: 'Outdoor Venue' },
    { value: 'museum', label: 'Museum' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'other', label: 'Other' },
  ];

  const priceRanges = [
    { value: '', label: 'Tous les prix' },
    { value: '0-100000', label: 'Moins de 100 000 XAF' },
    { value: '100000-500000', label: '100 000 - 500 000 XAF' },
    { value: '500000-1000000', label: '500 000 - 1 000 000 XAF' },
    { value: '1000000+', label: 'Plus de 1 000 000 XAF' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Venue</h1>
          <p className="mt-2 text-gray-600">
            Discover amazing venues for your event
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search venues, locations, or event types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button type="submit">
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité minimale
                  </label>
                  <input
                    type="number"
                    placeholder="Nombre d'invités"
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gamme de prix
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Type
                  </label>
                  <select
                    value={filters.venueType}
                    onChange={(e) => handleFilterChange('venueType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    {venueTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {venues.length} venue{venues.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Venues Grid */}
        {venues.length === 0 ? (
          <Card className="text-center py-12">
            <MapPinIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setFilters({ city: '', capacity: '', priceRange: '', venueType: '' });
              fetchVenues({});
            }}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues?.map((venue) => (
              <Card key={venue.id} className="hover:shadow-xl transition-shadow duration-300">
                {/* Venue Image */}
                <div className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {venue.images && venue.images.length > 0 ? (
                    <img
                      src={venue.images[0]}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPinIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={venue.isAvailable ? 'success' : 'danger'}
                      size="sm"
                    >
                      {venue.isAvailable ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                </div>

                {/* Venue Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {venue.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {venue.location}
                    </div>
                    
                    {/* Rating */}
                    {venue.rating && (
                      <div className="flex items-center space-x-1">
                        {renderStars(venue.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          ({venue.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      Jusqu'à {venue.capacity} invités
                    </div>
                    <div className="flex items-center text-primary-600 font-semibold">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      {formatPrice(venue.pricePerHour || venue.basePrice)}/h
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities && venue.amenities.split(', ').slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="gray" size="sm">
                        {amenity.trim()}
                      </Badge>
                    ))}
                    {venue.amenities && venue.amenities.split(', ').length > 3 && (
                      <Badge variant="gray" size="sm">
                        +{venue.amenities.split(', ').length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      as={Link}
                      to={`/venues/${venue.id}`}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={!venue.isAvailable}
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueListPage;

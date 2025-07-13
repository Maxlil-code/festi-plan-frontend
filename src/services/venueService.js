import api from './api';

export const venueService = {
  // Get all venues with search and filters
  getVenues: async (params = {}) => {
    const response = await api.get('/venues', { params });
    return response.data;
  },

  // Get venue by ID
  getVenueById: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },

  // Get venue availability
  getVenueAvailability: async (id, params = {}) => {
    const response = await api.get(`/venues/${id}/availability`, { params });
    return response.data;
  },

  // Search venues
  searchVenues: async (searchParams) => {
    const response = await api.post('/venues/search', searchParams);
    return response.data;
  },

  // Get venue reviews
  getVenueReviews: async (id) => {
    const response = await api.get(`/venues/${id}/reviews`);
    return response.data;
  },
};

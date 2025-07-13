import api from './api';

export const eventService = {
  // Get all events for current user
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Partial update event (for draft updates)
  patchEvent: async (id, eventData) => {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get event statistics
  getEventStats: async (id) => {
    const response = await api.get(`/events/${id}/stats`);
    return response.data;
  },

  // Accept quote (section 10.7)
  acceptQuote: async (quoteId) => {
    const response = await api.post(`/quotes/${quoteId}/accept`);
    return response.data;
  },
};

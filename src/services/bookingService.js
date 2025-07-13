import api from './api';

export const bookingService = {
  // Get all bookings for current user
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  // Get booking by ID (alias for consistency)
  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Confirm booking (for providers)
  confirmBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/confirm`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id, reason = '') => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Update booking details
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },
};

import api from './api';

export const quoteService = {
  // Get all quotes for current user
  getQuotes: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  // Get quote by ID (alias for consistency)
  getQuote: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  // Get quote by ID
  getQuoteById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  // Create new quote request
  createQuote: async (quoteData) => {
    const response = await api.post('/quotes', quoteData);
    return response.data;
  },

  // Update quote status (accept/reject)
  updateQuoteStatus: async (id, status, reason = '') => {
    const payload = { status };
    if (reason) {
      payload.reason = reason;
    }
    const response = await api.patch(`/quotes/${id}/status`, payload);
    return response.data;
  },

  // Accept quote
  acceptQuote: async (id) => {
    const response = await api.post(`/quotes/${id}/accept`);
    return response.data;
  },

  // Reject quote
  rejectQuote: async (id, reason = '') => {
    const response = await api.post(`/quotes/${id}/reject`, { reason });
    return response.data;
  },

  // Update quote details (for providers)
  updateQuote: async (id, quoteData) => {
    const response = await api.put(`/quotes/${id}`, quoteData);
    return response.data;
  },

  // Delete quote
  deleteQuote: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  // Get quote statistics
  getQuoteStats: async () => {
    const response = await api.get('/quotes/stats');
    return response.data;
  },
};

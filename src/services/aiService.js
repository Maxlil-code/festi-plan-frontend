import api from './api';

// AI-Powered Flows - Exact Implementation per Frontend Guide
export const analyzeRequirements = (eventId) =>
  api.post('/ai/analyze-requirements', { eventId });

export const fetchRecommendations = (guestCount, budget) =>
  api.post('/ai/recommendations', { guestCount, budget });

export const fetchQuote = (venueId, eventId) =>
  api.post('/ai/generate-quote', { venueId, eventId });

export const aiService = {
  // New AI-Powered Methods according to spec
  analyzeRequirements: (eventId) => analyzeRequirements(eventId),
  fetchRecommendations: (guestCount, budget) => fetchRecommendations(guestCount, budget),
  fetchQuote: (venueId, eventId) => fetchQuote(venueId, eventId),

  // Legacy methods for backward compatibility
  getRecommendations: async (eventData) => {
    const response = await api.post('/ai/recommendations', eventData);
    return response.data;
  },

  getEventInsights: async (eventId) => {
    const response = await api.get(`/ai/insights/${eventId}`);
    return response.data;
  },

  getPricingPredictions: async (eventData) => {
    const response = await api.post('/ai/pricing', eventData);
    return response.data;
  },
};

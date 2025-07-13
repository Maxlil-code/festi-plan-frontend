import api from './api';

export const messageService = {
  // Get conversations for current user
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages for a conversation
  getConversationMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, messageData) => {
    const response = await api.post(`/messages/conversations/${conversationId}`, messageData);
    return response.data;
  },

  // Create new conversation
  createConversation: async (participants) => {
    const response = await api.post('/messages/conversations', { participants });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    const response = await api.patch(`/messages/conversations/${conversationId}/read`);
    return response.data;
  },
};

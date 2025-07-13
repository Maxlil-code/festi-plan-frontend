import api from './api';

export const userService = {
  // Get user notifications
  getNotifications: async () => {
    const response = await api.get('/users/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    const response = await api.patch(`/users/notifications/${notificationId}/read`);
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get('/users/notifications/unread-count');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // Get user dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard-stats');
    return response.data;
  },
};

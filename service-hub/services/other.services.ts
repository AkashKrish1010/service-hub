import api from './api';

export const notificationService = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};

export const reviewService = {
  create: async (data: {
    bookingId: string;
    providerId: string;
    rating: number;
    reviewText: string;
    serviceQuality?: number;
    providerBehavior?: number;
  }) => {
    const res = await api.post('/reviews', data);
    return res.data.data;
  },

  getByProvider: async (providerId: string) => {
    const res = await api.get(`/reviews/provider/${providerId}`);
    const list = res.data.data || [];
    (list as any).sentiment = res.data.sentiment || null;
    return list;
  },

  getAll: async () => {
    const res = await api.get('/reviews');
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

export const complaintService = {
  create: async (data: { bookingId?: string; subject: string; description: string }) => {
    const res = await api.post('/complaints', data);
    return res.data.data;
  },

  getMy: async () => {
    const res = await api.get('/complaints/my');
    return res.data.data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  getUsers: async (role?: string) => {
    const res = await api.get('/admin/users', { params: { role } });
    return res.data.data;
  },

  getProviders: async (isApproved?: boolean) => {
    const res = await api.get('/admin/providers', { params: { isApproved } });
    return res.data.data;
  },

  approveProvider: async (id: string, isApproved: boolean) => {
    const res = await api.put(`/admin/providers/${id}/approve`, { isApproved });
    return res.data.data;
  },

  getBookings: async () => {
    const res = await api.get('/admin/bookings');
    return res.data.data;
  },

  getComplaints: async () => {
    const res = await api.get('/complaints');
    return res.data.data;
  },

  resolveComplaint: async (id: string, adminResponse: string) => {
    const res = await api.put(`/complaints/${id}`, { status: 'resolved', adminResponse });
    return res.data.data;
  },

  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },
};

export const categoryService = {
  getAll: async () => {
    const res = await api.get('/categories');
    return res.data.data;
  },
  create: async (data: { name: string; icon: string; description?: string }) => {
    const res = await api.post('/categories', data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

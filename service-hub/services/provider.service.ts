import api from './api';

export const providerService = {
  getNearby: async (params?: { lat?: number; lng?: number; category?: string; radius?: number; search?: string }) => {
    const res = await api.get('/provider/nearby', { params });
    return res.data.data;
  },

  getProfile: async (id: string) => {
    const res = await api.get(`/provider/profile/${id}`);
    return res.data.data;
  },

  updateProfile: async (data: any) => {
    const res = await api.put('/provider/profile', data);
    return res.data.data;
  },

  saveLocation: async (data: { lat: number; lng: number; address: string }) => {
    const res = await api.post('/provider/location', data);
    return res.data.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/provider/dashboard-stats');
    return res.data.data;
  },

  getEarnings: async () => {
    const res = await api.get('/provider/earnings');
    return res.data.data;
  },
};

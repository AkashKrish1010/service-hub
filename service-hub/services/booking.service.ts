import api from './api';

export const bookingService = {
  create: async (bookingData: {
    providerId: string;
    categoryId?: string;
    categoryName?: string;
    serviceAddress: string;
    scheduledDate: string;
    scheduledTime: string;
    description: string;
    paymentMethod: 'online' | 'cash';
    totalAmount: number;
  }) => {
    const res = await api.post('/bookings', bookingData);
    return res.data.data;
  },

  getMyBookings: async (status?: string) => {
    const res = await api.get('/bookings/my', { params: { status } });
    return res.data.data;
  },

  getProviderBookings: async (status?: string) => {
    const res = await api.get('/bookings/provider', { params: { status } });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    proof?: { completionPhoto?: string; completionReason?: string }
  ) => {
    const res = await api.put(`/bookings/${id}/status`, {
      status,
      ...proof,
    });
    return res.data.data;
  },
};

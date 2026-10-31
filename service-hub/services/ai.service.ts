import api from './api';

export const aiService = {
  getRecommendations: async (data?: { preferredCategory?: string; location?: string }) => {
    const res = await api.post('/ai/recommend', data || {});
    return res.data.data;
  },

  chat: async (message: string, history?: any[]) => {
    const res = await api.post('/ai/chat', { message, history });
    return res.data;
  },

  refineDescription: async (input: string) => {
    const res = await api.post('/ai/helper', { input });
    return res.data;
  },

  getProfileSummary: async (data: { category: string; experience?: string; rating?: number }) => {
    const res = await api.post('/ai/summary', data);
    return res.data.summary;
  },

  getAdminRevenueInsights: async () => {
    const res = await api.get('/ai/admin-revenue-insights');
    return res.data.data;
  },

  getProviderInsights: async () => {
    const res = await api.get('/ai/provider-insights');
    return res.data.data;
  },
};

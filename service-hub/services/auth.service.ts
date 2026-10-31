import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (credentials: { email: string; password: string; role?: string; name?: string }) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
  }) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      await AsyncStorage.removeItem('has_seen_onboarding');
    }
  },

  updatePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/auth/update-password', passwords);
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  updateProfile: async (profileData: { name?: string; phone?: string; profileImage?: string }) => {
    const res = await api.put('/auth/update-profile', profileData);
    if (res.data.token) {
      await AsyncStorage.setItem('auth_token', res.data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'provider' | 'admin';
  profileImage?: string;
  isVerified?: boolean;
  isApproved?: boolean;
  address?: string;
  providerProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string; role?: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string; role: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; address?: string; profileImage?: string }) => Promise<void>;
  updatePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async ({ identifier, password, role }: { identifier: string; password: string; role?: string }) => {
    const res = await api.post('/auth/login', {
      email: identifier.trim(),
      name: identifier.trim(),
      password: password.trim(),
      role,
    });

    if (res.data.token && res.data.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string; role: string }) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token && res.data.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string; profileImage?: string }) => {
    const res = await api.put('/auth/update-profile', data);
    if (res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const updatePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/auth/update-password', passwords);
    if (res.data.token && res.data.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      // ignore
    }
  };

  // Real-time socket sync for approval & user state changes
  useEffect(() => {
    const userId = user?.id || (user as any)?._id;
    if (!userId) return;

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join_user_room', userId);
    });

    socket.on('user_updated', () => {
      refreshUser();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, (user as any)?._id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

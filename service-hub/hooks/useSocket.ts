import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import { useAuth } from '../store/authStore';

export const useSocket = (onEventReceived?: (event: string, data: any) => void) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server with ID:', socket.id);
      socket.emit('join_user_room', user.id);
    });

    socket.on('new_booking_request', (data) => {
      console.log('[Socket] New booking request received:', data);
      if (onEventReceived) onEventReceived('new_booking_request', data);
    });

    socket.on('booking_status_updated', (data) => {
      console.log('[Socket] Booking status updated:', data);
      if (onEventReceived) onEventReceived('booking_status_updated', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
};

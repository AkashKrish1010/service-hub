import { Platform } from 'react-native';

// In Android emulator localhost is 10.0.2.2; on web or iOS simulator it is localhost
const getDevApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || getDevApiUrl();

export const SOCKET_URL = API_BASE_URL;

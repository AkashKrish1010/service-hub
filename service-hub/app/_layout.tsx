import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../store/authStore';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(provider)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen
            name="provider/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="booking/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="booking/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="review/[bookingId]"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="complaint/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="ai-chat"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

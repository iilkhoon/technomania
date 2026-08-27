import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { LocationProvider } from '../src/context/LocationContext';
import LocationModal from '../src/components/LocationModal';
import BrandedSplash from '../src/components/BrandedSplash';

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 260,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false, gestureEnabled: true }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false, gestureEnabled: true }} />
        <Stack.Screen name="category/[slug]" options={{ headerShown: false, gestureEnabled: true }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SettingsProvider>
        <BrandedSplash />
      </SettingsProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <LocationProvider>
              <CartProvider>
                <WishlistProvider>
                  <RootLayoutNav />
                </WishlistProvider>
              </CartProvider>
            </LocationProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Initialize polyfills before any other imports
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Additional polyfills for Node.js modules used by Supabase
import { Buffer } from '@craftzdog/react-native-buffer';
(global as any).Buffer = Buffer;

import { useEffect, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import { SplashScreen, Tabs, Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import './global.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
import { Home, BookOpen, Bookmark, Settings } from 'lucide-react-native';
import { useThemeStore, AppTheme } from '../stores/themeStore';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

// Import global CSS for NativeWind. This needs to be done once, at the root.
// For Expo, you typically create a `global.css` and import it,
// or apply styles directly. With NativeWind v4, the Babel plugin handles
// transforming Tailwind classes, but we still need to ensure Tailwind's base styles
// are conceptually applied. For web, a global CSS import is common.
// For native, NativeWind's preset in tailwind.config.js and the babel plugin do most of the heavy lifting.
// Let's create a global style file for any base native styles if needed,
// though NativeWind v4 aims to reduce this need.

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  // Get theme from Zustand store
  const { currentTheme, init: initThemeStore, setTheme, isSystemTheme } = useThemeStore();

  useEffect(() => {
    initThemeStore(); // Initialize theme from storage
  }, [initThemeStore]);
  
  // Listen to system color scheme changes ONLY if user wants to follow system theme
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      const newTheme = systemColorScheme as AppTheme;
      if (newTheme !== currentTheme && (newTheme === 'light' || newTheme === 'dark')) {
        setTheme(newTheme, true); // Update store, explicitly state it's a system change
      }
    }
  }, [systemColorScheme, isSystemTheme, setTheme, currentTheme]);

  const [loaded, error] = useFonts({
    // Inter font family for UI
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Merriweather for reading content
    Merriweather_400Regular,
    Merriweather_700Bold,
    // Tamagui Inter fonts (keep these for Tamagui compatibility)
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // Example: For a nice serif font for reading, consider:
    // Lora: require('../assets/fonts/Lora-Regular.ttf'), // Download and add Lora or similar
    // LoraBold: require('../assets/fonts/Lora-Bold.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Determine the theme name for TamaguiProvider and Theme component
  // Map AppTheme from Zustand to Tamagui theme names
  let tamaguiThemeName: string = currentTheme;
  if (currentTheme === 'light') tamaguiThemeName = 'light_app';
  if (currentTheme === 'dark') tamaguiThemeName = 'dark_app';

  // Get background color for StatusBar from the resolved theme colors
  const themeColorsFromStore = useThemeStore.getState().getThemeColors();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={tamaguiThemeName as any}>
        {/* Use Theme component to ensure nested components correctly inherit the theme */}
        <Theme name={tamaguiThemeName as any}>
          {/* Set StatusBar based on the actual theme in use */}
          <StatusBar
            style={currentTheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={themeColorsFromStore.tabBarBackground}
          />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{
              presentation: 'modal',
              title: "Login / Sign Up",
              headerStyle: { backgroundColor: themeColorsFromStore.surfaceColor },
              headerTintColor: themeColorsFromStore.textColor,
              headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
            }} />
            <Stack.Screen name="generate-modal" options={{
              presentation: 'modal',
              headerShown: false,
            }} />
          </Stack>
        </Theme>
      </TamaguiProvider>
    </SessionContextProvider>
  );
}

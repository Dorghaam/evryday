// Initialize polyfills before any other imports
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Additional polyfills for Node.js modules used by Supabase
import { Buffer } from '@craftzdog/react-native-buffer';
(global as any).Buffer = Buffer;

import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Tabs } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config'; // Adjust path if needed
import './global.css'; // Import global CSS for any base styles
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
import { useColorScheme } from 'react-native';
import { Home, BookOpen, Bookmark } from 'lucide-react-native';

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
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    // TODO: Add your custom fonts here if you have them.
    // For Tamagui, Inter is often used. You can install @tamagui/font-inter
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // Example from your current assets
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
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
    return null; // Or a basic loading spinner if you prefer
  }

  const activeColor = colorScheme === 'dark' ? '#f97316' : '#ea580c'; // Using standard orange colors
  const inactiveColor = colorScheme === 'dark' ? '#71717a' : '#52525b'; // Using standard gray colors

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
          <Tabs
            screenOptions={{
              headerShown: false, // We'll handle headers in individual screens or a top-level component
              tabBarActiveTintColor: activeColor,
              tabBarInactiveTintColor: inactiveColor,
              tabBarStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
                borderTopColor: colorScheme === 'dark' ? '#404040' : '#e5e5e5',
              },
            }}
          >
            <Tabs.Screen
              name="index" // This will be our "Home/Generate" tab
              options={{
                title: 'Generate',
                tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="read" // Screen for displaying the full essay
              options={{
                title: 'Read',
                tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="saved-essays"
              options={{
                title: 'Saved',
                tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="auth"
              options={{
                href: null, // Hide auth from tab bar as it should be modal
              }}
            />
            {/* Auth screen is typically presented modally, not as a tab */}
            {/* You might need a separate stack for modals if Stack.Screen for auth was here */}
          </Tabs>
        </Theme>
      </TamaguiProvider>
    </SessionContextProvider>
  );
}

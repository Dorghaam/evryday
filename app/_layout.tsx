import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../tamagui.config'; // Adjust path if needed
import './global.css'; // Import global CSS for any base styles

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

  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* 
        TODO: Add ThemeProvider here if you want to manage themes (light/dark/sepia)
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      */}
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Evryday', headerShown: false }} />
        {/* Add other global screen options or screens here */}
      </Stack>
    </TamaguiProvider>
  );
}

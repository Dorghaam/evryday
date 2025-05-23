// Initialize polyfills first
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto'; // Polyfill for URL, needed by Supabase on native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Provide development fallbacks to prevent crashes during setup
const defaultUrl = "https://demo.supabase.co"; // Demo URL that won't work but won't crash
const defaultKey = "demo-key"; // Demo key that won't work but won't crash

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️  Supabase credentials not found. Please create a .env file with:\n" +
    "EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n" +
    "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n" +
    "Authentication features will not work until configured."
  );
}

// For web, we need to check if we're on the client side
const getStorage = () => {
  if (Platform.OS === 'web') {
    // On web, only use localStorage if we're on the client side
    if (typeof window !== 'undefined') {
      return {
        getItem: (key: string) => {
          return Promise.resolve(localStorage.getItem(key));
        },
        setItem: (key: string, value: string) => {
          return Promise.resolve(localStorage.setItem(key, value));
        },
        removeItem: (key: string) => {
          return Promise.resolve(localStorage.removeItem(key));
        },
      };
    }
    // Return undefined for server-side rendering
    return undefined;
  }
  // For native platforms, use AsyncStorage
  return AsyncStorage;
};

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey,
  {
    auth: {
      storage: getStorage(), // Use appropriate storage for the platform
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web', // Only detect sessions in URL on web
    },
  }
); 
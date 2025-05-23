import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'light' | 'dark';

// Color scheme interface
interface ThemeColors {
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  activeColor: string;
  inactiveColor: string;
  borderColor: string;
  tabBarBackground: string;
  tabBarBorder: string;
}

// Function to generate colors based on theme
const getColorsForTheme = (theme: AppTheme): ThemeColors => {
  switch (theme) {
    case 'dark':
      return {
        backgroundColor: '#000000',
        surfaceColor: '#1C1C1E',
        textColor: '#FFFFFF',
        activeColor: '#FF9500',
        inactiveColor: '#8E8E93',
        borderColor: '#3A3A3C',
        tabBarBackground: '#1C1C1E',
        tabBarBorder: '#3A3A3C',
      };
    case 'light':
    default:
      return {
        backgroundColor: '#FFFFFF',
        surfaceColor: '#F2F2F7',
        textColor: '#000000',
        activeColor: '#FF9500',
        inactiveColor: '#8E8E93',
        borderColor: '#D1D1D6',
        tabBarBackground: '#FFFFFF',
        tabBarBorder: '#D1D1D6',
      };
  }
};

interface ThemeState {
  currentTheme: AppTheme;
  isSystemTheme: boolean; // Is the current theme following the system preference?
  setTheme: (theme: AppTheme, isSystem?: boolean) => void;
  toggleSystemTheme: (followSystem: boolean) => void;
  init: () => Promise<void>;
  getThemeColors: () => ThemeColors;
}

const THEME_STORAGE_KEY = 'app-theme';
const SYSTEM_THEME_STORAGE_KEY = 'app-system-theme-preference';

// Function to load theme from storage or default to system
const loadInitialTheme = async (): Promise<{ theme: AppTheme; isSystem: boolean }> => {
  try {
    const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    const storedSystemPref = await AsyncStorage.getItem(SYSTEM_THEME_STORAGE_KEY);
    const isSystem = storedSystemPref ? JSON.parse(storedSystemPref) : true; // Default to following system

    if (isSystem) {
      return { theme: (Appearance.getColorScheme() || 'light') as AppTheme, isSystem: true };
    }
    return { theme: storedTheme || (Appearance.getColorScheme() || 'light') as AppTheme, isSystem: false };
  } catch (e) {
    console.error("Failed to load theme from storage", e);
    return { theme: (Appearance.getColorScheme() || 'light') as AppTheme, isSystem: true };
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: (Appearance.getColorScheme() || 'light') as AppTheme, // Initial default
  isSystemTheme: true, // Default to following system

  // Initialize store with persisted values
  init: async () => {
    const { theme, isSystem } = await loadInitialTheme();
    set({ currentTheme: theme, isSystemTheme: isSystem });
  },

  getThemeColors: () => {
    const { currentTheme } = get();
    return getColorsForTheme(currentTheme);
  },

  setTheme: (theme, isSystemOverride) => {
    set({ currentTheme: theme });
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    if (typeof isSystemOverride === 'boolean') {
      set({ isSystemTheme: isSystemOverride });
      AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, JSON.stringify(isSystemOverride));
    } else {
       // If not explicitly overriding system preference, and user chose a theme, they are no longer following system
      set({ isSystemTheme: false });
      AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, JSON.stringify(false));
    }
  },
  toggleSystemTheme: (followSystem) => {
    set({ isSystemTheme: followSystem });
    AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, JSON.stringify(followSystem));
    if (followSystem) {
      // If switching to follow system, update to current system theme
      const systemTheme = (Appearance.getColorScheme() || 'light') as AppTheme;
      set({ currentTheme: systemTheme });
      AsyncStorage.setItem(THEME_STORAGE_KEY, systemTheme);
    }
  }
}));

// Call init right after creating the store to load persisted theme early
// This is a bit of a workaround for Zustand v4; v5 might have better async init.
// For now, we'll call init from _layout.tsx to ensure it runs after polyfills.
// useThemeStore.getState().init(); 
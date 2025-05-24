import { createTamagui, createTokens, createTheme } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3'; // Base config

// Using a darker palette for the "Medium" feel
const appColors = {
  brandOrange: '#F4581C',

  // Dark Theme - Medium Inspired
  mediumBlack: '#0C0C0C',        // True deep background
  mediumDarkSurface: '#1A1A1A',   // Cards, slightly elevated surfaces
  mediumDarkBorder: '#2D2D2D',    // Borders
  mediumDarkTextPrimary: '#E5E5E5', // Primary text
  mediumDarkTextSecondary: '#A3A3A3',// Muted/secondary text

  // Light Theme (can be refined later if needed, focus on dark for now)
  paperLight: '#FFFFFF',
  paperSepia: '#FFF8EC', // Keep if you plan to use sepia
  inkPrimaryLight: '#1A1A1A',
  inkSecondaryLight: '#6C6B6A',
  lightBorder: '#D1D1D6',
  lightSurface: '#F2F2F7',

  // Standard color palette (keep for utility)
  blue5: '#3B82F6',
  blue10: '#1E40AF',
  yellow5: '#FDE047',
  yellow8: '#FACC15',
  yellow10: '#CA8A04',
  gray1: '#F9FAFB', // Keep for light theme subtle backgrounds
  gray2: '#F3F4F6',
  gray3: '#E5E7EB',
  gray4: '#D1D5DB',
  gray5: '#9CA3AF',
  gray8: '#374151',
  gray9: '#1F2937',
  gray10: '#111827',
  red5: '#EF4444',
  red8: '#DC2626',
  red10: '#B91C1C',
  green5: '#10B981',
  green8: '#059669',
  green10: '#047857',
};

const appTokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    ...appColors,
  },
});

const dark_app_medium_style = createTheme({
  ...defaultConfig.themes.dark, // Start with a base dark
  background: appTokens.color.mediumBlack,
  backgroundStrong: appTokens.color.mediumDarkSurface, // For elements that need to stand out slightly more
  borderColor: appTokens.color.mediumDarkBorder,
  borderColorHover: appTokens.color.brandOrange, // Use accent for hover/focus on borders
  color: appTokens.color.mediumDarkTextPrimary,
  colorHover: appTokens.color.mediumDarkTextPrimary,
  colorFocus: appTokens.color.brandOrange,
  colorPress: appTokens.color.mediumDarkTextPrimary,
  placeholderColor: appTokens.color.mediumDarkTextSecondary,

  // Custom semantic tokens for app consistency
  appPrimary: appTokens.color.brandOrange,
  appBackground: appTokens.color.mediumBlack,
  appSurface: appTokens.color.mediumDarkSurface,
  appText: appTokens.color.mediumDarkTextPrimary,
  appTextSecondary: appTokens.color.mediumDarkTextSecondary,
  appBorder: appTokens.color.mediumDarkBorder,

  // Essay specific, if needed, otherwise they'll inherit 'appText' etc.
  essayText: appTokens.color.mediumDarkTextPrimary,
  essayTextSecondary: appTokens.color.mediumDarkTextSecondary,
});

const light_app_original = createTheme({
  ...defaultConfig.themes.light,
  background: appTokens.color.paperLight,
  backgroundStrong: appTokens.color.gray2,
  borderColor: appTokens.color.lightBorder,
  borderColorHover: appTokens.color.brandOrange,
  color: appTokens.color.inkPrimaryLight,
  colorHover: appTokens.color.inkPrimaryLight,
  colorFocus: appTokens.color.brandOrange,
  colorPress: appTokens.color.inkPrimaryLight,
  placeholderColor: appTokens.color.inkSecondaryLight,

  appPrimary: appTokens.color.brandOrange,
  appBackground: appTokens.color.paperLight,
  appSurface: appTokens.color.lightSurface,
  appText: appTokens.color.inkPrimaryLight,
  appTextSecondary: appTokens.color.inkSecondaryLight,
  appBorder: appTokens.color.lightBorder,

  essayText: appTokens.color.inkPrimaryLight,
  essayTextSecondary: appTokens.color.inkSecondaryLight,
});

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens: appTokens,
  themes: {
    ...defaultConfig.themes,
    light_app: light_app_original, // Your original light theme
    dark_app: dark_app_medium_style,  // The new Medium-style dark theme

    // It's good practice to explicitly set the default light and dark themes
    // that Tamagui might fall back to if 'light_app' or 'dark_app' isn't found.
    light: light_app_original,
    dark: dark_app_medium_style,
  },
  fonts: {
    ...defaultConfig.fonts,
    heading: defaultConfig.fonts.heading, // Use default for now, can be customized later
    body: defaultConfig.fonts.body,
    mono: defaultConfig.fonts.mono,
  },
});

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
  interface TamaguiTheme {
    appPrimary: string;
    appBackground: string;
    appSurface: string;
    appText: string;
    appTextSecondary: string;
    appBorder: string;
    essayText: string;
    essayTextSecondary: string;
  }
}

export default tamaguiConfig; 
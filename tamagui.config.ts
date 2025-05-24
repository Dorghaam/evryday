import { createTamagui, createTokens, createTheme } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';
// Import your fonts if you plan to reference them directly in the fonts config
// e.g., import { Inter_400Regular, Inter_700Bold, Merriweather_400Regular } from '@expo-google-fonts/inter';

const appColors = {
  brandOrange: '#F4581C',

  // Dark Theme - Medium Inspired
  mediumBlack: '#0C0C0C',
  mediumDarkSurface: '#1A1A1A',
  mediumDarkBorder: '#2D2D2D',
  mediumDarkTextPrimary: '#E5E5E5',
  mediumDarkTextSecondary: '#A3A3A3',
  white: '#FFFFFF', // Adding a white token for text on colored buttons

  // Light Theme
  paperLight: '#FFFFFF',
  lightSurface: '#F2F2F7', // Equivalent to surfaceColor in light theme
  lightBorder: '#D1D1D6',
  inkPrimaryLight: '#000000', // Primary text for light
  inkSecondaryLight: '#6C6B6A',

  // Base Tamagui colors we might want to keep or override
  ...defaultConfig.tokens.color, // Keep other default colors
};

const tamaguiTokens = createTokens({ // Renamed to avoid conflict
  ...defaultConfig.tokens,
  color: appColors, // Use our defined appColors
  // You can define custom space, size, radius, zIndex tokens here if needed
  // space: { ...defaultConfig.tokens.space, $true: 16, $0: 0, $1: 4, $2: 8, $3: 12, $4: 16, $5: 20, $6: 24 }, // Example
  // size: { ...defaultConfig.tokens.size, $true: 16 }, // Example
  // radius: { ...defaultConfig.tokens.radius, $true: 8, $0: 0, $1: 4, $2: 6, $3: 8, $4: 10, $5: 12 }, // Example
  // zIndex: { ...defaultConfig.tokens.zIndex, $true: 100, $0: 0, $1: 10, $2: 20 }, // Example
});

const light_app_theme = createTheme({
  ...defaultConfig.themes.light,
  background: tamaguiTokens.color.paperLight,
  backgroundStrong: tamaguiTokens.color.lightSurface,
  borderColor: tamaguiTokens.color.lightBorder,
  borderColorHover: tamaguiTokens.color.brandOrange,
  color: tamaguiTokens.color.inkPrimaryLight,
  colorHover: tamaguiTokens.color.inkPrimaryLight, // Can be different
  colorFocus: tamaguiTokens.color.brandOrange,
  colorPress: tamaguiTokens.color.inkPrimaryLight, // Can be different
  placeholderColor: tamaguiTokens.color.inkSecondaryLight,

  // Semantic tokens
  appPrimary: tamaguiTokens.color.brandOrange,
  appBackground: tamaguiTokens.color.paperLight,
  appSurface: tamaguiTokens.color.lightSurface,
  appText: tamaguiTokens.color.inkPrimaryLight,
  appTextSecondary: tamaguiTokens.color.inkSecondaryLight,
  appBorder: tamaguiTokens.color.lightBorder,
  appButtonText: tamaguiTokens.color.white, // Text on primary buttons
});

const dark_app_theme = createTheme({
  ...defaultConfig.themes.dark,
  background: tamaguiTokens.color.mediumBlack,
  backgroundStrong: tamaguiTokens.color.mediumDarkSurface,
  borderColor: tamaguiTokens.color.mediumDarkBorder,
  borderColorHover: tamaguiTokens.color.brandOrange,
  color: tamaguiTokens.color.mediumDarkTextPrimary,
  colorHover: tamaguiTokens.color.mediumDarkTextPrimary,
  colorFocus: tamaguiTokens.color.brandOrange,
  colorPress: tamaguiTokens.color.mediumDarkTextPrimary,
  placeholderColor: tamaguiTokens.color.mediumDarkTextSecondary,

  // Semantic tokens
  appPrimary: tamaguiTokens.color.brandOrange,
  appBackground: tamaguiTokens.color.mediumBlack,
  appSurface: tamaguiTokens.color.mediumDarkSurface,
  appText: tamaguiTokens.color.mediumDarkTextPrimary,
  appTextSecondary: tamaguiTokens.color.mediumDarkTextSecondary,
  appBorder: tamaguiTokens.color.mediumDarkBorder,
  appButtonText: tamaguiTokens.color.white, // Text on primary buttons
});

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens: tamaguiTokens,
  themes: {
    ...defaultConfig.themes, // Keep other default themes
    light: light_app_theme,   // Override default light
    dark: dark_app_theme,    // Override default dark
    light_app: light_app_theme, // Your app-specific light theme
    dark_app: dark_app_theme,   // Your app-specific dark theme
  },
  fonts: {
    // Ensure these keys (heading, body, mono) are used by Tamagui components
    // or that your components specify fonts like 'Inter_400Regular' directly.
    heading: defaultConfig.fonts.heading, // Fallback to default
    body: defaultConfig.fonts.body,
    mono: defaultConfig.fonts.mono, // For SpaceMono or similar
    // You can also map specific font family names if loaded via expo-font
    // Inter: tamaguiTokens.font.inter, // if 'inter' is a token pointing to the font family name
    // Merriweather: tamaguiTokens.font.merriweather // if 'merriweather' is a token
  },
  // Add other configurations like media queries if needed, or rely on defaultConfig.
  // media: defaultConfig.media,
});

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
  // Extend Theme interface with your semantic tokens for type safety
  interface TamaguiTheme {
    appPrimary: string;
    appBackground: string;
    appSurface: string;
    appText: string;
    appTextSecondary: string;
    appBorder: string;
    appButtonText: string; // Added for button text
  }
}

export default tamaguiConfig; 
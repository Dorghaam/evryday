import { createTamagui, createTokens, createTheme } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3'; // Base config

// Your Tailwind colors (adjust if your actual hex values are different)
const appColors = {
  brandOrange: '#F4581C',
  paperLight: '#FFFFFA',
  paperSepia: '#FFF8EC',
  paperDark: '#1A1A1A',
  inkPrimaryLight: '#1A1A1A',
  inkSecondaryLight: '#6C6B6A',
  inkPrimaryDark: '#E5E5E5',
  inkSecondaryDark: '#A3A3A3',
  // Standard color palette for UI components
  blue5: '#3B82F6',
  blue10: '#1E40AF',
  yellow5: '#FDE047',
  yellow8: '#FACC15',
  yellow10: '#CA8A04',
  gray1: '#F9FAFB',
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
    ...appColors, // Make your app-specific colors available as tokens
  },
});

const light_app = createTheme({
  ...defaultConfig.themes.light, // Start with Tamagui's default light theme
  background: appTokens.color.paperLight,
  backgroundStrong: appTokens.color.gray3, // For slightly off-main background elements like auth card
  borderColor: appTokens.color.gray5,
  borderColorHover: appTokens.color.gray8,
  color: appTokens.color.inkPrimaryLight, // Primary text
  colorHover: appTokens.color.inkPrimaryLight,
  colorFocus: appTokens.color.brandOrange,
  colorPress: appTokens.color.inkPrimaryLight,
  placeholderColor: appTokens.color.inkSecondaryLight,
  // Specific component theming (can be extensive)
  // For specific essay text
  essayText: appTokens.color.inkPrimaryLight,
  essayTextSecondary: appTokens.color.inkSecondaryLight,
});

const dark_app = createTheme({
  ...defaultConfig.themes.dark,
  background: appTokens.color.paperDark,
  backgroundStrong: appTokens.color.gray4,
  borderColor: appTokens.color.gray8,
  borderColorHover: appTokens.color.gray10,
  color: appTokens.color.inkPrimaryDark,
  colorHover: appTokens.color.inkPrimaryDark,
  colorFocus: appTokens.color.brandOrange,
  colorPress: appTokens.color.inkPrimaryDark,
  placeholderColor: appTokens.color.inkSecondaryDark,
  essayText: appTokens.color.inkPrimaryDark,
  essayTextSecondary: appTokens.color.inkSecondaryDark,
});

const tamaguiConfig = createTamagui({
  ...defaultConfig, // Keep other parts of default config (fonts, media queries, etc.)
  tokens: appTokens,
  themes: {
    ...defaultConfig.themes,
    light_app,
    dark_app,
    // Keep original light and dark if needed elsewhere, or remove if all app uses _app versions
    light: light_app, 
    dark: dark_app,
  },
  // Optional: Define a primary font for your app if desired.
  // fonts: {
  //   ...defaultConfig.fonts,
  //   body: 'Your preferred font (e.g., Inter, or a serif font like Lora, Georgia after loading it)',
  //   heading: 'Your preferred font'
  // }
});

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
   // If you are using a custom theme definition, you might need to extend the ThemeKeys/ThemeParsed.
  // This depends on how deep your theme customization goes.
  // For simple color overrides, often not needed immediately.
}

export default tamaguiConfig; 
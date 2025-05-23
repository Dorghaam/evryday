import { createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3'; // Using v3 config as an example, ensure it matches your @tamagui/config version or use a simpler/default one if v3 causes issues

// You can customize your tokens, themes, and media queries here
// For now, we'll use the default config
const tamaguiConfig = createTamagui(config);

export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // Or '@tamagui/core'
  // Overwrite the TamaguiCustomConfig interface with our AppConfig
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig; 
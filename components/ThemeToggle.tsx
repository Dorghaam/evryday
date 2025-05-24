import React from 'react';
import { Button, Text, XStack } from 'tamagui';
import { Sun, Moon } from 'lucide-react-native';
import { useThemeStore, AppTheme } from '../stores/themeStore';

export default function ThemeToggle() {
  const { currentTheme, setTheme, getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const getCurrentThemeIcon = () => {
    return currentTheme === 'light' ? 
      <Sun size={16} color={colors.textColor} /> : 
      <Moon size={16} color={colors.textColor} />;
  };

  const getCurrentThemeLabel = () => {
    return currentTheme === 'light' ? 'Light' : 'Dark';
  };

  return (
    <XStack alignItems="center" space="$2">
      <Text fontSize="$3" color={colors.textColor} fontFamily="Inter_500Medium">
        Theme:
      </Text>
      <Button
        size="$3"
        onPress={toggleTheme}
        backgroundColor={colors.surfaceColor}
        borderColor={colors.borderColor}
        borderWidth={1}
        pressStyle={{
          backgroundColor: colors.activeColor,
          borderColor: colors.activeColor,
        }}
      >
        <XStack alignItems="center" space="$2">
          {getCurrentThemeIcon()}
          <Text color={colors.textColor} fontFamily="Inter_500Medium">
            {getCurrentThemeLabel()}
          </Text>
        </XStack>
      </Button>
    </XStack>
  );
} 
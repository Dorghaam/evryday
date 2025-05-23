import React from 'react';
import { Select, Adapt, Sheet, Text, XStack } from 'tamagui';
import { Check, ChevronDown, Sun, Moon } from 'lucide-react-native';
import { useThemeStore, AppTheme } from '../stores/themeStore';

export default function ThemeToggle() {
  const { currentTheme, setTheme, getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const getCurrentThemeLabel = () => {
    const option = themeOptions.find(opt => opt.value === currentTheme);
    return option ? option.label : 'Light';
  };

  const getCurrentThemeIcon = () => {
    const option = themeOptions.find(opt => opt.value === currentTheme);
    const IconComponent = option ? option.icon : Sun;
    return <IconComponent size={16} color={colors.textColor} />;
  };

  return (
    <XStack alignItems="center" space="$2">
      <Text fontSize="$3" color={colors.textColor}>
        Theme:
      </Text>
      <Select
        value={currentTheme}
        onValueChange={(value: string) => setTheme(value as AppTheme)}
        disablePreventBodyScroll
      >
        <Select.Trigger width={120} iconAfter={ChevronDown}>
          <XStack alignItems="center" space="$2">
            {getCurrentThemeIcon()}
            <Select.Value placeholder="Select theme">
              <Text color={colors.textColor}>{getCurrentThemeLabel()}</Text>
            </Select.Value>
          </XStack>
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
            animationConfig={{
              type: 'spring',
              damping: 20,
              mass: 1.2,
              stiffness: 250,
            }}
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <ChevronDown size={20} />
          </Select.ScrollUpButton>

          <Select.Viewport
            // to do animations:
            // animation="quick"
            // animateOnly={['transform', 'opacity']}
            // enterStyle={{ o: 0, y: -10 }}
            // exitStyle={{ o: 0, y: 10 }}
            minWidth={200}
          >
            <Select.Group>
              {themeOptions.map((option, i) => {
                const IconComponent = option.icon;
                return (
                  <Select.Item
                    index={i}
                    key={option.value}
                    value={option.value}
                  >
                    <XStack alignItems="center" space="$2" flex={1}>
                      <IconComponent size={16} />
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </XStack>
                    <Select.ItemIndicator marginLeft="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <ChevronDown size={20} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>
    </XStack>
  );
} 
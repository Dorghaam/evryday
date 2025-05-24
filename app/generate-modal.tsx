import React from 'react';
import { YStack, H1, Paragraph, Button, Text, ScrollView } from 'tamagui';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';
import EssayGenerator from '../components/EssayGenerator';
import { X } from 'lucide-react-native';

export default function GenerateModalScreen() {
  const router = useRouter();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  return (
    <YStack flex={1} backgroundColor="$appBackground" paddingTop="$5">
      <Stack.Screen
        options={{
          title: 'Create New Idea',
          headerStyle: { backgroundColor: colors.surfaceColor },
          headerTintColor: colors.textColor,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          headerLeft: () => (
            <Button
              icon={<X size={24} color={colors.textColor} />}
              onPress={() => router.back()}
              chromeless
              circular
              marginRight="$2"
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <EssayGenerator />
      </ScrollView>
    </YStack>
  );
} 
import { Stack } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H2, Input, ScrollView, Separator, Button as TamaguiButton, Text, XStack, YStack } from 'tamagui';
import { useThemeStore } from '../../stores/themeStore';

const dummyTrendingTopics = [
  { id: '1', title: 'AI Ethics & The Future of Work', author: 'Jane Doe' },
  { id: '2', title: 'The Art of Mindful Productivity', author: 'John Smith' },
  { id: '3', title: 'Quantum Entanglement Explained Simply', author: 'Evryday AI' },
  { id: '4', title: 'Sustainable Living: A Practical Guide', author: 'Eco Warriors' },
  { id: '5', title: 'Ancient Philosophies for Modern Problems', author: 'Philosopher King' },
];

const dummyCategories = ["Technology", "Philosophy", "Science", "History", "Self-Improvement", "Arts", "Economics"];

export default function ExploreScreen() {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <YStack flex={1} backgroundColor="$appBackground">
        {/* Use Stack.Screen to configure the header for this tab */}
        <Stack.Screen options={{ headerShown: false }} />

        {/* Custom Header with Search Bar */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          space="$3"
          backgroundColor="$appSurface"
          borderBottomWidth={1}
          borderBottomColor="$appBorder"
        >
          <Search size={20} color={colors.inactiveColor} />
          <Input
            flex={1}
            placeholder="Search Evryday"
            value={searchText}
            onChangeText={setSearchText}
            size="$3.5" // Adjusted size
            backgroundColor="transparent" // Make input background transparent within the styled bar
            borderColor="transparent" // No border for the input itself
            color="$appText"
            placeholderTextColor="$appTextSecondary"
            focusStyle={{ borderColor: 'transparent' }} // No border on focus either
          />
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Topics/Categories Pills */}
          <YStack padding="$3" space="$2.5">
            <Text fontSize="$4" color="$appText" fontFamily="Inter_600SemiBold" marginBottom="$2">
              Topics
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
              <XStack space="$2.5">
                {dummyCategories.map((category) => (
                  <TamaguiButton
                    key={category}
                    size="$3"
                    backgroundColor="$appSurface"
                    borderColor="$appBorder"
                    borderWidth={1}
                    borderRadius="$10" // Pill shape
                    paddingHorizontal="$3"
                    hoverStyle={{ backgroundColor: '$backgroundStrong' }}
                    pressStyle={{ backgroundColor: '$backgroundStrong' }}
                  >
                    <Text color="$appTextSecondary" fontFamily="Inter_500Medium">{category}</Text>
                  </TamaguiButton>
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          <Separator marginVertical="$3" borderColor="$appBorder" />

          {/* Trending Section */}
          <YStack paddingHorizontal="$4" paddingVertical="$3" space="$3">
            <H2 color="$appText" fontFamily="Inter_600SemiBold" marginBottom="$2">
              Trending on Evryday
            </H2>
            {dummyTrendingTopics.map((item, index) => (
              <YStack key={item.id} space="$1.5" paddingVertical="$3">
                <XStack alignItems="center" space="$3">
                  <Text fontSize={24} fontWeight="bold" color={colors.inactiveColor} style={{ width: 30, textAlign: 'right'}}>
                    {index + 1 < 10 ? `0${index + 1}`: index + 1}
                  </Text>
                  <YStack flex={1}>
                    <Text fontSize="$4" color="$appText" fontFamily="Merriweather_700Bold" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text fontSize="$2" color="$appTextSecondary" fontFamily="Inter_400Regular" marginTop="$1">
                      {item.author}
                    </Text>
                  </YStack>
                </XStack>
                 {index < dummyTrendingTopics.length - 1 && <Separator marginVertical="$3" borderColor="$appBorder" />}
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
} 
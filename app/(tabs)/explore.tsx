import { Stack, useRouter } from 'expo-router';
import { Search as SearchIconLucide, X as XIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { H2, Input, ScrollView, Separator, Button as TamaguiButton, Text, XStack, YStack } from 'tamagui';
import { useThemeStore } from '../../stores/themeStore';

const dummyTrendingTopics = [
  { id: '1', title: 'AI Ethics & The Future of Work', author: 'Jane Doe', subject: 'Artificial Intelligence' },
  { id: '2', title: 'The Art of Mindful Productivity', author: 'John Smith', subject: 'Productivity' },
  { id: '3', title: 'Quantum Entanglement Explained Simply', author: 'Evryday AI', subject: 'Science' },
  { id: '4', title: 'Sustainable Living: A Practical Guide', author: 'Eco Warriors', subject: 'Sustainability' },
  { id: '5', title: 'Ancient Philosophies for Modern Problems', author: 'Philosopher King', subject: 'Philosophy' },
];

const dummyCategories = ["Technology", "Philosophy", "Science", "History", "Self-Improvement", "Arts", "Economics", "Psychology", "Space"];

export default function ExploreScreen() {
  const { getThemeColors, currentTheme } = useThemeStore();
  const colors = getThemeColors();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = () => {
    if (!searchText.trim()) return;
    Alert.alert("Search Submitted", `Searching for: ${searchText}`);
  };

  const handleViewTrendingItem = (item: typeof dummyTrendingTopics[0]) => {
    router.push({
      pathname: '/(tabs)/read',
      params: {
        title: item.title,
        content: `This is a trending article about "${item.title}" by ${item.author}. Full content for this trending topic would be loaded here, exploring various facets and ideas related to it.`,
        subject: item.subject || "Trending",
        readingLevel: "General Audience" 
      },
    });
  };

  const handleTopicPress = (topic: string) => {
    router.push({
      pathname: '/(tabs)/read',
      params: {
        title: `Exploring ${topic}`,
        content: `Content related to the topic "${topic}". This section would ideally list multiple articles or ideas about ${topic}. For now, this is a placeholder.`,
        subject: topic,
        readingLevel: "Various Levels"
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <YStack flex={1} backgroundColor="$appBackground">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Custom Header with Search Bar */}
        <XStack
          paddingHorizontal="$3"
          paddingVertical="$3"
          alignItems="center"
          space="$3"
          backgroundColor="$appSurface"
          borderBottomWidth={1}
          borderColor={isSearchFocused ? "$appPrimary" : "$appBorder"}
          marginHorizontal="$3"
          marginTop="$3"
          borderRadius="$3"
        >
          <SearchIconLucide size={20} color={isSearchFocused ? colors.activeColor : colors.inactiveColor} />
          <Input
            flex={1}
            placeholder="Search Evryday"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            size="$4"
            backgroundColor="transparent"
            borderColor="transparent"
            color="$appText"
            placeholderTextColor="$appTextSecondary"
            focusStyle={{ borderColor: 'transparent' }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            fontFamily="Inter_400Regular"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <XIcon size={20} color={colors.inactiveColor} />
            </TouchableOpacity>
          )}
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
          {/* Topics/Categories Pills */}
          <YStack paddingHorizontal="$3" paddingVertical="$4" space="$3">
            <Text fontSize="$5" color="$appText" fontFamily="Inter_600SemiBold" marginBottom="$2">
              Discover Topics
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 5 }}>
              <XStack space="$3">
                {dummyCategories.map((category) => (
                  <TamaguiButton
                    key={category}
                    size="$3"
                    backgroundColor={currentTheme === 'dark' ? "$color3" : "$color4"}
                    borderColor="$appBorder"
                    borderWidth={0.5}
                    borderRadius="$10"
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                    hoverStyle={{ backgroundColor: '$color5' }}
                    pressStyle={{ backgroundColor: '$color6' }}
                    onPress={() => handleTopicPress(category)}
                  >
                    <Text color="$appTextSecondary" fontFamily="Inter_500Medium" fontSize="$2">{category}</Text>
                  </TamaguiButton>
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Trending Section - Styled to look like Medium list items */}
          <YStack paddingHorizontal="$3" paddingTop="$2" space="$0">
            <H2 color="$appText" fontFamily="Inter_600SemiBold" marginBottom="$3" fontSize="$6">
              Trending on Evryday
            </H2>
            {dummyTrendingTopics.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity onPress={() => handleViewTrendingItem(item)}>
                  <YStack 
                    paddingVertical="$4" 
                    paddingHorizontal="$2"
                    space="$2"
                    hoverStyle={{ backgroundColor: '$appSurface' }}
                    borderRadius="$2"
                  >
                    <XStack alignItems="flex-start" space="$3">
                      <Text fontSize={28} fontWeight="bold" color={colors.inactiveColor} style={{ lineHeight: 30, opacity: 0.7 }}>
                        {index + 1 < 10 ? `0${index + 1}`: index + 1}
                      </Text>
                      <YStack flex={1} space="$1">
                         {item.author && (
                            <Text fontSize="$2" color="$appTextSecondary" fontFamily="Inter_500Medium" marginBottom="$1">
                              {item.author}
                            </Text>
                          )}
                        <Text fontSize="$5" color="$appText" fontFamily="Merriweather_700Bold" lineHeight="$5">
                          {item.title}
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </TouchableOpacity>
                {index < dummyTrendingTopics.length - 1 && <Separator marginHorizontal="$2" borderColor="$appBorder" />}
              </React.Fragment>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
} 
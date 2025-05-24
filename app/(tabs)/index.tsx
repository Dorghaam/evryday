import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button as TamaguiButton, ScrollView, H2, Paragraph, Separator, View, Card } from 'tamagui';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, Link, Stack } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import { BookHeart, Edit3, Search, Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import tamaguiConfig from '../../tamagui.config';

// Placeholder data for featured essays
interface FeaturedEssay {
  id: string;
  title: string;
  author: string; // Or source
  snippet: string;
  // Add other relevant fields like date, readTime, image (optional)
}

const dummyFeaturedEssays: FeaturedEssay[] = [
  { id: '1', title: 'The Future of Thought: AI & Human Cognition', author: 'Evryday AI', snippet: 'Exploring how artificial intelligence is reshaping our understanding of the mind...' },
  { id: '2', title: 'Daily Reflections: Finding Clarity in Chaos', author: 'Evryday AI', snippet: 'A guide to using daily writing prompts for mental well-being and focus...' },
  { id: '3', title: 'Unlocking Creativity: The Power of Random Ideas', author: 'Evryday AI', snippet: 'How unexpected connections can spark groundbreaking insights and innovations...' },
];

export default function HomeScreen() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { getThemeColors, currentTheme } = useThemeStore();
  const colors = getThemeColors();

  const [featuredEssays, setFeaturedEssays] = useState<FeaturedEssay[]>(dummyFeaturedEssays);

  const handleAuthAction = () => {
    if (user) {
      supabaseClient.auth.signOut().then(() => router.replace('/(tabs)'));
    } else {
      router.push('/auth');
    }
  };

  const navigateToEssayGenerator = () => {
    router.push('/generate-modal');
  };
  
  const handleViewEssay = (essay: FeaturedEssay) => {
    Alert.alert("View Essay", `Title: ${essay.title}`);
  };

  const tamaguiThemeName = currentTheme === 'dark' ? 'dark_app' : 'light_app';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <YStack flex={1} backgroundColor="$appBackground">
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          paddingTop="$5"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$appBorder"
          backgroundColor="$appSurface"
        >
          <Text fontSize={28} color="$appText" fontFamily="Inter_700Bold">
            Evryday
          </Text>
          <XStack space="$3" alignItems="center">
            <TamaguiButton
              icon={<Search size={22} color={colors.textColor} />}
              chromeless
              circular
              onPress={() => Alert.alert("Search", "Search functionality to be implemented.")}
            />
            <TamaguiButton
              size="$3"
              onPress={handleAuthAction}
              backgroundColor={user ? "$red9" : "$appPrimary"}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="$appButtonText" fontFamily="Inter_500Medium">
                {user ? 'Logout' : 'Login'}
              </Text>
            </TamaguiButton>
          </XStack>
        </XStack>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <XStack space="$3" padding="$3" borderBottomWidth={1} borderBottomColor="$appBorder">
            <TamaguiButton theme="active" chromeless>
              <Text color="$appPrimary" fontSize="$4" fontFamily="Inter_600SemiBold">For You</Text>
            </TamaguiButton>
            <TamaguiButton chromeless>
              <Text color="$appTextSecondary" fontSize="$4" fontFamily="Inter_600SemiBold">Following</Text>
            </TamaguiButton>
          </XStack>

          <YStack padding="$4" space="$5">
            <H2 color="$appText" fontFamily="Inter_600SemiBold">Featured Essays</H2>
            {featuredEssays.map((essay) => (
              <Card
                key={essay.id}
                elevate
                bordered
                backgroundColor="$appSurface"
                padding="$3.5"
                space="$2.5"
                hoverStyle={{ backgroundColor: '$backgroundStrong' }}
                pressStyle={{ backgroundColor: '$backgroundStrong', scale: 0.98 }}
                onPress={() => handleViewEssay(essay)}
                marginBottom="$3.5"
              >
                <Card.Header padding={0}>
                  <Text fontSize="$6" color="$appText" fontFamily="Merriweather_700Bold" lineHeight="$5">
                    {essay.title}
                  </Text>
                </Card.Header>
                <Text fontSize="$2" color="$appTextSecondary" fontFamily="Inter_500Medium" marginTop="$1">
                  By {essay.author}
                </Text>
                <Paragraph fontSize="$3" color="$appTextSecondary" numberOfLines={3} ellipsizeMode="tail" fontFamily="Inter_400Regular" lineHeight="$3" marginTop="$1.5">
                  {essay.snippet}
                </Paragraph>
              </Card>
            ))}
          </YStack>
        </ScrollView>

        <TamaguiButton
          icon={<Edit3 size={24} color={colors.backgroundColor} />}
          circular
          size="$5"
          backgroundColor="$appPrimary"
          position="absolute"
          bottom="$4"
          right="$4"
          elevation="$4"
          onPress={navigateToEssayGenerator}
          pressStyle={{ scale: 0.95, backgroundColor: colors.activeColor, opacity: 0.8 }}
        />
      </YStack>
    </SafeAreaView>
  );
}

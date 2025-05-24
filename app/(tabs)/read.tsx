import { useUser } from '@supabase/auth-helpers-react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import {
  Button,
  H2, Paragraph, ScrollView,
  Text,
  useTheme,
  XStack,
  YStack
} from 'tamagui';
import { supabase } from '../../lib/supabase/client';
import { useEssayStore } from '../../store/essayStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; readingLevel?: string; content?: string }>();
  const { currentEssay } = useEssayStore();
  const user = useUser();
  const tamaguiTheme = useTheme();
  const { getThemeColors, currentTheme: appCurrentTheme } = useThemeStore();
  const colors = getThemeColors();
  const [isSaving, setIsSaving] = useState(false);

  const essay = {
    subject: params.subject || currentEssay?.subject || "Untitled Essay",
    readingLevel: params.readingLevel || currentEssay?.readingLevel || "N/A",
    content: params.content || currentEssay?.content || "No content available.",
  };

  const handleSaveEssay = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to save essays.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push('/auth') }
      ]);
      return;
    }

    if (!essay.content || !essay.subject || !essay.readingLevel) {
      Alert.alert("Error", "Cannot save incomplete essay data.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_essays')
        .insert({
          user_id: user.id,
          subject: essay.subject,
          reading_level: essay.readingLevel,
          content: essay.content,
        });

      if (error) throw error;

      Alert.alert("Saved!", "Essay has been saved to your collection.", [
        { text: "View Saved Essays", onPress: () => router.push('/(tabs)/saved-essays') },
        { text: "OK", style: "default" }
      ]);
    } catch (e: any) {
      console.error('Error saving essay:', e);
      Alert.alert("Error", e.message || "Could not save the essay. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!essay.content) {
    return (
      <YStack flex={1} jc="center" ai="center" p="$4" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "No Essay" }} />
        <H2 color="$appText">No Essay to Display</H2>
        <Paragraph ta="center" mt="$2" color="$appTextSecondary">
          Please generate an essay first.
        </Paragraph>
        <Button onPress={() => router.replace('/(tabs)')} mt="$4" theme="active">
          Go Home
        </Button>
      </YStack>
    );
  }
  
  const markdownStyles = {
    body: { color: colors.textColor, fontSize: 18, lineHeight: 30, fontFamily: 'Merriweather_400Regular', marginTop: 10 },
    heading1: { color: colors.textColor, fontSize: 32, fontFamily: 'Merriweather_700Bold', marginTop: 20, marginBottom: 10, lineHeight: 40 },
    heading2: { color: colors.textColor, fontSize: 26, fontFamily: 'Merriweather_700Bold', marginTop: 18, marginBottom: 8, lineHeight: 34 },
    heading3: { color: colors.textColor, fontSize: 22, fontFamily: 'Merriweather_700Bold', marginTop: 16, marginBottom: 6, lineHeight: 30 },
    strong: { fontFamily: 'Merriweather_700Bold', color: colors.textColor },
    em: { fontFamily: 'Merriweather_400Regular', fontStyle: 'italic' as const, color: colors.textColor },
    link: { color: colors.activeColor, fontFamily: 'Merriweather_400Regular', textDecorationLine: 'underline' as const },
    paragraph: { marginVertical: 8, fontFamily: 'Merriweather_400Regular', fontSize: 18, lineHeight: 30, color: colors.textColor },
    bullet_list_icon: { color: colors.textColor, marginRight: 5 },
    ordered_list_icon: { color: colors.textColor, marginRight: 5 },
  };

  return (
    <YStack flex={1} backgroundColor="$appBackground">
      <Stack.Screen
        options={{
          title: essay.subject,
          headerStyle: { backgroundColor: colors.surfaceColor },
          headerTintColor: colors.textColor,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={tamaguiTheme.color?.val || colors.textColor} />} 
              onPress={() => router.back()}
              chromeless
              circular
              padding="$1.5"
            />
          ),
          headerRight: () => (
            <Button 
              icon={<Save size={20} color={tamaguiTheme.appButtonText?.val || "white"} />}
              onPress={handleSaveEssay}
              disabled={isSaving}
              backgroundColor="$appPrimary"
              size="$3"
              marginRight="$2"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="$appButtonText" fontFamily="Inter_500Medium">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Button>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Markdown style={markdownStyles}>
          {essay.content}
        </Markdown>
      </ScrollView>
      
      <XStack 
        jc="center" 
        paddingHorizontal="$4" 
        paddingVertical="$3" 
        borderTopWidth={1} 
        borderTopColor="$appBorder" 
        backgroundColor="$appSurface"
      >
        <Button 
          icon={<Save size={20} color="$appButtonText" />}
          onPress={handleSaveEssay}
          disabled={isSaving}
          backgroundColor="$appPrimary"
          size="$4"
          flexGrow={1}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text color="$appButtonText" fontFamily="Inter_600SemiBold" fontSize="$3">
            {isSaving ? "Saving Essay..." : "Save to My Essays"}
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
} 
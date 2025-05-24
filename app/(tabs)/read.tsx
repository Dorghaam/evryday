import { YStack, H2, Paragraph, ScrollView, Button, useTheme, Text, XStack } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useEssayStore } from '../../store/essayStore';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import Markdown from 'react-native-markdown-display';

export default function ReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; readingLevel?: string; content?: string }>();
  const { currentEssay } = useEssayStore();
  const user = useUser();
  const theme = useTheme();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const [isSaving, setIsSaving] = useState(false);

  // Use URL params if available, otherwise fall back to store
  const essay = {
    subject: params.subject || currentEssay?.subject,
    readingLevel: params.readingLevel || currentEssay?.readingLevel,
    content: params.content || currentEssay?.content,
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
        { text: "View Saved Essays", onPress: () => router.push('/saved-essays') },
        { text: "OK", style: "default" }
      ]);
    } catch (e: any) {
      console.error('Error saving essay:', e);
      Alert.alert("Error", e.message || "Could not save the essay. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // This screen should not be directly accessible if no essay data is available
  if (!essay.content) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "No Essay" }} />
        <H2 color={colors.textColor}>No Essay to Display</H2>
        <Paragraph textAlign="center" marginTop="$2" color={colors.textColor}>
          Please generate an essay first.
        </Paragraph>
        <Button onPress={() => router.replace('/')} marginTop="$4" backgroundColor={colors.activeColor}>
          <Text color="white">Go Home</Text>
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.backgroundColor}>
      <Stack.Screen 
        options={{ 
          title: essay.subject || 'Read Essay',
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={theme.color?.val} />} 
              onPress={() => router.back()}
              chromeless
              paddingLeft="$2"
            />
          ),
          headerRight: () => (
            <Button 
              icon={<Save size={20} color="white" />}
              onPress={handleSaveEssay}
              disabled={isSaving}
              backgroundColor={colors.activeColor}
              borderColor={colors.activeColor}
              size="$3"
              marginRight="$2"
            >
              <Text color="white" fontFamily="Inter_500Medium">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Button>
          ),
        }} 
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        <Markdown
          style={{
            body: { color: colors.textColor, fontSize: 18, lineHeight: 30, fontFamily: 'Inter_400Regular', marginTop: 20 },
            heading2: { color: colors.textColor, fontSize: 24, fontFamily: 'Inter_600SemiBold', marginTop: 10, marginBottom: 10 },
            strong: { fontFamily: 'Inter_700Bold', fontSize: 22, color: colors.textColor },
          }}
        >
          {essay.content}
        </Markdown>
        
        {/* Additional Save Button at bottom for easy access */}
        <XStack justifyContent="center" marginTop="$6" marginBottom="$4">
          <Button 
            icon={<Save size={20} color="white" />}
            onPress={handleSaveEssay}
            disabled={isSaving}
            backgroundColor={colors.activeColor}
            borderColor={colors.activeColor}
            size="$4"
            paddingHorizontal="$6"
          >
            <Text color="white" fontFamily="Inter_600SemiBold" fontSize="$4">
              {isSaving ? "Saving Essay..." : "Save to My Essays"}
            </Text>
          </Button>
        </XStack>
      </ScrollView>
    </YStack>
  );
} 
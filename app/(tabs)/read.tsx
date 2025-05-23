import { YStack, H2, Paragraph, ScrollView, Button, useTheme, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEssayStore } from '../../store/essayStore';

export default function ReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; readingLevel?: string; content?: string }>();
  const { currentEssay } = useEssayStore();
  const theme = useTheme();

  // Use URL params if available, otherwise fall back to store
  const essay = {
    subject: params.subject || currentEssay?.subject,
    readingLevel: params.readingLevel || currentEssay?.readingLevel,
    content: params.content || currentEssay?.content,
  };

  // This screen should not be directly accessible if no essay data is available
  if (!essay.content) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background">
        <Stack.Screen options={{ title: "No Essay" }} />
        <H2>No Essay to Display</H2>
        <Paragraph textAlign="center" marginTop="$2">
          Please generate an essay first.
        </Paragraph>
        <Button onPress={() => router.replace('/')} marginTop="$4">Go Home</Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen 
        options={{ 
          title: essay.subject || 'Read Essay',
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={theme.color?.val} />} 
              onPress={() => router.back()}
              chromeless
              paddingLeft="$2" // Tamagui specific padding
            />
          ),
        }} 
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
        <H2 color="$color12" fontSize="$7" marginTop="$3" marginBottom="$3">{essay.subject}</H2>
        <Paragraph theme="alt2" color="$color11" fontSize="$4" marginBottom="$4">
          {essay.readingLevel}
        </Paragraph>
        <Paragraph color="$color" fontSize="$6" lineHeight={30} selectable>
          {essay.content}
        </Paragraph>
      </ScrollView>
    </YStack>
  );
} 
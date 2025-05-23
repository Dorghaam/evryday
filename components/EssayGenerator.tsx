import { useState, useCallback } from 'react';
import { YStack, H3, Button, Select, Adapt, Sheet, Text, Spinner } from 'tamagui';
import { Check, ChevronDown, RefreshCw } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';
import { useEssayStore } from '../store/essayStore';

// --- Constants for selections ---
const SUBJECTS = ["History", "Science", "Philosophy", "Technology", "Art", "Literature", "Economics", "Psychology"];
const READING_LEVELS = ["Curious Child (5-8 years)", "Middle Schooler (11-13 years)", "High Schooler (14-17 years)", "University Student", "Seasoned Expert"];

// Helper to convert display string to value string
const toValueString = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

export default function EssayGenerator() {
  const router = useRouter();
  const { getThemeColors } = useThemeStore();
  const { setCurrentEssay, setReadTabVisible } = useEssayStore();
  const colors = getThemeColors();

  // State for Select components should store the value format used in Select.Item
  const [selectedSubjectValue, setSelectedSubjectValue] = useState(toValueString(SUBJECTS[0]));
  const [selectedReadingLevelValue, setSelectedReadingLevelValue] = useState(toValueString(READING_LEVELS[2]));
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get display string from value string (for API calls)
  const getDisplaySubject = (value: string) => SUBJECTS.find(s => toValueString(s) === value) || SUBJECTS[0];
  const getDisplayReadingLevel = (value: string) => READING_LEVELS.find(l => toValueString(l) === value) || READING_LEVELS[0];

  const handleGenerateEssay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const displaySubject = getDisplaySubject(selectedSubjectValue);
    const displayReadingLevel = getDisplayReadingLevel(selectedReadingLevelValue);

    console.log(`Calling API to generate essay for: ${displaySubject}, Level: ${displayReadingLevel}`);
    
    try {
      const response = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: displaySubject,
          readingLevel: displayReadingLevel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `API Error: ${response.status}`);
      }
      
      // Store the essay in the global store
      const essayData = {
        subject: displaySubject,
        readingLevel: displayReadingLevel,
        content: result.essay,
      };
      setCurrentEssay(essayData);
      setReadTabVisible(true);
      
      // Navigate to the read screen with the essay data
      router.push({
        pathname: '/read',
        params: { 
          subject: displaySubject, 
          readingLevel: displayReadingLevel, 
          content: result.essay 
        },
      });

    } catch (e: any) {
      console.error("Failed to generate essay:", e);
      setError(e.message || "An unexpected error occurred while fetching the essay.");
      Alert.alert("Error", e.message || "Could not generate essay.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjectValue, selectedReadingLevelValue, router, setCurrentEssay, setReadTabVisible]);

  return (
    <YStack space="$4" flex={1} paddingHorizontal="$3" paddingTop="$4" backgroundColor={colors.backgroundColor}>
      {/* --- Controls Section --- */}
      <YStack space="$3" paddingVertical="$3">
        <H3 textAlign="center" color={colors.textColor} fontFamily="Inter_600SemiBold">
          Craft Your Idea
        </H3>
        <YStack space="$2">
          <Text fontSize="$3" color={colors.textColor} fontFamily="Inter_500Medium">Subject</Text>
          <Select value={selectedSubjectValue} onValueChange={setSelectedSubjectValue} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Choose a subject...">
                {getDisplaySubject(selectedSubjectValue)}
              </Select.Value>
            </Select.Trigger>
            <Adapt when="sm" platform="native">
              <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Handle />
              </Sheet>
            </Adapt>
            <Select.Content>
              <Select.Viewport>
                {SUBJECTS.map((subject, i) => (
                  <Select.Item index={i} key={subject} value={toValueString(subject)}>
                    <Select.ItemText>{subject}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto"><Check size={16} /></Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" color={colors.textColor} fontFamily="Inter_500Medium">Reading Level</Text>
          <Select value={selectedReadingLevelValue} onValueChange={setSelectedReadingLevelValue} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Choose a level...">
                {getDisplayReadingLevel(selectedReadingLevelValue)}
              </Select.Value>
            </Select.Trigger>
            <Adapt when="sm" platform="native">
              <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Handle />
              </Sheet>
            </Adapt>
            <Select.Content>
              <Select.Viewport>
                {READING_LEVELS.map((level, i) => (
                  <Select.Item index={i} key={level} value={toValueString(level)}>
                    <Select.ItemText>{level}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto"><Check size={16} /></Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <Button 
          icon={isLoading ? <Spinner color={colors.textColor} /> : <RefreshCw size={16} color="white" />} 
          onPress={handleGenerateEssay} 
          disabled={isLoading}
          backgroundColor={colors.activeColor}
          borderColor={colors.activeColor}
          size="$4"
          marginTop="$4"
          fontFamily="Inter_600SemiBold"
        >
          <Text color="white" fontFamily="Inter_600SemiBold">
            {isLoading ? "Generating..." : "Generate Idea & Read"}
          </Text>
        </Button>
      </YStack>

      {error && (
        <Text 
          color="$red10" 
          textAlign="center" 
          padding="$2" 
          fontSize="$2" 
          fontFamily="Inter_400Regular"
          backgroundColor={colors.surfaceColor}
          borderRadius="$2"
        >
          {error}
        </Text>
      )}

      {/* Essay display and save button are removed from here, will be on /read screen */}
      
    </YStack>
  );
} 
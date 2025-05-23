import { useState, useEffect } from 'react';
import { YStack, H3, Paragraph, Button, Select, Adapt, Sheet, View, Text, Spinner, ScrollView } from 'tamagui';
import { Check, ChevronDown, Star as StarIcon, RefreshCw } from 'lucide-react-native'; // Using lucide-react-native
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client'; // Ensure this path is correct
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// --- Constants for selections ---
const SUBJECTS = ["History", "Science", "Philosophy", "Technology", "Art", "Literature", "Economics", "Psychology"];
const READING_LEVELS = ["Curious Child (5-8 years)", "Middle Schooler (11-13 years)", "High Schooler (14-17 years)", "University Student", "Seasoned Expert"];

interface Essay {
  id?: string; // Supabase ID if saved
  subject: string;
  readingLevel: string;
  content: string;
  isFavorite?: boolean; // Client-side state
  // created_at from Supabase will be handled automatically
}

export default function EssayGenerator() {
  const user = useUser();
  const supabaseClient = useSupabaseClient(); // Can also use the imported `supabase` directly
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedReadingLevel, setSelectedReadingLevel] = useState(READING_LEVELS[2]);
  
  const [currentEssay, setCurrentEssay] = useState<Essay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock essay generation for now
  const handleGenerateEssay = async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Generating essay for: ${selectedSubject}, Level: ${selectedReadingLevel}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const mockContent = `This is a mock essay about ${selectedSubject} for a ${selectedReadingLevel}. It contains several paragraphs of interesting, placeholder information designed to simulate a real essay. Once the backend is connected, this will be replaced with AI-generated content. \n\nFor now, enjoy this simulated experience and imagine the possibilities!`;
    
    setCurrentEssay({
      subject: selectedSubject,
      readingLevel: selectedReadingLevel,
      content: mockContent,
      isFavorite: false, // Reset favorite state for new essay
    });
    setIsLoading(false);
  };

  // Effect to load initial essay
  useEffect(() => {
    handleGenerateEssay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load one on mount

  // --- TODO: Implement handleSaveFavorite and checkFavoriteStatus in next steps ---

  return (
    <YStack space="$4" flex={1} paddingHorizontal="$3">
      {/* --- Controls Section --- */}
      <YStack space="$3" paddingVertical="$3" borderBottomWidth={1} borderColor="$borderColor">
        <H3 textAlign="center" color="$color">Craft Your Idea</H3>
        <YStack space="$2">
          <Text fontSize="$3" color="$colorFocus">Subject</Text>
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Choose a subject..." />
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
                  <Select.Item index={i} key={subject} value={subject.toLowerCase()}>
                    <Select.ItemText>{subject}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" color="$colorFocus">Reading Level</Text>
          <Select value={selectedReadingLevel} onValueChange={setSelectedReadingLevel} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Choose a level..." />
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
                  <Select.Item index={i} key={level} value={level.toLowerCase()}>
                    <Select.ItemText>{level}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <Button 
          icon={isLoading ? <Spinner /> : RefreshCw} 
          onPress={handleGenerateEssay} 
          disabled={isLoading}
          theme="active"
          size="$4"
        >
          {isLoading ? "Generating..." : "Generate New Idea"}
        </Button>
      </YStack>

      {error && <Text color="$red10" textAlign="center" padding="$2">{error}</Text>}

      {/* --- Essay Display Section --- */}
      {currentEssay ? (
        <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 20 }}>
          <YStack space="$3" padding="$3" backgroundColor="$background" borderRadius="$4" elevation="$2">
            <H3 color="$color12">{currentEssay.subject}</H3>
            <Paragraph theme="alt2" color="$color11" fontSize="$3">{currentEssay.readingLevel}</Paragraph>
            <Paragraph color="$color" lineHeight={24} fontSize="$5" whiteSpace="pre-wrap">
              {currentEssay.content}
            </Paragraph>
            {user && (
              <Button 
                icon={isSaving ? <Spinner size="small" /> : (currentEssay.isFavorite ? <StarIcon fill="$yellow10" color="$yellow10" /> : <StarIcon />) }
                onPress={() => { /* TODO: handleSaveFavorite */ Alert.alert("Save Clicked", "Save logic to be implemented.")}}
                disabled={isSaving || isLoading} // Disable if already saving or new essay loading
                aria-label="Save Favorite"
                circular // Makes it round if no text
                size="$4"
                alignSelf='flex-end'
                theme={currentEssay.isFavorite ? "yellow" : undefined}
              >
               {/* Save */}
              </Button>
            )}
          </YStack>
        </ScrollView>
      ) : isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$orange10" />
          <Text color="$color10" marginTop="$2">Generating your idea...</Text>
        </YStack>
      ) : (
        <YStack flex={1} justifyContent="center" alignItems="center">
           <Text color="$color10">Select options and generate an idea!</Text>
        </YStack>
      )}
    </YStack>
  );
} 
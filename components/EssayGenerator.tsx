import { useState, useEffect, useCallback } from 'react';
import { YStack, H3, Paragraph, Button, Select, Adapt, Sheet, View, Text, Spinner, ScrollView } from 'tamagui';
import { Check, ChevronDown, Star as StarIcon, RefreshCw } from 'lucide-react-native'; // Use lucide-react-native
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
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
  isFavorite?: boolean;
}

export default function EssayGenerator() {
  const user = useUser();
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedReadingLevel, setSelectedReadingLevel] = useState(READING_LEVELS[2]);
  
  const [currentEssay, setCurrentEssay] = useState<Essay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if the current essay is a favorite
  const checkFavoriteStatus = useCallback(async (essay: Essay) => {
    if (!user || !essay) return false;
    try {
      const { data, error } = await supabase
        .from('saved_essays')
        .select('id')
        .eq('user_id', user.id)
        .eq('subject', essay.subject)
        .eq('reading_level', essay.readingLevel)
        .eq('content', essay.content) // Matching by content, subject, and level
        .maybeSingle(); // Use maybeSingle to get one or null

      if (error) {
        console.error('Error checking favorite status:', error.message);
        return false;
      }
      return !!data; // True if a record is found
    } catch (e: any) {
      console.error('Catch Error checking favorite status:', e.message);
      return false;
    }
  }, [user]);

  const handleGenerateEssay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Generating essay for: ${selectedSubject}, Level: ${selectedReadingLevel}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const mockContent = `This is a mock essay about ${selectedSubject} for a ${selectedReadingLevel}. It contains several paragraphs of interesting, placeholder information designed to simulate a real essay. Once the backend is connected, this will be replaced with AI-generated content. \n\nFor now, enjoy this simulated experience and imagine the possibilities! This is version ${Math.random().toFixed(3)}`; // Add randomness to content
    
    const newEssayData: Essay = {
      subject: selectedSubject,
      readingLevel: selectedReadingLevel,
      content: mockContent,
      isFavorite: false, // Default to false
    };

    if (user) {
      newEssayData.isFavorite = await checkFavoriteStatus(newEssayData);
    }
    
    setCurrentEssay(newEssayData);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedReadingLevel, user, checkFavoriteStatus]); // Added dependencies

  useEffect(() => {
    handleGenerateEssay();
  }, [handleGenerateEssay]); // Now only depends on the memoized callback


  const handleSaveFavorite = async () => {
    if (!currentEssay) return;
    if (!user) {
      Alert.alert("Login Required", "Please log in to save your favorite ideas.", [
        { text: "Cancel" },
        { text: "Login", onPress: () => router.push('/auth') }
      ]);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (currentEssay.isFavorite && currentEssay.id) { // Unsave if it has an ID (meaning it was fetched/confirmed as saved)
        const { error: deleteError } = await supabase
          .from('saved_essays')
          .delete()
          .match({ id: currentEssay.id, user_id: user.id });

        if (deleteError) throw deleteError;
        setCurrentEssay(prev => prev ? { ...prev, isFavorite: false, id: undefined } : null);
        Alert.alert('Unsaved', 'Removed from your favorites.');

      } else if (currentEssay.isFavorite && !currentEssay.id) { // Unsave based on content match if no ID yet
         const { error: deleteError } = await supabase
          .from('saved_essays')
          .delete()
          .eq('user_id', user.id)
          .eq('subject', currentEssay.subject)
          .eq('reading_level', currentEssay.readingLevel)
          .eq('content', currentEssay.content);

        if (deleteError) throw deleteError;
        setCurrentEssay(prev => prev ? { ...prev, isFavorite: false, id: undefined } : null);
        Alert.alert('Unsaved', 'Removed from your favorites.');

      } else { // Save new favorite
        const { data, error: insertError } = await supabase
          .from('saved_essays')
          .insert({
            user_id: user.id,
            subject: currentEssay.subject,
            reading_level: currentEssay.readingLevel,
            content: currentEssay.content,
          })
          .select('id') // Select the ID of the newly inserted row
          .single(); // Expect a single row back

        if (insertError) throw insertError;
        if (data) {
            setCurrentEssay(prev => prev ? { ...prev, isFavorite: true, id: data.id } : null);
            Alert.alert('Saved!', 'Added to your favorites.');
        } else {
            // Should not happen if insertError is null
            throw new Error("Failed to save essay: No data returned after insert.");
        }
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while saving/unsaving.");
      Alert.alert('Error', e.message || "Could not update favorites.");
      // Optionally revert optimistic UI update here if needed
    } finally {
      setIsSaving(false);
    }
  };
  
  // Re-check favorite status if user logs in/out or current essay changes
  useEffect(() => {
    if (currentEssay && user) {
      const verifyFavorite = async () => {
        const isFav = await checkFavoriteStatus(currentEssay);
        // Try to find existing ID if it is a favorite
        let existingId: string | undefined = undefined;
        if (isFav) {
             const { data } = await supabase
            .from('saved_essays')
            .select('id')
            .eq('user_id', user.id)
            .eq('subject', currentEssay.subject)
            .eq('reading_level', currentEssay.readingLevel)
            .eq('content', currentEssay.content)
            .maybeSingle();
            existingId = data?.id;
        }
        setCurrentEssay(prev => prev ? { ...prev, isFavorite: isFav, id: existingId } : null);
      }
      verifyFavorite();
    } else if (currentEssay && !user) {
      // If user logs out, mark as not favorite
      setCurrentEssay(prev => prev ? { ...prev, isFavorite: false, id: undefined } : null);
    }
  }, [user, currentEssay?.content, checkFavoriteStatus]); // Re-check on content change (new essay) or user change


  return (
    <YStack space="$4" flex={1} paddingHorizontal="$3">
      {/* Controls Section (remains the same) */}
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
                <Sheet.Frame><Sheet.ScrollView><Adapt.Contents /></Sheet.ScrollView></Sheet.Frame>
                <Sheet.Handle />
              </Sheet>
            </Adapt>
            <Select.Content>
              <Select.Viewport>
                {SUBJECTS.map((subject, i) => (
                  <Select.Item index={i} key={subject} value={subject}>
                    <Select.ItemText>{subject}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto"><Check size={16} /></Select.ItemIndicator>
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
                <Sheet.Frame><Sheet.ScrollView><Adapt.Contents /></Sheet.ScrollView></Sheet.Frame>
                <Sheet.Handle />
              </Sheet>
            </Adapt>
            <Select.Content>
              <Select.Viewport>
                {READING_LEVELS.map((level, i) => (
                  <Select.Item index={i} key={level} value={level}>
                    <Select.ItemText>{level}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto"><Check size={16} /></Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <Button 
          icon={isLoading ? <Spinner /> : <RefreshCw size={16} />} 
          onPress={handleGenerateEssay} 
          disabled={isLoading || isSaving} // Also disable if saving
          theme="active"
          size="$4"
        >
          {isLoading ? "Generating..." : "Generate New Idea"}
        </Button>
      </YStack>

      {error && <Text color="$red10" textAlign="center" padding="$2" fontSize="$2">{error}</Text>}

      {/* Essay Display Section */}
      {currentEssay ? (
        <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 20 }}>
          <YStack space="$3" padding="$3" backgroundColor="$background" borderRadius="$4" elevation="$2">
            <H3 color="$color12" onPress={() => console.log(currentEssay)}>{currentEssay.subject}</H3> 
            <Paragraph theme="alt2" color="$color11" fontSize="$3">{currentEssay.readingLevel}</Paragraph>
            <Paragraph color="$color" lineHeight={24} fontSize="$5" whiteSpace="pre-wrap">
              {currentEssay.content}
            </Paragraph>
            
            {/* Debug info */}
            {__DEV__ && (
              <Text fontSize="$2" color="$gray10" padding="$2">
                Debug: User: {user ? 'logged in' : 'not logged in'} | isFavorite: {currentEssay.isFavorite ? 'true' : 'false'} | ID: {currentEssay.id || 'none'}
              </Text>
            )}
            
            <Button 
              icon={isSaving ? <Spinner size="small" color="$color10" /> : undefined}
              onPress={handleSaveFavorite}
              disabled={isSaving || isLoading}
              aria-label="Save Favorite"
              size="$5" // Made larger
              alignSelf='flex-end'
              theme={currentEssay.isFavorite ? "yellow" : "gray"}
              backgroundColor={currentEssay.isFavorite ? "$yellow5" : "$gray5"} // Add background color for visibility
              borderWidth={1}
              borderColor={currentEssay.isFavorite ? "$yellow8" : "$gray8"}
              marginTop="$3"
              elevation="$2" // Add some elevation
            >
              {isSaving ? "..." : (currentEssay.isFavorite ? "⭐" : "☆")} {/* Use emoji stars for better visibility */}
            </Button>
          </YStack>
        </ScrollView>
      ) : isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center" space="$2">
          <Spinner size="large" color="$orange10" />
          <Text color="$color10">Generating your idea...</Text>
        </YStack>
      ) : (
        <YStack flex={1} justifyContent="center" alignItems="center">
           <Text color="$color10">Select options and generate an idea!</Text>
        </YStack>
      )}
    </YStack>
  );
} 
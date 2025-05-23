import { useState, useEffect, useCallback } from 'react';
import { YStack, H3, Paragraph, Button, Select, Adapt, Sheet, View, Text, Spinner, ScrollView } from 'tamagui';
import { Check, ChevronDown, Star as StarIcon, RefreshCw, BookOpen } from 'lucide-react-native'; // Use lucide-react-native
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEssayStore, Essay } from '../store/essayStore'; // Import from store

// --- Constants for selections ---
const SUBJECTS = ["History", "Science", "Philosophy", "Technology", "Art", "Literature", "Economics", "Psychology"];
const READING_LEVELS = ["Curious Child (5-8 years)", "Middle Schooler (11-13 years)", "High Schooler (14-17 years)", "University Student", "Seasoned Expert"];

// Helper to convert display string to value string
const toValueString = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

export default function EssayGenerator() {
  const user = useUser();
  const router = useRouter();
  const { currentEssay, setCurrentEssay, setReadTabVisible } = useEssayStore();

  // State for Select components should store the value format used in Select.Item
  const [selectedSubjectValue, setSelectedSubjectValue] = useState(toValueString(SUBJECTS[0]));
  const [selectedReadingLevelValue, setSelectedReadingLevelValue] = useState(toValueString(READING_LEVELS[2]));
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get display string from value string (for currentEssay and API calls)
  const getDisplaySubject = (value: string) => SUBJECTS.find(s => toValueString(s) === value) || SUBJECTS[0];
  const getDisplayReadingLevel = (value: string) => READING_LEVELS.find(l => toValueString(l) === value) || READING_LEVELS[0];

  // Function to check if the current essay is a favorite
  const checkFavoriteStatus = useCallback(async (essay: Essay) => {
    if (!user || !essay) return false;
    try {
      const { data, error: dbError } = await supabase // aliased error to dbError
        .from('saved_essays')
        .select('id')
        .eq('user_id', user.id)
        .eq('subject', essay.subject) // Uses display string
        .eq('reading_level', essay.readingLevel) // Uses display string
        .eq('content', essay.content)
        .maybeSingle();

      if (dbError) {
        console.error('Error checking favorite status:', dbError.message);
        return false;
      }
      return !!data;
    } catch (e: any) {
      console.error('Catch Error checking favorite status:', e.message);
      return false;
    }
  }, [user]);

  const handleGenerateEssay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const displaySubject = getDisplaySubject(selectedSubjectValue);
    const displayReadingLevel = getDisplayReadingLevel(selectedReadingLevelValue);

    console.log(`Calling API to generate essay for: ${displaySubject}, Level: ${displayReadingLevel}`);
    
    try {
      const response = await fetch('/api/generate-essay', { // Relative path to the API route
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

      const newEssayData: Essay = {
        subject: displaySubject,
        readingLevel: displayReadingLevel,
        content: result.essay, // Get essay from API response
        isFavorite: false,
      };

      if (user) {
        newEssayData.isFavorite = await checkFavoriteStatus(newEssayData);
      }
      
      setCurrentEssay(newEssayData);
      setReadTabVisible(true); // Make Read tab visible when essay is generated

    } catch (e: any) {
      console.error("Failed to generate essay:", e);
      setError(e.message || "An unexpected error occurred while fetching the essay.");
      setCurrentEssay(null); // Clear previous essay on error
      setReadTabVisible(false); // Hide Read tab on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjectValue, selectedReadingLevelValue, user, checkFavoriteStatus, setCurrentEssay, setReadTabVisible]);

  useEffect(() => {
    // Automatically generate an essay when subject or level changes,
    // but only if not already loading. Debounce or more complex logic could be added here.
    if (!isLoading) {
         handleGenerateEssay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectValue, selectedReadingLevelValue]); // Re-generate when selections change

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
      if (currentEssay.isFavorite && currentEssay.id) {
        const { error: deleteError } = await supabase
          .from('saved_essays')
          .delete()
          .match({ id: currentEssay.id, user_id: user.id });

        if (deleteError) throw deleteError;
        setCurrentEssay({ ...currentEssay, isFavorite: false, id: undefined });
        Alert.alert('Unsaved', 'Removed from your favorites.');

      } else if (currentEssay.isFavorite && !currentEssay.id) {
         const { error: deleteError } = await supabase
          .from('saved_essays')
          .delete()
          .eq('user_id', user.id)
          .eq('subject', currentEssay.subject)
          .eq('reading_level', currentEssay.readingLevel)
          .eq('content', currentEssay.content);

        if (deleteError) throw deleteError;
        setCurrentEssay({ ...currentEssay, isFavorite: false, id: undefined });
        Alert.alert('Unsaved', 'Removed from your favorites.');

      } else { 
        const { data, error: insertError } = await supabase
          .from('saved_essays')
          .insert({
            user_id: user.id,
            subject: currentEssay.subject,       // Uses display string
            reading_level: currentEssay.readingLevel, // Uses display string
            content: currentEssay.content,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (data) {
            setCurrentEssay({ ...currentEssay, isFavorite: true, id: data.id });
            Alert.alert('Saved!', 'Added to your favorites.');
        } else {
            throw new Error("Failed to save essay: No data returned after insert.");
        }
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while saving/unsaving.");
      Alert.alert('Error', e.message || "Could not update favorites.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReadFullEssay = () => {
    router.push('/read' as any); // Type assertion to fix router typing issue
  };
  
  useEffect(() => {
    if (currentEssay && user) {
      const verifyFavorite = async () => {
        const isFav = await checkFavoriteStatus(currentEssay);
        let existingId: string | undefined = undefined;
        if (isFav) {
             const { data } = await supabase
            .from('saved_essays')
            .select('id')
            .eq('user_id', user.id)
            .eq('subject', currentEssay.subject) // Uses display string
            .eq('reading_level', currentEssay.readingLevel) // Uses display string
            .eq('content', currentEssay.content)
            .maybeSingle();
            existingId = data?.id;
        }
        setCurrentEssay({ ...currentEssay, isFavorite: isFav, id: existingId });
      }
      verifyFavorite();
    } else if (currentEssay && !user) {
      setCurrentEssay({ ...currentEssay, isFavorite: false, id: undefined });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentEssay?.content]); // Removed checkFavoriteStatus from deps as it's stable

  return (
    <YStack space="$4" flex={1} paddingHorizontal="$3">
      <YStack space="$3" paddingVertical="$3" borderBottomWidth={1} borderColor="$borderColor">
        <H3 textAlign="center" color="$color">Craft Your Idea</H3>
        <YStack space="$2">
          <Text fontSize="$3" color="$colorFocus">Subject</Text>
          {/* Use selectedSubjectValue for Select's value prop */}
          <Select value={selectedSubjectValue} onValueChange={setSelectedSubjectValue} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
              {/* Display the user-friendly version */}
              <Select.Value placeholder="Choose a subject...">
                {getDisplaySubject(selectedSubjectValue)}
              </Select.Value>
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
                  // Use the converted value string for Select.Item value
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
          <Text fontSize="$3" color="$colorFocus">Reading Level</Text>
          {/* Use selectedReadingLevelValue for Select's value prop */}
          <Select value={selectedReadingLevelValue} onValueChange={setSelectedReadingLevelValue} disablePreventBodyScroll>
            <Select.Trigger iconAfter={ChevronDown}>
               {/* Display the user-friendly version */}
              <Select.Value placeholder="Choose a level...">
                {getDisplayReadingLevel(selectedReadingLevelValue)}
              </Select.Value>
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
                  // Use the converted value string for Select.Item value
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
          icon={isLoading ? <Spinner /> : <RefreshCw size={16} />} 
          onPress={handleGenerateEssay} 
          disabled={isLoading || isSaving}
          theme="active"
          size="$4"
        >
          {isLoading ? "Generating..." : "Generate New Idea"}
        </Button>
      </YStack>

      {error && <Text color="$red" textAlign="center" padding="$2" fontSize="$2">{error}</Text>}

      {currentEssay ? (
        <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 20 }}>
          <YStack space="$3" padding="$3" backgroundColor="$background" borderRadius="$4" elevation="$2">
            <H3 color="$color12">{currentEssay.subject}</H3> 
            <Paragraph theme="alt2" color="$color11" fontSize="$3">{currentEssay.readingLevel}</Paragraph>
            
            {/* Show truncated content with Read More button */}
            <Paragraph color="$color" lineHeight={24} fontSize="$5" whiteSpace="pre-wrap">
              {currentEssay.content.length > 300 
                ? `${currentEssay.content.substring(0, 300)}...` 
                : currentEssay.content}
            </Paragraph>
            
            {currentEssay.content.length > 300 && (
              <Button 
                icon={<BookOpen size={16} />}
                onPress={handleReadFullEssay}
                theme="alt1"
                size="$4"
                marginTop="$2"
              >
                Read Full Essay
              </Button>
            )}
            
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
              size="$5" 
              alignSelf='flex-end'
              theme={currentEssay.isFavorite ? "yellow" : "gray"}
              backgroundColor={currentEssay.isFavorite ? "$yellow5" : "$gray5"}
              borderWidth={1}
              borderColor={currentEssay.isFavorite ? "$yellow8" : "$gray8"}
              marginTop="$3"
              elevation="$2" 
            >
              {isSaving ? "..." : (currentEssay.isFavorite ? "⭐" : "☆")} 
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
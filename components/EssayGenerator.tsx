import { useState, useCallback } from 'react';
import { YStack, XStack, H3, Button, Select, Adapt, Sheet, Text, Spinner, Input, ScrollView } from 'tamagui';
import { Check, ChevronDown, RefreshCw } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';
import { useEssayStore } from '../store/essayStore';

// --- Constants for selections ---
const SUBJECTS = [
  // Humanities & Social Sciences
  "Ancient History", "Medieval History", "Modern History", "Art History", "Military History",
  "Ethics", "Metaphysics", "Epistemology", "Political Philosophy", "Philosophy of Mind",
  "Poetry", "Classic Novels", "Contemporary Fiction", "Drama", "Creative Writing",
  "Archaeology", "Anthropology", "Sociology", "Cultural Studies", "Media Studies",
  "Cognitive Psychology", "Social Psychology", "Developmental Psychology", "Political Science",
  "International Relations", "Macroeconomics", "Microeconomics", "Behavioral Economics",
  "Geography", "Linguistics", "Religious Studies", "Mythology", "Folklore",
  
  // STEM
  "Physics", "Chemistry", "Biology", "Astronomy", "Earth Science", "Environmental Science",
  "Neuroscience", "Genetics", "Marine Biology", "Paleontology", "Quantum Mechanics",
  "Algebra", "Calculus", "Statistics", "Geometry", "Number Theory",
  "Artificial Intelligence", "Cybersecurity", "Software Development", "Biotechnology",
  "Nanotechnology", "Robotics", "Space Exploration", "Data Science",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering",
  "Aerospace Engineering", "Biomedical Engineering",
  
  // Arts & Design
  "Painting", "Sculpture", "Photography", "Digital Art", "Architecture",
  "Music Theory", "Music History", "Jazz", "Classical Music", "Electronic Music",
  "Film Studies", "Documentary Filmmaking", "Performing Arts", "Theater",
  "Graphic Design", "Fashion Design", "Industrial Design", "Game Design",
  
  // Business & Professional
  "Business Administration", "Marketing", "Finance", "Entrepreneurship",
  "Human Resources", "Project Management", "Law", "Medicine", "Education",
  "Journalism", "Public Relations", "Supply Chain Management",
  
  // Personal Development & Lifestyle
  "Health & Wellness", "Nutrition", "Fitness", "Mindfulness", "Meditation",
  "Productivity", "Personal Finance", "Cooking", "Travel", "Gardening",
  "DIY & Crafts", "Gaming", "Sports", "Photography",
  
  // Other Interesting Topics
  "True Crime", "Conspiracy Theories", "Futurology", "Cryptography",
  "Urban Planning", "Climate Change", "Renewable Energy", "Conservation",
  "Language Learning", "World Cultures", "Sustainable Living", "Mental Health"
];
const READING_LEVELS = ["Curious Child (5-8 years)", "Middle Schooler (11-13 years)", "High Schooler (14-17 years)", "University Student", "Seasoned Expert"];

// Helper to convert display string to value string
const toValueString = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

export default function EssayGenerator() {
  const router = useRouter();
  const { getThemeColors, currentTheme } = useThemeStore();
  const { setCurrentEssay, setReadTabVisible } = useEssayStore();
  const colors = getThemeColors();

  // State for Select components should store the value format used in Select.Item
  const [selectedSubjectValue, setSelectedSubjectValue] = useState(toValueString(SUBJECTS[0]));
  const [selectedReadingLevelValue, setSelectedReadingLevelValue] = useState(toValueString(READING_LEVELS[2]));
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState(SUBJECTS);
  
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
    <YStack space="$4" flex={1} paddingHorizontal="$3" paddingTop="$4" paddingBottom="$6" backgroundColor={colors.backgroundColor}>
      {/* --- Controls Section --- */}
      <YStack space="$3" paddingVertical="$3">
        <YStack space="$2">
          <Text fontSize="$3" color={colors.textColor} fontFamily="Inter_500Medium">Subject</Text>
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              if (text.trim() === '') {
                setFilteredSubjects(SUBJECTS);
              } else {
                setFilteredSubjects(
                  SUBJECTS.filter(subject =>
                    subject.toLowerCase().includes(text.toLowerCase())
                  )
                );
              }
            }}
            size="$4"
            borderColor={colors.borderColor}
            backgroundColor={colors.surfaceColor}
            color={colors.textColor}
            placeholderTextColor={colors.inactiveColor}
            marginVertical="$2"
            accessibilityLabel="Search categories"
          />
          
          <ScrollView 
            maxHeight={300}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <XStack flexWrap="wrap" gap="$2" justifyContent="center">
              {filteredSubjects.map((subjectDisplay, index) => {
                const subjectVal = toValueString(subjectDisplay);
                const isSelected = selectedSubjectValue === subjectVal;
                return (
                  <Button
                    key={index}
                    onPress={() => setSelectedSubjectValue(subjectVal)}
                    backgroundColor={isSelected ? colors.activeColor : colors.surfaceColor}
                    borderColor={isSelected ? colors.activeColor : colors.borderColor}
                    borderWidth={1}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$4"
                    margin="$1"
                    minWidth={80}
                    height="$4"
                    justifyContent="center"
                    alignItems="center"
                    accessibilityRole="button"
                    accessibilityLabel={subjectDisplay}
                  >
                    <Text
                      color={isSelected ? (currentTheme === 'dark' ? colors.backgroundColor : 'white') : colors.textColor}
                      fontSize="$2"
                      fontFamily="Inter_500Medium"
                      textAlign="center"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {subjectDisplay}
                    </Text>
                  </Button>
                );
              })}
              {filteredSubjects.length === 0 && searchTerm.trim() !== '' && (
                <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
                  <Text color={colors.inactiveColor}>No categories match "{searchTerm}".</Text>
                </YStack>
              )}
            </XStack>
          </ScrollView>
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
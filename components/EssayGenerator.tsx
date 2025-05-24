import { useState, useCallback } from 'react';
import { YStack, XStack, H3, Button, Text, Spinner, Input, ScrollView } from 'tamagui';
import { Check, ChevronDown, RefreshCw } from 'lucide-react-native';
import { Alert, TouchableOpacity } from 'react-native';
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
  
  // Dropdown state for reading level
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onPress={() => setIsDropdownOpen(false)}
          activeOpacity={1}
        />
      )}
      
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
          <YStack position="relative">
            <TouchableOpacity
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                borderWidth: 1,
                borderColor: colors.borderColor,
                backgroundColor: colors.surfaceColor,
                borderRadius: 8,
                height: 44,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text color={colors.textColor} fontSize="$3" fontFamily="Inter_500Medium">
                {getDisplayReadingLevel(selectedReadingLevelValue)}
              </Text>
              <ChevronDown size={20} color={colors.textColor} style={{
                transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }]
              }} />
            </TouchableOpacity>
            
            {isDropdownOpen && (
              <YStack
                position="absolute"
                top="$5"
                left={0}
                right={0}
                backgroundColor={colors.surfaceColor}
                borderWidth={1}
                borderColor={colors.borderColor}
                borderRadius="$3"
                padding="$2"
                zIndex={1000}
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.25}
                shadowRadius={8}
                elevation={5}
              >
                {READING_LEVELS.map((level, i) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      setSelectedReadingLevelValue(toValueString(level));
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      marginVertical: 2,
                      backgroundColor: selectedReadingLevelValue === toValueString(level) 
                        ? colors.activeColor + '20' 
                        : 'transparent',
                    }}
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text 
                        color={colors.textColor} 
                        fontFamily="Inter_500Medium"
                        fontSize="$3"
                      >
                        {level}
                      </Text>
                      {selectedReadingLevelValue === toValueString(level) && (
                        <Check size={16} color={colors.activeColor} />
                      )}
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            )}
          </YStack>
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
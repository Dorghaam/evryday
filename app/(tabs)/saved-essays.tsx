import { useUser } from '@supabase/auth-helpers-react';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { BookmarkMinus, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, TouchableOpacity, View } from 'react-native';
import { Button, H2, H3, Paragraph, Spinner, Text, XStack, YStack } from 'tamagui';
import { supabase } from '../../lib/supabase/client';
import { useEssayStore } from '../../store/essayStore';
import { useThemeStore } from '../../stores/themeStore';

interface SavedEssay {
  id: string;
  subject: string;
  reading_level: string;
  content: string;
  created_at: string;
  snippet?: string; 
}

export default function SavedEssaysScreen() {
  const user = useUser();
  const router = useRouter();
  const { getThemeColors, currentTheme } = useThemeStore();
  const { setCurrentEssay } = useEssayStore();
  const colors = getThemeColors();
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>([]);
  const [loading, setLoading] = useState(true); // Start true to show loading initially
  const [error, setError] = useState<string | null>(null);

  const extractEssayDetails = (content: string): { title: string; snippet: string } => {
    const titleMatch = content.match(/^\s*\*\*(.*?)\*\*/m); // Title often at the start, bolded
    let title = "Untitled Essay";
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/^Title:\s*/i, '').trim();
    } else {
      // Fallback: first non-empty line if no bold title
      const firstLine = content.split('\n').find(line => line.trim() !== "")?.trim();
      if (firstLine) title = firstLine;
    }
    if (title.length > 70) title = title.substring(0, 67) + '...';

    // Generate a snippet (first ~100-150 chars, remove markdown)
    let plainTextContent = content
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')   // Remove italics
      .replace(/#{1,6}\s*(.*)/g, '$1') // Remove headings
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/(\r\n|\n|\r)/gm, " ")    // Replace newlines with spaces
      .replace(/\s\s+/g, ' ');          // Replace multiple spaces with single
    
    // Remove the title from the snippet if it's at the beginning
    if (plainTextContent.toLowerCase().startsWith(title.toLowerCase())) {
        plainTextContent = plainTextContent.substring(title.length).trim();
    }

    let snippet = plainTextContent.substring(0, 120).trim();
    if (plainTextContent.length > 120) snippet += "...";

    return { title, snippet };
  };

  // Redirect to auth whenever the screen is focused and there's no user
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.replace('/auth');
        return;
      }
    }, [user, router])
  );

  const fetchSavedEssays = useCallback(async () => {
    // Only fetch if there's a user
    if (!user) return;

    console.log('Fetching saved essays for user:', user.id);
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_essays')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error: fetchError });

      if (fetchError) throw fetchError;
      setSavedEssays(data || []);
      console.log('Successfully loaded essays:', data?.length || 0);
    } catch (e: any) {
      console.error('Error fetching essays:', e);
      setError(e.message || "Failed to fetch saved essays.");
      Alert.alert("Error", e.message || "Could not load your saved essays.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Only fetch data if the user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedEssays();
    }
  }, [user, fetchSavedEssays]);

  // Refresh essays whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchSavedEssays();
      }
    }, [user, fetchSavedEssays])
  );

  const handleDeleteEssay = async (essayId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this saved essay?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error: deleteError } = await supabase
                .from('saved_essays')
                .delete()
                .match({ id: essayId, user_id: user?.id }); // Ensure user matches
              
              if (deleteError) throw deleteError;
              setSavedEssays(prev => prev.filter(essay => essay.id !== essayId));
              Alert.alert("Deleted", "Essay removed from your saved list.");
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not delete the essay.");
            }
          }
        }
      ]
    );
  };

  // If no user and not loading, show nothing (useFocusEffect will handle redirect)
  if (!user && !loading) {
    return null;
  }

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "Library", headerStyle: { backgroundColor: colors.surfaceColor }, headerTintColor: colors.textColor, headerTitleStyle: { fontFamily: 'Inter_600SemiBold' } }} />
        <Spinner size="large" color="$appPrimary" />
        <Paragraph marginTop="$2" color="$appText">Loading your saved essays...</Paragraph>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "Library", headerStyle: { backgroundColor: colors.surfaceColor }, headerTintColor: colors.textColor, headerTitleStyle: { fontFamily: 'Inter_600SemiBold' } }} />
        <Paragraph color="$red10" textAlign="center">{error}</Paragraph>
        <Button 
          onPress={fetchSavedEssays} 
          marginTop="$4"
          backgroundColor="$appPrimary"
        >
          <Text color="$appButtonText" fontFamily="Inter_600SemiBold">Try Again</Text>
        </Button>
      </YStack>
    );
  }
  
  if (savedEssays.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "Library", headerStyle: { backgroundColor: colors.surfaceColor }, headerTintColor: colors.textColor, headerTitleStyle: { fontFamily: 'Inter_600SemiBold' } }} />
        <BookmarkMinus size={48} color="$appTextSecondary" />
        <H2 color="$appText" marginTop="$3">Your Library is Empty</H2>
        <Paragraph textAlign="center" marginTop="$2" color="$appTextSecondary">
          Essays you save will appear here.
        </Paragraph>
        <Link href="/(tabs)" asChild>
          <Button marginTop="$4" theme="active" icon={<Search size={18}/>}>
            <Text color="$appButtonText" fontFamily="Inter_600SemiBold">Explore Essays</Text>
          </Button>
        </Link>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: SavedEssay }) => {
    const { title: extractedTitle, snippet: extractedSnippet } = extractEssayDetails(item.content);
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrentEssay({
            subject: item.subject,
            readingLevel: item.reading_level,
            content: item.content
          });
          router.push({ pathname: '/(tabs)/read', params: { ...item } });
        }}
      >
        <YStack
          paddingVertical="$3.5"
          paddingHorizontal="$4"
          borderBottomWidth={1}
          borderColor="$appBorder"
          backgroundColor="$appBackground" // Use main background for list items
          hoverStyle={{ backgroundColor: '$appSurface' }} // Subtle hover
        >
          <Text fontSize={14} color="$appTextSecondary" fontFamily="Inter_400Regular" marginBottom="$1.5">
            {item.subject} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <H3 color="$appText" fontFamily="Merriweather_700Bold" lineHeight={24} marginBottom="$1.5" numberOfLines={2} ellipsizeMode="tail">
            {extractedTitle}
          </H3>
          <Paragraph color="$appTextSecondary" fontFamily="Inter_400Regular" numberOfLines={2} ellipsizeMode="tail" lineHeight={22}>
            {extractedSnippet}
          </Paragraph>
          <XStack justifyContent="flex-end" marginTop="$3">
             <Button
                size="$3" // Changed from $2.5 to valid token
                icon={<Trash2 size={18} color="$red10" />}
                onPress={(e) => {
                    e.stopPropagation(); // Prevent card press
                    handleDeleteEssay(item.id);
                }}
                chromeless // Make it more subtle
                paddingHorizontal="$2"
              >
                <Text color="$red10" fontSize={12}>Remove</Text>
              </Button>
          </XStack>
        </YStack>
      </TouchableOpacity>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$appBackground">
      <Stack.Screen options={{ title: "Library", headerStyle: { backgroundColor: colors.surfaceColor }, headerTintColor: colors.textColor, headerTitleStyle: { fontFamily: 'Inter_600SemiBold' } }} />
      <FlatList
        data={savedEssays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View />} // Using borderBottom on items instead
        contentContainerStyle={{ paddingTop: 40 }} // Increased top padding to push content even lower
      />
    </YStack>
  );
} 
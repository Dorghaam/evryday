import { useState, useEffect, useCallback } from 'react';
import { YStack, H2, H3, Paragraph, Spinner, ScrollView, Card, Text, Button, Separator, XStack } from 'tamagui';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase/client';
import { Alert, FlatList } from 'react-native'; // Using FlatList for performance
import { useRouter, Link, Stack, useFocusEffect } from 'expo-router';
import { Trash2, FileText, Eye } from 'lucide-react-native'; // Icons for delete, document, and view
import { useThemeStore } from '../../stores/themeStore';
import { useEssayStore } from '../../store/essayStore';

interface SavedEssay {
  id: string;
  subject: string;
  reading_level: string; // Note: Supabase columns are often snake_case by convention
  content: string;
  created_at: string;
}

export default function SavedEssaysScreen() {
  const user = useUser();
  const router = useRouter();
  const { getThemeColors } = useThemeStore();
  const { setCurrentEssay } = useEssayStore();
  const colors = getThemeColors();
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent flash
  const [error, setError] = useState<string | null>(null);

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

  // If no user, show nothing (useFocusEffect will handle redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "My Saved Essays" }} />
        <Spinner size="large" color={colors.activeColor} />
        <Paragraph marginTop="$2" color={colors.textColor}>Loading your saved essays...</Paragraph>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "My Saved Essays" }} />
        <Paragraph color="$red10" textAlign="center">{error}</Paragraph>
        <Button 
          onPress={fetchSavedEssays} 
          marginTop="$4"
          backgroundColor={colors.activeColor}
          borderColor={colors.activeColor}
        >
          <Text color="white" fontFamily="Inter_600SemiBold">Try Again</Text>
        </Button>
      </YStack>
    );
  }
  
  if (savedEssays.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "My Saved Essays" }} />
        <H2 color={colors.textColor}>No Saved Essays Yet</H2>
        <Paragraph textAlign="center" marginTop="$2" color={colors.textColor}>
          Start generating and saving essays to see them here!
        </Paragraph>
        <Link href="/" asChild>
          <Button 
            marginTop="$4"
            backgroundColor={colors.activeColor}
            borderColor={colors.activeColor}
          >
            <Text color="white" fontFamily="Inter_600SemiBold">Generate Essays</Text>
          </Button>
        </Link>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: SavedEssay }) => (
    <XStack 
      elevation="$4" 
      marginVertical="$2" 
      padding="$4" 
      borderRadius="$6" 
      backgroundColor={colors.surfaceColor}
      alignItems="flex-start"
      space="$3"
      borderWidth={1}
      borderColor={colors.surfaceColor}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      {/* Icon */}
      <FileText 
        size={24} 
        color={colors.activeColor}
        style={{ marginTop: 2 }} // Slight adjustment to align with title
      />
      
      {/* Content Area */}
      <YStack flex={1} space="$2">
        {/* Title */}
        <H3 
          color={colors.textColor}
          numberOfLines={2}
          ellipsizeMode="tail"
          fontFamily="Inter_600SemiBold"
        >
          {item.subject}
        </H3>
        
        {/* Reading Level */}
        <Paragraph 
          size="$3" 
          color={colors.inactiveColor}
          fontFamily="Inter_500Medium"
        >
          {item.reading_level}
        </Paragraph>
        
        {/* Date */}
        <Paragraph 
          size="$2" 
          color={colors.inactiveColor}
          fontFamily="Inter_400Regular"
        >
          Saved: {new Date(item.created_at).toLocaleDateString()}
        </Paragraph>
        
        {/* Action Buttons */}
        <XStack 
          justifyContent="flex-end" 
          space="$3" 
          marginTop="$3"
          alignItems="center"
          flexShrink={0}
          flexWrap="nowrap"
        >
          {/* View Button */}
          <Button 
            size="$3"
            backgroundColor={colors.activeColor}
            borderColor={colors.activeColor}
            accessibilityLabel={`View essay: ${item.subject}`}
            minHeight={44}
            paddingHorizontal="$4"
            onPress={() => {
              // Set current essay for consistency (fallback)
              setCurrentEssay({
                subject: item.subject,
                readingLevel: item.reading_level,
                content: item.content
              });
              
              // Navigate with direct parameters (more robust)
              router.push({ 
                pathname: '/read', 
                params: { 
                  subject: item.subject, 
                  readingLevel: item.reading_level, 
                  content: item.content 
                } 
              });
            }}
          >
            <XStack alignItems="center" space="$2">
              <Eye size={16} color="white" />
              <Text color="white" fontFamily="Inter_500Medium" fontSize="$3">View</Text>
            </XStack>
          </Button>
          
          {/* Delete Button */}
          <Button 
            size="$3"
            circular
            backgroundColor="$red9"
            borderColor="$red10"
            borderWidth={1}
            accessibilityLabel={`Delete essay: ${item.subject}`}
            minHeight={44}
            minWidth={44}
            onPress={() => handleDeleteEssay(item.id)}
            pressStyle={{
              backgroundColor: "$red10",
              borderColor: "$red11"
            }}
          >
            <Trash2 size={22} color="white" />
          </Button>
        </XStack>
      </YStack>
    </XStack>
  );

  return (
    <YStack flex={1} backgroundColor={colors.backgroundColor}>
      <Stack.Screen options={{ title: "My Saved Essays" }} />
      <FlatList
        data={savedEssays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 32 
        }}
        style={{ flex: 1 }}
        ListHeaderComponent={
          <H2 
            padding="$4" 
            paddingTop="$8"
            paddingBottom="$2"
            color={colors.textColor}
            fontFamily="Inter_600SemiBold"
          >
            My Saved Essays
          </H2>
        }
      />
    </YStack>
  );
} 
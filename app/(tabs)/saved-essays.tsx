import { useState, useEffect, useCallback } from 'react';
import { YStack, H2, H3, Paragraph, Spinner, ScrollView, Card, Text, Button, Separator, XStack } from 'tamagui';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase/client';
import { Alert, FlatList } from 'react-native'; // Using FlatList for performance
import { useRouter, Link, Stack, useFocusEffect } from 'expo-router';
import { Trash2, FileText, Eye } from 'lucide-react-native'; // Icons for delete, document, and view
import { useThemeStore } from '../../stores/themeStore';

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
      Alert.alert("Error", e.message || "Could not load your saved ideas.");
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
      "Are you sure you want to delete this saved idea?",
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
              Alert.alert("Deleted", "Idea removed from your saved list.");
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not delete the idea.");
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
        <Stack.Screen options={{ title: "Saved Ideas" }} />
        <Spinner size="large" color={colors.activeColor} />
        <Paragraph marginTop="$2" color={colors.textColor}>Loading your saved ideas...</Paragraph>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "Saved Ideas" }} />
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
        <Stack.Screen options={{ title: "Saved Ideas" }} />
        <H2 color={colors.textColor}>No Saved Ideas Yet</H2>
        <Paragraph textAlign="center" marginTop="$2" color={colors.textColor}>
          Start generating and saving ideas to see them here!
        </Paragraph>
        <Link href="/" asChild>
          <Button 
            marginTop="$4"
            backgroundColor={colors.activeColor}
            borderColor={colors.activeColor}
          >
            <Text color="white" fontFamily="Inter_600SemiBold">Generate Ideas</Text>
          </Button>
        </Link>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: SavedEssay }) => (
    <XStack 
      elevation="$2" 
      marginVertical="$2" 
      padding="$3" 
      borderRadius="$4" 
      backgroundColor={colors.surfaceColor}
      alignItems="flex-start"
      space="$3"
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
          space="$2" 
          marginTop="$1"
          alignItems="center"
        >
          {/* View Button */}
          <Button 
            size="$3"
            backgroundColor={colors.activeColor}
            borderColor={colors.activeColor}
            onPress={() => {
              // TODO: Navigate to full essay view
              console.log('View essay:', item.id);
            }}
          >
            <XStack alignItems="center" space="$1">
              <Eye size={16} color="white" />
              <Text color="white" fontFamily="Inter_500Medium" fontSize="$2">View</Text>
            </XStack>
          </Button>
          
          {/* Delete Button */}
          <Button 
            size="$3"
            circular
            chromeless
            theme="red"
            onPress={() => handleDeleteEssay(item.id)}
          >
            <Trash2 size={18} color="$red10" />
          </Button>
        </XStack>
      </YStack>
    </XStack>
  );

  return (
    <YStack flex={1} backgroundColor={colors.backgroundColor}>
      <Stack.Screen options={{ title: "Saved Ideas" }} />
      <FlatList
        data={savedEssays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        ListHeaderComponent={<H2 padding="$3" color={colors.textColor}>My Saved Ideas</H2>}
      />
    </YStack>
  );
} 
import { useState, useEffect, useCallback } from 'react';
import { YStack, H2, H3, Paragraph, Spinner, ScrollView, Card, Text, Button, Separator } from 'tamagui';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
import { Alert, FlatList } from 'react-native'; // Using FlatList for performance
import { useRouter, Link } from 'expo-router';
import { Trash2 } from 'lucide-react-native'; // Icon for delete

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
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedEssays = useCallback(async () => {
    if (!user) {
      setSavedEssays([]);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    // If user is not logged in, redirect to auth or show message
    if (!user) {
        Alert.alert("Login Required", "Please log in to view your saved ideas.", [
            { text: "OK", onPress: () => router.canGoBack() ? router.back() : router.replace('/') }
        ]);
        return;
    }
    fetchSavedEssays();
  }, [user, fetchSavedEssays, router]);

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

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$orange10" />
        <Paragraph marginTop="$2">Loading your saved ideas...</Paragraph>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Paragraph color="$red10" textAlign="center">{error}</Paragraph>
        <Button onPress={fetchSavedEssays} marginTop="$4">Try Again</Button>
      </YStack>
    );
  }

  if (!user) {
     // This case should ideally be handled by the useEffect redirect, but as a fallback:
    return (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Paragraph>Please login to see your saved ideas.</Paragraph>
             <Link href="/auth" asChild>
                <Button theme="blue" marginTop="$4">Login</Button>
            </Link>
        </YStack>
    )
  }
  
  if (savedEssays.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <H2>No Saved Ideas Yet</H2>
        <Paragraph textAlign="center" marginTop="$2">
          Start generating and saving ideas to see them here!
        </Paragraph>
        <Link href="/" asChild>
             <Button theme="green" marginTop="$4">Generate Ideas</Button>
        </Link>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: SavedEssay }) => (
    <Card elevation="$2" marginVertical="$2" padding="$3" borderRadius="$4">
      <Card.Header>
        <H3 color="$color12">{item.subject}</H3>
        <Paragraph size="$2" color="$color10" theme="alt2">{item.reading_level}</Paragraph>
        <Paragraph size="$1" color="$color9" theme="alt2" fontStyle="italic">
          Saved: {new Date(item.created_at).toLocaleDateString()}
        </Paragraph>
      </Card.Header>
      <Separator marginVertical="$2.5" />
      <Paragraph color="$color" numberOfLines={5} ellipsizeMode="tail">
        {item.content}
      </Paragraph>
      {/* TODO: Add navigation to a full essay view if desired */}
      <Button 
        icon={<Trash2 size={18} color="$red10"/>} 
        onPress={() => handleDeleteEssay(item.id)}
        position="absolute"
        top="$2"
        right="$2"
        size="$3"
        circular
        chromeless
        theme="red"
      />
    </Card>
  );

  return (
    <FlatList
      data={savedEssays}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 10 }}
      ListHeaderComponent={<H2 padding="$3" color="$colorFocus">My Saved Ideas</H2>}
    />
  );
} 
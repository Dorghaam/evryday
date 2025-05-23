import { YStack, XStack, H2, H3, Paragraph, ScrollView, Button, Text } from 'tamagui';
import { useEssayStore } from '../store/essayStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, StarOff, Share } from 'lucide-react-native';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase/client';
import { useState } from 'react';
import { Alert, Share as RNShare } from 'react-native';

export default function ReadScreen() {
  const { currentEssay, setCurrentEssay } = useEssayStore();
  const user = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

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
            subject: currentEssay.subject,
            reading_level: currentEssay.readingLevel,
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
      Alert.alert('Error', e.message || "Could not update favorites.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!currentEssay) return;
    
    try {
      await RNShare.share({
        title: `${currentEssay.subject} - Ideas for Everyone`,
        message: `${currentEssay.subject}\n\n${currentEssay.content}\n\nGenerated with Evryday - Ideas for Everyone`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (!currentEssay) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background" space="$4">
        <H3 color="$color10" textAlign="center">No essay to read</H3>
        <Paragraph color="$color9" textAlign="center" maxWidth={300}>
          Generate an essay from the Generate tab to read it here.
        </Paragraph>
        <Button 
          onPress={() => router.push('/')} 
          theme="active"
          icon={<ArrowLeft size={16} />}
        >
          Go to Generate
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack 
        padding="$3" 
        paddingTop="$8"
        justifyContent="space-between" 
        alignItems="center" 
        borderBottomWidth={1} 
        borderColor="$borderColor"
        space="$2"
      >
        <Button 
          onPress={() => router.push('/')} 
          chromeless 
          icon={<ArrowLeft size={20} />}
          size="$3"
        />
        <Text fontSize="$5" fontWeight="bold" color="$colorFocus" flex={1} textAlign="center">
          Read
        </Text>
        <XStack space="$2">
          <Button 
            onPress={handleShare}
            chromeless 
            icon={<Share size={18} />}
            size="$3"
          />
          <Button 
            onPress={handleSaveFavorite}
            chromeless 
            icon={currentEssay.isFavorite ? <Star size={18} fill="gold" color="gold" /> : <StarOff size={18} />}
            size="$3"
            disabled={isSaving}
          />
        </XStack>
      </XStack>

      {/* Content */}
      <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
        <YStack space="$4" paddingBottom="$8">
          <YStack space="$2">
            <H2 color="$color12" textAlign="center">{currentEssay.subject}</H2>
            <Paragraph 
              theme="alt2" 
              color="$color11" 
              fontSize="$4" 
              textAlign="center"
              fontStyle="italic"
            >
              {currentEssay.readingLevel}
            </Paragraph>
          </YStack>
          
          <YStack 
            space="$3" 
            padding="$4" 
            backgroundColor="$backgroundStrong" 
            borderRadius="$6"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Paragraph 
              color="$color" 
              lineHeight={28} 
              fontSize="$6" 
              whiteSpace="pre-wrap"
              textAlign="left"
            >
              {currentEssay.content}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
} 
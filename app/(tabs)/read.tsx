import { useUser } from '@supabase/auth-helpers-react';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Book, Copy, Save, Search as SearchIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, Platform, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import {
  Button,
  Card,
  H2, Paragraph, ScrollView,
  Separator,
  Text,
  useTheme,
  View,
  XStack,
  YStack
} from 'tamagui';
import { supabase } from '../../lib/supabase/client';
import { useEssayStore } from '../../store/essayStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; readingLevel?: string; content?: string }>();
  const { currentEssay } = useEssayStore();
  const user = useUser();
  const tamaguiTheme = useTheme();
  const { getThemeColors, currentTheme: appCurrentTheme } = useThemeStore();
  const colors = getThemeColors();
  const [isSaving, setIsSaving] = useState(false);

  const [menuText, setMenuText] = useState(''); // Text to show in menu actions
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const essay = {
    subject: params.subject || currentEssay?.subject || "Untitled Essay",
    readingLevel: params.readingLevel || currentEssay?.readingLevel || "N/A",
    content: params.content || currentEssay?.content || "No content available.",
  };

  const handleLongPressOnContent = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    
    // --- THIS IS THE CORE LIMITATION ---
    // We cannot easily get the *exact* word/phrase the user is long-pressing on
    // from the Markdown component or standard Text components without a much more complex setup.
    // So, we'll use a placeholder. For "Define", we'll try to take the first word of this placeholder.
    const placeholderForInteraction = essay.content.substring(0, 30).trim() + (essay.content.length > 30 ? "..." : "");
    setMenuText(placeholderForInteraction); 

    const menuWidth = Platform.OS === 'ios' ? 250 : 280; // iOS menu can be a bit narrower
    const menuHeight = 50; 
    let x = pageX - (menuWidth / 2);
    let y = pageY - menuHeight - 30; // Position above the touch point, with a bit more gap

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    // Adjust X to stay within bounds
    if (x < 10) x = 10;
    if (x + menuWidth > screenWidth - 10) x = screenWidth - menuWidth - 10;
    
    // Adjust Y to stay within bounds (simple check, might need SafeAreaView insets for more accuracy)
    if (y < 60) y = pageY + 20; // If too high, position below touch
    if (y + menuHeight > screenHeight - 80) y = screenHeight - menuHeight - 80; // Avoid bottom tab bar

    setMenuPosition({ x, y });
    setMenuVisible(true);
  };
  
  const onDefine = async () => {
    setMenuVisible(false);
    if (!menuText.trim()) {
      Alert.alert("Define", "No text selected to define.");
      return;
    }
    // Extract the first word from the placeholder menuText
    const firstWordMatch = menuText.match(/(\w+)/);
    const wordToDefine = firstWordMatch ? firstWordMatch[0] : null;

    if (!wordToDefine) {
      Alert.alert("Define", "Could not extract a word to define from the selected text snippet.");
      return;
    }

    Alert.alert("Define", `Searching definition for: "${wordToDefine}"...`);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToDefine}`);
      const data = await response.json();

      if (!response.ok || !data || data.title === "No Definitions Found") {
        Alert.alert("Define", data.title || `No definition found for "${wordToDefine}", or an error occurred.`);
        return;
      }
      
      if (data.length > 0 && data[0].meanings && data[0].meanings.length > 0 && data[0].meanings[0].definitions && data[0].meanings[0].definitions.length > 0) {
        const definition = data[0].meanings[0].definitions[0].definition;
        Alert.alert(`Definition: ${data[0].word}`, definition);
      } else {
        Alert.alert("Define", `No specific definition found for "${wordToDefine}". The API might have returned an empty result or an unexpected format.`);
      }
    } catch (error: any) {
      console.error("Define API Error:", error);
      Alert.alert("Define Error", error.message || "Failed to fetch definition. Please check your connection or try a different word.");
    }
  };

  const onTranslate = () => {
    setMenuVisible(false);
    Alert.alert("Translate", `Translate: "${menuText}" (Translation API integration pending)`);
  };

  const onCopy = async () => {
    setMenuVisible(false);
    if (menuText.trim()) {
        await Clipboard.setStringAsync(menuText); // Copies the placeholder text
        Alert.alert("Copied", `"${menuText}" (placeholder text) copied to clipboard. Precise selection not yet implemented.`);
    } else {
        Alert.alert("Copy", "No text to copy.");
    }
  };
  
  const onHighlight = () => {
    setMenuVisible(false);
    Alert.alert("Highlight", `Visual highlighting for "${menuText}" is not yet implemented.`);
  };

  const handleSaveEssay = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to save essays.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push('/auth') }
      ]);
      return;
    }

    if (!essay.content || !essay.subject || !essay.readingLevel) {
      Alert.alert("Error", "Cannot save incomplete essay data.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_essays')
        .insert({
          user_id: user.id,
          subject: essay.subject,
          reading_level: essay.readingLevel,
          content: essay.content,
        });

      if (error) throw error;

      Alert.alert("Saved!", "Essay has been saved to your collection.", [
        { text: "View Saved Essays", onPress: () => router.push('/saved-essays') },
        { text: "OK", style: "default" }
      ]);
    } catch (e: any) {
      console.error('Error saving essay:', e);
      Alert.alert("Error", e.message || "Could not save the essay. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!essay.content) {
    return (
      <YStack flex={1} jc="center" ai="center" p="$4" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "No Essay" }} />
        <H2 color="$appText">No Essay to Display</H2>
        <Paragraph ta="center" mt="$2" color="$appTextSecondary">
          Please generate an essay first.
        </Paragraph>
        <Button onPress={() => router.replace('/')} mt="$4" theme="active">
          Go Home
        </Button>
      </YStack>
    );
  }
  
  const markdownStyles = {
    body: { color: colors.textColor, fontSize: 18, lineHeight: 30, fontFamily: 'Merriweather_400Regular', marginTop: 10 },
    heading1: { color: colors.textColor, fontSize: 32, fontFamily: 'Merriweather_700Bold', marginTop: 20, marginBottom: 10, lineHeight: 40 },
    heading2: { color: colors.textColor, fontSize: 26, fontFamily: 'Merriweather_700Bold', marginTop: 18, marginBottom: 8, lineHeight: 34 },
    heading3: { color: colors.textColor, fontSize: 22, fontFamily: 'Merriweather_700Bold', marginTop: 16, marginBottom: 6, lineHeight: 30 },
    strong: { fontFamily: 'Merriweather_700Bold', color: colors.textColor },
    em: { fontFamily: 'Merriweather_400Regular', fontStyle: 'italic' as const, color: colors.textColor },
    link: { color: colors.activeColor, fontFamily: 'Merriweather_400Regular', textDecorationLine: 'underline' as const },
    paragraph: { marginVertical: 8, fontFamily: 'Merriweather_400Regular', fontSize: 18, lineHeight: 30, color: colors.textColor },
    bullet_list_icon: { color: colors.textColor, marginRight: 5 },
    ordered_list_icon: { color: colors.textColor, marginRight: 5 },
  };

  return (
    <YStack flex={1} backgroundColor="$appBackground">
      <Stack.Screen
        options={{
          title: essay.subject,
          headerStyle: { backgroundColor: colors.surfaceColor },
          headerTintColor: colors.textColor,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={tamaguiTheme.color?.val || colors.textColor} />} 
              onPress={() => router.back()}
              chromeless
              circular
              padding="$1.5"
            />
          ),
          headerRight: () => (
            <Button 
              icon={<Save size={20} color={tamaguiTheme.appButtonText?.val || "white"} />}
              onPress={handleSaveEssay}
              disabled={isSaving}
              backgroundColor="$appPrimary"
              size="$3"
              marginRight="$2"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="$appButtonText" fontFamily="Inter_500Medium">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Button>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onLongPress={handleLongPressOnContent} activeOpacity={1.0} delayLongPress={350}>
          <View>
            <Markdown style={markdownStyles}>
              {essay.content}
            </Markdown>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPressOut={() => {
            if (menuVisible) setMenuVisible(false);
          }}
        >
          <Card
            elevate
            bordered
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            borderRadius="$4"
            backgroundColor="$appSurface"
            position="absolute"
            left={menuPosition.x}
            top={menuPosition.y}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <XStack space="$1" alignItems="center"> 
               <Button theme="alt1" size="$2.5" chromeless onPress={onHighlight} icon={<Book size={16} color={colors.textColor} />}>Highlight</Button>
               <Separator vertical marginHorizontal="$1" />
               <Button theme="alt1" size="$2.5" chromeless onPress={onCopy} icon={<Copy size={16} color={colors.textColor} />}>Copy</Button>
               <Separator vertical marginHorizontal="$1" />
               <Button theme="alt1" size="$2.5" chromeless onPress={onDefine} icon={<SearchIcon size={16} color={colors.textColor} />}>Define</Button>
            </XStack>
          </Card>
        </TouchableOpacity>
      </Modal>
      
      <XStack 
        jc="center" 
        paddingHorizontal="$4" 
        paddingVertical="$3" 
        borderTopWidth={1} 
        borderTopColor="$appBorder" 
        backgroundColor="$appSurface"
      >
        <Button 
          icon={<Save size={20} color="$appButtonText" />}
          onPress={handleSaveEssay}
          disabled={isSaving}
          backgroundColor="$appPrimary"
          size="$4"
          flexGrow={1}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text color="$appButtonText" fontFamily="Inter_600SemiBold" fontSize="$3">
            {isSaving ? "Saving Essay..." : "Save to My Essays"}
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
} 
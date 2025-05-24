import React, { useState, useCallback, useRef } from 'react';
import {
  YStack, H2, Paragraph, ScrollView, Button, useTheme, Text, XStack,
  View
} from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Save, Mic, Book, Share2, MoreHorizontal, Copy, Search, Languages } from 'lucide-react-native';
import { useEssayStore } from '../../store/essayStore';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase/client';
import { Alert, Modal, TouchableOpacity, findNodeHandle, ActionSheetIOS, Platform } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

export default function ReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; readingLevel?: string; content?: string }>();
  const { currentEssay } = useEssayStore();
  const user = useUser();
  const theme = useTheme();
  const { getThemeColors, currentTheme: appCurrentTheme } = useThemeStore();
  const colors = getThemeColors();
  const [isSaving, setIsSaving] = useState(false);

  // State for custom context menu
  const [selectedText, setSelectedText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const markdownRef = useRef(null);

  // Use URL params if available, otherwise fall back to store
  const essay = {
    subject: params.subject || currentEssay?.subject,
    readingLevel: params.readingLevel || currentEssay?.readingLevel,
    content: params.content || currentEssay?.content,
  };

  const handleTextSelection = (event: any) => {
    const { nativeEvent } = event;
    
    if (essay.content) {
        setSelectedText(essay.content.substring(0, 20) + "..." || "Selected Text");
        setMenuPosition({ x: 50, y: 200 });
        setMenuVisible(true);
    }
  };
  
  const onDefine = () => {
    setMenuVisible(false);
    Alert.alert("Define", `Define: "${selectedText}" (Implementation pending)`);
  };

  const onTranslate = () => {
    setMenuVisible(false);
    Alert.alert("Translate", `Translate: "${selectedText}" (Implementation pending)`);
  };

  const onCopy = () => {
    setMenuVisible(false);
    Alert.alert("Copy", `Copied: "${selectedText}" (Clipboard API pending)`);
  };
  
  const onHighlight = () => {
    setMenuVisible(false);
    Alert.alert("Highlight", `Highlighted: "${selectedText}" (Visual highlighting pending)`);
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

  // This screen should not be directly accessible if no essay data is available
  if (!essay.content && !params.content) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$appBackground">
        <Stack.Screen options={{ title: "No Essay" }} />
        <H2 color="$appTextPrimary">No Essay to Display</H2>
        <Paragraph textAlign="center" marginTop="$2" color="$appTextPrimary">
          Please generate an essay first.
        </Paragraph>
        <Button onPress={() => router.replace('/')} marginTop="$4" backgroundColor="$appPrimary">
          <Text color="$appButtonText">Go Home</Text>
        </Button>
      </YStack>
    );
  }

  // Updated Markdown styling
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
          title: essay.subject || 'Read Essay',
          headerStyle: { backgroundColor: colors.surfaceColor },
          headerTintColor: colors.textColor,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={theme.color?.val} />} 
              onPress={() => router.back()}
              chromeless
              paddingLeft="$2"
            />
          ),
          headerRight: () => (
            <Button 
              icon={<Save size={20} color="white" />}
              onPress={handleSaveEssay}
              disabled={isSaving}
              backgroundColor={colors.activeColor}
              borderColor={colors.activeColor}
              size="$3"
              marginRight="$2"
            >
              <Text color="white" fontFamily="Inter_500Medium">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Button>
          ),
        }}
      />
      <TouchableOpacity onLongPress={handleTextSelection} activeOpacity={0.9}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 60 }}
          ref={markdownRef}
        >
          <Markdown
            style={markdownStyles}
          >
            {essay.content || params.content || "No content."}
          </Markdown>
        </ScrollView>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={{ flex: 1 }} onPressOut={() => setMenuVisible(false)} activeOpacity={1}>
          <View
            padding="$2.5"
            borderRadius="$3"
            backgroundColor="$appSurface"
            position="absolute"
            left={menuPosition.x}
            top={menuPosition.y}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
            borderWidth={1}
            borderColor="$appBorder"
          >
            <XStack space="$2" alignItems="center">
               <Button size="$2" chromeless onPress={onHighlight} icon={<Book size={18} color={colors.textColor} />}>Highlight</Button>
               <Button size="$2" chromeless onPress={onCopy} icon={<Copy size={18} color={colors.textColor} />}>Copy</Button>
               <Button size="$2" chromeless onPress={onDefine} icon={<Search size={18} color={colors.textColor} />}>Define</Button>
               <Button size="$2" chromeless onPress={onTranslate} icon={<Languages size={18} color={colors.textColor} />}>Translate</Button>
            </XStack>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <XStack justifyContent="center" marginTop="$automatically" marginBottom="$4" paddingHorizontal="$3">
        <Button 
          icon={<Save size={20} color="$appButtonText" />}
          onPress={handleSaveEssay}
          disabled={isSaving}
          backgroundColor="$appPrimary"
          borderColor="$appPrimary"
          size="$4"
          flex={1}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text color="$appButtonText" fontFamily="Inter_600SemiBold" fontSize="$4">
            {isSaving ? "Saving Essay..." : "Save to My Essays"}
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
} 
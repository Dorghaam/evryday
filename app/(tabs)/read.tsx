import { useUser } from '@supabase/auth-helpers-react';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Book, Copy, Languages, Save, Search as SearchIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import {
  Button,
  Card,
  H2, Paragraph, ScrollView,
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

  const [selectedTextForMenu, setSelectedTextForMenu] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [actualSelectedText, setActualSelectedText] = useState('');

  const essay = {
    subject: params.subject || currentEssay?.subject || "Untitled Essay",
    readingLevel: params.readingLevel || currentEssay?.readingLevel || "N/A",
    content: params.content || currentEssay?.content || "No content available.",
  };

  const handleLongPressOnContent = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    const textToUse = essay.content.substring(0, 30) + (essay.content.length > 30 ? "..." : "");
    setSelectedTextForMenu(textToUse);
    setActualSelectedText(textToUse);

    const menuWidth = 280;
    const menuHeight = 50;
    let x = pageX - (menuWidth / 2);
    let y = pageY - menuHeight - 20;

    const screenWidth = Dimensions.get('window').width;
    if (x < 10) x = 10;
    if (x + menuWidth > screenWidth - 10) x = screenWidth - menuWidth - 10;
    if (y < 50) y = 50;

    setMenuPosition({ x, y });
    setMenuVisible(true);
  };
  
  const onDefine = () => {
    setMenuVisible(false);
    Alert.alert("Define", `Define: "${selectedTextForMenu}" (Dictionary API integration pending)`);
  };

  const onTranslate = () => {
    setMenuVisible(false);
    Alert.alert("Translate", `Translate: "${selectedTextForMenu}" (Translation API integration pending)`);
  };

  const onCopy = async () => {
    setMenuVisible(false);
    if(actualSelectedText){
        await Clipboard.setStringAsync(actualSelectedText);
        Alert.alert("Copied", `"${actualSelectedText}" copied to clipboard.`);
    } else {
        Alert.alert("Copy", "No text selected to copy.");
    }
  };
  
  const onHighlight = () => {
    setMenuVisible(false);
    Alert.alert("Highlight", `Highlight: "${selectedTextForMenu}" (Visual highlighting pending)`);
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
        <TouchableOpacity onLongPress={handleLongPressOnContent} activeOpacity={1.0} delayLongPress={300}>
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
          style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start' }} 
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <Card
            elevate
            bordered
            padding="$2"
            borderRadius="$3"
            backgroundColor="$appSurface"
            position="absolute"
            left={menuPosition.x}
            top={menuPosition.y}
          >
            <XStack space="$1.5" alignItems="center" flexWrap="nowrap">
               <Button theme="alt1" size="$2" chromeless onPress={onHighlight} icon={<Book size={18} color={colors.textColor} />}>Highlight</Button>
               <Button theme="alt1" size="$2" chromeless onPress={onCopy} icon={<Copy size={18} color={colors.textColor} />}>Copy</Button>
               <Button theme="alt1" size="$2" chromeless onPress={onDefine} icon={<SearchIcon size={18} color={colors.textColor} />}>Define</Button>
               <Button theme="alt1" size="$2" chromeless onPress={onTranslate} icon={<Languages size={18} color={colors.textColor} />}>Translate</Button>
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
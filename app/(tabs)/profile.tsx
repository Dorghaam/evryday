import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Stack, useRouter } from 'expo-router';
import { HelpCircle, LogOut, Settings, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H2, Paragraph, Separator, Button as TamaguiButton, Text, YStack } from 'tamagui';
import ThemeToggle from '../../components/ThemeToggle';
import { useThemeStore } from '../../stores/themeStore';

export default function ProfileScreen() {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.replace('/'); 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <YStack flex={1} backgroundColor="$appBackground">
        <Stack.Screen 
          options={{ 
            headerShown: true,
            title: user ? (user.email?.split('@')[0] || "Profile") : "Profile",
            headerStyle: { backgroundColor: colors.surfaceColor },
            headerTintColor: colors.textColor,
            headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          }} 
        />

        <YStack paddingVertical="$5" paddingHorizontal="$4" alignItems="flex-start" space="$2">
          {user ? (
            <H2 color="$appText" fontFamily="Inter_600SemiBold">Welcome, {user.email?.split('@')[0]}</H2>
          ) : (
            <YStack space="$2" width="100%">
              <H2 color="$appText" fontFamily="Inter_600SemiBold">Profile</H2>
              <Paragraph color="$appTextSecondary">Log in or sign up to save your essays and preferences.</Paragraph>
              <TamaguiButton 
                theme="active" 
                onPress={() => router.push('/auth')} 
                size="$3" 
                marginTop="$2"
                backgroundColor="$appPrimary" 
                width="100%"
              >
                  <Text color="$appButtonText" fontFamily="Inter_500Medium">Login / Sign Up</Text>
              </TamaguiButton>
            </YStack>
          )}
        </YStack>
        
        <Separator />

        <YStack paddingHorizontal="$3" paddingTop="$4" space="$1">
          <TamaguiButton
            icon={<Settings size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
            paddingVertical="$3"
            onPress={() => Alert.alert("Settings", "App settings page (to be implemented).")}
          >
            <Text color="$appText" fontSize="$4" fontFamily="Inter_500Medium">Settings</Text>
          </TamaguiButton>
          <Separator marginHorizontal="$3" />
          
          <TamaguiButton
            icon={<ShieldCheck size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
            paddingVertical="$3"
            onPress={() => Alert.alert("Privacy Policy", "Link to privacy policy (to be implemented).")}
          >
            <Text color="$appText" fontSize="$4" fontFamily="Inter_500Medium">Privacy Policy</Text>
          </TamaguiButton>
          <Separator marginHorizontal="$3" />

          <TamaguiButton
            icon={<HelpCircle size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
            paddingVertical="$3"
            onPress={() => Alert.alert("Help & Support", "Link to help page (to be implemented).")}
          >
            <Text color="$appText" fontSize="$4" fontFamily="Inter_500Medium">Help & Support</Text>
          </TamaguiButton>
          <Separator marginHorizontal="$3" />
        </YStack>
        
        <YStack marginTop="auto" padding="$4" space="$3">
          <ThemeToggle />
          {user && (
            <>
              <Separator marginVertical="$2" />
              <TamaguiButton
                icon={<LogOut size={20} color="$red10" />}
                backgroundColor="$appSurface"
                borderColor="$appBorder"
                borderWidth={1}
                size="$4"
                onPress={handleLogout}
                pressStyle={{ backgroundColor: "$red3"}}
              >
                <Text color="$red10" fontFamily="Inter_500Medium" fontWeight="600">Logout</Text>
              </TamaguiButton>
            </>
          )}
        </YStack>

      </YStack>
    </SafeAreaView>
  );
} 
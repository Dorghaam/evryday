import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Stack, useRouter } from 'expo-router';
import { Edit2, HelpCircle, LogOut, Settings, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, H2, Paragraph, Separator, Button as TamaguiButton, Text, YStack } from 'tamagui';
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
    router.replace('/'); // Navigate to home or auth
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <YStack flex={1} backgroundColor="$appBackground">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Profile Header */}
        <YStack alignItems="center" paddingVertical="$6" space="$3" borderBottomWidth={1} borderColor="$appBorder" backgroundColor="$appSurface">
          <Avatar circular size="$10" backgroundColor="$gray5">
            {/* Replace with user image or initials */}
            <Avatar.Image src={user?.user_metadata?.avatar_url || "https://placekitten.com/200/200"} />
            <Avatar.Fallback backgroundColor="$gray4">
              <Text fontSize="$5" color="$appText">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          <H2 color="$appText" fontFamily="Inter_600SemiBold">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User'}
          </H2>
          {user && (
            <Paragraph color="$appTextSecondary" fontFamily="Inter_400Regular" onPress={() => router.push('/auth')}>
              {user.email}
            </Paragraph>
          )}
           {!user && (
            <TamaguiButton theme="active" onPress={() => router.push('/auth')}>
                <Text color="$appPrimary">Login / Sign Up</Text>
            </TamaguiButton>
           )}
        </YStack>

        {/* Profile Options List */}
        <YStack paddingHorizontal="$4" paddingTop="$4" space="$3">
          <TamaguiButton
            icon={<Edit2 size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
            onPress={() => Alert.alert("Edit Profile", "Functionality to be implemented.")}
          >
            Edit Profile
          </TamaguiButton>
          <Separator />
          <TamaguiButton
            icon={<Settings size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
             onPress={() => Alert.alert("Settings", "Theme toggle could go here or its own settings page.")}
          >
            Settings
          </TamaguiButton>
           <Separator />
           <TamaguiButton
            icon={<ShieldCheck size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
             onPress={() => Alert.alert("Privacy", "Functionality to be implemented.")}
          >
            Privacy Policy
          </TamaguiButton>
           <Separator />
             <TamaguiButton
            icon={<HelpCircle size={20} color={colors.textColor} />}
            justifyContent="flex-start"
            size="$4"
            chromeless
             onPress={() => Alert.alert("Help", "Functionality to be implemented.")}
          >
            Help & Support
          </TamaguiButton>


          {user && (
            <>
              <Separator marginVertical="$3" />
              <TamaguiButton
                icon={<LogOut size={20} color="$red10" />}
                justifyContent="flex-start"
                size="$4"
                chromeless
                onPress={handleLogout}
              >
                <Text color="$red10">Logout</Text>
              </TamaguiButton>
            </>
          )}
        </YStack>
        {/* Include ThemeToggle here for now if desired */}
        <YStack padding="$4" marginTop="auto">
            <ThemeToggle />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
} 
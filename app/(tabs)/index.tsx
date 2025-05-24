import { View, Button as TamaguiButton, Text, YStack, XStack } from 'tamagui';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, Link } from 'expo-router';
import EssayGenerator from '../../components/EssayGenerator';
import ThemeToggle from '../../components/ThemeToggle';
import { BookHeart } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';

export default function IndexScreen() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  const handleAuthAction = () => {
    if (user) {
      supabaseClient.auth.signOut().then(() => router.replace('/'));
    } else {
      router.push('/auth');
    }
  };

  return (
    <YStack flex={1} backgroundColor={colors.backgroundColor}>
      {/* Header / Auth Button Area */}
      <XStack 
        padding="$3" 
        paddingTop="$8"
        justifyContent="space-between" 
        alignItems="center" 
        borderBottomWidth={1} 
        borderColor={colors.borderColor}
        space="$2"
        backgroundColor={colors.surfaceColor}
      >
        <Text fontSize="$6" fontWeight="bold" color={colors.textColor} flexShrink={1} fontFamily="Inter_700Bold">
          Evryday
        </Text>
        <XStack space="$2" alignItems="center">
          {user && (
            <Link href="/saved-essays" asChild>
              <TamaguiButton 
                icon={<BookHeart size={18} color={colors.activeColor} />} 
                size="$3" 
                chromeless 
                theme="alt1" 
              />
            </Link>
          )}
          <TamaguiButton 
            size="$3"
            onPress={handleAuthAction}
            theme={user ? "red_alt1" : "blue_alt1"}
            fontFamily="Inter_500Medium"
          >
            {user ? `Logout` : 'Login'}
          </TamaguiButton>
        </XStack>
      </XStack>

      {/* Theme Toggle Section */}
      <YStack paddingHorizontal="$3" paddingVertical="$2">
        <ThemeToggle />
      </YStack>

      {/* Essay Generator takes up the main space */}
      <EssayGenerator />
    </YStack>
  );
}

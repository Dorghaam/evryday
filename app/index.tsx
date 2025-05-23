import { View, Button as TamaguiButton, Text, YStack, XStack } from 'tamagui';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, Link } from 'expo-router';
import EssayGenerator from '../components/EssayGenerator';
import { BookHeart } from 'lucide-react-native';

export default function IndexScreen() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      supabaseClient.auth.signOut().then(() => router.replace('/'));
    } else {
      router.push('/auth');
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header / Auth Button Area */}
      <XStack 
        padding="$3" 
        paddingTop="$8"
        justifyContent="space-between" 
        alignItems="center" 
        borderBottomWidth={1} 
        borderColor="$borderColor"
        space="$2"
      >
        <Text fontSize="$6" fontWeight="bold" color="$colorFocus" flexShrink={1}>Evryday</Text>
        <XStack space="$2" alignItems="center">
          {user && (
            <Link href="/saved-essays" asChild>
              <TamaguiButton icon={<BookHeart size={18} />} size="$3" chromeless theme="alt1" />
            </Link>
          )}
          <TamaguiButton 
            size="$3"
            onPress={handleAuthAction}
            theme={user ? "red_alt1" : "blue_alt1"}
          >
            {user ? `Logout` : 'Login'}
          </TamaguiButton>
        </XStack>
      </XStack>

      {/* Essay Generator takes up the main space */}
      <EssayGenerator />
    </YStack>
  );
}

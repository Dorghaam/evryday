import { View, Button as TamaguiButton, Text, YStack } from 'tamagui';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, Link } from 'expo-router';
import EssayGenerator from '../components/EssayGenerator';

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
      <View padding="$3" flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="$borderColor">
        <Text fontSize="$6" fontWeight="bold" color="$colorFocus">Evryday</Text>
        <TamaguiButton 
          size="$3"
          onPress={handleAuthAction}
          theme={user ? "red" : "blue"}
        >
          {user ? `Logout (${user.email?.split('@')[0]})` : 'Login'}
        </TamaguiButton>
      </View>

      {/* Essay Generator takes up the main space */}
      <EssayGenerator />
    </YStack>
  );
}

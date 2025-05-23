import { Text, View, Button as TamaguiButton } from 'tamagui';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, Link } from 'expo-router';

export default function Index() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      supabaseClient.auth.signOut();
      // Optionally navigate or show a message after sign out
      router.replace('/'); // Refresh to reflect signed-out state
    } else {
      // Simple navigation test
      console.log('Attempting to navigate to auth...');
      router.push('/auth');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-paper-light dark:bg-paper-dark p-4 space-y-4">
      <Text className="text-2xl font-bold text-ink-primary dark:text-ink-primary_dark mb-4">
        Welcome to Evryday!
      </Text>
      <Text className="text-base text-ink-secondary dark:text-ink-secondary_dark text-center">
        Your daily dose of ideas starts here.
      </Text>
      
      {user ? (
        <Text className="text-lg text-green-600 dark:text-green-400">Logged in as: {user.email}</Text>
      ) : (
        <Text className="text-lg text-red-600 dark:text-red-400">Not logged in</Text>
      )}

      <TamaguiButton 
        onPress={handleAuthAction}
        theme={user ? "red" : "blue"}
        size="$4"
        width="80%" 
        maxWidth={300}
      >
        {user ? 'Sign Out' : 'Login / Sign Up'}
      </TamaguiButton>

      {/* Add a Link component as a backup test */}
      <Link href="/auth" asChild>
        <TamaguiButton theme="green" size="$3">
          Test Link to Auth
        </TamaguiButton>
      </Link>

      <View mt="$4" p="$2" backgroundColor="$blue5" borderRadius="$3">
        <Text color="$blue10">This is a Tamagui-specific styled View.</Text>
      </View>
    </View>
  );
}

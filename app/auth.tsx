import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client'; // Your Supabase client
import { useRouter } from 'expo-router';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useColorScheme, Alert } from 'react-native'; // Using react-native Button for simplicity now
import { YStack, H2, Paragraph, Input, Button, XStack, Text } from 'tamagui'; // Tamagui components

export default function AuthScreen() {
  const router = useRouter();
  const user = useUser();
  const session = useSession();
  const colorScheme = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is logged in (session exists), redirect them from the auth page.
    if (session) {
      // Check if router is available to avoid errors during initial renders or modal transitions
      if (router.canGoBack()) {
        router.back(); // Go back if presented as modal
      } else {
        router.replace('/'); // Or replace with home screen if not modal
      }
    }
  }, [session, router]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    // Show a loading or redirecting message while the useEffect kicks in
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4" p="$4" backgroundColor="$background">
        <H2>Redirecting...</H2>
        <Paragraph>You are already logged in.</Paragraph>
      </YStack>
    );
  }

  return (
    <YStack flex={1} justifyContent="center" space="$4" p="$6" backgroundColor="$backgroundStrong" maxWidth={400} alignSelf="center" width="100%">
      <H2 textAlign="center" color="$color" mb="$4">
        Welcome to Evryday
      </H2>
      <Paragraph textAlign="center" color="$color10" mb="$6">
        {isSignUp ? 'Create an account to save your ideas' : 'Sign in to access your ideas'}
      </Paragraph>
      
      <YStack space="$3">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          size="$4"
        />
        
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$4"
        />
        
        <Button
          onPress={handleAuth}
          disabled={loading}
          theme="blue"
          size="$4"
          mt="$2"
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>
        
        <XStack justifyContent="center" alignItems="center" space="$2" mt="$4">
          <Text color="$color10">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Button
            onPress={() => setIsSignUp(!isSignUp)}
            variant="outlined"
            size="$3"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
} 
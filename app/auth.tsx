import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client'; // Your Supabase client
import { useRouter, Stack } from 'expo-router';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { Alert } from 'react-native';
import { YStack, H2, Paragraph, Input, Button, XStack, Text } from 'tamagui';
import { useThemeStore } from '../stores/themeStore';
import { ArrowLeft } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const user = useUser();
  const session = useSession();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
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

  const handleGoHome = () => {
    router.replace('/');
  };

  if (session) {
    // Show a loading or redirecting message while the useEffect kicks in
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4" p="$4" backgroundColor={colors.backgroundColor}>
        <Stack.Screen options={{ title: "Redirecting" }} />
        <H2 color={colors.textColor}>Redirecting...</H2>
        <Paragraph color={colors.textColor}>You are already logged in.</Paragraph>
      </YStack>
    );
  }

  return (
    <YStack flex={1} justifyContent="center" space="$4" p="$6" backgroundColor={colors.backgroundColor} maxWidth={400} alignSelf="center" width="100%">
      <Stack.Screen 
        options={{ 
          title: "Welcome",
          headerLeft: () => (
            <Button 
              icon={<ArrowLeft size={24} color={colors.textColor} />} 
              onPress={handleGoHome}
              chromeless
              paddingLeft="$2"
            />
          ),
        }} 
      />
      
      <H2 textAlign="center" color={colors.textColor} mb="$4" fontFamily="Inter_700Bold">
        Welcome to Evryday
      </H2>
      <Paragraph textAlign="center" color={colors.inactiveColor} mb="$6" fontFamily="Inter_400Regular">
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
          backgroundColor={colors.surfaceColor}
          borderColor={colors.borderColor}
          color={colors.textColor}
          placeholderTextColor={colors.inactiveColor}
          fontFamily="Inter_400Regular"
        />
        
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$4"
          backgroundColor={colors.surfaceColor}
          borderColor={colors.borderColor}
          color={colors.textColor}
          placeholderTextColor={colors.inactiveColor}
          fontFamily="Inter_400Regular"
        />
        
        <Button
          onPress={handleAuth}
          disabled={loading}
          backgroundColor={colors.activeColor}
          borderColor={colors.activeColor}
          size="$4"
          mt="$2"
          fontFamily="Inter_600SemiBold"
        >
          <Text color="white" fontFamily="Inter_600SemiBold">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </Button>
        
        <XStack justifyContent="center" alignItems="center" space="$2" mt="$4">
          <Text color={colors.inactiveColor} fontFamily="Inter_400Regular">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Button
            onPress={() => setIsSignUp(!isSignUp)}
            backgroundColor="transparent"
            borderColor={colors.borderColor}
            size="$3"
            fontFamily="Inter_500Medium"
          >
            <Text color={colors.activeColor} fontFamily="Inter_500Medium">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Button>
        </XStack>

        {/* Go Home Button */}
        <Button
          onPress={handleGoHome}
          backgroundColor="transparent"
          borderColor="transparent"
          size="$3"
          mt="$4"
          fontFamily="Inter_500Medium"
        >
          <Text color={colors.inactiveColor} fontFamily="Inter_500Medium">
            Continue without account
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
} 
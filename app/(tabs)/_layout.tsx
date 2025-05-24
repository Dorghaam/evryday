import { Tabs } from 'expo-router';
import { Home, BookOpen, Bookmark } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import tamaguiConfig from '../../tamagui.config';

export default function TabLayout() {
  const { currentTheme } = useThemeStore();

  // Determine the Tamagui theme name
  const tamaguiThemeName = currentTheme === 'dark' ? 'dark_app' : 'light_app';

  // Get colors from the resolved Tamagui theme object
  // Ensure that 'dark_app' and 'light_app' exist in tamaguiConfig.themes
  const currentTamaguiSpecificTheme = tamaguiConfig.themes[tamaguiThemeName];

  // Fallback values are important if tokens aren't found for some reason
  const activeColor = currentTamaguiSpecificTheme.appPrimary?.val || (currentTheme === 'dark' ? '#F4581C' : '#F4581C');
  const inactiveColor = currentTamaguiSpecificTheme.appTextSecondary?.val || (currentTheme === 'dark' ? '#A3A3A3' : '#8E8E93');
  const tabBackgroundColor = currentTamaguiSpecificTheme.appSurface?.val || (currentTheme === 'dark' ? '#1A1A1A' : '#FFFFFF');
  const tabBorderColor = currentTamaguiSpecificTheme.appBorder?.val || (currentTheme === 'dark' ? '#2D2D2D' : '#D1D1D6');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          borderTopColor: tabBorderColor,
          borderTopWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
          height: 85,
          paddingBottom: 15,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          fontFamily: 'Inter_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size*0.9} color={color} />,
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: 'Read',
          tabBarIcon: ({ color, size }) => <BookOpen size={size*0.9} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved-essays"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Bookmark size={size*0.9} color={color} />,
        }}
      />
    </Tabs>
  );
} 
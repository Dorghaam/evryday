import { Tabs } from 'expo-router';
import { Home, BookOpen, Bookmark } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';

export default function TabLayout() {
  const { currentTheme } = useThemeStore();

  // Determine the theme name for TamaguiProvider and Theme component
  // Map AppTheme from Zustand to Tamagui theme names
  let tamaguiThemeName: string = currentTheme;
  if (currentTheme === 'light') tamaguiThemeName = 'light_app';
  if (currentTheme === 'dark') tamaguiThemeName = 'dark_app';

  // Import tamaguiConfig to get theme colors
  const tamaguiConfig = require('../../tamagui.config').default;
  
  // Safely access theme colors with fallbacks
  const currentTamaguiTheme = (tamaguiConfig.themes as any)[tamaguiThemeName];
  const activeColor = currentTamaguiTheme?.orange9?.val || currentTamaguiTheme?.orange10?.val || 'orange';
  const inactiveColor = currentTamaguiTheme?.gray10?.val || 'grey';
  const tabBackgroundColor = currentTamaguiTheme?.gray3?.val || (currentTheme === 'dark' ? '#1C1C1E' : '#FFFFFF');
  const tabBorderColor = currentTamaguiTheme?.gray5?.val || (currentTheme === 'dark' ? '#3A3A3C' : '#D1D1D6');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          borderTopColor: tabBorderColor,
          shadowOpacity: 0, 
          elevation: 0, 
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
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
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <Bookmark size={size*0.9} color={color} />,
        }}
      />
    </Tabs>
  );
} 
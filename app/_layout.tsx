import { Urbanist_400Regular, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { darkTheme } from '@/constants/paperTheme';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Urbanist_400Regular,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const isDark = true; // Force dark design
  return (
    <ThemeProvider value={DarkTheme}>
      <PaperProvider theme={darkTheme}>
        <View style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#f9fafb' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="capture" options={{ headerShown: true, title: 'Motion Tracker' }} />
            <Stack.Screen name="pose" options={{ headerShown: true, title: 'Pose Detection' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </View>
      </PaperProvider>
    </ThemeProvider>
  );
}

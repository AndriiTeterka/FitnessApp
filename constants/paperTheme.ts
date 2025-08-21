import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Reuse Tailwind theme colors for consistent design tokens
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require('../tailwind.config.js');

// Brand highlight (yellow) to match reference design
const brandYellow = '#fef08a'; // Tailwind yellow-200 like pill
const brandYellowText = '#171717';
const primary600: string = brandYellow;
const primary500: string = brandYellow;

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: primary600,
    secondary: '#8b5cf6',
    background: '#121212',
    surface: '#18181b',
    surfaceVariant: '#1f2937',
    outline: '#2a2a2a',
    onPrimary: brandYellowText,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primary500,
    secondary: '#8b5cf6',
    background: '#0b0f19',
    surface: '#111827',
    surfaceVariant: '#1f2937',
    outline: '#2a2a2a',
    onPrimary: brandYellowText,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontFamily: 'Urbanist_400Regular' },
    bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontFamily: 'Urbanist_400Regular' },
    bodySmall: { ...MD3DarkTheme.fonts.bodySmall, fontFamily: 'Urbanist_400Regular' },
    titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontFamily: 'Urbanist_700Bold' },
    titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontFamily: 'Urbanist_600SemiBold' },
    titleSmall: { ...MD3DarkTheme.fonts.titleSmall, fontFamily: 'Urbanist_600SemiBold' },
  },
};



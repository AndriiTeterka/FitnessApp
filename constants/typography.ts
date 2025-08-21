import { TextStyle } from 'react-native';

export type TypographyVariant =
  | 'displayLarge' | 'displayMedium' | 'displaySmall'
  | 'headlineLarge' | 'headlineMedium' | 'headlineSmall'
  | 'titleLarge' | 'titleMedium' | 'titleSmall'
  | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
  | 'labelLarge' | 'labelMedium' | 'labelSmall';

export const typography: Record<TypographyVariant, TextStyle> = {
  displayLarge: { fontFamily: 'Urbanist_700Bold', fontSize: 34, lineHeight: 40 },
  displayMedium: { fontFamily: 'Urbanist_700Bold', fontSize: 30, lineHeight: 36 },
  displaySmall: { fontFamily: 'Urbanist_700Bold', fontSize: 26, lineHeight: 32 },

  headlineLarge: { fontFamily: 'Urbanist_600SemiBold', fontSize: 24, lineHeight: 30 },
  headlineMedium: { fontFamily: 'Urbanist_600SemiBold', fontSize: 22, lineHeight: 28 },
  headlineSmall: { fontFamily: 'Urbanist_600SemiBold', fontSize: 20, lineHeight: 26 },

  titleLarge: { fontFamily: 'Urbanist_600SemiBold', fontSize: 18, lineHeight: 24 },
  titleMedium: { fontFamily: 'Urbanist_600SemiBold', fontSize: 16, lineHeight: 22 },
  titleSmall: { fontFamily: 'Urbanist_600SemiBold', fontSize: 14, lineHeight: 20 },

  bodyLarge: { fontFamily: 'Urbanist_400Regular', fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'Urbanist_400Regular', fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 18 },

  labelLarge: { fontFamily: 'Urbanist_600SemiBold', fontSize: 14, lineHeight: 18 },
  labelMedium: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12, lineHeight: 16 },
  labelSmall: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, lineHeight: 14 },
};



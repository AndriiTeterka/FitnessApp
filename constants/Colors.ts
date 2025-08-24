/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2563EB';
// Primary accent used throughout the dark theme
const tintColorDark = '#FFD645';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#151618',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Enhanced color palette for the redesigned Home screen
// Primary:    #FFD645 (Bright yellow for accents and CTAs)
// Secondary:  #1A1D21 (Darker card background)
// Tertiary:   #2A2D31 (Medium card background)
// Quaternary: #0F1114 (Main background)
// Quinary:    #FFFFFF (Pure white)
// Accent:     #FF6B35 (Orange accent for highlights)
// Success:    #10B981 (Green for completed states)
// Warning:    #F59E0B (Amber for paused states)
export const Palette = {
  primary: '#FFD645',
  secondary: '#1A1D21',
  tertiary: '#2A2D31',
  quaternary: '#0F1114',
  quinary: '#FFFFFF',
  accent: '#FF6B35',
  success: '#10B981',
  warning: '#F59E0B',
};

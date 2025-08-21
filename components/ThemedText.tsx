import { typography, type TypographyVariant } from '@/constants/typography';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'; // backward-compat
  variant?: TypographyVariant; // new scale
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        variant ? typography[variant] : { fontFamily: type === 'title' ? 'Urbanist_700Bold' : type === 'defaultSemiBold' || type === 'subtitle' ? 'Urbanist_600SemiBold' : 'Urbanist_400Regular' },
        !variant && type === 'default' ? styles.default : undefined,
        !variant && type === 'title' ? styles.title : undefined,
        !variant && type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        !variant && type === 'subtitle' ? styles.subtitle : undefined,
        !variant && type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

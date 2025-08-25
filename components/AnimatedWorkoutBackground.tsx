import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path, Defs, G, Filter, FeGaussianBlur } from 'react-native-svg';
import { Palette } from '@/constants/Colors';

type Props = {
  intensity?: 'calm' | 'active';
  activeColor?: string; // color for current workout stage
};

export default function AnimatedWorkoutBackground({ intensity = 'active', activeColor = Palette.primary }: Props) {
  // Base/overlay colors for crossfade
  const [baseColor, setBaseColor] = useState(activeColor);
  const [overlayColor, setOverlayColor] = useState(activeColor);
  const overlayOpacity = useSharedValue(0);

  // Crossfade to target color
  useEffect(() => {
    if (activeColor === baseColor) return;
    setOverlayColor(activeColor);
    overlayOpacity.value = 0;
    overlayOpacity.value = withTiming(1, { duration: 650, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(setBaseColor)(activeColor);
        // Fade overlay away on next frame to avoid flicker
        requestAnimationFrame(() => {
          overlayOpacity.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
        });
      }
    });
  }, [activeColor, baseColor, overlayOpacity]);

  const baseAnim = useAnimatedStyle(() => ({ opacity: 1 - overlayOpacity.value }));
  const overlayAnim = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  // Subtle breathing highlight (stationary figure)
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);
  const pulseAnim = useAnimatedStyle(() => ({ opacity: 0.015 + 0.025 * pulse.value }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Subtle vignette */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.28)' }]} />

      {/* Base hourglass figure */}
      <Animated.View style={[StyleSheet.absoluteFill, baseAnim]}>
        <Hourglass color={baseColor} idSuffix="base" />
      </Animated.View>

      {/* Overlay hourglass for crossfade */}
      <Animated.View style={[StyleSheet.absoluteFill, overlayAnim]}>
        <Hourglass color={overlayColor} idSuffix="overlay" />
      </Animated.View>

      {/* Soft breathing highlight */}
      <Animated.View style={[StyleSheet.absoluteFill, pulseAnim]}>
        <Hourglass color="#FFFFFF" onlyCore idSuffix="pulse" />
      </Animated.View>

      {/* Global blur for the glow effect */}
      <BlurView pointerEvents="none" style={StyleSheet.absoluteFill} intensity={84} tint="dark" />
    </View>
  );
}

function Hourglass({ color, onlyCore = false, idSuffix }: { color: string; onlyCore?: boolean; idSuffix: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
      <Defs>
        {/* Large blur area to avoid clipping */}
        <Filter id={`hg-blur-${idSuffix}`} x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur stdDeviation="60" />
        </Filter>
      </Defs>
      <G filter={`url(#hg-blur-${idSuffix})`}>
        {/* central hourglass body (wider bulbs, narrow waist) */}
        <Path d="M0,-40 C220,180 220,620 0,840 L400,840 C180,620 180,180 400,-40 Z" fill={color} opacity={onlyCore ? 1 : 0.36} />
        {onlyCore ? null : (
          <>
            {/* inner layer for glow depth */}
            <Path d="M0,40 C210,230 210,570 0,760 L400,760 C190,570 190,230 400,40 Z" fill={color} opacity={0.24} />
            {/* outer haze */}
            <Path d="M0,-80 C240,160 240,640 0,880 L400,880 C160,640 160,160 400,-80 Z" fill={color} opacity={0.18} />
          </>
        )}
      </G>
    </Svg>
  );
}

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Palette } from '@/constants/Colors';

type Props = {
  intensity?: 'calm' | 'active';
};

function GlowBlob({ size, color, opacity = 0.35 }: { size: number; color: string; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
      <Defs>
        <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={size} height={size} fill="url(#grad)" />
    </Svg>
  );
}

export function AnimatedWorkoutBackground({ intensity = 'active' }: Props) {
  const dur = intensity === 'active' ? 7000 : 11000;
  const range = intensity === 'active' ? 18 : 10;

  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);
  const t3 = useSharedValue(0);

  useEffect(() => {
    t1.value = withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.quad) }), -1, true);
    t2.value = withRepeat(withTiming(1, { duration: dur + 1200, easing: Easing.inOut(Easing.cubic) }), -1, true);
    t3.value = withRepeat(withTiming(1, { duration: dur - 800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [dur, t1, t2, t3]);

  const blob1 = useAnimatedStyle(() => {
    const tx = interpolate(t1.value, [0, 1], [-range, range]);
    const ty = interpolate(t1.value, [0, 1], [range, -range]);
    const scale = interpolate(t1.value, [0, 1], [1, 1.08]);
    return { transform: [{ translateX: tx }, { translateY: ty }, { scale }] };
  });

  const blob2 = useAnimatedStyle(() => {
    const tx = interpolate(t2.value, [0, 1], [range, -range]);
    const ty = interpolate(t2.value, [0, 1], [range * 0.8, -range * 0.8]);
    const scale = interpolate(t2.value, [0, 1], [1.02, 0.95]);
    return { transform: [{ translateX: tx }, { translateY: ty }, { scale }] };
  });

  const blob3 = useAnimatedStyle(() => {
    const tx = interpolate(t3.value, [0, 1], [-range * 0.6, range * 0.6]);
    const ty = interpolate(t3.value, [0, 1], [-range * 0.6, range * 0.6]);
    const scale = interpolate(t3.value, [0, 1], [0.98, 1.06]);
    return { transform: [{ translateX: tx }, { translateY: ty }, { scale }] };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* subtle vignette base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />

      {/* animated glow blobs */}
      <Animated.View style={[styles.blobBase, { top: -80, left: -60 }, blob1]}>
        <GlowBlob size={360} color={Palette.primary} opacity={0.35} />
      </Animated.View>

      <Animated.View style={[styles.blobBase, { bottom: -60, right: -60 }, blob2]}>
        <GlowBlob size={320} color={Palette.accent} opacity={0.30} />
      </Animated.View>

      <Animated.View style={[styles.blobBase, { top: 220, right: -40 }, blob3]}>
        <GlowBlob size={280} color={Palette.success} opacity={0.28} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  blobBase: {
    position: 'absolute',
  },
});

export default AnimatedWorkoutBackground;


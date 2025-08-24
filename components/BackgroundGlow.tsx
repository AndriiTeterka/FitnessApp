import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export default function BackgroundGlow() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          {/* Primary golden glow at the top */}
          <RadialGradient id="topGlow" cx="50%" cy="-5%" r="80%">
            <Stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
            <Stop offset="25%" stopColor="#f59e0b" stopOpacity={0.6} />
            <Stop offset="50%" stopColor="#d97706" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#0b0f19" stopOpacity={0} />
          </RadialGradient>
          
          {/* Secondary orange glow for depth */}
          <RadialGradient id="secondaryGlow" cx="30%" cy="20%" r="60%">
            <Stop offset="0%" stopColor="#ea580c" stopOpacity={0.3} />
            <Stop offset="50%" stopColor="#dc2626" stopOpacity={0.2} />
            <Stop offset="100%" stopColor="#0b0f19" stopOpacity={0} />
          </RadialGradient>
          
          {/* Accent glow for visual interest */}
          <RadialGradient id="accentGlow" cx="70%" cy="30%" r="40%">
            <Stop offset="0%" stopColor="#fde047" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#0b0f19" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Base dark background */}
        <Rect width="100%" height="100%" fill="#0b0f19" />
        
        {/* Primary golden glow */}
        <Rect width="100%" height="100%" fill="url(#topGlow)" />
        
        {/* Secondary orange glow */}
        <Rect width="100%" height="100%" fill="url(#secondaryGlow)" />
        
        {/* Accent glow */}
        <Rect width="100%" height="100%" fill="url(#accentGlow)" />
      </Svg>
    </View>
  );
}

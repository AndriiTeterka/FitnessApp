import { ThemedText } from '@/components/ThemedText';
import { tw } from '@/utils/tw';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <View style={tw`bg-[#111827] border-b border-[#1f2937]`}>
      <View style={tw`px-4 py-2.5 flex-row items-center justify-between`}>
        <Link href="/" asChild>
          <TouchableOpacity style={tw`flex-row items-center`}>
            <ThemedText variant="titleLarge" style={tw`text-white`}>FitMotion</ThemedText>
          </TouchableOpacity>
        </Link>
        <View style={tw`flex-row gap-4`}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <ThemedText variant="bodyMedium" style={tw`text-white`}>Home</ThemedText>
            </TouchableOpacity>
          </Link>
          <Link href="/capture" asChild>
            <TouchableOpacity>
              <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>Motion Capture</ThemedText>
            </TouchableOpacity>
          </Link>
          <Link href="/exercises" asChild>
            <TouchableOpacity>
              <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>Exercises</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>{isMenuOpen ? 'Close' : 'Menu'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}



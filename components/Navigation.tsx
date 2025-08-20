import tw from '@/utils/tw';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <View style={tw`bg-white border-b border-gray-200`}>
      <View style={tw`px-4 py-2.5 flex-row items-center justify-between`}>
        <Link href="/" asChild>
          <TouchableOpacity style={tw`flex-row items-center`}>
            <Text style={tw`text-lg font-bold text-gray-900`}>FitMotion</Text>
          </TouchableOpacity>
        </Link>
        <View style={tw`flex-row gap-4`}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={tw`text-gray-900`}>Home</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/capture" asChild>
            <TouchableOpacity>
              <Text style={tw`text-gray-500`}>Motion Capture</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/exercises" asChild>
            <TouchableOpacity>
              <Text style={tw`text-gray-500`}>Exercises</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <Text style={tw`text-gray-500`}>{isMenuOpen ? 'Close' : 'Menu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



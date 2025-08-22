import tw from '@/utils/tw';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

export default function WorkoutDetails() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={tw`flex-1 bg-[#0b0f19]`}>
      {/* Header */}
      <View style={tw`px-4 py-3 border-b border-[#1f2937]`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <ThemedText variant="displaySmall" style={tw`text-white`}>20 min Upper Body</ThemedText>
          <IconButton icon="dots-horizontal" size={24} iconColor="#fff" />
        </View>
        <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>
          20 min • Upper Body • Build muscle • Intermediate • Dumbbells Only • With Warm-up
        </ThemedText>
      </View>

      {/* Action Buttons */}
      <View style={tw`flex-row items-center justify-between px-4 py-3`}>
        <TouchableOpacity style={tw`flex-row items-center bg-[#111827] rounded-xl px-4 py-2`}>
          <IconButton icon="refresh" size={16} iconColor="#fff" />
          <ThemedText variant="bodyMedium" style={tw`text-white ml-1`}>Refresh</ThemedText>
        </TouchableOpacity>
        <View style={tw`flex-row`}>
          <IconButton icon="bookmark-outline" size={24} iconColor="#fff" />
          <IconButton icon="dots-horizontal" size={24} iconColor="#fff" />
        </View>
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        {/* Warm Up Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <ThemedText variant="headlineSmall" style={tw`text-white`}>Warm Up</ThemedText>
            <IconButton icon="dots-horizontal" size={20} iconColor="#fff" />
          </View>
          
          <View style={tw`bg-[#111827] rounded-xl p-4 border border-[#1f2937]`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-16 h-16 bg-[#1f2937] rounded-lg mr-3`} />
              <View style={tw`flex-1`}>
                <ThemedText variant="titleMedium" style={tw`text-white`}>Hand Release Push Up</ThemedText>
                <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>30s</ThemedText>
              </View>
              <IconButton icon="dots-horizontal" size={20} iconColor="#fff" />
            </View>
          </View>
          
          <TouchableOpacity style={tw`bg-[#111827] rounded-xl p-3 mt-2 border border-[#1f2937]`}>
            <View style={tw`flex-row items-center justify-center`}>
              <IconButton icon="chevron-down" size={16} iconColor="#fff" />
              <ThemedText variant="bodyMedium" style={tw`text-white ml-1`}>5 more</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Block 1 Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View>
              <ThemedText variant="headlineSmall" style={tw`text-white`}>Block 1</ThemedText>
              <ThemedText variant="bodySmall" style={tw`text-gray-400`}>Dumbbells</ThemedText>
            </View>
            <IconButton icon="dots-horizontal" size={20} iconColor="#fff" />
          </View>
          
          <View style={tw`bg-[#111827] rounded-xl p-4 border border-[#1f2937] mb-3`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-16 h-16 bg-[#1f2937] rounded-lg mr-3`} />
              <View style={tw`flex-1`}>
                <ThemedText variant="titleMedium" style={tw`text-white`}>Supinated Row</ThemedText>
                <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>3x • 8 reps per side</ThemedText>
              </View>
              <IconButton icon="dots-horizontal" size={20} iconColor="#fff" />
            </View>
          </View>
          
          <View style={tw`bg-[#111827] rounded-xl p-4 border border-[#1f2937]`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-16 h-16 bg-[#1f2937] rounded-lg mr-3`} />
              <View style={tw`flex-1`}>
                <ThemedText variant="titleMedium" style={tw`text-white`}>Dumbbell Single Arm Overhead Press</ThemedText>
                <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>3x • 8 reps per side</ThemedText>
              </View>
              <IconButton icon="dots-horizontal" size={20} iconColor="#fff" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Workout Button */}
      <View style={tw`p-4 border-t border-[#1f2937]`}>
        <Button
          mode="contained"
          onPress={() => router.push('/capture')}
          style={tw`bg-white rounded-xl`}
          contentStyle={tw`py-3`}
          labelStyle={tw`text-black font-semibold`}
          icon="play"
        >
          Start Workout
        </Button>
      </View>
    </SafeAreaView>
  );
}

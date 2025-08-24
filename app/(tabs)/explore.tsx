import tw from '@/utils/tw';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';

export default function ExploreScreen() {
  return (
    <ScrollView style={tw`flex-1 bg-black`} contentContainerStyle={tw`p-4`}>
      <View style={tw`pt-12 pb-6`}>
        <ThemedText variant="displaySmall" style={tw`text-white text-center mb-2`}>
          Explore
        </ThemedText>
        <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center`}>
          Discover new workouts and exercises
        </ThemedText>
      </View>

      <Card style={tw`mb-4 bg-gray-900`}>
        <Card.Content>
          <ThemedText variant="titleMedium" style={tw`text-white mb-2`}>
            Featured Workouts
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-gray-300`}>
            Explore curated workout routines designed for different fitness levels and goals.
          </ThemedText>
        </Card.Content>
      </Card>

      <Card style={tw`mb-4 bg-gray-900`}>
        <Card.Content>
          <ThemedText variant="titleMedium" style={tw`text-white mb-2`}>
            Exercise Library
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-gray-300`}>
            Browse our comprehensive collection of exercises with detailed instructions.
          </ThemedText>
        </Card.Content>
      </Card>

      <Card style={tw`mb-4 bg-gray-900`}>
        <Card.Content>
          <ThemedText variant="titleMedium" style={tw`text-white mb-2`}>
            Training Programs
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-gray-300`}>
            Follow structured training programs to achieve your fitness goals.
          </ThemedText>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

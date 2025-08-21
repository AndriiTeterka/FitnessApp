import tw from '@/utils/tw';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <ScrollView style={tw`flex-1 bg-[#0b0f19]`} contentContainerStyle={tw`p-6`}>
      {/* Header */}
      <View style={tw`items-center mb-6`}>
        <View style={tw`h-24 w-24 rounded-full bg-yellow-200 items-center justify-center mb-3`}>
          <Text style={tw`text-white text-2xl font-bold`}>JD</Text>
        </View>
        <Text style={{ color: 'white', fontFamily: 'Urbanist_700Bold', fontSize: 30, lineHeight: 36 }}>John Doe</Text>
        <Text style={tw`text-gray-400 mt-1`}>Fitness Enthusiast</Text>
        <Button mode="outlined" style={tw`mt-3`}>Edit Profile</Button>
      </View>

      {/* Stats */}
      <View style={tw`flex-row gap-4 mb-4`}>
        <Card style={tw`flex-1`}>
          <Card.Content style={tw`items-center`}>
            <Text style={tw`text-2xl font-extrabold text-white`}>47</Text>
            <Text style={tw`text-gray-400 mt-1`}>Total Workouts</Text>
          </Card.Content>
        </Card>
        <Card style={tw`flex-1`}>
          <Card.Content style={tw`items-center`}>
            <Text style={tw`text-2xl font-extrabold text-white`}>23.5</Text>
            <Text style={tw`text-gray-400 mt-1`}>Hours Trained</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={tw`flex-row gap-4 mb-8`}>
        <Card style={tw`flex-1`}>
          <Card.Content style={tw`items-center`}>
            <Text style={tw`text-2xl font-extrabold text-white`}>8,420</Text>
            <Text style={tw`text-gray-400 mt-1`}>Calories Burned</Text>
          </Card.Content>
        </Card>
        <Card style={tw`flex-1`}>
          <Card.Content style={tw`items-center`}>
            <Text style={tw`text-2xl font-extrabold text-white`}>12 days</Text>
            <Text style={tw`text-gray-400 mt-1`}>Current Streak</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Progress */}
      <View style={tw`bg-[#111827] rounded-2xl p-4 border border-[#1f2937]`}>
        <Text style={tw`font-semibold text-white mb-2`}>This Week's Progress</Text>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-400`}>Workouts Completed</Text>
          <Text style={tw`text-white font-semibold`}>5/7</Text>
        </View>
        <View style={tw`h-2 bg-[#1f2937] rounded-full mt-2 overflow-hidden`}>
          <View style={tw`h-full w-5/6 bg-yellow-200`} />
        </View>
        <View style={tw`flex-row justify-between mt-3`}>
          <Text style={tw`text-gray-400`}>Weekly Goal</Text>
          <Text style={tw`text-white font-semibold`}>1,200/1,500 cal</Text>
        </View>
      </View>
    </ScrollView>
  );
}



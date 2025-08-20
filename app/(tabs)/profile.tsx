import tw from '@/utils/tw';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={tw`flex-1 bg-gray-50`} contentContainerStyle={tw`p-6`}>
      {/* Header */}
      <View style={tw`items-center mb-6`}>
        <View style={tw`h-24 w-24 rounded-full bg-blue-600 items-center justify-center mb-3`}>
          <Text style={tw`text-white text-2xl font-bold`}>JD</Text>
        </View>
        <Text style={tw`text-3xl font-extrabold text-gray-900`}>John Doe</Text>
        <Text style={tw`text-gray-600 mt-1`}>Fitness Enthusiast</Text>
        <TouchableOpacity style={tw`mt-3 px-4 py-2 rounded-xl border border-gray-200 bg-white`}>
          <Text style={tw`text-gray-800`}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={tw`flex-row gap-4 mb-4`}>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center`}>
          <Text style={tw`text-2xl font-extrabold`}>47</Text>
          <Text style={tw`text-gray-600 mt-1`}>Total Workouts</Text>
        </View>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center`}>
          <Text style={tw`text-2xl font-extrabold`}>23.5</Text>
          <Text style={tw`text-gray-600 mt-1`}>Hours Trained</Text>
        </View>
      </View>
      <View style={tw`flex-row gap-4 mb-8`}>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center`}>
          <Text style={tw`text-2xl font-extrabold`}>8,420</Text>
          <Text style={tw`text-gray-600 mt-1`}>Calories Burned</Text>
        </View>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center`}>
          <Text style={tw`text-2xl font-extrabold`}>12 days</Text>
          <Text style={tw`text-gray-600 mt-1`}>Current Streak</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={tw`bg-white rounded-2xl p-4 border border-gray-100`}>
        <Text style={tw`font-semibold text-gray-900 mb-2`}>This Week's Progress</Text>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-700`}>Workouts Completed</Text>
          <Text style={tw`text-gray-900 font-semibold`}>5/7</Text>
        </View>
        <View style={tw`h-2 bg-gray-200 rounded-full mt-2 overflow-hidden`}>
          <View style={tw`h-full w-5/6 bg-blue-600`} />
        </View>
        <View style={tw`flex-row justify-between mt-3`}>
          <Text style={tw`text-gray-700`}>Weekly Goal</Text>
          <Text style={tw`text-gray-900 font-semibold`}>1,200/1,500 cal</Text>
        </View>
      </View>
    </ScrollView>
  );
}



import tw from '@/utils/tw';
import { Link } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top','left','right']} style={tw`flex-1 bg-gray-50`}>
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`}>
      <View style={tw`items-center mb-3 mt-1`}>
        <ThemedText type="title" style={tw`text-center`}>Good Morning!</ThemedText>
        <ThemedText style={tw`text-gray-600 text-center mt-2`}>Ready for today's workout?</ThemedText>
      </View>

      {/* Stats grid */}
      <View style={tw`flex-row gap-4 mb-4`}> 
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100`}> 
          <ThemedText style={tw`text-3xl font-extrabold text-center`}>5</ThemedText>
          <ThemedText style={tw`text-gray-600 text-center mt-1`}>Workouts This Week</ThemedText>
        </View>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100`}> 
          <ThemedText style={tw`text-3xl font-extrabold text-center`}>1,240</ThemedText>
          <ThemedText style={tw`text-gray-600 text-center mt-1`}>Calories Burned</ThemedText>
        </View>
      </View>
      <View style={tw`flex-row gap-4 mb-8`}>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100`}>
          <ThemedText style={tw`text-3xl font-extrabold text-center`}>12</ThemedText>
          <ThemedText style={tw`text-gray-600 text-center mt-1`}>Streak Days</ThemedText>
        </View>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100`}>
          <ThemedText style={tw`text-3xl font-extrabold text-center`}>4h 32m</ThemedText>
          <ThemedText style={tw`text-gray-600 text-center mt-1`}>Total Time</ThemedText>
        </View>
      </View>

      {/* Quick Start */}
      <View style={tw`mb-4`}>
        <ThemedText type="subtitle" style={tw`mb-3`}>Quick Start</ThemedText>
        <Link href="/exercises" asChild>
          <TouchableOpacity style={tw`bg-blue-600 rounded-2xl py-4 items-center`}>
            <ThemedText style={tw`text-white font-bold text-lg`}>Start Workout</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Recent Workouts */}
      <View style={tw`mt-6`}>
        <ThemedText type="subtitle" style={tw`mb-3`}>Recent Workouts</ThemedText>
        {[
          { name: 'Upper Body Strength', meta: '45 min', right: 'Today' },
          { name: 'Cardio HIIT', meta: '30 min', right: 'Yesterday' },
          { name: 'Core & Abs', meta: '25 min', right: '2 days ago' },
        ].map((w) => (
          <View key={w.name} style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-100`}> 
            <View style={tw`flex-row justify-between items-center`}>
              <ThemedText style={tw`font-semibold text-lg`}>{w.name}</ThemedText>
              <ThemedText style={tw`text-gray-500`}>{w.right}</ThemedText>
            </View>
            <ThemedText style={tw`text-gray-600 mt-1`}>{w.meta}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}



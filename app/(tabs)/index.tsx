import tw from '@/lib/tw';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <ScrollView style={tw`flex-1 bg-gray-50`} contentContainerStyle={tw`p-6`}>
      {/* Header */}
      <View style={tw`items-center mb-8`}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={tw`h-24 w-32 mb-4`}
        />
        <ThemedText type="title" style={tw`text-center mb-2`}>FitMotion</ThemedText>
        <ThemedText style={tw`text-gray-600 text-center text-base`}>
          Your AI-powered fitness companion
        </ThemedText>
      </View>

      {/* Quick Actions */}
      <View style={tw`mb-8`}>
        <ThemedText type="subtitle" style={tw`mb-4 text-center`}>Quick Start</ThemedText>
        <View style={tw`gap-4`}>
          <Link href="/exercises" asChild>
            <TouchableOpacity style={tw`bg-white p-6 rounded-2xl shadow-sm border border-gray-100`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <ThemedText type="defaultSemiBold" style={tw`text-lg mb-1`}>Exercise Library</ThemedText>
                  <ThemedText style={tw`text-gray-600`}>Browse exercises and start your workout</ThemedText>
                </View>
                <View style={tw`bg-blue-100 p-3 rounded-full`}>
                  <ThemedText style={tw`text-blue-600 text-xl`}>🏋️</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Removed Start Motion Capture entry per request */}
        </View>
      </View>

      {/* Features */}
      <View style={tw`mb-6`}>
        <ThemedText type="subtitle" style={tw`mb-4 text-center`}>Features</ThemedText>
        <View style={tw`gap-3`}>
          <View style={tw`flex-row items-center bg-white p-4 rounded-xl`}>
            <View style={tw`bg-purple-100 p-2 rounded-full mr-3`}>
              <ThemedText style={tw`text-purple-600`}>🎯</ThemedText>
            </View>
            <View style={tw`flex-1`}>
              <ThemedText type="defaultSemiBold">Real-time Pose Detection</ThemedText>
              <ThemedText style={tw`text-gray-600 text-sm`}>AI-powered movement tracking</ThemedText>
            </View>
          </View>

          <View style={tw`flex-row items-center bg-white p-4 rounded-xl`}>
            <View style={tw`bg-orange-100 p-2 rounded-full mr-3`}>
              <ThemedText style={tw`text-orange-600`}>📊</ThemedText>
            </View>
            <View style={tw`flex-1`}>
              <ThemedText type="defaultSemiBold">Exercise Library</ThemedText>
              <ThemedText style={tw`text-gray-600 text-sm`}>Curated workouts for all levels</ThemedText>
            </View>
          </View>

          <View style={tw`flex-row items-center bg-white p-4 rounded-xl`}>
            <View style={tw`bg-teal-100 p-2 rounded-full mr-3`}>
              <ThemedText style={tw`text-teal-600`}>💪</ThemedText>
            </View>
            <View style={tw`flex-1`}>
              <ThemedText type="defaultSemiBold">Form Correction</ThemedText>
              <ThemedText style={tw`text-gray-600 text-sm`}>Get feedback on your technique</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}



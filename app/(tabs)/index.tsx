import tw from '@/utils/tw';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackgroundGlow from '@/components/BackgroundGlow';
import { ThemedText } from '@/components/ThemedText';

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={tw`flex-1 bg-white/15 backdrop-blur-2xl rounded-2xl border border-yellow-400/25 mb-3 overflow-hidden shadow-xl`}>
      <View style={tw`p-4 bg-gradient-to-r from-yellow-500/8 to-orange-500/6 relative`}>
        {/* Subtle inner glow */}
        <View style={tw`absolute inset-0 bg-gradient-to-r from-yellow-400/3 to-transparent rounded-2xl`} />
        <View style={tw`items-center justify-center min-h-16 relative z-10`}>
          <ThemedText variant="displaySmall" style={tw`text-center text-yellow-200 font-bold tracking-wider`}>{value}</ThemedText>
          <ThemedText variant="bodySmall" style={tw`text-white/80 text-center mt-1 font-semibold tracking-wide`}>{label}</ThemedText>
        </View>
      </View>
    </View>
  );
}

function WorkoutCard({ name, meta, right }: { name: string; meta: string; right: string }) {
  return (
    <View style={tw`bg-white/15 backdrop-blur-2xl rounded-2xl border border-yellow-400/25 mb-3 overflow-hidden shadow-xl`}>
      <View style={tw`p-4 bg-gradient-to-r from-yellow-500/8 to-orange-500/6 relative`}>
        {/* Subtle inner glow */}
        <View style={tw`absolute inset-0 bg-gradient-to-r from-yellow-400/3 to-transparent rounded-2xl`} />
        <View style={tw`flex-row justify-between items-start relative z-10`}>
          <View style={tw`flex-1`}>
            <ThemedText variant="bodyMedium" style={tw`text-white font-bold tracking-wide`}>{name}</ThemedText>
            <ThemedText variant="bodySmall" style={tw`text-yellow-200/90 mt-1 font-semibold`}>{meta}</ThemedText>
          </View>
          <View style={tw`bg-gradient-to-r from-yellow-500/25 to-orange-500/20 px-3 py-1.5 rounded-full border border-yellow-400/40 shadow-lg`}>
            <ThemedText variant="labelSmall" style={tw`text-yellow-200 font-bold tracking-wide`}>{right}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={tw`flex-1`}>
      {/* Background Glow */}
      <BackgroundGlow />
      
      <SafeAreaView edges={['top','left','right']} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={tw`items-center mb-8 mt-2`}>
            <ThemedText variant="displayMedium" style={tw`text-center text-white font-black tracking-wider`}>
              Good Morning!
            </ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-white/80 text-center mt-2 font-semibold tracking-wide`}>
              Ready for today's workout?
            </ThemedText>
          </View>

          {/* Stats Grid - Using Workout Card Style */}
          <View style={tw`flex-row gap-3 mb-6`}>
            <StatCard value="5" label="Workouts This Week" />
            <StatCard value="1,240" label="Calories Burned" />
          </View>
          <View style={tw`flex-row gap-3 mb-8`}>
            <StatCard value="12" label="Streak Days" />
            <StatCard value="4h 32m" label="Total Time" />
          </View>

          {/* Quick Start - Half Black/Half Yellow Gradient Button */}
          <View style={tw`mb-8`}>
            <ThemedText variant="titleMedium" style={tw`mb-4 text-white font-black tracking-wide`}>Quick Start</ThemedText>
            <Link href="/customize-workout" asChild>
              <View style={tw`rounded-3xl overflow-hidden shadow-2xl relative`}>
                {/* Half Black/Half Yellow Gradient */}
                <View style={tw`bg-gradient-to-r from-black via-black to-yellow-500/20 backdrop-blur-2xl border border-yellow-400/35 relative`}>
                  {/* Inner glow effect */}
                  <View style={tw`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-yellow-400/8 rounded-3xl`} />
                  <Button 
                    mode="text" 
                    icon="play" 
                    style={tw`bg-transparent relative z-10`} 
                    contentStyle={tw`py-5`} 
                    labelStyle={tw`text-white font-black text-lg tracking-wider`}
                    accessibilityLabel="startWorkoutButton" 
                    testID="startWorkoutButton"
                  >
                    Start Workout
                  </Button>
                </View>
              </View>
            </Link>
          </View>

          {/* Recent Workouts */}
          <View style={tw`mt-2`}>
            <ThemedText variant="titleMedium" style={tw`mb-4 text-white font-black tracking-wide`}>Recent Workouts</ThemedText>
            {[ 
              { name: 'Upper Body Strength', meta: '45 min', right: 'Today' },
              { name: 'Cardio HIIT', meta: '30 min', right: 'Yesterday' },
              { name: 'Core & Abs', meta: '25 min', right: '2 days ago' },
            ].map((w) => (
              <WorkoutCard key={w.name} {...w} />
            ))}
          </View>

          <View style={tw`h-8`} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}



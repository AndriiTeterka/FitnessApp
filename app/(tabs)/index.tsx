import tw from '@/utils/tw';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top','left','right']} style={tw`flex-1 bg-[#0b0f19]`}>
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`}>
      <View style={tw`items-center mb-3 mt-1`}>
        <ThemedText variant="displayMedium" style={tw`text-center text-white`}>Good Morning!</ThemedText>
        <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center mt-2`}>Ready for today's workout?</ThemedText>
      </View>

      {/* Stats grid */}
      <View style={tw`flex-row gap-4 mb-4`}>
        <Card style={tw`flex-1`}>
          <Card.Content>
            <ThemedText variant="displaySmall" style={tw`text-center text-white`}>5</ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center mt-1`}>Workouts This Week</ThemedText>
          </Card.Content>
        </Card>
        <Card style={tw`flex-1`}>
          <Card.Content>
            <ThemedText variant="displaySmall" style={tw`text-center text-white`}>1,240</ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center mt-1`}>Calories Burned</ThemedText>
          </Card.Content>
        </Card>
      </View>
      <View style={tw`flex-row gap-4 mb-8`}>
        <Card style={tw`flex-1`}>
          <Card.Content>
            <ThemedText variant="displaySmall" style={tw`text-center text-white`}>12</ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center mt-1`}>Streak Days</ThemedText>
          </Card.Content>
        </Card>
        <Card style={tw`flex-1`}>
          <Card.Content>
            <ThemedText variant="displaySmall" style={tw`text-center text-white`}>4h 32m</ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-gray-400 text-center mt-1`}>Total Time</ThemedText>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Start */}
      <View style={tw`mb-4`}>
        <ThemedText variant="headlineSmall" style={tw`mb-3 text-white`}>Quick Start</ThemedText>
        <Link href="/customize-workout" asChild>
          <Button mode="contained" style={tw`rounded-2xl`} contentStyle={tw`py-2`}>
            Start Workout
          </Button>
        </Link>
      </View>

      {/* Recent Workouts */}
      <View style={tw`mt-6`}>
        <ThemedText variant="headlineSmall" style={tw`mb-3 text-white`}>Recent Workouts</ThemedText>
        {[ 
          { name: 'Upper Body Strength', meta: '45 min', right: 'Today' },
          { name: 'Cardio HIIT', meta: '30 min', right: 'Yesterday' },
          { name: 'Core & Abs', meta: '25 min', right: '2 days ago' },
        ].map((w) => (
          <Card key={w.name} style={tw`mb-3`}>
            <Card.Content>
              <View style={tw`flex-row justify-between items-center`}>
                <ThemedText style={tw`font-semibold text-lg`}>{w.name}</ThemedText>
                <ThemedText style={tw`text-gray-500`}>{w.right}</ThemedText>
              </View>
              <ThemedText style={tw`text-gray-600 mt-1`}>{w.meta}</ThemedText>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}



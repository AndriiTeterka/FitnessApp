import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { Link, router } from 'expo-router';
import { Clock3, Dumbbell, Flame, Heart, LucideIcon, Play, TrendingUp } from 'lucide-react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <View
      style={[
        tw`flex-1 rounded-3xl p-5`,
        { 
          backgroundColor: Palette.secondary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
    >
      <View
        style={[
          tw`w-12 h-12 rounded-2xl items-center justify-center mb-3`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: Palette.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
            borderWidth: 1,
            borderColor: '#3A3D41',
          },
        ]}
      >
        <Icon size={22} color={Palette.primary} />
      </View>
      <ThemedText
        variant="bodySmall"
        style={tw`text-white/80 font-medium mb-1`}
      >
        {label}
      </ThemedText>
      <ThemedText
        variant="titleLarge"
        style={[tw`font-bold`, { color: Palette.primary }]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function RecentWorkout({
  name,
  meta,
  status,
}: {
  name: string;
  meta: string;
  status: string;
}) {
  const isCompleted = status === 'COMPLETED';
  const isPaused = status === 'PAUSED';
  
  return (
    <View
      style={[
        tw`flex-row items-center p-5 rounded-3xl mb-4`,
        { 
          backgroundColor: Palette.secondary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        },
      ]}
    >
      <View
        style={[
          tw`w-14 h-14 rounded-2xl items-center justify-center mr-4`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: Palette.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      >
        <Dumbbell size={26} color={Palette.primary} />
      </View>
      <View style={tw`flex-1`}>
        <ThemedText variant="titleMedium" style={tw`text-white font-bold mb-1`}>
          {name}
        </ThemedText>
        <ThemedText variant="bodySmall" style={tw`text-white/70`}>
          {meta}
        </ThemedText>
      </View>
      <View
        style={[
          tw`px-4 py-2 rounded-full`,
          { 
            backgroundColor: isCompleted ? Palette.success : Palette.warning,
            shadowColor: isCompleted ? Palette.success : Palette.warning,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          },
        ]}
      >
        <ThemedText
          variant="labelSmall"
          style={[
            tw`font-bold`,
            { 
              color: Palette.quinary,
            },
          ]}
        >
          {status}
        </ThemedText>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[tw`flex-1`, { backgroundColor: Palette.quaternary }]}
    >
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pb-32`}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={tw`mb-10`}>
          <ThemedText
            variant="displayLarge"
            style={tw`text-white font-bold mb-2`}
          >
            Welcome back,
          </ThemedText>
          <ThemedText
            variant="displayMedium"
            style={[tw`font-bold`, { color: Palette.primary }]}
          >
            Andrii
          </ThemedText>
        </View>

        {/* Today's Progress Section */}
        <View style={tw`mb-10`}>
          <View style={tw`flex-row items-center mb-5`}>
            <View
              style={[
                tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: Palette.tertiary },
              ]}
            >
              <TrendingUp size={18} color={Palette.primary} />
            </View>
            <ThemedText
              variant="titleLarge"
              style={tw`text-white font-bold`}
            >
              Today's Progress
            </ThemedText>
          </View>
          <View style={tw`flex-row gap-4`}>
            <StatCard label="Calories Burned" value="820" icon={Flame} />
            <StatCard label="Workout Time" value="45 min" icon={Clock3} />
            <StatCard label="Heart Rate" value="118 bpm" icon={Heart} />
          </View>
        </View>

        {/* Recent Workouts Section */}
        <View style={tw`mb-10`}>
          <View style={tw`flex-row items-center justify-between mb-6`}>
            <ThemedText
              variant="titleLarge"
              style={tw`text-white font-bold`}
            >
              Recent Workouts
            </ThemedText>
            <Link href="/customize-workout?tab=recent" asChild>
              <TouchableOpacity
                style={[
                  tw`px-4 py-2 rounded-full`,
                  { 
                    backgroundColor: Palette.tertiary,
                    shadowColor: Palette.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <ThemedText
                  variant="bodyMedium"
                  style={[tw`font-semibold`, { color: Palette.primary }]}
                >
                  View All
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
          {[
            { name: 'Full Body Strength', meta: 'Apr 22 • 30 min • 320 cal', status: 'COMPLETED' },
            { name: 'HIIT Cardio', meta: 'Apr 20 • 20 min • 280 cal', status: 'COMPLETED' },
            { name: 'Morning Yoga', meta: 'Apr 18 • 10 min • 50 cal', status: 'PAUSED' },
          ].map((w) => (
            <RecentWorkout key={w.name} {...w} />
          ))}
        </View>

        {/* Start Workout Button */}
        <TouchableOpacity
          style={[
            tw`rounded-3xl py-5 px-6 mt-4`,
            { 
              backgroundColor: '#FFD645',
              shadowColor: '#FFD645',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 20,
              borderWidth: 2,
              borderColor: '#FFE066',
            },
          ]}
          accessibilityLabel="startWorkoutButton"
          testID="startWorkoutButton"
          onPress={() => {
            // Navigate to customize workout
            router.push('/customize-workout');
          }}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <View
              style={[
                tw`w-12 h-12 rounded-2xl items-center justify-center mr-4`,
                { 
                  backgroundColor: '#1A1D21',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: '#2A2D31',
                },
              ]}
            >
              <Play size={24} color="#FFD645" style={tw`ml-1`} />
            </View>
            <ThemedText
              variant="titleLarge"
              style={[tw`font-bold text-xl`, { color: '#1A1D21' }]}
            >
              Start New Workout
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
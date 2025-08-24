import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { Link } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Dumbbell, Clock3, Flame, Heart, LucideIcon } from 'lucide-react-native';
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
        tw`flex-1 rounded-2xl p-4`,
        { backgroundColor: Palette.secondary },
      ]}
    >
      <Icon size={20} color={Palette.primary} />
      <ThemedText
        variant="bodySmall"
        style={tw`text-white/70 mt-2`}
      >
        {label}
      </ThemedText>
      <ThemedText
        variant="titleMedium"
        style={[tw`font-bold mt-1`, { color: Palette.primary }]}
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
  return (
    <View
      style={[
        tw`flex-row items-center p-4 rounded-2xl mb-3`,
        { backgroundColor: Palette.secondary },
      ]}
    >
      <View
        style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-4`,
          { backgroundColor: Palette.tertiary },
        ]}
      >
        <Dumbbell size={24} color={Palette.primary} />
      </View>
      <View style={tw`flex-1`}>
        <ThemedText variant="bodyMedium" style={tw`text-white font-semibold`}>
          {name}
        </ThemedText>
        <ThemedText variant="bodySmall" style={tw`text-white/60`}>
          {meta}
        </ThemedText>
      </View>
      <View
        style={[
          tw`px-3 py-1 rounded-full`,
          { backgroundColor: Palette.tertiary },
        ]}
      >
        <ThemedText
          variant="labelSmall"
          style={[tw`font-bold`, { color: Palette.primary }]}
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
        contentContainerStyle={tw`p-6 pb-24`}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          variant="displayMedium"
          style={tw`text-white font-bold mb-8`}
        >
          Welcome, Andrii
        </ThemedText>

        {/* Stats */}
        <View style={tw`flex-row gap-3 mb-10`}>
          <StatCard label="Calories" value="820" icon={Flame} />
          <StatCard label="Workout Time" value="45 min" icon={Clock3} />
          <StatCard label="Heart Rate" value="118 bpm" icon={Heart} />
        </View>

        {/* Recent Workouts */}
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <ThemedText
            variant="titleMedium"
            style={tw`text-white font-bold`}
          >
            Recent Workouts
          </ThemedText>
          <Link href="/workouts" asChild>
            <TouchableOpacity>
              <ThemedText
                variant="bodySmall"
                style={tw`text-white/70`}
              >
                See all
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
        {[
          { name: 'Full Body', meta: 'Apr 22 - 30 min - 320', status: 'COMPLETED' },
          { name: 'HIIT', meta: 'Apr 20 - 20 min - 280', status: 'COMPLETED' },
          { name: 'Yoga', meta: 'Apr 18 - 10 min - 50', status: 'PAUSED' },
        ].map((w) => (
          <RecentWorkout key={w.name} {...w} />
        ))}

        <Link href="/customize-workout" asChild>
          <TouchableOpacity
            style={[
              tw`mt-6 rounded-2xl`,
              { backgroundColor: Palette.primary },
            ]}
            accessibilityLabel="startWorkoutButton"
            testID="startWorkoutButton"
          >
            <ThemedText
              variant="titleMedium"
              style={[tw`text-center py-4 font-bold`, { color: Palette.secondary }]}
            >
              Start Workout
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
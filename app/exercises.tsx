import { ExerciseCard } from '@/components/ExerciseCard';
import FilterSheet from '@/components/FilterSheet';
import SegmentControl from '@/components/SegmentControl';
import tw from '@/utils/tw';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type Exercise = {
  id: number;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  muscleGroups: string[];
  goal: 'Fat loss' | 'Hypertrophy' | 'Strength' | 'Endurance' | 'Power' | 'Mobility' | 'Stability' | 'Posture' | 'Rehab';
  environment: 'Home' | 'Gym' | 'Outdoor' | 'Office/Travel';
  trackingAvailable?: boolean;
};

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Squats',
    description: 'Targets quads, hamstrings, and glutes.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    goal: 'Strength',
    environment: 'Gym',
    trackingAvailable: true,
  },
  {
    id: 2,
    name: 'Push-ups',
    description: 'Works chest, shoulders, and triceps.',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    goal: 'Hypertrophy',
    environment: 'Home',
    trackingAvailable: true,
  },
  {
    id: 3,
    name: 'Lunges',
    description: 'Unilateral lower-body with balance demand.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    goal: 'Mobility',
    environment: 'Outdoor',
    trackingAvailable: true,
  },
  {
    id: 4,
    name: 'Plank',
    description: 'Isometric core strength and stability.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Core', 'Shoulders', 'Back', 'Glutes'],
    goal: 'Stability',
    environment: 'Home',
    trackingAvailable: true,
  },
  // Additional exercises
  {
    id: 5,
    name: 'Deadlift',
    description: 'Posterior-chain strength builder.',
    difficulty: 'Advanced',
    image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Back', 'Glutes', 'Hamstrings', 'Core'],
    goal: 'Strength',
    environment: 'Gym',
    trackingAvailable: false,
  },
  {
    id: 6,
    name: 'Burpees',
    description: 'Full-body conditioning and fat loss.',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476f?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Full Body', 'Legs', 'Core'],
    goal: 'Fat loss',
    environment: 'Home',
    trackingAvailable: true,
  },
  {
    id: 7,
    name: 'Rowing Machine',
    description: 'Back and endurance cardio.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Back', 'Biceps', 'Core'],
    goal: 'Endurance',
    environment: 'Gym',
    trackingAvailable: false,
  },
  {
    id: 8,
    name: 'Mountain Climbers',
    description: 'Core and cardio power move.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1593005510424-7a8f45b4d9c0?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Core', 'Shoulders', 'Legs'],
    goal: 'Power',
    environment: 'Home',
    trackingAvailable: true,
  },
  {
    id: 9,
    name: 'Band Pull-aparts',
    description: 'Posture and shoulder stability drill.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Rear Delts', 'Upper Back'],
    goal: 'Posture',
    environment: 'Office/Travel',
    trackingAvailable: false,
  },
  {
    id: 10,
    name: 'Glute Bridge',
    description: 'Hip extension and rehab-friendly.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1594385208970-2e8b1d24b00e?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Glutes', 'Hamstrings', 'Core'],
    goal: 'Rehab',
    environment: 'Home',
    trackingAvailable: true,
  },
];

export default function Exercises() {
  const [search, setSearch] = useState('');
  const [goal, setGoal] = useState<Exercise['goal'] | 'All'>('All');
  const [env, setEnv] = useState<Exercise['environment'] | 'All'>('All');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'All' | Exercise['difficulty']>('All');
  const [trackingOnly, setTrackingOnly] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const goals: Array<Exercise['goal'] | 'All'> = ['All','Fat loss','Hypertrophy','Strength','Endurance','Power','Mobility','Stability','Posture','Rehab'];
  const envs: Array<Exercise['environment'] | 'All'> = ['All','Home','Gym','Outdoor','Office/Travel'];

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (goal !== 'All' && ex.goal !== goal) return false;
      if (env !== 'All' && ex.environment !== env) return false;
      if (selectedMuscles.length > 0 && !selectedMuscles.every((m) => ex.muscleGroups.includes(m))) return false;
      if (difficulty !== 'All' && ex.difficulty !== difficulty) return false;
      if (trackingOnly && !ex.trackingAvailable) return false;
      return true;
    });
  }, [search, goal, env, selectedMuscles, difficulty, trackingOnly]);

  return (
    <SafeAreaView edges={['top','left','right']} style={tw`flex-1 bg-[#0b0f19]`}>
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
      <View style={tw`items-center mb-3`}>
        <Text style={tw`text-white`}>
          <Text style={{ fontFamily: 'Urbanist_700Bold', fontSize: 30, lineHeight: 36 }}>Exercises</Text>
        </Text>
        <Text style={tw`text-gray-400 text-center mt-1`}>Choose your workout</Text>
      </View>

      {/* Search and filters (visual only) */}
      <TextInput
        placeholder="Search exercises..."
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        style={tw`mb-3`}
      />
      {/* Alternative filter control */}
      <View style={tw`mb-3`}>
        <SegmentControl
          options={[ 'All', 'Beginner', 'Intermediate', 'Advanced' ] as const}
          value={difficulty as 'All' | 'Beginner' | 'Intermediate' | 'Advanced'}
          onChange={(d) => setDifficulty(d as any)}
        />
        <View style={tw`flex-row justify-between mt-3`}>
          <Text style={tw`text-white`}>Filters</Text>
          <Text style={tw`text-yellow-200`} onPress={() => setSheetOpen(true)}>Open</Text>
        </View>
      </View>
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        goal={goal}
        env={env}
        difficulty={difficulty}
        goals={goals}
        envs={envs}
        onChange={({ goal: g, env: e, difficulty: d }) => {
          if (g) setGoal(g as any);
          if (e) setEnv(e as any);
          if (d) setDifficulty(d as any);
        }}
        onReset={() => { setGoal('All'); setEnv('All'); setDifficulty('All'); setTrackingOnly(false); setSelectedMuscles([]); }}
      />

      <View style={tw`gap-4`}>
        {filtered.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            selectedMuscles={selectedMuscles}
            selectedDifficulty={difficulty === 'All' ? undefined : (difficulty as any)}
            trackingOnly={trackingOnly}
            onTagPress={(t) => setSelectedMuscles((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
            onFilter={(f) => {
              if (typeof f.tracking === 'boolean') {
                setTrackingOnly(f.tracking);
              }
              if (f.difficulty) {
                setDifficulty(f.difficulty as any);
              }
            }}
          />
        ))}
      </View>
      <View style={tw`h-6`} />
    </ScrollView>
    </SafeAreaView>
  );
}

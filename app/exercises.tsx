import tw from '@/lib/tw';
import { Link } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Exercise = {
  id: number;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  muscleGroups: string[];
};

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Squats',
    description: 'Targets quads, hamstrings, and glutes.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
  },
  {
    id: 2,
    name: 'Push-ups',
    description: 'Works chest, shoulders, and triceps.',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
  },
  {
    id: 3,
    name: 'Lunges',
    description: 'Unilateral lower-body with balance demand.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
  },
  {
    id: 4,
    name: 'Plank',
    description: 'Isometric core strength and stability.',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=750&q=80',
    muscleGroups: ['Core', 'Shoulders', 'Back', 'Glutes'],
  },
];

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return tw`bg-green-100 text-green-800`;
    case 'Intermediate': return tw`bg-yellow-100 text-yellow-800`;
    case 'Advanced': return tw`bg-red-100 text-red-800`;
    default: return tw`bg-green-100 text-green-800`;
  }
};

export default function Exercises() {
  return (
    <ScrollView style={tw`flex-1 bg-gray-50`} contentContainerStyle={tw`p-4`}>
      {/* Header */}
      <View style={tw`items-center mb-6`}>
        <Text style={tw`text-2xl font-extrabold text-gray-900 mb-2`}>Exercise Library</Text>
        <Text style={tw`text-gray-600 text-center text-base`}>Choose an exercise to start your motion capture workout</Text>
      </View>

      {/* Exercise Grid */}
      <View style={tw`gap-4`}>
        {EXERCISES.map((ex) => (
          <Link key={ex.id} href={{ pathname: '/capture', params: { exercise: String(ex.id) } }} asChild>
            <TouchableOpacity style={tw`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:bg-gray-50`}>
              <Image source={{ uri: ex.image }} style={tw`w-full h-48`} />
              <View style={tw`p-4`}>
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={tw`text-xl font-bold text-gray-900`}>{ex.name}</Text>
                  <Text style={tw.style(`text-xs px-3 py-1 rounded-full font-medium`, getDifficultyStyle(ex.difficulty))}>
                    {ex.difficulty}
                  </Text>
                </View>
                
                <Text style={tw`text-gray-600 mb-4 leading-5`}>{ex.description}</Text>
                
                <View style={tw`mb-4`}>
                  <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>Target Muscles:</Text>
                  <View style={tw`flex-row flex-wrap`} style={{ gap: 8 }}>
                    {ex.muscleGroups.map((m) => (
                      <Text key={m} style={tw`text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-medium`}>
                        {m}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={tw`bg-blue-50 rounded-xl p-3 items-center`}>
                  <Text style={tw`text-blue-700 font-semibold text-center`}>Tap to Start Exercise</Text>
                  <Text style={tw`text-blue-600 text-xs text-center mt-1`}>Camera will open for pose detection</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={tw`h-6`} />
    </ScrollView>
  );
}





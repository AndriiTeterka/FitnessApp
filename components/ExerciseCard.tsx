import { tw } from '@/utils/tw';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type Exercise = {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  image: string;
  muscleGroups: string[];
  trackingAvailable?: boolean;
};

export function ExerciseCard({ exercise, onTagPress, selectedMuscles, onFilter, selectedDifficulty, trackingOnly }: { exercise: Exercise; onTagPress?: (tag: string) => void; selectedMuscles?: string[]; onFilter?: (f: { difficulty?: string; tracking?: boolean }) => void; selectedDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All'; trackingOnly?: boolean }) {
  const router = useRouter();
  const diff = exercise.difficulty as 'Beginner' | 'Intermediate' | 'Advanced';
  const color = diff === 'Beginner' ? 'bg-green-100 text-green-800' : diff === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const [bg, text] = color.split(' ');
  const isDiffActive = selectedDifficulty === diff;

  return (
    <View style={tw`rounded-2xl overflow-hidden bg-white border border-gray-100`}>
      <Image source={{ uri: exercise.image }} style={tw`h-36 w-full`} resizeMode="cover" />
      <View style={tw`p-4`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-xl font-bold text-gray-900`}>{exercise.name}</Text>
          <View style={tw`flex-row items-center`}>
            {exercise.trackingAvailable ? (
              <TouchableOpacity onPress={() => onFilter?.({ tracking: !(trackingOnly ?? false) })}>
                <View style={tw.style('mr-2 rounded-full px-2.5 py-0.5', trackingOnly ? 'bg-green-600' : 'bg-green-100')}>
                  <Text style={tw.style('text-xs font-medium', trackingOnly ? 'text-white' : 'text-green-800')}>Tracking</Text>
                </View>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => onFilter?.({ difficulty: isDiffActive ? 'All' : exercise.difficulty })}>
              <View style={tw.style('rounded-full px-2.5 py-0.5', isDiffActive ? 'bg-green-600' : bg)}>
                <Text style={tw.style('text-xs font-medium', isDiffActive ? 'text-white' : text)}>{exercise.difficulty}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={tw`mt-1 text-sm text-gray-600`}>{exercise.description}</Text>
        <View style={tw`mt-2 flex-row flex-wrap`}>
          {exercise.muscleGroups.map((m) => {
            const active = (selectedMuscles ?? []).includes(m);
            return (
              <TouchableOpacity key={m} onPress={() => onTagPress?.(m)}>
                <View style={tw.style('mr-2 mb-2 rounded-md px-2 py-0.5', active ? 'bg-blue-600' : 'bg-gray-100')}>
                  <Text style={tw.style('text-xs font-medium', active ? 'text-white' : 'text-gray-700')}>{m}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={tw`mt-3 w-full items-center justify-center py-3 rounded-xl bg-blue-600`}
          onPress={() => router.push({ pathname: '/capture', params: { exercise: String(exercise.id) } })}
        >
          <Text style={tw`text-white font-semibold`}>Start Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



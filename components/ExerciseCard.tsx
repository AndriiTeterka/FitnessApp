import { ThemedText } from '@/components/ThemedText';
import { tw } from '@/utils/tw';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';

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
  const isDiffActive = selectedDifficulty === diff;

  return (
    <Card>
      <Card.Cover source={{ uri: exercise.image }} style={tw`h-36`} />
      <Card.Content>
        <View style={tw`flex-row items-center justify-between`}>
          <ThemedText variant="headlineLarge" style={tw`text-white`}>{exercise.name}</ThemedText>
          <View style={tw`flex-row items-center`}>
            {exercise.trackingAvailable ? (
              <Chip
                selected={!!trackingOnly}
                onPress={() => onFilter?.({ tracking: !(trackingOnly ?? false) })}
                style={tw`mr-2`}
              >
                Tracking
              </Chip>
            ) : null}
            <Chip
              selected={isDiffActive}
              onPress={() => onFilter?.({ difficulty: isDiffActive ? 'All' : exercise.difficulty })}
            >
              {exercise.difficulty}
            </Chip>
          </View>
        </View>
        <ThemedText variant="bodyMedium" style={tw`mt-1 text-gray-300`}>{exercise.description}</ThemedText>
        <View style={tw`mt-2 flex-row flex-wrap`}>
          {exercise.muscleGroups.map((m) => {
            const active = (selectedMuscles ?? []).includes(m);
            return (
              <Chip key={m} selected={active} onPress={() => onTagPress?.(m)} style={tw`mr-2 mb-2`}>
                {m}
              </Chip>
            );
          })}
        </View>
        <Button
          mode="contained"
          style={tw`mt-3`}
          onPress={() => router.push({ pathname: '/capture', params: { exercise: String(exercise.id) } })}
        >
          Start Exercise
        </Button>
      </Card.Content>
    </Card>
  );
}



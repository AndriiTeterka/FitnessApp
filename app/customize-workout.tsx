import tw from '@/utils/tw';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

type WorkoutTime = '10 min' | '15 min' | '20 min' | '30 min' | '45 min' | '60 min';
type TargetMuscles = 'Upper Body' | 'Lower Body' | 'Core' | 'Push' | 'Pull' | 'Full Body';
type Focus = 'Build strength' | 'Build muscle' | 'Endurance';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Equipment = 'None' | 'Only dumbbells' | 'Your equipment' | 'All gym equipment';

export default function CustomizeWorkout() {
  const [workoutTime, setWorkoutTime] = useState<WorkoutTime>('20 min');
  const [targetMuscles, setTargetMuscles] = useState<TargetMuscles>('Upper Body');
  const [focus, setFocus] = useState<Focus>('Build muscle');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [equipment, setEquipment] = useState<Equipment>('Only dumbbells');
  const [warmUp, setWarmUp] = useState(true);
  const [stretching, setStretching] = useState(false);

  const workoutTimes: WorkoutTime[] = ['10 min', '15 min', '20 min', '30 min', '45 min', '60 min'];
  const targetMuscleOptions: TargetMuscles[] = ['Upper Body', 'Lower Body', 'Core', 'Push', 'Pull', 'Full Body'];
  const focusOptions: Focus[] = ['Build strength', 'Build muscle', 'Endurance'];
  const difficultyOptions: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
  const equipmentOptions: Equipment[] = ['None', 'Only dumbbells', 'Your equipment', 'All gym equipment'];

  function OptionButton<T extends string>({ 
    options, 
    value, 
    onChange, 
    columns = 3 
  }: { 
    options: T[]; 
    value: T; 
    onChange: (value: T) => void; 
    columns?: number;
  }) {
    return (
      <View style={tw`flex-row flex-wrap gap-2`}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              style={tw.style(
                'rounded-xl py-3 px-4 items-center',
                selected ? 'bg-yellow-200' : 'bg-[#111827] border border-[#1f2937]',
                columns === 2 ? 'flex-1' : 'flex-1'
              )}
            >
              <ThemedText 
                variant="bodyMedium" 
                style={tw.style(selected ? 'text-black font-semibold' : 'text-white')}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={tw`flex-1 bg-[#0b0f19]`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 py-3 border-b border-[#1f2937]`}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText variant="bodyMedium" style={tw`text-white`}>Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText variant="headlineMedium" style={tw`text-white`}>Customize Workout</ThemedText>
        <View style={tw`w-16`} />
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        {/* Custom Muscles Button */}
        <TouchableOpacity style={tw`bg-[#111827] rounded-xl py-3 px-4 mb-6 border border-[#1f2937]`}>
          <ThemedText variant="bodyMedium" style={tw`text-white text-center`}>Custom muscles</ThemedText>
        </TouchableOpacity>

        {/* Focus Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-3`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Focus</ThemedText>
            <IconButton icon="information" size={16} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={focusOptions}
            value={focus}
            onChange={setFocus}
            columns={3}
          />
        </View>

        {/* Workout Difficulty */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-3`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Workout difficulty</ThemedText>
            <IconButton icon="information" size={16} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={difficultyOptions}
            value={difficulty}
            onChange={setDifficulty}
            columns={3}
          />
        </View>

        {/* Equipment */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Equipment</ThemedText>
            <TouchableOpacity>
              <ThemedText variant="bodyMedium" style={tw`text-yellow-200`}>Edit your equipment</ThemedText>
            </TouchableOpacity>
          </View>
          <OptionButton
            options={equipmentOptions}
            value={equipment}
            onChange={setEquipment}
            columns={2}
          />
        </View>

        {/* Toggles */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center justify-between py-3`}>
            <ThemedText variant="bodyMedium" style={tw`text-white`}>Warm up</ThemedText>
            <Switch
              value={warmUp}
              onValueChange={setWarmUp}
              trackColor={{ false: '#374151', true: '#fef08a' }}
              thumbColor={warmUp ? '#171717' : '#9ca3af'}
            />
          </View>
          <View style={tw`flex-row items-center justify-between py-3`}>
            <ThemedText variant="bodyMedium" style={tw`text-white`}>Post-workout stretching</ThemedText>
            <Switch
              value={stretching}
              onValueChange={setStretching}
              trackColor={{ false: '#374151', true: '#fef08a' }}
              thumbColor={stretching ? '#171717' : '#9ca3af'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={tw`p-4 border-t border-[#1f2937]`}>
        <Button
          mode="contained"
          onPress={() => router.push('/workout-details')}
          style={tw`bg-white rounded-xl`}
          contentStyle={tw`py-3`}
          labelStyle={tw`text-black font-semibold`}
        >
          Save
        </Button>
      </View>
    </SafeAreaView>
  );
}

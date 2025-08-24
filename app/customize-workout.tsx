import tw from '@/utils/tw';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Full Body';
type Focus = 'Strength' | 'Build Muscle' | 'Endurance';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Environment = 'Gym' | 'Home' | 'Outdoor';

export default function CustomizeWorkout() {
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
  const [focus, setFocus] = useState<Focus>('Build Muscle');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [environment, setEnvironment] = useState<Environment>('Home');
  const [warmUp, setWarmUp] = useState(true);
  const [stretching, setStretching] = useState(false);

  const muscleGroupOptions: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'];
  const focusOptions: Focus[] = ['Strength', 'Build Muscle', 'Endurance'];
  const difficultyOptions: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
  const environmentOptions: Environment[] = ['Gym', 'Home', 'Outdoor'];

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
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {options.map((option, idx) => {
          const selected = value === option;
          return (
            <View key={`${String(option)}-${idx}`} style={tw`px-1 w-1/${columns} mb-2`}> 
              <TouchableOpacity
                accessibilityLabel={String(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(option)}
                style={tw.style(
                  'rounded-xl py-4 px-3 items-center justify-center min-h-16',
                  selected 
                    ? 'bg-yellow-400 border-2 border-yellow-500 shadow-lg' 
                    : 'bg-[#111827] border border-[#1f2937]'
                )}
              >
                <ThemedText 
                  variant="bodyMedium" 
                  style={tw.style(
                    selected ? 'text-black font-bold' : 'text-white',
                    'text-center leading-5'
                  )}
                >
                  {option}
                </ThemedText>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={tw`flex-1 bg-[#0b0f19]`}>
      {/* Header */}
      <View style={tw`px-4 py-3 border-b border-[#1f2937]`}>
        <View style={tw`flex-row items-center justify-center`}>
          <ThemedText variant="headlineMedium" style={tw`text-white`}>Customize Workout</ThemedText>
        </View>
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pt-3 pb-12`} showsVerticalScrollIndicator={false}>
        {/* Muscle Group Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Muscle Group</ThemedText>
            <IconButton icon="information-outline" size={18} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={muscleGroupOptions}
            value={muscleGroup}
            onChange={setMuscleGroup}
            columns={3}
          />
        </View>

        {/* Focus Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Focus</ThemedText>
            <IconButton icon="information-outline" size={18} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={focusOptions}
            value={focus}
            onChange={setFocus}
            columns={3}
          />
        </View>

        {/* Difficulty Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Difficulty</ThemedText>
            <IconButton icon="information-outline" size={18} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={difficultyOptions}
            value={difficulty}
            onChange={setDifficulty}
            columns={3}
          />
        </View>

        {/* Environment Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <ThemedText variant="titleMedium" style={tw`text-white`}>Environment</ThemedText>
            <IconButton icon="information-outline" size={18} iconColor="#fff" style={tw`ml-2`} />
          </View>
          <OptionButton
            options={environmentOptions}
            value={environment}
            onChange={setEnvironment}
            columns={3}
          />
        </View>

        {/* Toggles */}
        <View style={tw`mb-8`}>
          <Card style={tw`mb-3`}>
            <Card.Content style={tw`p-4`}>
              <View style={tw`flex-row items-center justify-between py-3`}>
                <ThemedText variant="bodyMedium" style={tw`text-white`}>Warm up</ThemedText>
                <Switch
                  value={warmUp}
                  onValueChange={setWarmUp}
                  trackColor={{ false: '#374151', true: '#fef08a' }}
                  thumbColor={warmUp ? '#171717' : '#9ca3af'}
                  accessibilityLabel="Warm up toggle"
                />
              </View>
              <View style={tw`h-px bg-[#1f2937] my-2`} />
              <View style={tw`flex-row items-center justify-between py-3`}>
                <ThemedText variant="bodyMedium" style={tw`text-white`}>Post-workout stretching</ThemedText>
                <Switch
                  value={stretching}
                  onValueChange={setStretching}
                  trackColor={{ false: '#374151', true: '#fef08a' }}
                  thumbColor={stretching ? '#171717' : '#9ca3af'}
                  accessibilityLabel="Post-workout stretching toggle"
                />
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={tw`p-4 border-t border-[#1f2937] bg-[#0b0f19]`}> 
        <View style={tw`flex-row gap-3`}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={tw`flex-1 border-white/30 rounded-2xl`}
            contentStyle={tw`py-3`}
            labelStyle={tw`text-white font-semibold`}
            accessibilityLabel="Cancel"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/workout-details')}
            style={tw`flex-1 rounded-2xl`}
            contentStyle={tw`py-3`}
            labelStyle={tw`font-semibold`}
            accessibilityLabel="Save workout settings"
          >
            Save
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

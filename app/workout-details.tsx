import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bookmark, Calendar, Clock, Dumbbell, Edit, Flame, Heart, LucideIcon, MoreHorizontal, Play, Target, TrendingUp, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { getWorkout } from '@/lib/workouts';

function ExerciseCard({
  name,
  duration,
  sets,
  reps,
  icon: Icon,
  isWarmup = false,
  isCompleted = false,
}: {
  name: string;
  duration?: string;
  sets?: string;
  reps?: string;
  icon: LucideIcon;
  isWarmup?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <View
      style={[
        tw`flex-row items-center p-4 rounded-3xl mb-3`,
        { 
          backgroundColor: Palette.secondary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
          opacity: isCompleted ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          tw`w-12 h-12 rounded-2xl items-center justify-center mr-4`,
          { 
            backgroundColor: isWarmup ? Palette.warning : Palette.tertiary,
            shadowColor: isWarmup ? Palette.warning : Palette.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#3A3D41',
          },
        ]}
      >
        <Icon size={20} color={isWarmup ? Palette.secondary : Palette.primary} />
      </View>
      <View style={tw`flex-1`}>
        <ThemedText 
          variant="titleMedium" 
          style={[
            tw`font-bold mb-1`,
            { color: isCompleted ? 'rgba(255, 255, 255, 0.6)' : 'white' }
          ]}
        >
          {name}
        </ThemedText>
        <View style={tw`flex-row items-center`}>
          {duration ? (
            <View style={tw`flex-row items-center mr-3`}>
              <Clock size={14} color={Palette.primary} style={tw`mr-1`} />
              <ThemedText variant="bodySmall" style={tw`text-white/70`}>
                {duration}
              </ThemedText>
            </View>
          ) : (
            <View style={tw`flex-row items-center mr-3`}>
              <Dumbbell size={14} color={Palette.primary} style={tw`mr-1`} />
              <ThemedText variant="bodySmall" style={tw`text-white/70`}>
                {sets} • {reps}
              </ThemedText>
            </View>
          )}
          {isCompleted && (
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-2 h-2 rounded-full mr-2`,
                  { backgroundColor: Palette.success }
                ]}
              />
              <ThemedText variant="bodySmall" style={[tw`font-semibold`, { color: Palette.success }]}>
                Done
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function WorkoutStats({
  duration,
  difficulty,
  focus,
  equipment,
  lastCompleted,
  totalWorkouts,
}: {
  duration: string;
  difficulty: string;
  focus: string;
  equipment: string;
  lastCompleted?: string;
  totalWorkouts?: number;
}) {
  return (
    <View style={tw`mb-6`}>
      <View style={tw`flex-row gap-3 mb-4`}>
        <View
          style={[
            tw`flex-1 rounded-3xl p-4`,
            { 
              backgroundColor: Palette.secondary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        >
          <Clock size={16} color={Palette.primary} style={tw`mb-2`} />
          <ThemedText variant="bodySmall" style={tw`text-white/70 mb-1`}>
            Duration
          </ThemedText>
          <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: Palette.primary }]}>
            {duration}
          </ThemedText>
        </View>
        <View
          style={[
            tw`flex-1 rounded-3xl p-4`,
            { 
              backgroundColor: Palette.secondary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        >
          <Target size={16} color={Palette.primary} style={tw`mb-2`} />
          <ThemedText variant="bodySmall" style={tw`text-white/70 mb-1`}>
            Focus
          </ThemedText>
          <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: Palette.primary }]}>
            {focus}
          </ThemedText>
        </View>
      </View>
      
      {(lastCompleted || totalWorkouts) && (
        <View style={tw`flex-row gap-3`}>
          {lastCompleted && (
            <View
              style={[
                tw`flex-1 rounded-3xl p-4`,
                { 
                  backgroundColor: Palette.secondary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
            >
              <Calendar size={16} color={Palette.primary} style={tw`mb-2`} />
              <ThemedText variant="bodySmall" style={tw`text-white/70 mb-1`}>
                Last Completed
              </ThemedText>
              <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: Palette.primary }]}>
                {lastCompleted}
              </ThemedText>
            </View>
          )}
          {totalWorkouts && (
            <View
              style={[
                tw`flex-1 rounded-3xl p-4`,
                { 
                  backgroundColor: Palette.secondary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
            >
              <TrendingUp size={16} color={Palette.primary} style={tw`mb-2`} />
              <ThemedText variant="bodySmall" style={tw`text-white/70 mb-1`}>
                Total Workouts
              </ThemedText>
              <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: Palette.primary }]}>
                {totalWorkouts}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function WorkoutStatusBadge({ status }: { status: 'completed' | 'paused' | 'not-started' }) {
  const getStatusColor = () => {
    if (status === 'completed') return Palette.success;
    if (status === 'paused') return Palette.warning;
    return Palette.primary;
  };

  const getStatusText = () => {
    if (status === 'completed') return 'COMPLETED';
    if (status === 'paused') return 'PAUSED';
    return 'NOT STARTED';
  };

  return (
    <View
      style={[
        tw`px-4 py-2 rounded-full self-start`,
        {
          backgroundColor: Palette.tertiary,
          shadowColor: getStatusColor(),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: getStatusColor(),
        },
      ]}
    >
      <ThemedText
        variant="labelSmall"
        style={[tw`font-bold`, { color: getStatusColor() }]}
      >
        {getStatusText()}
      </ThemedText>
    </View>
  );
}

export default function WorkoutDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const plan = useMemo(() => getWorkout(id as string | undefined), [id]);
  const [workoutStatus] = useState<'completed' | 'paused' | 'not-started'>('not-started');
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <View style={[tw`flex-1`, { backgroundColor: Palette.quaternary }]}>
      {/* Header */}
      <View style={tw`p-6 pb-4 pt-12`}>
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center mr-4`,
              { 
                backgroundColor: Palette.secondary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <ArrowLeft size={20} color={Palette.primary} />
          </TouchableOpacity>
        <View style={tw`flex-1`}>
          <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
            {plan.name}
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-white/70`}>
            {plan.focus} • {plan.difficulty}
          </ThemedText>
        </View>
          <TouchableOpacity
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center mr-2`,
              { backgroundColor: Palette.secondary },
            ]}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark 
              size={18} 
              color={isBookmarked ? Palette.primary : Palette.primary} 
              fill={isBookmarked ? Palette.primary : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center`,
              { backgroundColor: Palette.secondary },
            ]}
          >
            <MoreHorizontal size={18} color={Palette.primary} />
          </TouchableOpacity>
        </View>

        {/* Workout Status */}
        <WorkoutStatusBadge status={workoutStatus} />
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pb-32`}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Stats */}
        <WorkoutStats
          duration={plan.duration}
          difficulty={plan.difficulty}
          focus={plan.focus}
          equipment={plan.equipment || 'Bodyweight'}
        />

        {/* Edit Workout Button */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center justify-center p-4 rounded-3xl mb-6`,
            { 
              backgroundColor: Palette.tertiary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#3A3D41',
            },
          ]}
          onPress={() => {
            // Navigate to edit workout page
            router.push('/customize-workout?edit=true');
          }}
        >
          <Edit size={18} color={Palette.primary} style={tw`mr-2`} />
          <ThemedText variant="bodyLarge" style={[tw`font-semibold`, { color: Palette.primary }]}>
            Edit Workout
          </ThemedText>
        </TouchableOpacity>

        {/* Warm Up Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <View
              style={[
                tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: Palette.warning },
              ]}
            >
              <Flame size={18} color={Palette.secondary} />
            </View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
              Warm Up
            </ThemedText>
          </View>
          {plan.warmup.map((w, idx) => (
            <ExerciseCard
              key={w.name + idx}
              name={w.name}
              duration={`${w.durationSec}s`}
              icon={Users}
              isWarmup={true}
              isCompleted={false}
            />
          ))}
        </View>

        {/* Main Workout Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <View
              style={[
                tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: Palette.tertiary },
              ]}
            >
              <Dumbbell size={18} color={Palette.primary} />
            </View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
              Main Workout
            </ThemedText>
          </View>
          {plan.main.map((m, idx) => (
            <ExerciseCard
              key={m.name + idx}
              name={m.name}
              sets={`${m.sets}x`}
              reps={`${m.reps} reps`}
              icon={Dumbbell}
              isCompleted={false}
            />
          ))}
        </View>

        {/* Cool Down Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-4`}>
            <View
              style={[
                tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: Palette.success },
              ]}
            >
              <Heart size={18} color={Palette.secondary} />
            </View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
              Cool Down
            </ThemedText>
          </View>
          {plan.cooldown.map((c, idx) => (
            <ExerciseCard
              key={c.name + idx}
              name={c.name}
              duration={`${c.durationSec}s`}
              icon={Users}
              isCompleted={false}
            />
          ))}
        </View>
      </ScrollView>

      {/* Start Workout Button */}
      <View style={tw`absolute bottom-6 left-6 right-6`}>
        <TouchableOpacity
          style={[
            tw`rounded-3xl py-4 px-6`,
            { 
              backgroundColor: Palette.primary,
              shadowColor: Palette.primary,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 16,
              borderWidth: 2,
              borderColor: '#FFE066',
            },
          ]}
          onPress={() => {
            router.push({ pathname: '/capture', params: { id: plan.id } });
          }}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <View
              style={[
                tw`w-10 h-10 rounded-2xl items-center justify-center mr-3`,
                { 
                  backgroundColor: '#1A1D21',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: '#2A2D31',
                },
              ]}
            >
              <Play size={20} color="#FFD645" style={tw`ml-1`} />
            </View>
            <ThemedText
              variant="titleLarge"
              style={[tw`font-bold text-lg`, { color: '#1A1D21' }]}
            >
              Start Workout
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}


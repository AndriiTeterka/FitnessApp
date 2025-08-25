import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Dumbbell, Flame, Heart, LucideIcon, Star, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { recentWorkouts } from '@/lib/recentWorkouts';

type WorkoutTab = 'my-workouts' | 'recent' | 'quick-start' | 'recommended';

function WorkoutCard({
  id,
  name,
  duration,
  difficulty,
  exercises,
  icon: Icon,
  type = 'custom',
  isFavorite = false,
  status,
}: {
  id?: string;
  name: string;
  duration: string;
  difficulty: string;
  exercises: number;
  icon: LucideIcon;
  type?: 'custom' | 'recent' | 'quick' | 'recommended';
  isFavorite?: boolean;
  status?: 'completed' | 'paused';
}) {
  const getTypeColor = () => {
    switch (type) {
      case 'quick': return Palette.primary;
      case 'custom': return Palette.accent;
      case 'recent': return Palette.success;
      case 'recommended': return '#8B5CF6';
      default: return Palette.primary;
    }
  };

  const getStatusColor = () => {
    if (status === 'completed') return Palette.success;
    if (status === 'paused') return Palette.warning;
    return getTypeColor();
  };

  const getStatusText = () => {
    if (status === 'completed') return 'COMPLETED';
    if (status === 'paused') return 'PAUSED';
    return difficulty;
  };

  return (
    <TouchableOpacity
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
      onPress={() => {
        // Navigate to workout details with id
        const slug = (id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');
        router.push({ pathname: '/workout-details', params: { id: slug } });
      }}
    >
      <View
        style={[
          tw`w-14 h-14 rounded-2xl items-center justify-center mr-4`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: getTypeColor(),
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#3A3D41',
          },
        ]}
      >
        <Icon size={26} color={getTypeColor()} />
      </View>
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center mb-1`}>
          <ThemedText variant="titleMedium" style={tw`text-white font-bold`}>
            {name}
          </ThemedText>
          {isFavorite && (
            <Star size={16} color={Palette.warning} style={tw`ml-2`} fill={Palette.warning} />
          )}
        </View>
        <View style={tw`flex-row items-center`}>
          <Clock size={14} color={getTypeColor()} style={tw`mr-1`} />
          <ThemedText variant="bodySmall" style={tw`text-white/70 mr-3`}>
            {duration}
          </ThemedText>
          <Dumbbell size={14} color={getTypeColor()} style={tw`mr-1`} />
          <ThemedText variant="bodySmall" style={tw`text-white/70`}>
            {exercises} exercises
          </ThemedText>
        </View>
      </View>
      <View
        style={[
          tw`px-3 py-1 rounded-full`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: getStatusColor(),
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
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
    </TouchableOpacity>
  );
}

function QuickStartCard({
  title,
  subtitle,
  icon: Icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
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
      onPress={onPress}
    >
      <View
        style={[
          tw`w-12 h-12 rounded-2xl items-center justify-center mb-3`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: color,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 6,
            borderWidth: 1,
            borderColor: '#3A3D41',
          },
        ]}
      >
        <Icon size={22} color={color} />
      </View>
      <ThemedText
        variant="bodyMedium"
        style={tw`text-white font-bold mb-1`}
      >
        {title}
      </ThemedText>
      <ThemedText
        variant="bodySmall"
        style={tw`text-white/70`}
      >
        {subtitle}
      </ThemedText>
    </TouchableOpacity>
  );
}

function TabButton({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={tw`px-4 py-3 mr-6`}
      onPress={onPress}
    >
      <ThemedText
        variant="bodyLarge"
        style={[
          tw`font-semibold`,
          { color: isActive ? Palette.primary : 'rgba(255, 255, 255, 0.7)' },
        ]}
      >
        {title}
      </ThemedText>
      {isActive && (
        <View
          style={[
            tw`h-0.5 rounded-full mt-2`,
            { 
              backgroundColor: Palette.primary,
              shadowColor: Palette.primary,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

function EmptyState({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <View style={tw`items-center justify-center py-12`}>
      <View
        style={[
          tw`w-16 h-16 rounded-3xl items-center justify-center mb-4`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: Palette.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
      >
        <Icon size={32} color={Palette.primary} />
      </View>
      <ThemedText variant="titleMedium" style={tw`text-white font-bold mb-2`}>
        {title}
      </ThemedText>
      <ThemedText variant="bodyMedium" style={tw`text-white/60 text-center`}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

export default function CustomizeWorkout() {
  const [activeTab, setActiveTab] = useState<WorkoutTab>('my-workouts');
  const { tab } = useLocalSearchParams<{ tab?: WorkoutTab }>();

  useEffect(() => {
    if (tab) {
      setActiveTab(tab as WorkoutTab);
    }
  }, [tab]);

  const handleCreateWorkout = () => {
    // Navigate to workout creation flow
    router.push('/exercises');
  };

  const handleQuickWorkout = () => {
    // Start a quick workout immediately (use a default plan)
    router.push({ pathname: '/workout-details', params: { id: 'upper-body-power' } });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-workouts':
        return (
          <View>
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
                My Custom Workouts
              </ThemedText>
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
                onPress={handleCreateWorkout}
              >
                <ThemedText
                  variant="bodyMedium"
                  style={[tw`font-semibold`, { color: Palette.primary }]}
                >
                  Create New
                </ThemedText>
              </TouchableOpacity>
            </View>
            {[
              { id: 'morning-strength', name: 'Morning Strength', duration: '45 min', difficulty: 'Intermediate', exercises: 8, icon: Dumbbell, type: 'custom' as const },
              { id: 'upper-body-power', name: 'Upper Body Power', duration: '35 min', difficulty: 'Intermediate', exercises: 9, icon: Dumbbell, type: 'custom' as const },
              { id: 'yoga-flow', name: 'Yoga Flow', duration: '20 min', difficulty: 'Beginner', exercises: 12, icon: Users, type: 'custom' as const, isFavorite: true },
            ].map((w) => (
              <WorkoutCard key={w.name} {...w} />
            ))}
          </View>
        );

      case 'recent':
        return (
          <View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-6`}>
              Recent Activity
            </ThemedText>
              {recentWorkouts.map((w) => (
                <WorkoutCard
                  key={w.id}
                  id={w.id}
                  name={w.name}
                  duration={w.duration}
                  difficulty={w.difficulty}
                  exercises={w.exercises}
                  icon={w.id === 'full-body-hiit' ? Flame : Dumbbell}
                  type={'recent'}
                  status={w.status}
                />
              ))}
          </View>
        );

      case 'quick-start':
        return (
          <View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-6`}>
              Quick Start Options
            </ThemedText>
            <View style={tw`flex-row gap-4 mb-8`}>
              <QuickStartCard
                title="Quick Workout"
                subtitle="15 min • Beginner"
                icon={Flame}
                color={Palette.primary}
                onPress={handleQuickWorkout}
              />
              <QuickStartCard
                title="Custom Plan"
                subtitle="Build your own"
                icon={TrendingUp}
                color={Palette.accent}
                onPress={handleCreateWorkout}
              />
            </View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-6`}>
              Popular Quick Workouts
            </ThemedText>
            {[
              { id: 'upper-body-power', name: '5-Minute Warm Up', duration: '5 min', difficulty: 'Beginner', exercises: 3, icon: Flame, type: 'quick' as const },
              { name: '10-Minute Cardio', duration: '10 min', difficulty: 'Beginner', exercises: 4, icon: Heart, type: 'quick' as const },
              { name: '15-Minute Strength', duration: '15 min', difficulty: 'Intermediate', exercises: 6, icon: Dumbbell, type: 'quick' as const },
            ].map((w) => (
              <WorkoutCard key={w.name} {...w} />
            ))}
          </View>
        );

      case 'recommended':
        return (
          <View>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-6`}>
              Recommended for You
            </ThemedText>
            {[
              { name: 'Upper Body Power', duration: '35 min', difficulty: 'Intermediate', exercises: 9, icon: Dumbbell, type: 'recommended' as const },
              { name: 'Lower Body Strength', duration: '40 min', difficulty: 'Advanced', exercises: 7, icon: Heart, type: 'recommended' as const },
              { name: 'Full Body Circuit', duration: '30 min', difficulty: 'Intermediate', exercises: 8, icon: Flame, type: 'recommended' as const },
            ].map((w) => (
              <WorkoutCard key={w.name} {...w} />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[tw`flex-1`, { backgroundColor: Palette.quaternary }]}
    >
      {/* Header */}
      <View style={tw`flex-row items-center p-6 pb-4`}>
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
        <ThemedText
          variant="titleLarge"
          style={tw`text-white font-bold`}
        >
          Workouts
        </ThemedText>
      </View>

      {/* Tab Navigation */}
      <View style={tw`px-6 pb-4`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
          <TabButton
            title="My Workouts"
            isActive={activeTab === 'my-workouts'}
            onPress={() => setActiveTab('my-workouts')}
          />
          <TabButton
            title="Recent"
            isActive={activeTab === 'recent'}
            onPress={() => setActiveTab('recent')}
          />
          <TabButton
            title="Quick Start"
            isActive={activeTab === 'quick-start'}
            onPress={() => setActiveTab('quick-start')}
          />
          <TabButton
            title="Recommended"
            isActive={activeTab === 'recommended'}
            onPress={() => setActiveTab('recommended')}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 pb-32`}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

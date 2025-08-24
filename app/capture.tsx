import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { router } from 'expo-router';
import { ArrowLeft, Check, CheckCircle, Dumbbell, Flame, RotateCcw, SkipForward, Snowflake } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { getExerciseStatus, getExerciseSets, shouldShowCompleteSetButton } from '@/utils/workout';

function CircularTimer({ 
  elapsedTime, 
  isActive, 
  onPause, 
  onResume,
  totalTime = 300, // 5 minutes default
  currentExerciseName = "Push-ups",
  isRest = false,
  restTime = 60,
  currentExercise = 3,
}: { 
  elapsedTime: number; 
  isActive: boolean; 
  onPause: () => void; 
  onResume: () => void;
  totalTime?: number;
  currentExerciseName?: string;
  isRest?: boolean;
  restTime?: number;
  currentExercise?: number;
}) {
  const glowAnimation = useRef(new Animated.Value(0)).current;
  
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(elapsedTime), [elapsedTime, formatTime]);
  
  const progressPercentage = useMemo(() => 
    Math.min((elapsedTime / totalTime) * 100, 100), 
    [elapsedTime, totalTime]
  );

  // Trigger glow animation on each second tick
  useEffect(() => {
    if (isActive && elapsedTime > 0) {
      // Reset animation value
      glowAnimation.setValue(0);
      
      // Create the glow animation sequence
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [elapsedTime, isActive, glowAnimation]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const glowScale = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const getStatusText = () => {
    if (isRest) {
      return `Rest: ${restTime}s`;
    }
    return isActive ? 'Tap to pause' : 'Tap to resume';
  };

  const getStatusColor = () => {
    if (isRest) return '#FFFFFF'; // White for rest
    if (currentExercise <= 2) return '#EF4444'; // Red for warmup
    if (currentExercise <= 7) return '#F59E0B'; // Yellow for main exercises
    return '#3B82F6'; // Blue for cooldown
  };

  return (
    <View style={tw`items-center mb-8`}>
      <View style={tw`relative items-center justify-center`}>
        {/* Enhanced Glow Effect */}
        <Animated.View
          style={[
            tw`absolute w-64 h-64 rounded-full`,
            {
              backgroundColor: getStatusColor(),
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
              shadowColor: getStatusColor(),
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 30,
              elevation: 15,
            },
          ]}
        />
        
        {/* Background Circle */}
        <TouchableOpacity
          onPress={isActive ? onPause : onResume}
          activeOpacity={0.9}
          style={[
            tw`w-56 h-56 rounded-full items-center justify-center`,
            { 
              backgroundColor: Palette.secondary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
        >
          {/* Progress Circle */}
          <View style={tw`absolute inset-0`}>
            <View
              style={[
                tw`w-56 h-56 rounded-full`,
                {
                  borderWidth: 10,
                  borderColor: getStatusColor(),
                  borderTopColor: progressPercentage > 0 ? getStatusColor() : 'transparent',
                  borderRightColor: progressPercentage > 25 ? getStatusColor() : 'transparent',
                  borderBottomColor: progressPercentage > 50 ? getStatusColor() : 'transparent',
                  borderLeftColor: progressPercentage > 75 ? getStatusColor() : 'transparent',
                  transform: [{ rotate: '-90deg' }],
                  shadowColor: getStatusColor(),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                },
              ]}
            />
          </View>
          
          {/* Enhanced Timer Display */}
          <View style={tw`items-center px-4`}>
            <ThemedText variant="displayLarge" style={[tw`font-bold text-center`, { color: getStatusColor() }]}>
              {formattedTime}
            </ThemedText>
            <ThemedText variant="titleMedium" style={[tw`font-semibold text-center mt-2`, { color: 'white' }]}>
              {currentExerciseName}
            </ThemedText>
            <ThemedText variant="bodySmall" style={tw`text-white/60 mt-1 text-center`}>
              {getStatusText()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ExerciseList({
  currentExercise,
  totalExercises,
  currentSet,
  totalSets,
  repsRequired,
  onExerciseTap,
  onCompleteSet,
  onSkipRest,
  isRest,
  skippedExercises,
  nextExercise,
}: {
  currentExercise: number;
  totalExercises: number;
  currentSet: number;
  totalSets: number;
  repsRequired: number;
  onExerciseTap: (exerciseId: number) => void;
  onCompleteSet: (exerciseId: number) => void;
  onSkipRest: () => void;
  isRest: boolean;
  skippedExercises: number[];
  nextExercise: number;
}) {
  const progressPercentage = useMemo(() => 
    Math.round((currentExercise / totalExercises) * 100), 
    [currentExercise, totalExercises]
  );

  // Sample exercise data organized by sections
  const warmupExercises = [
    { id: 1, name: "Arm Circles", duration: "30s", sets: 1, reps: null, icon: Flame, color: '#EF4444' },
    { id: 2, name: "Shoulder Rolls", duration: "30s", sets: 1, reps: null, icon: Flame, color: '#EF4444' },
  ];

  const mainExercises = [
    { id: 3, name: "Push-ups", sets: 3, reps: 12, duration: null, icon: Dumbbell, color: '#F59E0B' },
    { id: 4, name: "Dumbbell Rows", sets: 3, reps: 12, duration: null, icon: Dumbbell, color: '#F59E0B' },
    { id: 5, name: "Shoulder Press", sets: 3, reps: 12, duration: null, icon: Dumbbell, color: '#F59E0B' },
    { id: 6, name: "Tricep Dips", sets: 3, reps: 12, duration: null, icon: Dumbbell, color: '#F59E0B' },
    { id: 7, name: "Bicep Curls", sets: 3, reps: 12, duration: null, icon: Dumbbell, color: '#F59E0B' },
  ];

  const cooldownExercises = [
    { id: 8, name: "Stretching", duration: "60s", sets: 1, reps: null, icon: Snowflake, color: '#3B82F6' },
    { id: 9, name: "Deep Breathing", duration: "30s", sets: 1, reps: null, icon: Snowflake, color: '#3B82F6' },
  ];

  const getStatusColor = (status: string, exerciseColor: string) => {
    switch (status) {
      case 'completed': return '#10B981'; // Green for completed
      case 'skipped': return '#6B7280'; // Gray for skipped
      case 'current': return exerciseColor;
      case 'next': return exerciseColor;
      default: return Palette.tertiary;
    }
  };

  const getStatusIcon = (status: string, exercise: any) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color="#10B981" />;
      case 'skipped': return <SkipForward size={16} color="#6B7280" />;
      case 'current': return <exercise.icon size={16} color={exercise.color} />;
      case 'next': return <exercise.icon size={16} color={exercise.color} />;
      default: return <exercise.icon size={16} color={getStatusColor(status, exercise.color)} />;
    }
  };

  const renderExerciseItem = (exercise: any, index: number) => {
    const status = getExerciseStatus(
      exercise.id,
      currentExercise,
      isRest,
      nextExercise,
      skippedExercises
    );
    const isCurrent = status === 'current';
    const isNext = status === 'next';
    const isHighlighted = isCurrent || isNext;

    // Determine if exercise should show complete button
    const canComplete = shouldShowCompleteSetButton(
      exercise.id,
      currentExercise,
      isRest
    );
    const canSkipRest = isCurrent && isRest;
    
    return (
      <TouchableOpacity
        key={exercise.id}
        onPress={() => onExerciseTap(exercise.id)}
        activeOpacity={0.7}
        style={[
          tw`flex-row items-center p-4 rounded-2xl mb-3`,
          {
            backgroundColor: isHighlighted ? Palette.secondary : 'transparent',
            borderWidth: isHighlighted ? 1 : 0,
            borderColor: exercise.color,
            opacity: status === 'completed' || status === 'skipped' ? 0.7 : 1,
            shadowColor: isHighlighted ? exercise.color : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isHighlighted ? 0.3 : 0,
            shadowRadius: 4,
            elevation: isHighlighted ? 3 : 0,
          },
        ]}
      >
        {/* Exercise Info */}
        <View style={tw`flex-1`}>
          <ThemedText 
            variant="bodyLarge" 
            style={[
              tw`font-semibold mb-1`,
              { color: status === 'completed' || status === 'skipped' ? 'rgba(255, 255, 255, 0.7)' : 'white' }
            ]}
          >
            {exercise.name}
          </ThemedText>
          <View style={tw`flex-row items-center`}>
            {exercise.duration ? (
              <ThemedText variant="bodySmall" style={tw`text-white/60`}>
                {exercise.duration}
              </ThemedText>
            ) : (
              <ThemedText variant="bodySmall" style={tw`text-white/60`}>
                {exercise.sets} sets • {exercise.reps} reps
              </ThemedText>
            )}
            {isCurrent && exercise.sets > 1 && !isRest && (
              <View style={[tw`ml-3 px-2 py-1 rounded-full`, { backgroundColor: Palette.tertiary }]}>
                <ThemedText variant="labelSmall" style={[tw`font-bold`, { color: exercise.color }]}>
                  Set {currentSet}/{totalSets}
                </ThemedText>
              </View>
            )}
            {isNext && (
              <View style={[tw`ml-3 px-2 py-1 rounded-full`, { backgroundColor: exercise.color }]}>
                <ThemedText variant="labelSmall" style={tw`font-bold text-white`}>
                  Next
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Complete Set Button, Skip Rest Button, or Section Icon */}
        {canComplete ? (
          <TouchableOpacity
            onPress={() => onCompleteSet(exercise.id)}
            style={[
              tw`px-5 py-3 rounded-2xl`,
              { 
                backgroundColor: exercise.color,
                shadowColor: exercise.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }
            ]}
            activeOpacity={0.7}
          >
            <View style={tw`flex-row items-center`}>
              <Check size={18} color="white" style={tw`mr-2`} />
              <ThemedText variant="bodyMedium" style={tw`font-bold text-white`}>
                Complete Set
              </ThemedText>
            </View>
          </TouchableOpacity>
        ) : canSkipRest ? (
          <TouchableOpacity
            onPress={onSkipRest}
            style={[
              tw`px-5 py-3 rounded-2xl`,
              { 
                backgroundColor: '#6B7280',
                shadowColor: '#6B7280',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }
            ]}
            activeOpacity={0.7}
          >
            <View style={tw`flex-row items-center`}>
              <SkipForward size={18} color="white" style={tw`mr-2`} />
              <ThemedText variant="bodyMedium" style={tw`font-bold text-white`}>
                Skip Rest
              </ThemedText>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={tw`w-8 h-8 items-center justify-center`}>
            {getStatusIcon(status, exercise)}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderProgressBar = () => {
    const warmupWidth = (warmupExercises.length / totalExercises) * 100;
    const mainWidth = (mainExercises.length / totalExercises) * 100;
    const cooldownWidth = (cooldownExercises.length / totalExercises) * 100;

    return (
      <View style={tw`flex-row h-2 rounded-full mb-6 overflow-hidden`}>
        {/* Warmup Progress */}
        <View
          style={[
            tw`h-2`,
            {
              backgroundColor: '#EF4444',
              width: `${warmupWidth}%`,
            },
          ]}
        />
        {/* Main Exercises Progress */}
        <View
          style={[
            tw`h-2`,
            {
              backgroundColor: '#F59E0B',
              width: `${mainWidth}%`,
            },
          ]}
        />
        {/* Cooldown Progress */}
        <View
          style={[
            tw`h-2`,
            {
              backgroundColor: '#3B82F6',
              width: `${cooldownWidth}%`,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={tw`mb-8`}>
      {/* Progress Header */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <ThemedText variant="bodyMedium" style={tw`text-white/70`}>
          Exercise {currentExercise} of {totalExercises}
        </ThemedText>
        <View
          style={[
            tw`px-3 py-1 rounded-full`,
            { 
              backgroundColor: Palette.tertiary,
              shadowColor: Palette.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        >
          <ThemedText variant="labelSmall" style={[tw`font-bold`, { color: Palette.primary }]}>
            {progressPercentage}%
          </ThemedText>
        </View>
      </View>
      
      {/* Block Progress Bar */}
      {renderProgressBar()}

      {/* Exercise List */}
      <ScrollView style={tw`max-h-80`} showsVerticalScrollIndicator={false}>
        {/* Warm Up Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Flame size={18} color="#EF4444" style={tw`mr-2`} />
            <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: '#EF4444' }]}> 
              Warm Up
            </ThemedText>
          </View>
          {warmupExercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </View>

        {/* Main Exercises Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Dumbbell size={18} color="#F59E0B" style={tw`mr-2`} />
            <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: '#F59E0B' }]}>
              Main Exercises
            </ThemedText>
          </View>
          {mainExercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </View>

        {/* Cool Down Section */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Snowflake size={18} color="#3B82F6" style={tw`mr-2`} />
            <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: '#3B82F6' }]}> 
              Cool Down
            </ThemedText>
          </View>
          {cooldownExercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </View>
      </ScrollView>
    </View>
  );
}

function ConfirmJumpModal({
  visible,
  onConfirm,
  onCancel,
  targetExercise,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  targetExercise: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[
        tw`flex-1 justify-center items-center`,
        { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      ]}>
        <View style={[
          tw`mx-6 p-6 rounded-3xl`,
          { 
            backgroundColor: Palette.secondary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}>
          <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-2 text-center`}>
            Jump to Exercise?
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-white/70 mb-6 text-center`}>
            Are you sure you want to jump to &quot;{targetExercise}&quot;? This will skip the current exercise.
          </ThemedText>
          
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={[
                tw`flex-1 rounded-3xl py-4 px-6`,
                { 
                  backgroundColor: Palette.tertiary,
                  borderWidth: 1,
                  borderColor: '#3A3D41',
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ThemedText variant="bodyLarge" style={[tw`font-semibold text-center`, { color: Palette.primary }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                tw`flex-1 rounded-3xl py-4 px-6`,
                { 
                  backgroundColor: Palette.primary,
                  borderWidth: 2,
                  borderColor: '#FFE066',
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <ThemedText variant="bodyLarge" style={[tw`font-semibold text-center`, { color: '#1A1D21' }]}>
                Jump
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmResetModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[
        tw`flex-1 justify-center items-center`,
        { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      ]}>
        <View style={[
          tw`mx-6 p-6 rounded-3xl`,
          { 
            backgroundColor: Palette.secondary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}>
          <ThemedText variant="titleLarge" style={tw`text-white font-bold mb-2 text-center`}>
            Reset Workout?
          </ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-white/70 mb-6 text-center`}>
            This will reset your workout progress and start over from the beginning.
          </ThemedText>
          
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={[
                tw`flex-1 rounded-3xl py-4 px-6`,
                { 
                  backgroundColor: Palette.tertiary,
                  borderWidth: 1,
                  borderColor: '#3A3D41',
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ThemedText variant="bodyLarge" style={[tw`font-semibold text-center`, { color: Palette.primary }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                tw`flex-1 rounded-3xl py-4 px-6`,
                { 
                  backgroundColor: Palette.primary,
                  borderWidth: 2,
                  borderColor: '#FFE066',
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <ThemedText variant="bodyLarge" style={[tw`font-semibold text-center`, { color: '#1A1D21' }]}>
                Reset
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function Capture() {
  const [isActive, setIsActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(3); // Start with main exercise
  const [currentSet, setCurrentSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [targetExercise, setTargetExercise] = useState({ id: 0, name: '' });
  const [skippedExercises, setSkippedExercises] = useState<number[]>([]);

  const totalExercises = 9; // Total including warmup and cooldown
  const totalSets = 3;
  const repsRequired = 12;
  const restDuration = 60; // 60 seconds rest

  // Calculate next exercise
  const nextExercise = useMemo(() => {
    if (currentExercise >= totalExercises) return totalExercises;
    return currentExercise + 1;
  }, [currentExercise, totalExercises]);

  // Memoized values for performance
  const isWorkoutComplete = useMemo(() => 
    currentExercise > totalExercises, 
    [currentExercise, totalExercises]
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !isWorkoutComplete) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        
        // Handle rest timer
        if (isRest) {
          setRestTime((prev) => {
            if (prev <= 1) {
              setIsRest(false);
              setRestTime(restDuration);
              return restDuration;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isWorkoutComplete, isRest, restDuration]);

  const handlePause = useCallback(() => setIsActive(false), []);
  const handleResume = useCallback(() => setIsActive(true), []);

  const handleExerciseTap = useCallback((exerciseId: number) => {
    if (exerciseId !== currentExercise) {
      const exerciseNames = [
        "Arm Circles", "Shoulder Rolls", "Push-ups", "Dumbbell Rows", 
        "Shoulder Press", "Tricep Dips", "Bicep Curls", "Stretching", "Deep Breathing"
      ];
      setTargetExercise({ id: exerciseId, name: exerciseNames[exerciseId - 1] });
      setShowJumpModal(true);
    }
  }, [currentExercise]);

  const handleJumpConfirm = useCallback(() => {
    // Add current exercise to skipped list if it's not completed and not already skipped
    if (currentExercise <= totalExercises && !skippedExercises.includes(currentExercise)) {
      setSkippedExercises(prev => [...prev, currentExercise]);
    }
    
    setCurrentExercise(targetExercise.id);
    setCurrentSet(1);
    setIsRest(false);
    setRestTime(restDuration);
    setIsActive(true); // Auto-unpause when jumping
    setShowJumpModal(false);
  }, [currentExercise, targetExercise, restDuration, totalExercises, skippedExercises]);

  const handleJumpCancel = useCallback(() => {
    setShowJumpModal(false);
  }, []);

  const handleCompleteSet = useCallback((exerciseId: number) => {
    if (exerciseId === currentExercise) {
      // Check if this is a warmup or cooldown exercise (no rest periods)
      const isWarmupOrCooldown = exerciseId <= 2 || exerciseId >= 8;
      const exerciseSets = getExerciseSets(exerciseId, totalSets);

      if (currentSet < exerciseSets) {
        // Move to next set
        setCurrentSet(currentSet + 1);
        // Only start rest for main exercises
        if (!isWarmupOrCooldown) {
          setIsRest(true);
          setRestTime(restDuration);
        }
      } else if (currentExercise < totalExercises) {
        // Move to next exercise
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
        // Only start rest for main exercises
        if (!isWarmupOrCooldown && currentExercise + 1 <= 7) {
          setIsRest(true);
          setRestTime(restDuration);
        }
      } else {
        // Workout complete
        setCurrentExercise(totalExercises + 1);
        setIsRest(false);
      }
    }
  }, [currentExercise, currentSet, totalSets, totalExercises, restDuration]);

  const handleSkipRest = useCallback(() => {
    setIsRest(false);
    setRestTime(restDuration);
  }, [restDuration]);

  const handleReset = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmReset = useCallback(() => {
    setElapsedTime(0);
    setCurrentExercise(3); // Start with main exercise
    setCurrentSet(1);
    setIsRest(false);
    setRestTime(restDuration);
    setSkippedExercises([]);
    setShowResetModal(false);
  }, [restDuration]);

  const cancelReset = useCallback(() => {
    setShowResetModal(false);
  }, []);

  const handleEndWorkout = useCallback(() => {
    router.back();
  }, []);

  const getCurrentExerciseData = useMemo(() => {
    if (isWorkoutComplete) {
      return {
        name: "Workout Complete!",
        instructions: "Congratulations! You've completed your workout. Great job!",
        isRest: false,
        isCompleted: true,
      };
    }
    
    if (isRest) {
      return {
        name: "Rest Period",
        instructions: `Take a ${restDuration}-second break. Focus on your breathing and prepare for the next set.`,
        isRest: true,
        isCompleted: false,
      };
    }

    const exercises = [
      "Arm Circles", // Warmup
      "Shoulder Rolls", // Warmup
      "Push-ups", // Main
      "Dumbbell Rows", // Main
      "Shoulder Press", // Main
      "Tricep Dips", // Main
      "Bicep Curls", // Main
      "Stretching", // Cooldown
      "Deep Breathing", // Cooldown
    ];

    const instructions = [
      "Make circular motions with your arms to warm up your shoulders.",
      "Roll your shoulders forward and backward to loosen up.",
      "Keep your body in a straight line, lower your chest to the ground, then push back up.",
      "Keep your back straight, pull the dumbbell towards your hip, then lower with control.",
      "Press the dumbbells overhead while keeping your core engaged and back straight.",
      "Lower your body by bending your elbows, then push back up to the starting position.",
      "Curl the dumbbells towards your shoulders while keeping your elbows at your sides.",
      "Stretch your muscles gently to cool down and prevent stiffness.",
      "Take deep breaths to relax and recover from your workout.",
    ];

    return {
      name: exercises[currentExercise - 1] || "Exercise",
      instructions: instructions[currentExercise - 1] || "Perform the exercise with proper form.",
      isRest: false,
      isCompleted: false,
    };
  }, [currentExercise, isRest, isWorkoutComplete, restDuration]);

  return (
    <View style={[tw`flex-1`, { backgroundColor: Palette.quaternary }]}>
      {/* Header */}
      <View style={tw`p-6 pb-4 pt-8`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <TouchableOpacity
            onPress={handleEndWorkout}
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center`,
              { 
                backgroundColor: Palette.secondary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Palette.primary} />
          </TouchableOpacity>
          <View style={tw`flex-1 items-center`}>
            <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
              {isWorkoutComplete ? 'Workout Complete!' : 'Workout in Progress'}
            </ThemedText>
            <ThemedText variant="bodyMedium" style={tw`text-white/70`}>
              Upper Body Power
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center`,
              { backgroundColor: Palette.secondary },
            ]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color={Palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`flex-1 px-6 pb-24`}>
        {/* Circular Timer */}
        <CircularTimer
          elapsedTime={elapsedTime}
          isActive={isActive}
          onPause={handlePause}
          onResume={handleResume}
          currentExerciseName={isWorkoutComplete ? "Workout Complete!" : getCurrentExerciseData.name}
          isRest={isRest}
          restTime={restTime}
          currentExercise={currentExercise}
        />

        {/* Exercise List */}
        {!isWorkoutComplete && (
          <ExerciseList
            currentExercise={currentExercise}
            totalExercises={totalExercises}
            currentSet={currentSet}
            totalSets={totalSets}
            repsRequired={repsRequired}
            onExerciseTap={handleExerciseTap}
            onCompleteSet={handleCompleteSet}
            onSkipRest={handleSkipRest}
            isRest={isRest}
            skippedExercises={skippedExercises}
            nextExercise={nextExercise}
          />
        )}
      </View>

      {/* Jump Confirmation Modal */}
      <ConfirmJumpModal
        visible={showJumpModal}
        onConfirm={handleJumpConfirm}
        onCancel={handleJumpCancel}
        targetExercise={targetExercise.name}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmResetModal
        visible={showResetModal}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </View>
  );
}


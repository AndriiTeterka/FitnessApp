import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, CheckCircle, Dumbbell, Flame, RotateCcw, SkipForward, Snowflake } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import AnimatedWorkoutBackground from '@/components/AnimatedWorkoutBackground';
import { getWorkout } from '@/lib/workouts';

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

type RestPhase = 'none' | 'between_sets' | 'between_exercises';
type ExerciseItem = { id: number; name: string; duration?: string | null; sets: number; reps: number | null; icon: any; color: string };

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
  restPhase,
  restTargetExercise,
  selectedExerciseId,
  warmupExercises,
  mainExercises,
  cooldownExercises,
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
  restPhase: RestPhase;
  restTargetExercise: number | null;
  selectedExerciseId: number | null;
  warmupExercises: ExerciseItem[];
  mainExercises: ExerciseItem[];
  cooldownExercises: ExerciseItem[];
}) {
  const progressPercentage = useMemo(() => 
    Math.round((currentExercise / totalExercises) * 100), 
    [currentExercise, totalExercises]
  );

  const warmupCount = warmupExercises.length;
  const mainCount = mainExercises.length;
  const cooldownCount = cooldownExercises.length;

  const getExerciseStatus = (exerciseId: number) => {
    // Current exercise takes precedence
    if (exerciseId === currentExercise) return 'current';

    if (isRest) {
      if (restPhase === 'between_sets') {
        if (exerciseId < currentExercise) {
          return skippedExercises.includes(exerciseId) ? 'skipped' : 'completed';
        }
        return skippedExercises.includes(exerciseId) ? 'skipped' : 'upcoming';
      }
      if (restPhase === 'between_exercises') {
        if (exerciseId <= currentExercise) {
          return skippedExercises.includes(exerciseId) ? 'skipped' : 'completed';
        }
        if (restTargetExercise != null && exerciseId === restTargetExercise) return 'next';
        return skippedExercises.includes(exerciseId) ? 'skipped' : 'upcoming';
      }
    }

    if (exerciseId < currentExercise) {
      return skippedExercises.includes(exerciseId) ? 'skipped' : 'completed';
    }
    return skippedExercises.includes(exerciseId) ? 'skipped' : 'upcoming';
  };

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
    const status = getExerciseStatus(exercise.id);
    const isCurrent = status === 'current';
    const isNext = status === 'next';
    const isSelected = selectedExerciseId === exercise.id;
    const isHighlighted = isCurrent || isNext || isSelected;
    
    // Determine if exercise should show complete button (warmup/cooldown also have it)
    const canComplete = isCurrent && !isRest;
    // Skip rest appears on current for between_sets, and on target for between_exercises
    const canSkipRest = isRest && (
      (restPhase === 'between_sets' && exercise.id === currentExercise) ||
      (restPhase === 'between_exercises' && restTargetExercise != null && exercise.id === restTargetExercise)
    );
    
    // Determine if exercise should have rest periods (only main exercises)
    const hasRestPeriods = exercise.id >= 3 && exercise.id <= 7;
    
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
    const warmupWidth = (warmupCount / totalExercises) * 100;
    const mainWidth = (mainCount / totalExercises) * 100;
    const cooldownWidth = (cooldownCount / totalExercises) * 100;

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
        <TouchableOpacity
          onPress={() => onExerciseTap(warmupExercises[0]?.id ?? 1)}
          activeOpacity={0.8}
          style={tw`mb-6`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <Flame size={18} color="#EF4444" style={tw`mr-2`} />
            <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: '#EF4444' }]}>
              Warm Up
            </ThemedText>
          </View>
          {warmupExercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </TouchableOpacity>

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
        <TouchableOpacity
          onPress={() => onExerciseTap(cooldownExercises[0]?.id ?? (warmupCount + mainCount + 1))}
          activeOpacity={0.8}
          style={tw`mb-6`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <Snowflake size={18} color="#3B82F6" style={tw`mr-2`} />
            <ThemedText variant="titleMedium" style={[tw`font-bold`, { color: '#3B82F6' }]}>
              Cool Down
            </ThemedText>
          </View>
          {cooldownExercises.map((exercise, index) => renderExerciseItem(exercise, index))}
        </TouchableOpacity>
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
            Are you sure you want to jump to "{targetExercise}"? This will skip the current exercise.
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const plan = useMemo(() => getWorkout(id as string | undefined), [id]);

  // Build workout arrays from plan
  const warmupArr: ExerciseItem[] = useMemo(() => plan.warmup.map((w, i) => ({
    id: i + 1,
    name: w.name,
    duration: `${w.durationSec}s`,
    sets: 1,
    reps: null,
    icon: Flame,
    color: '#EF4444',
  })), [plan]);
  const mainArr: ExerciseItem[] = useMemo(() => plan.main.map((m, i) => ({
    id: warmupArr.length + i + 1,
    name: m.name,
    duration: null,
    sets: m.sets,
    reps: m.reps,
    icon: Dumbbell,
    color: '#F59E0B',
  })), [plan, warmupArr.length]);
  const cooldownArr: ExerciseItem[] = useMemo(() => plan.cooldown.map((c, i) => ({
    id: warmupArr.length + mainArr.length + i + 1,
    name: c.name,
    duration: `${c.durationSec}s`,
    sets: 1,
    reps: null,
    icon: Snowflake,
    color: '#3B82F6',
  })), [plan, warmupArr.length, mainArr.length]);

  const [isActive, setIsActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(1); // Start at first exercise
  const [currentSet, setCurrentSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [restTime, setRestTime] = useState(plan.restSeconds);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [targetExercise, setTargetExercise] = useState({ id: 0, name: '' });
  const [skippedExercises, setSkippedExercises] = useState<number[]>([]);
  const [restPhase, setRestPhase] = useState<RestPhase>('none');
  const [restTargetExercise, setRestTargetExercise] = useState<number | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [totalSets, setTotalSets] = useState(1);
  const [repsRequired, setRepsRequired] = useState(0);

  const totalExercises = warmupArr.length + mainArr.length + cooldownArr.length;
  const restDuration = plan.restSeconds; // rest from plan

  // Helper to resolve display name list
  const exerciseNames = useMemo(() => ([...warmupArr, ...mainArr, ...cooldownArr].map(e => e.name)), [warmupArr, mainArr, cooldownArr]);

  useEffect(() => {
    const all = [...warmupArr, ...mainArr, ...cooldownArr];
    const ex = all[currentExercise - 1];
    if (ex) {
      setTotalSets(ex.sets || 1);
      setRepsRequired(ex.reps || 0);
    }
  }, [currentExercise, warmupArr, mainArr, cooldownArr]);

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
              // End of rest
              if (restPhase === 'between_exercises' && restTargetExercise != null) {
                // Advance to target exercise after inter-exercise rest
                setCurrentExercise(restTargetExercise);
                setCurrentSet(1);
              }
              setIsRest(false);
              setRestPhase('none');
              setRestTargetExercise(null);
              setRestTime(restDuration);
              setSelectedExerciseId(null);
              return restDuration;
            }
            return prev - 1;
          });
        }
  }, 1000);
}
return () => clearInterval(interval);
  }, [isActive, isWorkoutComplete, isRest, restDuration, restPhase, restTargetExercise]);

  const handlePause = useCallback(() => setIsActive(false), []);
  const handleResume = useCallback(() => setIsActive(true), []);

  const handleExerciseTap = useCallback((exerciseId: number) => {
    setSelectedExerciseId(exerciseId);
    // If we're resting between exercises and the user taps the upcoming exercise, start it immediately
    if (isRest && restPhase === 'between_exercises' && restTargetExercise === exerciseId) {
      // Equivalent to skipping rest
      setIsRest(false);
      setRestPhase('none');
      setRestTargetExercise(null);
      // If the target was previously marked skipped, unskip it now
      setSkippedExercises((prev) => prev.filter((id) => id !== exerciseId));
      setCurrentExercise(exerciseId);
      setCurrentSet(1);
      return;
    }
    // No-op if tapping the current exercise
    if (exerciseId === currentExercise) return;
    // Otherwise, confirm jump
    setTargetExercise({ id: exerciseId, name: exerciseNames[exerciseId - 1] });
    setShowJumpModal(true);
  }, [currentExercise, exerciseNames, isRest, restPhase, restTargetExercise]);

  const handleJumpConfirm = useCallback(() => {
    // Add current exercise to skipped list if it's not completed and not already skipped
    if (currentExercise <= totalExercises && !skippedExercises.includes(currentExercise)) {
      setSkippedExercises(prev => [...prev, currentExercise]);
    }
    
    // Unskip the target if it was previously skipped
    setSkippedExercises(prev => prev.filter(id => id !== targetExercise.id));
    setCurrentExercise(targetExercise.id);
    setCurrentSet(1);
    setIsRest(false);
    setRestPhase('none');
    setRestTargetExercise(null);
    setRestTime(restDuration);
    setIsActive(true); // Auto-unpause when jumping
    setShowJumpModal(false);
    setSelectedExerciseId(null);
  }, [currentExercise, targetExercise, restDuration, totalExercises, skippedExercises]);

  const handleJumpCancel = useCallback(() => {
    setShowJumpModal(false);
    setSelectedExerciseId(null);
  }, []);

  const handleCompleteSet = useCallback((exerciseId: number) => {
    if (exerciseId !== currentExercise) return;

    const warmupCount = warmupArr.length;
    const mainEnd = warmupArr.length + mainArr.length;
    const isWarmupOrCooldown = exerciseId <= warmupCount || exerciseId > mainEnd;

    if (isWarmupOrCooldown) {
      // Warmup/Cooldown: no rest, just progress to next or finish
      if (currentExercise < totalExercises) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
      } else {
        // Mark complete by advancing beyond last exercise
        setCurrentExercise(totalExercises + 1);
      }
      setSelectedExerciseId(null);
      return;
    }

    // Main exercises
    if (currentSet < totalSets) {
      // Next set with rest between sets
      setCurrentSet(currentSet + 1);
      setIsRest(true);
      setRestPhase('between_sets');
      setRestTargetExercise(null);
      setRestTime(restDuration);
      setSelectedExerciseId(null);
    } else {
      // Finished this exercise
      if (currentExercise < (warmupArr.length + mainArr.length)) {
        // Rest before next main exercise
        const nextId = currentExercise + 1;
        setIsRest(true);
        setRestPhase('between_exercises');
        setRestTargetExercise(nextId);
        // Ensure the next exercise is not marked as skipped if we plan to do it next
        setSkippedExercises(prev => prev.filter(id => id !== nextId));
        setRestTime(restDuration);
        // Keep currentExercise pointing to the completed exercise until rest ends
        setSelectedExerciseId(null);
      } else {
        // Move directly to cooldown (no rest between main -> cooldown)
        setCurrentExercise(warmupArr.length + mainArr.length + 1);
        setCurrentSet(1);
        setSelectedExerciseId(null);
      }
    }
  }, [currentExercise, currentSet, totalSets, totalExercises, restDuration]);

  const handleSkipRest = useCallback(() => {
    if (restPhase === 'between_exercises' && restTargetExercise != null) {
      setCurrentExercise(restTargetExercise);
      setCurrentSet(1);
    }
    setIsRest(false);
    setRestPhase('none');
    setRestTargetExercise(null);
    setRestTime(restDuration);
  }, [restDuration, restPhase, restTargetExercise]);

  const handleReset = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmReset = useCallback(() => {
    setElapsedTime(0);
    setCurrentExercise(1);
    setCurrentSet(1);
    setIsRest(false);
    setRestTime(restDuration);
    setIsCompleted(false);
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

    const all = [...warmupArr, ...mainArr, ...cooldownArr];
    const current = all[currentExercise - 1];
    const desc = current?.duration
      ? `Perform for ${current.duration}. Focus on form and breathing.`
      : current?.reps
      ? `Complete ${current.sets} sets of ${current.reps} reps with control.`
      : 'Perform the exercise with proper form.';

    return {
      name: current?.name || 'Exercise',
      instructions: desc,
      isRest: false,
      isCompleted: false,
    };
  }, [currentExercise, isRest, isWorkoutComplete, restDuration, warmupArr, mainArr, cooldownArr]);

  return (
    <View style={[tw`flex-1`, { backgroundColor: Palette.quaternary }]}>
      <AnimatedWorkoutBackground intensity="active" />
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
              {plan.name}
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
            restPhase={restPhase}
            restTargetExercise={restTargetExercise}
            selectedExerciseId={selectedExerciseId}
            warmupExercises={warmupArr}
            mainExercises={mainArr}
            cooldownExercises={cooldownArr}
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


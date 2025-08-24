import { Palette } from '@/constants/Colors';
import { tw } from '@/utils/tw';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Clock, RotateCcw } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

function CircularTimer({ 
  elapsedTime, 
  isActive, 
  onPause, 
  onResume,
  totalTime = 300, // 5 minutes default
  currentExerciseName = "Push-ups",
}: { 
  elapsedTime: number; 
  isActive: boolean; 
  onPause: () => void; 
  onResume: () => void;
  totalTime?: number;
  currentExerciseName?: string;
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

  return (
    <View style={tw`items-center mb-8`}>
      <View style={tw`relative items-center justify-center`}>
        {/* Enhanced Glow Effect */}
        <Animated.View
          style={[
            tw`absolute w-64 h-64 rounded-full`,
            {
              backgroundColor: Palette.primary,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
              shadowColor: Palette.primary,
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
                  borderColor: Palette.primary,
                  borderTopColor: progressPercentage > 0 ? Palette.primary : 'transparent',
                  borderRightColor: progressPercentage > 25 ? Palette.primary : 'transparent',
                  borderBottomColor: progressPercentage > 50 ? Palette.primary : 'transparent',
                  borderLeftColor: progressPercentage > 75 ? Palette.primary : 'transparent',
                  transform: [{ rotate: '-90deg' }],
                  shadowColor: Palette.primary,
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
            <ThemedText variant="displayLarge" style={[tw`font-bold text-center`, { color: Palette.primary }]}>
              {formattedTime}
            </ThemedText>
            <ThemedText variant="titleMedium" style={[tw`font-semibold text-center mt-2`, { color: 'white' }]}>
              {currentExerciseName}
            </ThemedText>
            <ThemedText variant="bodySmall" style={tw`text-white/60 mt-1 text-center`}>
              {isActive ? 'Tap to pause' : 'Tap to resume'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ExerciseProgress({
  currentExercise,
  totalExercises,
  currentSet,
  totalSets,
  currentRep,
  totalReps,
}: {
  currentExercise: number;
  totalExercises: number;
  currentSet: number;
  totalSets: number;
  currentRep: number;
  totalReps: number;
}) {
  const progressPercentage = useMemo(() => 
    Math.round((currentExercise / totalExercises) * 100), 
    [currentExercise, totalExercises]
  );

  return (
    <View style={tw`mb-8`}>
      {/* Exercise Progress */}
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
      
      {/* Progress Bar */}
      <View
        style={[
          tw`h-2 rounded-full mb-6`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      >
        <View
          style={[
            tw`h-2 rounded-full`,
            { 
              backgroundColor: Palette.primary,
              width: `${progressPercentage}%`,
              shadowColor: Palette.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            },
          ]}
        />
      </View>

      {/* Set and Rep Progress */}
      <View style={tw`flex-row gap-4`}>
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
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <ThemedText variant="bodySmall" style={tw`text-white/70`}>
              Set
            </ThemedText>
          </View>
          <ThemedText variant="titleLarge" style={[tw`font-bold`, { color: Palette.primary }]}>
            {currentSet}/{totalSets}
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
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <ThemedText variant="bodySmall" style={tw`text-white/70`}>
              Rep
            </ThemedText>
          </View>
          <ThemedText variant="titleLarge" style={[tw`font-bold`, { color: Palette.primary }]}>
            {currentRep}/{totalReps}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function CurrentExercise({
  name,
  instructions,
  isRest = false,
  isCompleted = false,
}: {
  name: string;
  instructions: string;
  isRest?: boolean;
  isCompleted?: boolean;
}) {
  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle size={18} color={Palette.success} />;
    if (isRest) return <Clock size={18} color={Palette.secondary} />;
    return <AlertCircle size={18} color={Palette.primary} />;
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isRest) return 'Rest Period';
    return 'Current Exercise';
  };

  const getBackgroundColor = () => {
    if (isCompleted) return Palette.success;
    if (isRest) return Palette.warning;
    return Palette.tertiary;
  };

  return (
    <View
      style={[
        tw`rounded-3xl p-6 mb-8`,
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
      <View style={tw`flex-row items-center mb-3`}>
        <View
          style={[
            tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
            { backgroundColor: getBackgroundColor() },
          ]}
        >
          {getStatusIcon()}
        </View>
        <ThemedText variant="titleLarge" style={tw`text-white font-bold`}>
          {getStatusText()}
        </ThemedText>
      </View>
      <ThemedText 
        variant="titleMedium" 
        style={[
          tw`font-semibold mb-2`,
          { color: isCompleted ? 'rgba(255, 255, 255, 0.7)' : 'white' }
        ]}
      >
        {name}
      </ThemedText>
      <ThemedText 
        variant="bodyMedium" 
        style={[
          tw`text-white/70`,
          { opacity: isCompleted ? 0.6 : 1 }
        ]}
      >
        {instructions}
      </ThemedText>
    </View>
  );
}

function ExerciseNavigation({
  currentExercise,
  totalExercises,
  onPrevious,
  onNext,
}: {
  currentExercise: number;
  totalExercises: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const canGoPrevious = currentExercise > 1;
  const canGoNext = currentExercise < totalExercises;

  return (
    <View style={tw`flex-row gap-3`}>
      <TouchableOpacity
        style={[
          tw`flex-1 rounded-3xl py-4 px-6`,
          { 
            backgroundColor: Palette.tertiary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#3A3D41',
            opacity: canGoPrevious ? 1 : 0.5,
          },
        ]}
        onPress={onPrevious}
        disabled={!canGoPrevious}
        activeOpacity={0.7}
      >
        <View style={tw`flex-row items-center justify-center`}>
          <ChevronLeft size={18} color={Palette.primary} style={tw`mr-2`} />
          <ThemedText variant="bodyLarge" style={[tw`font-semibold`, { color: Palette.primary }]}>
            Previous
          </ThemedText>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          tw`flex-1 rounded-3xl py-4 px-6`,
          { 
            backgroundColor: Palette.primary,
            shadowColor: Palette.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 2,
            borderColor: '#FFE066',
            opacity: canGoNext ? 1 : 0.5,
          },
        ]}
        onPress={onNext}
        disabled={!canGoNext}
        activeOpacity={0.7}
      >
        <View style={tw`flex-row items-center justify-center`}>
          <ThemedText variant="bodyLarge" style={[tw`font-semibold`, { color: '#1A1D21' }]}>
            Next
          </ThemedText>
          <ChevronRight size={18} color="#1A1D21" style={tw`ml-2`} />
        </View>
      </TouchableOpacity>
    </View>
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
  const [currentExercise, setCurrentExercise] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isRest, setIsRest] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const totalExercises = 5;
  const totalSets = 3;
  const totalReps = 12;

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
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isWorkoutComplete]);

  const handlePause = useCallback(() => setIsActive(false), []);
  const handleResume = useCallback(() => setIsActive(true), []);

  const handleReset = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmReset = useCallback(() => {
    setElapsedTime(0);
    setCurrentExercise(1);
    setCurrentSet(1);
    setCurrentRep(0);
    setIsRest(false);
    setIsCompleted(false);
    setShowResetModal(false);
  }, []);

  const cancelReset = useCallback(() => {
    setShowResetModal(false);
  }, []);

  const handleEndWorkout = useCallback(() => {
    router.back();
  }, []);

  const handlePreviousExercise = useCallback(() => {
    if (currentExercise > 1) {
      setCurrentExercise(currentExercise - 1);
      setCurrentSet(1);
      setCurrentRep(0);
    }
  }, [currentExercise]);

  const handleNextExercise = useCallback(() => {
    if (currentExercise < totalExercises) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
      setCurrentRep(0);
    }
  }, [currentExercise, totalExercises]);

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
        instructions: "Take a 60-second break. Focus on your breathing and prepare for the next set.",
        isRest: true,
        isCompleted: false,
      };
    }

    const exercises = [
      "Push-ups",
      "Dumbbell Rows", 
      "Shoulder Press",
      "Tricep Dips",
      "Bicep Curls"
    ];

    const instructions = [
      "Keep your body in a straight line, lower your chest to the ground, then push back up.",
      "Keep your back straight, pull the dumbbell towards your hip, then lower with control.",
      "Press the dumbbells overhead while keeping your core engaged and back straight.",
      "Lower your body by bending your elbows, then push back up to the starting position.",
      "Curl the dumbbells towards your shoulders while keeping your elbows at your sides."
    ];

    return {
      name: exercises[currentExercise - 1] || "Exercise",
      instructions: instructions[currentExercise - 1] || "Perform the exercise with proper form.",
      isRest: false,
      isCompleted: false,
    };
  }, [currentExercise, isRest, isWorkoutComplete]);

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
        />

        {/* Exercise Progress */}
        {!isWorkoutComplete && (
          <ExerciseProgress
            currentExercise={currentExercise}
            totalExercises={totalExercises}
            currentSet={currentSet}
            totalSets={totalSets}
            currentRep={currentRep}
            totalReps={totalReps}
          />
        )}

        {/* Current Exercise */}
        <CurrentExercise
          name={getCurrentExerciseData.name}
          instructions={getCurrentExerciseData.instructions}
          isRest={getCurrentExerciseData.isRest}
          isCompleted={getCurrentExerciseData.isCompleted}
        />

        {/* Exercise Navigation */}
        {!isWorkoutComplete && !isRest && (
          <ExerciseNavigation
            currentExercise={currentExercise}
            totalExercises={totalExercises}
            onPrevious={handlePreviousExercise}
            onNext={handleNextExercise}
          />
        )}
      </View>

      {/* Reset Confirmation Modal */}
      <ConfirmResetModal
        visible={showResetModal}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </View>
  );
}


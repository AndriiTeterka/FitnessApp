export type WorkoutPlan = {
  id: string;
  name: string;
  duration: string; // e.g., "35 min"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string; // e.g., "Upper Body"
  equipment?: string; // e.g., "Bodyweight" or "Dumbbells"
  restSeconds: number; // rest used for main exercises (between sets/exercises)
  warmup: Array<{ name: string; durationSec: number }>;
  main: Array<{ name: string; sets: number; reps: number }>;
  cooldown: Array<{ name: string; durationSec: number }>;
};

const upperBodyPower: WorkoutPlan = {
  id: 'upper-body-power',
  name: 'Upper Body Power',
  duration: '35 min',
  difficulty: 'Intermediate',
  focus: 'Upper Body',
  equipment: 'Bodyweight + Dumbbells',
  restSeconds: 60,
  warmup: [
    { name: 'Arm Circles', durationSec: 30 },
    { name: 'Shoulder Rolls', durationSec: 30 },
  ],
  main: [
    { name: 'Push-ups', sets: 3, reps: 12 },
    { name: 'Dumbbell Rows', sets: 3, reps: 12 },
    { name: 'Shoulder Press', sets: 3, reps: 12 },
    { name: 'Tricep Dips', sets: 3, reps: 12 },
    { name: 'Bicep Curls', sets: 3, reps: 12 },
  ],
  cooldown: [
    { name: 'Stretching', durationSec: 60 },
    { name: 'Deep Breathing', durationSec: 30 },
  ],
};

const morningStrength: WorkoutPlan = {
  id: 'morning-strength',
  name: 'Morning Strength',
  duration: '45 min',
  difficulty: 'Intermediate',
  focus: 'Full Body',
  equipment: 'Bodyweight + Dumbbells',
  restSeconds: 60,
  warmup: [
    { name: 'Jumping Jacks', durationSec: 45 },
    { name: 'Hip Circles', durationSec: 30 },
  ],
  main: [
    { name: 'Squats', sets: 3, reps: 12 },
    { name: 'Push-ups', sets: 3, reps: 10 },
    { name: 'Bent-over Rows', sets: 3, reps: 12 },
    { name: 'Lunges', sets: 3, reps: 12 },
  ],
  cooldown: [
    { name: 'Forward Fold', durationSec: 45 },
    { name: 'Thoracic Twist', durationSec: 30 },
  ],
};

export const workouts: Record<string, WorkoutPlan> = {
  [upperBodyPower.id]: upperBodyPower,
  [morningStrength.id]: morningStrength,
};

export function getWorkout(id?: string): WorkoutPlan {
  if (id && workouts[id]) return workouts[id];
  // Fallback to upper body if unknown
  return upperBodyPower;
}


export type RecentWorkoutItem = {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: number;
  status: 'completed' | 'paused';
};

// Shared source of truth for the Recent tab and Home screen
export const recentWorkouts: RecentWorkoutItem[] = [
  {
    id: 'full-body-hiit',
    name: 'Full Body HIIT',
    duration: '25 min',
    difficulty: 'Advanced',
    exercises: 10,
    status: 'completed',
  },
  {
    id: 'core-focus',
    name: 'Core Focus',
    duration: '15 min',
    difficulty: 'Beginner',
    exercises: 5,
    status: 'completed',
  },
  {
    id: 'upper-body-power',
    name: 'Upper Body Power',
    duration: '35 min',
    difficulty: 'Intermediate',
    exercises: 9,
    status: 'paused',
  },
];


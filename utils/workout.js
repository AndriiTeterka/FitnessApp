/**
 * Utility functions for workout navigation logic.
 */

/**
 * Determine the status of an exercise in the list.
 * @param {number} exerciseId
 * @param {number} currentExercise
 * @param {boolean} isRest
 * @param {number} nextExercise
 * @param {number[]} skippedExercises
 * @returns {"skipped"|"completed"|"current"|"next"|"upcoming"}
 */
function getExerciseStatus(exerciseId, currentExercise, isRest, nextExercise, skippedExercises) {
  if (skippedExercises.includes(exerciseId)) return 'skipped';
  if (exerciseId < currentExercise) return 'completed';
  if (exerciseId === currentExercise) return 'current';
  if (isRest && exerciseId === nextExercise) return 'next';
  return 'upcoming';
}

/**
 * Return the number of sets for a given exercise.
 * Warmup (1-2) and cooldown (8+) exercises have only one set.
 * @param {number} exerciseId
 * @param {number} defaultSets
 * @returns {number}
 */
function getExerciseSets(exerciseId, defaultSets) {
  return exerciseId <= 2 || exerciseId >= 8 ? 1 : defaultSets;
}

/**
 * Determine whether the complete set button should be shown.
 * @param {number} exerciseId
 * @param {number} currentExercise
 * @param {boolean} isRest
 * @returns {boolean}
 */
function shouldShowCompleteSetButton(exerciseId, currentExercise, isRest) {
  return exerciseId === currentExercise && !isRest;
}

module.exports = {
  getExerciseStatus,
  getExerciseSets,
  shouldShowCompleteSetButton,
};

const test = require('node:test');
const assert = require('node:assert');
const { getExerciseStatus, getExerciseSets, shouldShowCompleteSetButton } = require('./workout');

test('getExerciseStatus covers all status cases', () => {
  assert.strictEqual(getExerciseStatus(1, 2, false, 3, []), 'completed');
  assert.strictEqual(getExerciseStatus(2, 2, false, 3, []), 'current');
  assert.strictEqual(getExerciseStatus(3, 2, true, 3, []), 'next');
  assert.strictEqual(getExerciseStatus(4, 2, false, 3, [4]), 'skipped');
  assert.strictEqual(getExerciseStatus(5, 2, false, 3, []), 'upcoming');
});

test('getExerciseSets differentiates sections', () => {
  assert.strictEqual(getExerciseSets(1, 3), 1); // warmup
  assert.strictEqual(getExerciseSets(3, 3), 3); // main
  assert.strictEqual(getExerciseSets(8, 3), 1); // cooldown
});

test('shouldShowCompleteSetButton when current and not resting', () => {
  assert.strictEqual(shouldShowCompleteSetButton(1, 1, false), true);
  assert.strictEqual(shouldShowCompleteSetButton(1, 1, true), false);
  assert.strictEqual(shouldShowCompleteSetButton(2, 1, false), false);
});

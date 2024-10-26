import { workoutPlan } from './WorkoutPlan';

const skipTask = (dayIndex, taskIndex) => {
  const taskToSkip = workoutPlan[dayIndex].tasks[taskIndex];
  workoutPlan[dayIndex].tasks = workoutPlan[dayIndex].tasks.filter((_, i) => i !== taskIndex);
  if (workoutPlan[dayIndex + 1]) {
    workoutPlan[dayIndex + 1].tasks.unshift(taskToSkip);
  }
};

export default skipTask;


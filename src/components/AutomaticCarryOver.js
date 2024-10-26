import { workoutPlan } from './WorkoutPlan';

const carryOverTasks = (dayIndex) => {
  const incompleteTasks = workoutPlan[dayIndex].tasks.filter(task => !task.isComplete);
  if (incompleteTasks.length > 0 && workoutPlan[dayIndex + 1]) {
    workoutPlan[dayIndex + 1].tasks = [...incompleteTasks, ...workoutPlan[dayIndex + 1].tasks];
  }
};

export default carryOverTasks;


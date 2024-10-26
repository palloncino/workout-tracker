import React from 'react';
import { workoutPlan } from './WorkoutPlan';

const DailyPreview = ({ day }) => {
  const nextDayTasks = workoutPlan[day + 1] ? workoutPlan[day + 1].tasks : [];
  return (
    <div>
      <h3>Preview for {workoutPlan[day + 1]?.day}</h3>
      {nextDayTasks.map((task, index) => (
        <div key={index}>{task.name}</div>
      ))}
    </div>
  );
};

export default DailyPreview;


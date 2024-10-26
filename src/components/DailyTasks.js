import React from 'react';
import { workoutPlan } from './WorkoutPlan';

const DailyTasks = ({ day }) => {
  const tasks = workoutPlan.find(d => d.day === day)?.tasks || [];

  return (
    <div>
      <h2>Tasks for {day}</h2>
      {tasks.map((task, index) => (
        <div key={index}>
          <input type="checkbox" readOnly />
          {task}
        </div>
      ))}
    </div>
  );
};

export default DailyTasks;

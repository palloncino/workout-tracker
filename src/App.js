import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const workoutPlan = [
  { day: "Sunday", tasks: [{ name: "Running", isComplete: false }, { name: "Stretching", isComplete: false }] },
  { day: "Monday", tasks: [{ name: "Push-ups", isComplete: false }, { name: "Shoulder Press", isComplete: false }] },
  { day: "Tuesday", tasks: [{ name: "Pull-ups", isComplete: false }, { name: "Barbell Shrugs", isComplete: false }] },
  { day: "Wednesday", tasks: [{ name: "Bouncing Squats", isComplete: false }, { name: "Leg Press", isComplete: false }] },
  { day: "Thursday", tasks: [{ name: "Rest Day", isComplete: true }] },
  { day: "Friday", tasks: [{ name: "Dips", isComplete: false }, { name: "Chest Fly", isComplete: false }] },
  { day: "Saturday", tasks: [{ name: "Hanging Leg Raises", isComplete: false }, { name: "Forearm Curls", isComplete: false }] },
];

function App() {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const [tasks, setTasks] = useState(workoutPlan[currentDayIndex].tasks);
  const [dayIndex, setDayIndex] = useState(currentDayIndex);

  useEffect(() => {
    setTasks(workoutPlan[dayIndex].tasks);
  }, [dayIndex]);

  const toggleTaskCompletion = (taskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].isComplete = !newTasks[taskIndex].isComplete;
    setTasks(newTasks);
  };

  const carryOverIncompleteTasks = () => {
    const incompleteTasks = tasks.filter(task => !task.isComplete);
    if (dayIndex < daysOfWeek.length - 1) {
      workoutPlan[dayIndex + 1].tasks = [...incompleteTasks, ...workoutPlan[dayIndex + 1].tasks];
      setDayIndex(dayIndex + 1);
    }
  };

  const skipTask = (taskIndex) => {
    const taskToSkip = tasks[taskIndex];
    setTasks(tasks.filter((_, index) => index !== taskIndex));
    if (dayIndex < daysOfWeek.length - 1) {
      workoutPlan[dayIndex + 1].tasks.unshift(taskToSkip);
    }
  };

  return (
    <Router>
      <div className="App min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg">
          <h1 className="text-xl font-semibold text-center mb-4">Workout Tracker</h1>
          <nav className="flex justify-around mb-6">
            {daysOfWeek.map((day, index) => (
              <Link
                key={day}
                to={`/${day}`}
                onClick={() => setDayIndex(index)}
                className={`text-sm font-medium ${dayIndex === index ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {day}
              </Link>
            ))}
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            {daysOfWeek.map((day, index) => (
              <Route
                key={day}
                path={`/${day}`}
                element={
                  <DayView
                    day={day}
                    tasks={tasks}
                    toggleTaskCompletion={toggleTaskCompletion}
                    carryOverIncompleteTasks={carryOverIncompleteTasks}
                    skipTask={skipTask}
                    nextDayTasks={workoutPlan[index + 1]?.tasks || []}
                  />
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="text-center">
    <p className="text-lg">Select a day to view tasks.</p>
  </div>
);

const DayView = ({ day, tasks, toggleTaskCompletion, carryOverIncompleteTasks, skipTask, nextDayTasks }) => (
  <div>
    <h2 className="text-lg font-medium mb-2">Tasks for {day}</h2>
    {tasks.map((task, index) => (
      <div key={index} className="flex items-center justify-between mb-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={task.isComplete}
            onChange={() => toggleTaskCompletion(index)}
            className="mr-2"
          />
          <span className={task.isComplete ? "line-through text-gray-400" : ""}>{task.name}</span>
        </label>
        {!task.isComplete && (
          <button onClick={() => skipTask(index)} className="text-xs text-red-500">Skip</button>
        )}
      </div>
    ))}
    <button onClick={carryOverIncompleteTasks} className="w-full mt-4 p-2 bg-blue-500 text-white rounded-md">
      Complete Day
    </button>

    {nextDayTasks.length > 0 && (
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-2">Preview of Next Day’s Tasks</h3>
        {nextDayTasks.map((task, index) => (
          <div key={index} className="text-sm text-gray-600">{task.name}</div>
        ))}
      </div>
    )}
  </div>
);

export default App;

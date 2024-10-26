import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const workoutPlan = [
  { label: "Upper Body Push", tasks: ["Dips", "Push-ups", "Shoulder Press", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
  { label: "Legs", tasks: ["Bouncing Squats", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
  { label: "Pull Day", tasks: ["Pull-ups", "Barbell Shrugs", "Running"] },
  { label: "Forearms, Core, and Neck", tasks: ["Wrist Curls", "Reverse Curls", "Leg Raises", "Neck Exercises", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
];

function App() {
  const today = new Date();
  const currentDayIndex = today.getDay();
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
  const [tasksState, setTasksState] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasksState'));
    return savedTasks || workoutPlan.map((plan) =>
      plan.tasks.map(() => ({ isComplete: false, isSkipped: false }))
    );
  });

  useEffect(() => {
    localStorage.setItem('tasksState', JSON.stringify(tasksState));
  }, [tasksState]);

  const toggleTaskCompletion = (dayIndex, taskIndex) => {
    const newTasksState = [...tasksState];
    newTasksState[dayIndex][taskIndex].isComplete = !newTasksState[dayIndex][taskIndex].isComplete;
    setTasksState(newTasksState);
  };

  const toggleSkipTask = (dayIndex, taskIndex) => {
    const newTasksState = [...tasksState];
    newTasksState[dayIndex][taskIndex].isSkipped = !newTasksState[dayIndex][taskIndex].isSkipped;
    setTasksState(newTasksState);
  };

  return (
    <Router>
      <div className="App min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-lg p-4 bg-white shadow-md rounded-lg">
          <h1 className="text-xl font-semibold text-center mb-4">Workout Tracker</h1>

          {/* Swiper Carousel */}
          <Swiper
            spaceBetween={10}
            slidesPerView={1.2}
            centeredSlides
            initialSlide={currentDayIndex}
            onSlideChange={(swiper) => setSelectedDayIndex(swiper.activeIndex)}
          >
            {workoutPlan.map((plan, index) => {
              const date = addDays(today, index - currentDayIndex);
              const dayName = format(date, 'EEEE');
              const formattedDate = format(date, 'dd MMMM yyyy');
              return (
                <SwiperSlide key={index}>
                  <Link to={`/${index}`} className="block">
                    <div
                      className={`border p-3 rounded-lg ${
                        selectedDayIndex === index ? 'border-blue-500' : 'border-gray-200'
                      } bg-gray-50 text-center`}
                    >
                      <p className="text-xs text-gray-400 mb-1">{formattedDate}</p>
                      <p className="text-sm font-bold text-gray-800">{dayName}</p>
                      <p className="text-sm text-blue-600 mb-1">{plan.label}</p>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <Routes>
            <Route path="/" element={<Home />} />
            {workoutPlan.map((plan, dayIndex) => (
              <Route
                key={dayIndex}
                path={`/${dayIndex}`}
                element={
                  <DayView
                    dayIndex={dayIndex}
                    dayLabel={format(addDays(today, dayIndex - currentDayIndex), 'EEEE')}
                    date={format(addDays(today, dayIndex - currentDayIndex), 'dd MMMM yyyy')}
                    tasks={plan.tasks}
                    tasksState={tasksState[dayIndex]}
                    toggleTaskCompletion={toggleTaskCompletion}
                    toggleSkipTask={toggleSkipTask}
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

const DayView = ({ dayIndex, dayLabel, date, tasks, tasksState, toggleTaskCompletion, toggleSkipTask }) => (
  <div className="p-4">
    <h2 className="text-lg font-semibold mb-2">{dayLabel}</h2>
    <p className="text-xs text-gray-400 mb-4">{date}</p>
    <h3 className="text-sm text-blue-600 font-medium mb-2">Tasks for Today</h3>
    {tasks.map((task, taskIndex) => (
      <div key={taskIndex} className="flex items-center justify-between mb-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={tasksState[taskIndex]?.isComplete || false}
            onChange={() => toggleTaskCompletion(dayIndex, taskIndex)}
            className="mr-2"
          />
          <span
            className={`${tasksState[taskIndex]?.isComplete ? "line-through text-gray-400" : ""} ${
              tasksState[taskIndex]?.isSkipped ? "text-gray-500 italic" : ""
            }`}
          >
            {task}
          </span>
        </label>
        <button
          onClick={() => toggleSkipTask(dayIndex, taskIndex)}
          className={`text-xs ${tasksState[taskIndex]?.isSkipped ? "text-gray-400" : "text-red-500"}`}
        >
          {tasksState[taskIndex]?.isSkipped ? "Unskip" : "Skip"}
        </button>
      </div>
    ))}
  </div>
);

export default App;

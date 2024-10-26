import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const timezone = 'Europe/Rome';
const daysBeforeAndAfter = 7;

const baseWorkoutPlan = [
  { label: "Upper Body Push", tasks: ["Dips", "Push-ups", "Shoulder Press", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
  { label: "Legs", tasks: ["Bouncing Squats", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
  { label: "Pull Day", tasks: ["Pull-ups", "Barbell Shrugs", "Running"] },
  { label: "Forearms, Core, and Neck", tasks: ["Wrist Curls", "Reverse Curls", "Leg Raises", "Neck Exercises", "Running"] },
  { label: "Rest or Light Activity", tasks: ["Running"] },
];

function App() {
  const today = toZonedTime(new Date(), timezone);
  const currentDayIndex = daysBeforeAndAfter;

  // Calculate offset to set Monday as "Upper Body Push"
  const calculateMondayOffset = () => {
    const todayIndex = today.getDay();
    return (1 - todayIndex + 7) % 7;
  };

  const getAdjustedWorkoutPlan = () => {
    const offset = calculateMondayOffset();
    return [
      ...baseWorkoutPlan.slice(offset),
      ...baseWorkoutPlan.slice(0, offset),
    ];
  };

  // Initialize tasks with local storage data or create a new state for 14 days
  const initializeTasksState = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasksState')) || {};
    const adjustedWorkoutPlan = getAdjustedWorkoutPlan();
    const initializedTasks = {};

    for (let i = -daysBeforeAndAfter; i <= daysBeforeAndAfter; i++) {
      const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
      const planIndex = (i + adjustedWorkoutPlan.length) % adjustedWorkoutPlan.length;
      initializedTasks[dateKey] = savedTasks[dateKey] || adjustedWorkoutPlan[planIndex].tasks.map(() => ({
        isComplete: false,
        isSkipped: false,
      }));
    }

    return initializedTasks;
  };

  const [workoutPlan, setWorkoutPlan] = useState(getAdjustedWorkoutPlan);
  const [tasksState, setTasksState] = useState(initializeTasksState);
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
  const swiperInstance = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasksState', JSON.stringify(tasksState));
  }, [tasksState]);

  const resetWorkoutPlan = () => {
    const newWorkoutPlan = getAdjustedWorkoutPlan();
    setWorkoutPlan(newWorkoutPlan);
    setTasksState(initializeTasksState());
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const toggleTaskCompletion = (dayKey, taskIndex) => {
    if (navigator.vibrate) navigator.vibrate(30);
    const updatedTasks = { ...tasksState };
    updatedTasks[dayKey][taskIndex].isComplete = !updatedTasks[dayKey][taskIndex].isComplete;
    setTasksState(updatedTasks);
  };

  const toggleSkipTask = (dayKey, taskIndex) => {
    if (navigator.vibrate) navigator.vibrate(30);
    const updatedTasks = { ...tasksState };
    updatedTasks[dayKey][taskIndex].isSkipped = !updatedTasks[dayKey][taskIndex].isSkipped;
    setTasksState(updatedTasks);
  };

  const goToCurrentDay = () => {
    if (swiperInstance.current) {
      swiperInstance.current.slideTo(currentDayIndex, 300);
      setSelectedDayIndex(currentDayIndex);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  return (
    <Router>
      <div className="App h-screen w-screen fixed flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg h-full overflow-y-auto">
          <h1 className="text-2xl font-semibold text-center mb-6">Workout Tracker</h1>

          {/* Buttons */}
          <div className="flex space-x-4 mb-6">
            <button onClick={goToCurrentDay} className="flex-grow text-blue-500 text-lg py-2 border rounded-lg">
              Go to Today
            </button>
            <button onClick={resetWorkoutPlan} className="flex-grow text-red-500 text-lg py-2 border rounded-lg">
              Reset to Monday Start
            </button>
          </div>

          {/* Swiper Carousel */}
          <Swiper
            spaceBetween={10}
            slidesPerView="auto"
            centeredSlides
            initialSlide={currentDayIndex}
            onSlideChange={(swiper) => {
              setSelectedDayIndex(swiper.activeIndex);
              if (navigator.vibrate) navigator.vibrate(30);
            }}
            onSwiper={(swiper) => (swiperInstance.current = swiper)}
          >
            {[...Array(2 * daysBeforeAndAfter + 1)].map((_, index) => {
              const offset = index - daysBeforeAndAfter;
              const date = addDays(today, offset);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayName = format(date, 'EEEE');
              const formattedDate = format(date, 'dd MMMM yyyy');
              const plan = workoutPlan[(offset + workoutPlan.length) % workoutPlan.length];

              return (
                <SwiperSlide key={dateKey} style={{ width: 'auto' }}>
                  <Link to={`/${dateKey}`} className="block">
                    <div
                      className={`border p-4 rounded-lg ${
                        selectedDayIndex === index ? 'border-blue-500' : 'border-gray-200'
                      } bg-gray-50 text-center`}
                    >
                      <p className="text-xs text-gray-400 mb-1">{formattedDate}</p>
                      <p className="text-sm font-bold text-gray-800">{dayName}</p>
                      <p className="text-base text-blue-600 mb-1">{plan.label}</p>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Routes and Day View */}
          <Routes>
            <Route path="/" element={<Home />} />
            {[...Array(2 * daysBeforeAndAfter + 1)].map((_, offsetIndex) => {
              const offset = offsetIndex - daysBeforeAndAfter;
              const dateKey = format(addDays(today, offset), 'yyyy-MM-dd');
              const plan = workoutPlan[(offset + workoutPlan.length) % workoutPlan.length];
              return (
                <Route
                  key={dateKey}
                  path={`/${dateKey}`}
                  element={
                    <DayView
                      dayLabel={format(addDays(today, offset), 'EEEE')}
                      date={format(addDays(today, offset), 'dd MMMM yyyy')}
                      tasks={plan.tasks}
                      tasksState={tasksState[dateKey]}
                      toggleTaskCompletion={(taskIndex) => toggleTaskCompletion(dateKey, taskIndex)}
                      toggleSkipTask={(taskIndex) => toggleSkipTask(dateKey, taskIndex)}
                    />
                  }
                />
              );
            })}
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

const DayView = ({ dayLabel, date, tasks, tasksState, toggleTaskCompletion, toggleSkipTask }) => (
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-3">{dayLabel}</h2>
    <p className="text-sm text-gray-400 mb-4">{date}</p>
    <h3 className="text-lg text-blue-600 font-medium mb-4">Tasks for Today</h3>
    {tasks.map((task, taskIndex) => (
      <div key={taskIndex} className="flex items-center justify-between mb-3 py-2 px-4 border rounded-lg bg-white">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={tasksState[taskIndex]?.isComplete || false}
            onChange={() => toggleTaskCompletion(taskIndex)}
            className="mr-2 h-6 w-6"
          />
          <span
            className={`text-lg ${
              tasksState[taskIndex]?.isComplete ? "line-through text-gray-400" : ""
            } ${tasksState[taskIndex]?.isSkipped ? "text-gray-500 italic" : ""}`}
          >
            {task}
          </span>
        </label>
        <button
          onClick={() => toggleSkipTask(taskIndex)}
          className={`text-base ${tasksState[taskIndex]?.isSkipped ? "text-gray-400" : "text-red-500"}`}
        >
          {tasksState[taskIndex]?.isSkipped ? "Unskip" : "Skip"}
        </button>
      </div>
    ))}
    {tasksState.every(task => task.isComplete) && (
      <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
        <h3 className="text-xl font-bold">Day Complete!</h3>
        <p className="text-lg">Well done on completing your tasks for {dayLabel}!</p>
      </div>
    )}
  </div>
);

export default App;

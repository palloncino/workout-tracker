import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const timezone = 'Europe/Rome';
const daysBeforeAndAfter = 7;
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
  const today = toZonedTime(new Date(), timezone);
  const currentDayIndex = daysBeforeAndAfter; // This is the center day in our 14-day view

  const getPlanForOffset = (offset) => {
    // Ensure we use a valid index in workoutPlan
    const normalizedIndex = ((offset % workoutPlan.length) + workoutPlan.length) % workoutPlan.length;
    return workoutPlan[normalizedIndex];
  };

  const initializeTasksState = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasksState')) || {};
    const initializedTasks = {};
    for (let i = -daysBeforeAndAfter; i <= daysBeforeAndAfter; i++) {
      const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
      initializedTasks[dateKey] = savedTasks[dateKey] || getPlanForOffset(i).tasks.map(() => ({
        isComplete: false,
        isSkipped: false,
      }));
    }
    return initializedTasks;
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayIndex);
  const swiperInstance = useRef(null);
  const [tasksState, setTasksState] = useState(initializeTasksState);

  // Update local storage whenever tasksState changes
  useEffect(() => {
    localStorage.setItem('tasksState', JSON.stringify(tasksState));
  }, [tasksState]);

  // "Cron job" function to reset data daily and keep only recent 14 days
  useEffect(() => {
    const lastResetDate = localStorage.getItem('lastResetDate');
    const todayDate = format(today, 'yyyy-MM-dd');
    if (lastResetDate !== todayDate) {
      const updatedTasks = {};
      for (let i = -daysBeforeAndAfter; i <= daysBeforeAndAfter; i++) {
        const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
        updatedTasks[dateKey] = tasksState[dateKey] || getPlanForOffset(i).tasks.map(() => ({
          isComplete: false,
          isSkipped: false,
        }));
      }
      setTasksState(updatedTasks);
      localStorage.setItem('lastResetDate', todayDate);
    }
  }, [tasksState, today]);

  const toggleTaskCompletion = (dayKey, taskIndex) => {
    const updatedTasks = { ...tasksState };
    updatedTasks[dayKey][taskIndex].isComplete = !updatedTasks[dayKey][taskIndex].isComplete;
    setTasksState(updatedTasks);
  };

  const toggleSkipTask = (dayKey, taskIndex) => {
    const updatedTasks = { ...tasksState };
    updatedTasks[dayKey][taskIndex].isSkipped = !updatedTasks[dayKey][taskIndex].isSkipped;
    setTasksState(updatedTasks);
  };

  const goToCurrentDay = () => {
    if (swiperInstance.current) {
      swiperInstance.current.slideTo(currentDayIndex, 300);
      setSelectedDayIndex(currentDayIndex);
    }
  };

  return (
    <Router>
      <div className="App min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-lg p-4 bg-white shadow-md rounded-lg">
          <h1 className="text-xl font-semibold text-center mb-4">Workout Tracker</h1>

          {/* Go to Current Day Button */}
          <button onClick={goToCurrentDay} className="text-blue-500 text-sm mb-4">
            Go to Current Day
          </button>

          {/* Swiper Carousel for Days Before, Current, and After */}
          <Swiper
            spaceBetween={10}
            slidesPerView="auto"
            centeredSlides
            initialSlide={currentDayIndex}
            onSlideChange={(swiper) => setSelectedDayIndex(swiper.activeIndex)}
            onSwiper={(swiper) => (swiperInstance.current = swiper)}
          >
            {[...Array(2 * daysBeforeAndAfter + 1)].map((_, index) => {
              const offset = index - daysBeforeAndAfter;
              const date = addDays(today, offset);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayName = format(date, 'EEEE');
              const formattedDate = format(date, 'dd MMMM yyyy');
              const plan = getPlanForOffset(offset);

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
                      <p className="text-sm text-blue-600 mb-1">{plan.label}</p>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Next Day Preview */}
          {selectedDayIndex < 2 * daysBeforeAndAfter && (
            <div className="mt-4 p-3 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-blue-600">Next Day Preview</h3>
              <p className="text-xs text-gray-400">
                {format(addDays(today, selectedDayIndex - daysBeforeAndAfter + 1), 'dd MMMM yyyy')}
              </p>
              <p className="text-sm font-bold text-gray-800">
                {format(addDays(today, selectedDayIndex - daysBeforeAndAfter + 1), 'EEEE')}
              </p>
              <ul className="text-sm text-gray-600 mt-2">
                {getPlanForOffset(selectedDayIndex - daysBeforeAndAfter + 1).tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Home />} />
            {[...Array(2 * daysBeforeAndAfter + 1)].map((_, offsetIndex) => {
              const offset = offsetIndex - daysBeforeAndAfter;
              const dateKey = format(addDays(today, offset), 'yyyy-MM-dd');
              const plan = getPlanForOffset(offset);
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
    <h2 className="text-lg font-semibold mb-2">{dayLabel}</h2>
    <p className="text-xs text-gray-400 mb-4">{date}</p>
    <h3 className="text-sm text-blue-600 font-medium mb-2">Tasks for Today</h3>
    {tasks.map((task, taskIndex) => (
      <div key={taskIndex} className="flex items-center justify-between mb-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={tasksState[taskIndex]?.isComplete || false}
            onChange={() => toggleTaskCompletion(taskIndex)}
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
          onClick={() => toggleSkipTask(taskIndex)}
          className={`text-xs ${tasksState[taskIndex]?.isSkipped ? "text-gray-400" : "text-red-500"}`}
        >
          {tasksState[taskIndex]?.isSkipped ? "Unskip" : "Skip"}
        </button>
      </div>
    ))}
    {tasksState.every(task => task.isComplete) && (
      <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
        <h3 className="text-lg font-bold">Day Complete!</h3>
        <p className="text-sm">Well done on completing your tasks for {dayLabel}!</p>
      </div>
    )}
  </div>
);

export default App;

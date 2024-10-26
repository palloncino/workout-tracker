import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DailyTasks from './components/DailyTasks';
import DailyPreview from './components/DailyPreview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/tasks" element={<DailyTasks />} />
          <Route path="/preview" element={<DailyPreview />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => (
  <div>
    <h1>Welcome to the Workout Tracker</h1>
  </div>
);

export default App;

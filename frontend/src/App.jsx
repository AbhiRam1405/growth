import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ManageTasks from './pages/ManageTasks';
import Analytics from './pages/Analytics';
import TaskHistory from './pages/TaskHistory';
import LearningHistory from './pages/LearningHistory';
import ExamNotes from './pages/ExamNotes';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<ManageTasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<TaskHistory />} />
            <Route path="/learning-log" element={<LearningHistory />} />
            <Route path="/exam-notes" element={<ExamNotes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

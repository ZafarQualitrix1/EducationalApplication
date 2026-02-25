import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './HomePage/HomePage';
import LoginPage from './LoginPage/LoginPage';
import SignUp from './LoginPage/SignUp';
import AdminLoginPage from './LoginPage/AdminLoginPage';
import MentorLoginPage from './LoginPage/MentorLoginPage';
import Dashboard from './HomePage/Dashboard';
import ProfilePage from './HomePage/ProfilePage';
import SettingsPage from './HomePage/SettingsPage';
import MyCoursesPage from './HomePage/MyCoursesPage';
import LogoutPage from './HomePage/LogoutPage';
import MentorPage from './components/MentorPage';
import AdminPage from './components/AdminPage';
import StudentPage from './components/StudentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/mentor-login" element={<MentorLoginPage />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/mentors" element={<MentorPage />} />
        <Route path="/mentor/:mentorId" element={<MentorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:adminId" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/student/:studentId" element={<StudentPage />} />
        <Route path="/mentor-dashboard/:mentorId" element={<MentorPage />} />
      </Routes>
    </Router>
  );
}

export default App;

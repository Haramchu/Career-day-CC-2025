import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CareerDayProvider } from './contexts/CareerDayContext';
import Home from './pages/Home';
import DatabaseTest from './components/DatabaseTest';
import './App.css';
import SessionPage from './pages/Session';
import Login from './pages/Login';
import MyTalks from './pages/MyTalks';
import ChangePassword from './pages/ChangePassword';
import TeacherAdmin from './pages/TeacherAdmin';
import TeacherLoginDebug from './components/TeacherLoginDebug';

function App() {
  return (
    <CareerDayProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test-db" element={<DatabaseTest />} />
            <Route path="/sessions" element={<SessionPage />} />
            <Route path="/my-talks" element={<MyTalks />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<TeacherAdmin />} />
            <Route path="/debug-admin" element={<TeacherLoginDebug />} />
          </Routes>
        </div>
      </Router>
    </CareerDayProvider>
  );
}

export default App;
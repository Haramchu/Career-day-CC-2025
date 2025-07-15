import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Form from './pages/Form';
import './App.css';
import SessionPage from './pages/Session';
import Login from './pages/Login';
import MyTalks from './pages/MyTalks';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/enroll" element={<Form />} />
          <Route path="/sessions" element={<SessionPage />} />
          <Route path="/my-talks" element={<MyTalks />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CareerDayProvider } from './contexts/CareerDayContext';
import Home from './pages/Home';
import Form from './pages/Form';
import DatabaseTest from './components/DatabaseTest';
import './App.css';

function App() {
  return (
    <CareerDayProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/enroll" element={<Form />} />
            <Route path="/test-db" element={<DatabaseTest />} />
          </Routes>
        </div>
      </Router>
    </CareerDayProvider>
  );
}

export default App;
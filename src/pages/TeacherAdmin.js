import React, { useState, useEffect } from 'react';
import TeacherLogin from '../components/TeacherLogin';
import AdminPanel from '../components/AdminPanel';

const TeacherAdmin = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if teacher is already logged in
    const savedTeacher = localStorage.getItem('teacher_session');
    if (savedTeacher) {
      try {
        setTeacher(JSON.parse(savedTeacher));
      } catch (error) {
        console.error('Error parsing saved teacher session:', error);
        localStorage.removeItem('teacher_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (teacherData) => {
    setTeacher(teacherData);
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_session');
    setTeacher(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teacher) {
    return <TeacherLogin onLogin={handleLogin} />;
  }

  return <AdminPanel teacher={teacher} onLogout={handleLogout} />;
};

export default TeacherAdmin;

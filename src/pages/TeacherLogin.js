import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ccLogo from '../assets/cc.png';

const TeacherLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting teacher login with:', { email: formData.email }); // Debug log
      
      const { data, error } = await supabase
        .rpc('teacher_login', {
          teacher_email: formData.email,
          teacher_password: formData.password
        });

      console.log('Supabase RPC response:', { data, error }); // Debug log

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      // Handle both string and object responses
      let response;
      if (typeof data === 'string') {
        try {
          response = JSON.parse(data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid response format from server');
        }
      } else {
        response = data;
      }

      console.log('Parsed response:', response); // Debug log

      if (response && response.success) {
        localStorage.setItem('teacher_session', JSON.stringify(response.teacher));
        onLogin(response.teacher);
      } else {
        const errorMessage = response?.error || 'Login gagal - response tidak valid';
        console.error('Login failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Terjadi kesalahan saat login';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      if (error.code) {
        errorMessage += ' (Code: ' + error.code + ')';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src={ccLogo} alt="Canisius College Jakarta" className="mx-auto mb-3 w-16 h-16 object-contain" />
          <h1 className="text-white text-3xl font-bold">Canisius College Jakarta</h1>
          <p className="text-yellow-400 font-semibold text-lg mt-1">Teacher Admin Login</p>
          <p className="mt-3 text-white/80 text-sm">Masuk untuk mengakses data siswa</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" required placeholder="your.email@example.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300" />
          </div>
          <div>
            <label htmlFor="password" className="block text-white text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" required placeholder="Enter your password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300" />
          </div>
          {error && <div className="bg-red-500/20 border border-red-400/50 rounded-lg px-4 py-3 text-red-100 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:scale-105 hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherLogin;

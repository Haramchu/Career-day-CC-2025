import React from 'react';
import { Link } from 'react-router-dom';
import ccLogo from '../assets/cc.png';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) navigate('/login');
  //   };
  //   checkAuth();
  // }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      <Navbar />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center">
          {/* Logo and Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={ccLogo}
              alt="Canisius College Jakarta"
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Canisius College Jakarta
            </h1>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Career Day 2025
              </h2>
            </div>
          </div>
          <div className="backdrop-blur-sm bg-white/20 rounded-2xl shadow-2xl p-8 mb-12 max-w-4xl mx-auto border border-white/30">
            <p className="text-xl text-white mb-8 leading-relaxed">
              Join us for an exciting career exploration event where students can discover
              various career paths, meet industry professionals, and gain valuable insights
              about their future careers.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                <span className="mr-3">📅</span>
                Event Details
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-white">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">📍</div>
                  <div className="font-semibold mb-1">Location</div>
                  <div className="text-sm opacity-90">Canisius College Jakarta Campus</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="font-semibold mb-1">Date</div>
                  <div className="text-sm opacity-90">Coming Soon</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">⏰</div>
                  <div className="font-semibold mb-1">Time</div>
                  <div className="text-sm opacity-90">9:00 AM - 3:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
              <span className="mr-3">✨</span>
              What to Expect
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20 h-full">
                  <div className="text-4xl mb-4 text-center">🏢</div>
                  <h4 className="font-bold text-white mb-3 text-xl text-center">Career Booths</h4>
                  <p className="text-white/90 text-center leading-relaxed">Explore various career fields and industries with interactive displays and presentations</p>
                </div>
              </div>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-green-500/20 to-teal-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20 h-full">
                  <div className="text-4xl mb-4 text-center">🤝</div>
                  <h4 className="font-bold text-white mb-3 text-xl text-center">Networking</h4>
                  <p className="text-white/90 text-center leading-relaxed">Meet professionals from different industries and build valuable connections</p>
                </div>
              </div>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20 h-full">
                  <div className="text-4xl mb-4 text-center">🎓</div>
                  <h4 className="font-bold text-white mb-3 text-xl text-center">Workshops</h4>
                  <p className="text-white/90 text-center leading-relaxed">Attend skill-building sessions and seminars to enhance your career readiness</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-pulse">
            <Link
              to="/sessions"
              className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:from-yellow-300 hover:to-orange-400"
            >
              <span className="relative z-10">Enroll Now</span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
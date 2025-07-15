import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ccLogo from '../assets/cc.png';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={ccLogo}
              alt="Canisius College Jakarta"
              className="w-8 h-8 object-contain"
            />
            <span className="text-white font-bold text-lg">CC Career Day</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`text-white hover:text-yellow-400 transition-colors duration-200 font-medium ${
                isActive('/') ? 'text-yellow-400 border-b-2 border-yellow-400' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/sessions"
              className={`text-white hover:text-yellow-400 transition-colors duration-200 font-medium ${
                isActive('/sessions') ? 'text-yellow-400 border-b-2 border-yellow-400' : ''
              }`}
            >
              Sessions
            </Link>
            <Link
              to="/my-talks"
              className={`text-white hover:text-yellow-400 transition-colors duration-200 font-medium ${
                isActive('/my-talks') ? 'text-yellow-400 border-b-2 border-yellow-400' : ''
              }`}
            >
              My Talks
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

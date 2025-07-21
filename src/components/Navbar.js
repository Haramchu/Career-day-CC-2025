import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ccLogo from '../assets/cc.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProfileDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 150); // 150ms delay before closing
  };

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
          <div className="flex space-x-8 items-center">
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
            
            {/* Profile Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`text-white hover:text-yellow-400 transition-colors duration-200 font-medium focus:outline-none flex items-center space-x-1 ${
                  isActive('/change-password') ? 'text-yellow-400 border-b-2 border-yellow-400' : ''
                }`}
              >
                <span>Profile</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white/20 py-1 z-50"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="/change-password"
                    className="flex items-center w-full px-4 py-3 text-gray-800 hover:bg-yellow-400/20 hover:text-yellow-600 transition-colors duration-200 text-sm font-medium"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-800 hover:bg-red-400/20 hover:text-red-600 transition-colors duration-200 text-sm font-medium text-left"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ccLogo from '../assets/cc.png';
import React, { useState } from 'react';

const Form = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    major: '',
    year: '',
    careerInterests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            student_id: formData.studentId,
            major: formData.major,
            year: formData.year,
            career_interests: formData.careerInterests,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }

      setSubmitMessage('Enrollment successful! Thank you for registering.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        studentId: '',
        major: '',
        year: '',
        careerInterests: ''
      });
    } catch (error) {
      setSubmitMessage('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="group inline-flex items-center text-white hover:text-yellow-400 mb-6 transition-colors duration-300"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back to Home
            </Link>

            <div className="flex flex-col items-center mb-6">
              <img
                src={ccLogo}
                alt="Canisius College Jakarta"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                Career Day Enrollment
              </h1>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                <p className="text-lg font-semibold">
                  Register for Career Day 2025
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                    placeholder="+62 xxx xxxx xxxx"
                  />
                </div>
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-white mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                    placeholder="Enter your student ID"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-white mb-2">
                    Major *
                  </label>
                  <select
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  >
                    <option value="" className="bg-blue-900 text-white">Select your major</option>
                    <option value="Computer Science" className="bg-blue-900 text-white">Computer Science</option>
                    <option value="Business Administration" className="bg-blue-900 text-white">Business Administration</option>
                    <option value="Engineering" className="bg-blue-900 text-white">Engineering</option>
                    <option value="Psychology" className="bg-blue-900 text-white">Psychology</option>
                    <option value="Communications" className="bg-blue-900 text-white">Communications</option>
                    <option value="Other" className="bg-blue-900 text-white">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-white mb-2">
                    Year of Study *
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  >
                    <option value="" className="bg-blue-900 text-white">Select your year</option>
                    <option value="1" className="bg-blue-900 text-white">1st Year</option>
                    <option value="2" className="bg-blue-900 text-white">2nd Year</option>
                    <option value="3" className="bg-blue-900 text-white">3rd Year</option>
                    <option value="4" className="bg-blue-900 text-white">4th Year</option>
                    <option value="Graduate" className="bg-blue-900 text-white">Graduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="careerInterests" className="block text-sm font-medium text-white mb-2">
                  Career Interests (Optional)
                </label>
                <textarea
                  id="careerInterests"
                  name="careerInterests"
                  value={formData.careerInterests}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 resize-none"
                  placeholder="Tell us about your career interests or specific industries you'd like to explore..."
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-md ${submitMessage.includes('successful')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                  }`}>
                  {submitMessage}
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MyTalks = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingTalkId, setPendingTalkId] = useState(null);

  // Dummy enrolled talks data
  const [enrolledTalks, setEnrolledTalks] = useState([
    {
      id: '1-1',
      title: 'Introduction to Software Engineering',
      description: 'Learn about the fundamentals of software development and career opportunities in tech.',
      session: 'Session 1',
      speaker: 'John Doe',
      time: '10:00 AM - 11:00 AM'
    },
    {
      id: '1-5',
      title: 'Digital Marketing Strategies',
      description: 'Explore modern marketing techniques and digital platforms for business growth.',
      session: 'Session 1',
      speaker: 'Jane Smith',
      time: '11:30 AM - 12:30 PM'
    },
    {
      id: '2-3',
      title: 'Financial Planning and Investment',
      description: 'Understanding personal finance, investment strategies, and wealth management.',
      session: 'Session 2',
      speaker: 'Michael Johnson',
      time: '1:00 PM - 2:00 PM'
    },
    {
      id: '2-8',
      title: 'Healthcare Innovation',
      description: 'Discover the latest trends in healthcare technology and medical research.',
      session: 'Session 2',
      speaker: 'Dr. Sarah Wilson',
      time: '2:30 PM - 3:30 PM'
    },
    {
      id: '1-12',
      title: 'Entrepreneurship and Startups',
      description: 'Learn how to start your own business and navigate the startup ecosystem.',
      session: 'Session 1',
      speaker: 'Alex Rodriguez',
      time: '3:00 PM - 4:00 PM'
    }
  ]);

  const MODAL_TRANSITION_MS = 200;

  const handleRemoveClick = (talkId) => {
    setPendingTalkId(talkId);
    setConfirmOpen(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    
    // Remove the talk from enrolled talks
    setEnrolledTalks((prev) => prev.filter(talk => talk.id !== pendingTalkId));
    setPendingTalkId(null);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    setPendingTalkId(null);
  };

  const getTalkToRemove = () => {
    return enrolledTalks.find(talk => talk.id === pendingTalkId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      <Navbar />
      
      {/* Background blur decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            My Enrolled Talks
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Here are all the talks you've enrolled in. You can remove any talk if you change your mind.
          </p>
        </div>

        {enrolledTalks.length === 0 ? (
          <div className="text-center">
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 p-12 rounded-2xl text-white max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-4">No Talks Enrolled</h3>
              <p className="text-white/90 mb-6">
                You haven't enrolled in any talks yet. Visit the Sessions page to browse available talks.
              </p>
              <button
                onClick={() => navigate('/sessions')}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:from-yellow-300 hover:to-orange-400"
              >
                <span className="relative z-10">Browse Sessions</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {enrolledTalks.map((talk) => (
              <div
                key={talk.id}
                className="backdrop-blur-sm bg-white/10 border border-white/20 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-medium">
                    {talk.session}
                  </span>
                  <span className="text-sm text-white/70">{talk.time}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{talk.title}</h3>
                <p className="text-white/90 mb-3">{talk.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {talk.speaker.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-white/80 text-sm">{talk.speaker}</span>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveClick(talk.id)}
                    className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:from-red-400 hover:to-red-500"
                  >
                    <span className="relative z-10">Remove</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Sessions Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/sessions')}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:from-blue-400 hover:to-blue-500"
          >
            <span className="relative z-10">Browse More Sessions</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className={`bg-white rounded-xl p-6 w-full max-w-md transform transition-all duration-200 ${
              modalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h4 className="text-xl font-bold text-black mb-2">Remove Talk</h4>
            <p className="text-gray-700 mb-4">
              Are you sure you want to remove "<strong>{getTalkToRemove()?.title}</strong>" from your enrolled talks?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-red-500 rounded-lg hover:bg-red-600 text-white font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTalks;

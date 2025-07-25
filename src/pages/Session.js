import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MODAL_TRANSITION_MS = 200;

const SessionPage = () => {
  const [events, setEvents] = useState([]);
  const [enrolledTalks, setEnrolledTalks] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingTalkId, setPendingTalkId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollLoadingId, setEnrollLoadingId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if password change is required
    const needsPasswordChange = localStorage.getItem('needsPasswordChange');
    if (needsPasswordChange === 'true') {
      navigate('/change-password');
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: allEvents, error: eventsError } = await supabase
        .from('event')
        .select('*');

      if (eventsError || !user) {
        setErrorMessage('Failed to fetch events.');
        setLoading(false);
        return;
      }

      setEvents(allEvents);

      const { data: student, error: studentError } = await supabase
        .from('student')
        .select('*')
        .eq('student_email', user.student_email)
        .single();

      if (studentError || !student) {
        setErrorMessage('Failed to fetch your enrollment data.');
        setLoading(false);
        return;
      }

      setEnrolledTalks(
        [student.student_event_1, student.student_event_2].filter(Boolean)
      );

      // Update localStorage to sync user state
      localStorage.setItem('user', JSON.stringify(student));

      setLoading(false);
    };

    fetchData();
  }, []);

  const sessions = events.reduce((acc, event) => {
    const sessionId = event.event_sesi;
    if (!acc[sessionId]) acc[sessionId] = [];
    acc[sessionId].push(event);
    return acc;
  }, {});

  const getEnrollmentCount = async (eventId) => {
    const { count, error } = await supabase
      .from('student')
      .select('*', { count: 'exact', head: true })
      .or(`student_event_1.eq.${eventId},student_event_2.eq.${eventId}`);
    return error ? -1 : count;
  };

  const handleEnrollClick = (talkId) => {
    setPendingTalkId(talkId);
    setConfirmOpen(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleConfirm = async () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    
    const talkId = pendingTalkId;
    setPendingTalkId(null);
    
    // Set loading state for specific talk
    setEnrollLoadingId(talkId);
    
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('*')
        .eq('event_event_id', talkId)
        .single();

      if (eventError || !eventData) {
        setErrorMessage('Failed to fetch event details.');
        setEnrollLoadingId(null);
        return;
      }

      const currentCount = await getEnrollmentCount(talkId);
      if (currentCount >= eventData.event_lokasi_kapasitas) {
        setErrorMessage('Sorry, this talk is already full. Please choose another.');
        setEnrollLoadingId(null);
        return;
      }

      const session = eventData.event_sesi;
      const column = session === 1 ? 'student_event_1' : 'student_event_2';

      if (user[column]) {
        setErrorMessage(`You have already enrolled in Session ${session}.`);
        setEnrollLoadingId(null);
        return;
      }

      const { error: updateError } = await supabase
        .from('student')
        .update({ [column]: talkId })
        .eq('student_email', user.student_email);

      if (updateError) {
        setErrorMessage('Enrollment failed: ' + updateError.message);
        setEnrollLoadingId(null);
        return;
      }

      // Refetch updated student data and events
      const { data: updatedStudent } = await supabase
        .from('student')
        .select('*')
        .eq('student_email', user.student_email)
        .single();

      if (updatedStudent) {
        localStorage.setItem('user', JSON.stringify(updatedStudent));
        setEnrolledTalks(
          [updatedStudent.student_event_1, updatedStudent.student_event_2].filter(Boolean)
        );
        
        // Show success message
        setSuccessMessage(`Successfully enrolled in "${eventData.event_topik}"!`);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setEnrollLoadingId(null);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    setPendingTalkId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      <Navbar />

      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16 relative z-10">
          {Object.entries(sessions).map(([sessionId, talks]) => (
            <div key={sessionId} className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-md">
                Session {sessionId}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {talks.map((talk) => (
                  <div
                    key={talk.event_event_id}
                    className="backdrop-blur-sm bg-white/10 border border-white/20 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold mb-2">{talk.event_topik}</h3>
                    <p className="text-white/90 mb-2">{talk.event_deskripsi}</p>
                    <p className="text-sm text-white/60 mb-4">
                      Location: {talk.event_lokasi} | Duration: {talk.event_durasi} min
                    </p>
                    
                    {enrolledTalks.includes(talk.event_event_id) ? (
                      <button
                        className="group relative inline-flex items-center justify-center px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl cursor-default"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="relative z-10">You're Enrolled!</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur opacity-30"></span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(talk.event_event_id)}
                        disabled={enrollLoadingId === talk.event_event_id}
                        className={`group relative inline-flex items-center justify-center px-6 py-2 text-base font-bold text-white rounded-full shadow-2xl transition-all duration-300 ${
                          enrollLoadingId === talk.event_event_id 
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-orange-500/25 hover:scale-105 hover:from-yellow-300 hover:to-orange-400'
                        }`}
                      >
                        {enrollLoadingId === talk.event_event_id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="relative z-10">Enrolling...</span>
                          </>
                        ) : (
                          <span className="relative z-10">Enroll</span>
                        )}
                        <span className={`absolute inset-0 rounded-full blur opacity-30 transition-opacity ${
                          enrollLoadingId === talk.event_event_id 
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:opacity-50'
                        }`}></span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className={`bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <h4 className="text-2xl font-bold mb-3 text-center drop-shadow">Confirm Enrollment</h4>
            <p className="text-white/90 text-center mb-6 leading-relaxed">
              Are you sure you want to enroll in this talk?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white font-semibold shadow-md hover:scale-105 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 text-white font-semibold shadow-md hover:scale-105 transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 text-white rounded-xl p-4 w-full max-w-md shadow-2xl flex items-center gap-4">
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage('')}
              className="ml-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 text-white rounded-xl p-4 w-full max-w-md shadow-2xl flex items-center gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">{successMessage}</div>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPage;

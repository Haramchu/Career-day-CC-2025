import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MODAL_TRANSITION_MS = 200;

const SessionPage = () => {
  const [events, setEvents] = useState([]);
  const [enrolledTalks, setEnrolledTalks] = useState([]);
  // NEW state to hold all event counts
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
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
    
    const needsPasswordChange = localStorage.getItem('needsPasswordChange');
    if (needsPasswordChange === 'true') {
      navigate('/change-password');
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch events and speakers together
      const { data: allEvents, error: eventsError } = await supabase
        .from('event')
        .select('*, speaker(*)');

      // NEW: Fetch all enrollment counts at once
      const { data: counts, error: countsError } = await supabase.rpc('get_all_event_counts');

      if (eventsError || countsError || !user) {
        console.error('Fetch data error:', eventsError || countsError);
        setErrorMessage('Failed to fetch event data.');
        setLoading(false);
        return;
      }

      setEvents(allEvents);
      if (counts) {
        setEnrollmentCounts(counts);
      }

      // Fetch current student's data
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

  // This function is no longer needed, as we fetch all counts at once.
  // const getEnrollmentCount = async (eventId) => { ... };

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
    setEnrollLoadingId(talkId);
    
    setErrorMessage('');
    setSuccessMessage('');

    if (!user || !user.student_nis) {
        setErrorMessage("Could not find your student ID to enroll.");
        setEnrollLoadingId(null);
        return;
    }

    try {
      const { data: rpcResponse, error: rpcError } = await supabase.rpc('enroll_student_in_event', {
        p_student_nis: user.student_nis,
        p_event_id: talkId,
      });

      if (rpcError) throw rpcError;

      if (rpcResponse.startsWith('Success')) {
        setSuccessMessage(rpcResponse);
        
        // Refetch both student and count data to update the UI instantly
        const { data: updatedStudent } = await supabase.from('student').select('*').eq('student_nis', user.student_nis).single();
        const { data: updatedCounts } = await supabase.rpc('get_all_event_counts');

        if (updatedStudent) {
            localStorage.setItem('user', JSON.stringify(updatedStudent));
            setEnrolledTalks([updatedStudent.student_event_1, updatedStudent.student_event_2].filter(Boolean));
        }
        if (updatedCounts) {
            setEnrollmentCounts(updatedCounts);
        }
        
      } else {
        setErrorMessage(rpcResponse);
      }

    } catch (error) {
      setErrorMessage('Enrollment failed: ' + error.message);
    } finally {
      setEnrollLoadingId(null);
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
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
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {talks.map((talk) => (
                  <div
                    key={talk.event_event_id}
                    className="backdrop-blur-sm bg-white/10 border border-white/20 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="flex-grow">
                      {/* Speaker Section */}
                      {talk.speaker && (
                        <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-white/10 border border-white/20">
                          <img 
                            src={talk.speaker.speaker_img} 
                            alt={talk.speaker.speaker_nama || 'Speaker'}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/50 flex-shrink-0 shadow-lg"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src=`https://placehold.co/100x100/374151/E5E7EB?text=${talk.speaker.speaker_nama?.charAt(0) || 'S'}`; 
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-lg leading-tight mb-1">{talk.speaker.speaker_nama}</h4>
                            <p className="text-xs text-white/80 mb-1">Alumnus Angkatan {talk.speaker.speaker_angkatan}</p>
                            <p className="text-xs text-white/80 font-semibold mb-1">{talk.speaker.speaker_title}</p>
                            <p className="text-xs text-white/70">{talk.speaker.speaker_company}</p>
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="w-full h-px bg-white/20 my-4" />

                      {/* Topic Section */}
                      <div className="mb-4 text-center">
                        <h3 className="text-2xl font-extrabold mb-1 text-white drop-shadow">{talk.event_topik}</h3>
                        <p className="text-base text-white/90 mb-1 font-medium">{talk.event_bidang}</p>
                      </div>

                      {/* Details Section */}
                      <div className="flex justify-center items-center gap-8 mb-4">
                        <span className="flex items-center gap-2 text-sm text-white/80">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          <span className="font-semibold">{enrollmentCounts[talk.event_event_id] || 0} / {talk.event_lokasi_kapasitas}</span>
                        </span>
                        <span className="flex items-center gap-2 text-sm text-white/80">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.978.572.636.636 0 00.28.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                          <span className="font-semibold">{talk.event_lokasi}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 text-center">
                      {enrolledTalks.includes(talk.event_event_id) ? (
                        <button className="group relative inline-flex items-center justify-center px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl cursor-default">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal and messages (no changes here) */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className={`bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h4 className="text-2xl font-bold mb-3 text-center drop-shadow">Confirm Enrollment</h4>
            <p className="text-white/90 text-center mb-6 leading-relaxed">Are you sure you want to enroll in this talk?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleCancel} className="px-5 py-2 rounded-full bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white font-semibold shadow-md hover:scale-105 transition-all duration-200">Cancel</button>
              <button onClick={handleConfirm} className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 text-white font-semibold shadow-md hover:scale-105 transition-all duration-200">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4"><div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 text-white rounded-xl p-4 w-full max-w-md shadow-2xl flex items-center gap-4"><div className="flex-1">{errorMessage}</div><button onClick={() => setErrorMessage('')} className="ml-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white font-semibold transition">Close</button></div></div>
      )}
      {successMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4"><div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 text-white rounded-xl p-4 w-full max-w-md shadow-2xl flex items-center gap-4"><div className="flex items-center gap-3"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div className="flex-1">{successMessage}</div></div><button onClick={() => setSuccessMessage('')} className="ml-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/40 text-white font-semibold transition">Close</button></div></div>
      )}
    </div>
  );
};

export default SessionPage;

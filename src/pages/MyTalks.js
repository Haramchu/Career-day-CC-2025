import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const MyTalks = () => {
  const navigate = useNavigate();
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingTalkId, setPendingTalkId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyTalks = async () => {

      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('*')
        .eq('student_email', user.student_email)
        .single();

      if (studentError || !studentData) {
        console.error('Student fetch error', studentError);
        setLoading(false);
        return;
      }

      const eventIds = [studentData.student_event_1, studentData.student_event_2].filter(Boolean);
      if (eventIds.length === 0) {
        setTalks([]);
        setLoading(false);
        return;
      }

      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('*')
        .in('event_event_id', eventIds);

      if (eventError) {
        console.error('Event fetch error', eventError);
      } else {
        setTalks(eventData);
      }

      setLoading(false);
    };

    if (!user) return navigate('/login');
    fetchMyTalks();
  }, [navigate, user]);

  const MODAL_TRANSITION_MS = 200;

  const handleRemoveClick = (talkId) => {
    setPendingTalkId(talkId);
    setConfirmOpen(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const handleConfirm = async () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);

    // Determine which column to nullify
    const columnToUpdate =
      talks.find(talk => talk.event_event_id === pendingTalkId)?.event_sesi === 1
        ? 'student_event_1'
        : 'student_event_2';

    const { error } = await supabase
      .from('student')
      .update({ [columnToUpdate]: null })
      .eq('student_email', user.student_email);

    if (!error) {
      setTalks(prev => prev.filter(talk => talk.event_event_id !== pendingTalkId));
    }

    setPendingTalkId(null);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    setPendingTalkId(null);
  };

  const getTalkToRemove = () => talks.find(talk => talk.event_event_id === pendingTalkId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">My Enrolled Talks</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            View and manage your registered talks below.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Loading talks...</div>
        ) : talks.length === 0 ? (
          <div className="text-center text-white text-lg">You haven't enrolled in any talks.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {talks.map(talk => (
              <div
                key={talk.event_event_id}
                className="backdrop-blur-sm bg-white/10 border border-white/20 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-medium">
                    Session {talk.event_sesi}
                  </span>
                  <span className="text-sm text-white/70">Duration: {talk.event_durasi} min</span>
                </div>

                <h3 className="text-xl font-bold mb-2">{talk.event_topik}</h3>
                <p className="text-white/90 mb-3">{talk.event_deskripsi}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">{talk.event_lokasi}</div>
                  <button
                    onClick={() => handleRemoveClick(talk.event_event_id)}
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
      </div>

      {/* Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className={`bg-white rounded-xl p-6 w-full max-w-md transform transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <h4 className="text-xl font-bold text-black mb-2">Remove Talk</h4>
            <p className="text-gray-700 mb-4">
              Are you sure you want to remove <strong>{getTalkToRemove()?.event_topik}</strong>?
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

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const talksPerSession = 20;

const generateTalks = (sessionId) =>
  Array.from({ length: talksPerSession }, (_, i) => ({
    id: `${sessionId}-${i + 1}`,
    title: `Talk ${i + 1}`,
    description: `Description for Talk ${i + 1} in Session ${sessionId}`
  }));

const MODAL_TRANSITION_MS = 200;

const SessionPage = () => {
  const [enrolledTalks, setEnrolledTalks] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingTalkId, setPendingTalkId] = useState(null);
  const navigate = useNavigate();

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

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from('talk_enrollments')
      .insert({ user_id: user.id, talk_id: talkId });

    if (!error) {
      setEnrolledTalks((prev) => [...prev, talkId]);
    } else {
      alert("Enrollment failed: " + error.message);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmOpen(false), MODAL_TRANSITION_MS);
    setPendingTalkId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Background blur decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="mb-10 px-5 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 border border-white/30 transition"
        >
          &larr; Back to Home
        </button>

        {[1, 2].map((sessionId) => (
          <div key={sessionId} className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-md">
              Session {sessionId}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {generateTalks(sessionId).map((talk) => (
                <div
                  key={talk.id}
                  className="backdrop-blur-sm bg-white/10 border border-white/20 p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-bold mb-2">{talk.title}</h3>
                  <p className="text-white/90 mb-4">{talk.description}</p>
                  <button
                    onClick={() => handleEnrollClick(talk.id)}
                    disabled={enrolledTalks.includes(talk.id)}
                    className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 transition"
                  >
                    {enrolledTalks.includes(talk.id) ? "Enrolled" : "Enroll"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div
              className={`bg-white rounded-xl p-6 w-full max-w-md transform transition-all duration-200 ${
                modalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <h4 className="text-xl font-bold text-black mb-2">Confirm Enrollment</h4>
              <p className="text-gray-700 mb-4">
                Are you sure you want to enroll in this talk?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600 text-black font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionPage;

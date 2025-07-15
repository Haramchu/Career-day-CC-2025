// SessionPage.js
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const talksPerSession = 20;

const generateTalks = (sessionId) => Array.from({ length: talksPerSession }, (_, i) => ({
  id: `${sessionId}-${i + 1}`,
  title: `Talk ${i + 1}`,
  description: `Description for Talk ${i + 1} in Session ${sessionId}`
}));

const SessionPage = () => {
  const [enrolledTalks, setEnrolledTalks] = useState([]);

  const handleEnroll = async (talkId) => {
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

  return (
    <div className="p-8 space-y-8 text-white bg-indigo-900 min-h-screen">
      {[1, 2].map(sessionId => (
        <div key={sessionId}>
          <h2 className="text-2xl font-bold mb-4">Session {sessionId}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generateTalks(sessionId).map(talk => (
              <div key={talk.id} className="p-4 border border-white/20 rounded-xl bg-white/10">
                <h3 className="text-xl font-semibold">{talk.title}</h3>
                <p className="text-sm text-white/80">{talk.description}</p>
                <button
                  onClick={() => handleEnroll(talk.id)}
                  disabled={enrolledTalks.includes(talk.id)}
                  className="mt-2 px-4 py-2 bg-yellow-500 rounded text-black font-semibold hover:bg-yellow-600 disabled:opacity-50"
                >
                  {enrolledTalks.includes(talk.id) ? "Enrolled" : "Enroll"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionPage;

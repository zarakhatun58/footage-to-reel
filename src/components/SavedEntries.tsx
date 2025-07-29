import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/services/apis';

const SavedEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/videos`);
        setEntries(res.data.videos);
      } catch (err) {
        console.error("Error fetching entries:", err);
        setError('Failed to load saved stories.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">📚 Saved Stories</h2>

      {loading && <p className="text-center text-blue-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {entries.length === 0 && !loading && (
        <p className="text-center text-gray-600">No saved stories found.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.id} className="bg-white p-5 rounded shadow mb-6">
          <p className="text-gray-500 text-sm mb-2">📅 {new Date(entry.created_at).toLocaleString()}</p>

          <div className="mb-2">
            <h3 className="font-semibold">🎤 Transcript:</h3>
            <p className="whitespace-pre-line">{entry.transcript}</p>
          </div>

          <div className="mb-2">
            <h3 className="font-semibold">📝 Prompt:</h3>
            <p className="whitespace-pre-line">{entry.prompt}</p>
          </div>

          <div className="mb-2">
            <h3 className="font-semibold">📖 Story:</h3>
            <p className="whitespace-pre-line">{entry.story}</p>
          </div>

          <div>
            <h3 className="font-semibold">🏷️ Tags:</h3>
            <p>{entry.tags}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedEntries;
import React, { useRef, useState, useEffect } from 'react';

type UploadedMedia = {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'unknown';
  story?: string;
  voiceUrl?: string;
};

type Props = {
  media: UploadedMedia;
  setUploadedMedia: React.Dispatch<React.SetStateAction<UploadedMedia[]>>;
  BASE_URL: string;
};

const AudioUploadModal: React.FC<Props> = ({ media, setUploadedMedia, BASE_URL }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [option, setOption] = useState<'upload' | 'record' | 'auto'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAudioUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${BASE_URL}/api/audio/${media.id}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.audioUrl) {
        setUploadedMedia(prev =>
          prev.map(m => (m.id === media.id ? { ...m, voiceUrl: data.audioUrl } : m))
        );
        alert('🎤 Audio uploaded successfully!');
      }
    } catch {
      alert('❌ Failed to upload audio');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = e => e.data.size > 0 && recordedChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/mp3' });
        await handleAudioUpload(new File([blob], 'recorded-audio.mp3', { type: 'audio/mp3' }));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('❌ Unable to access microphone');
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const autoGenerateAudio = async () => {
    if (!media.story) return alert('No story text to generate audio');
    try {
      const res = await fetch(`${BASE_URL}/api/audio/generate-audio/${media.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: media.story }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadedMedia(prev =>
          prev.map(m => (m.id === media.id ? { ...m, voiceUrl: data.audioUrl } : m))
        );
        alert('🎤 Audio auto-generated successfully!');
      }
    } catch {
      alert('❌ Failed to auto-generate audio');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded shadow transition"
      >
        Audio
      </button>

      {/* Modal with blur background and fade-in/out */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 relative transform transition-transform duration-300 scale-95 opacity-0 animate-scale-in"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold text-gray-700">Select Audio Option 🎵</h3>

            <div className="flex flex-col gap-2">
              {['upload', 'record', 'auto'].map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all duration-200
                    ${option === opt
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <input
                    type="radio"
                    name="audioOption"
                    value={opt}
                    checked={option === opt}
                    onChange={() => setOption(opt as any)}
                    className="hidden"
                  />
                  {opt === 'upload' ? 'Upload MP3' : opt === 'record' ? 'Record Audio' : 'Auto Generate'}
                </label>
              ))}
            </div>

            <div className="mt-4">
              {option === 'upload' && (
                <input
                  type="file"
                  accept="audio/mp3"
                  onChange={e => e.target.files && handleAudioUpload(e.target.files[0])}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}

              {option === 'record' && (
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 rounded shadow transition-transform duration-200 hover:scale-105"
                    >
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 rounded shadow transition-transform duration-200 hover:scale-105"
                    >
                      Stop & Upload
                    </button>
                  )}
                </div>
              )}

              {option === 'auto' && (
                <button
                  onClick={autoGenerateAudio}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded shadow transition-transform duration-200 hover:scale-105"
                >
                  Generate Audio
                </button>
              )}
            </div>

            {media.voiceUrl && (
              <audio controls className="w-full mt-4">
                <source src={media.voiceUrl} type="audio/mp3" />
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AudioUploadModal;

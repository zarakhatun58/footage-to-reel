import { BASE_URL } from '@/services/apis';
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

};

const AudioUploadModal: React.FC<Props> = ({ media, setUploadedMedia}) => {
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

  // ✅ Unified function for all audio actions
  const handleAudioAction = async (file?: File, text?: string) => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('text', text);
    } else {
      return alert('No audio data provided');
    }

    try {
      const res = await fetch(`${BASE_URL}/api/audio/${media.id}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.audioUrl) {
        setUploadedMedia(prev =>
          prev.map(m => (m.id === media.id ? { ...m, voiceUrl: data.audioUrl } : m))
        );
        alert(file ? '🎤 Audio uploaded successfully!' : '🎤 Audio generated successfully!');
        setIsOpen(false); // ✅ close modal after success
      } else {
        alert('❌ Audio action failed');
      }
    } catch {
      alert('❌ Server error while processing audio');
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
        await handleAudioAction(new File([blob], 'recorded-audio.mp3', { type: 'audio/mp3' }));
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
    await handleAudioAction(undefined, media.story);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-300 hover:bg-teal-300 text-white font-semibold px-4 py-2 rounded-md shadow transition"
      >
        Audio
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 relative"
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
                      ? 'bg-gradient-primary text-white shadow-lg scale-105'
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
                  onChange={e => e.target.files && handleAudioAction(e.target.files[0])}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}

              {option === 'record' && (
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex-1 bg-teal-300 hover:bg-red-300 text-white font-semibold py-1.5 rounded shadow"
                    >
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 bg-teal-300 hover:bg-red-300 text-white font-semibold py-1.5 rounded shadow"
                    >
                      Stop & Upload
                    </button>
                  )}
                </div>
              )}

              {option === 'auto' && (
                <button
                  onClick={autoGenerateAudio}
                  className="w-full bg-teal-600 hover:bg-red-400 text-white font-semibold py-1.5 rounded shadow"
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

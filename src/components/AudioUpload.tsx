import React, { useRef, useState } from 'react';

type UploadedMedia = {
  id: string;
  name: string;
  size: number;
  type: 'video' | 'audio' | 'image' | 'unknown';
  duration?: number;
  emotions?: string;
  title?: string;
  description?: string;
  story?: string;
  thumbnail?: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'error';
  transcript?: string;
  visionLabels?: string[];
  tags?: string[];
  storyUrl?: string;
  rankScore?: number;
  images?: string[];
  voiceUrl?: string;
  renderId?: string;
  views?: number;
  likes?: number;
  shares?: number;
};

type Props = {
  media: UploadedMedia;
  setUploadedMedia: React.Dispatch<React.SetStateAction<UploadedMedia[]>>;
  BASE_URL: string;
};

const AudioUpload: React.FC<Props> = ({ media, setUploadedMedia, BASE_URL }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleAudioUpload = async (file: File, mediaId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/api/audio/${mediaId}`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success && data.audioUrl) {
        setUploadedMedia(prev =>
          prev.map(m =>
            m.id === mediaId ? { ...m, voiceUrl: data.audioUrl } : m
          )
        );
        alert('🎤 Audio uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Audio upload error:', err);
      alert('❌ Failed to upload audio');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/mp3' });
        const file = new window.File([blob], 'recorded-audio.mp3', { type: 'audio/mp3' });

        await handleAudioUpload(file, media.id);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      alert('❌ Unable to access microphone');
    }
  };

  const autoGenerateAudio = async () => {
    if (!media.story) {
      alert('No story text to generate audio from');
      return;
    }
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
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert('❌ Failed to auto-generate audio');
      console.error(err);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioUpload(file, media.id);
    }
  };

  return (
   <div className="space-y-4 max-w-md mx-auto p-3 bg-white rounded shadow-md">
  <div>
    <label className="block text-gray-700 font-semibold mb-1 text-sm">🎧 Upload MP3 File</label>
    <input
      type="file"
      accept="audio/mp3"
      onChange={handleFileChange}
      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label className="block text-gray-700 font-semibold mb-1 text-sm">🎙️ Record Audio</label>
    <div className="flex flex-row gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex-1 bg-green-600 hover:bg-green-700 transition text-white font-semibold text-sm px-3 py-1.5 rounded shadow"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex-1 bg-red-600 hover:bg-red-700 transition text-white font-semibold text-sm px-3 py-1.5 rounded shadow"
        >
          Stop & Upload
        </button>
      )}
    </div>
  </div>

  <div>
    <button
      onClick={autoGenerateAudio}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-3 py-1.5 rounded shadow transition"
    >
      Auto Generate Audio
    </button>
  </div>
</div>

  );
};

export default AudioUpload;

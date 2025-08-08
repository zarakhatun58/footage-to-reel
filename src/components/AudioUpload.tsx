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
    <div className="space-y-4">
      <div>
        <label className="font-semibold">🎧 Upload MP3 File</label>
        <input
          type="file"
          accept="audio/mp3"
          onChange={handleFileChange}
          className="w-full mt-2"
        />
      </div>

      <div>
        <label className="font-semibold">🎙️ Record Audio</label>
        <div className="flex gap-4 mt-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop & Upload
            </button>
          )}
        </div>
      </div>
       <button onClick={autoGenerateAudio}>
        Auto Generate Audio
      </button>
    </div>
  );
};

export default AudioUpload;

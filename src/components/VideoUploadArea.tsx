import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FileVideo,
  Mic,
  ImageIcon,
  File,
  Film,
  FileCheck,
  Loader2,
  Upload,
  Share2,
  Edit2,
  PlayCircle,
  ThumbsUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from "@ramonak/react-progress-bar";
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReactPlayer from 'react-player';
import { BASE_URL } from '@/services/apis';
import { RenderProgress } from './RenderProgress ';
import { MediaStatsBar } from './MediaStatsBar';
import UploadedMediaCard from './UploadedMediaCard';
import AudioUpload from './AudioUpload';

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
  renderId?: string; // ✅ add this
  views?: number;    // ✅ for stats
  likes?: number;
  shares?: number;
};


export const VideoUploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [mediaId, setMediaId] = useState<string>('');
  const [storyProgress, setStoryProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [storyAudioUrl, setStoryAudioUrl] = useState('');
  const [showAudioOptions, setShowAudioOptions] = useState(false);
  const [manualOptions, setManualOptions] = useState(false);

  const [selectedAudioMode, setSelectedAudioMode] = useState('original'); // 'original', 'silent', 'custom'

  const toggleAudioOptions = () => {
    setShowAudioOptions(!showAudioOptions);
  };
  const toggleManualOptions = () => {
    setManualOptions(!manualOptions);
  };

  const handleAudioModeChange = (mode: any) => {
    setSelectedAudioMode(mode);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const tempId = `${Date.now()}-${file.name}`;
      const mimeType = file.type;
      const type = mimeType.startsWith('image')
        ? 'image'
        : mimeType.startsWith('video')
          ? 'video'
          : 'voiceover';

      setUploadedMedia((prev: any) => [...prev, { id: tempId, name: file.name, type }]);
      uploadFileToServer(tempId, file, type);
    });

    e.target.value = '';
  };


  const handleFiles = (files: File[]) => {
    const supportedTypes = ['video/', 'audio/', 'image/'];

    const validFiles = files.filter(file =>
      supportedTypes.some(type => file.type.startsWith(type))
    );

    validFiles.forEach(file => {
      const mediaId = `${Date.now()}-${Math.random()}`;
      const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image';

      const newMedia: UploadedMedia = {
        id: mediaId,
        name: file.name,
        size: file.size,
        type,
        transcriptionStatus: 'pending'
      };

      setUploadedMedia(prev => [...prev, newMedia]);
      uploadFileToServer(mediaId, file, type);
    });
  };

  // const uploadFileToServer = async (mediaId: string, file: File, type: string) => {
  //   const formData = new FormData();
  //   formData.append(
  //     type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
  //     file
  //   );

  //   setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }));

  //   setUploadedMedia(prev =>
  //     prev.map(m => (m.id === mediaId ? { ...m, transcriptionStatus: 'processing' } : m))
  //   );

  //   try {
  //     const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
  //       method: 'POST',
  //       body: formData
  //     });

  //     const result = await uploadRes.json();
  //     const uploadedItem = result.uploaded?.[0];
  //     if (!uploadedItem) throw new Error('Upload returned no file');

  //     const newMedia = {
  //       id: uploadedItem._id || mediaId,
  //       name: uploadedItem.filename,
  //       size: file.size,
  //       type,
  //       transcriptionStatus: 'completed',
  //       thumbnail:
  //         uploadedItem.thumbnail ||
  //         uploadedItem.images?.[0] ||
  //         (uploadedItem.filename.endsWith('.jpg') || uploadedItem.filename.endsWith('.png')
  //           ? uploadedItem.filename
  //           : null),
  //       transcript: uploadedItem.transcript || '',
  //       tags: uploadedItem.tags || [],
  //       emotions: uploadedItem.emotions?.join(', ') || '',
  //       story: uploadedItem.story || '',
  //       storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`,
  //       images: uploadedItem.images || []
  //     };

  //     setUploadedMedia((prev: any) =>
  //       prev.map((media: any) => (media.id === mediaId ? newMedia : media))
  //     );
  //     setMediaId(uploadedItem._id);
  //     setStoryText(uploadedItem.story || '');
  //     if (type === 'audio' && uploadedItem.filename) {
  //       setStoryAudioUrl(`${BASE_URL}/uploads/${uploadedItem.filename}`);
  //     }
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     setUploadedMedia(prev =>
  //       prev.map(media =>
  //         media.id === mediaId ? { ...media, transcriptionStatus: 'error' } : media
  //       )
  //     );
  //   }
  // };


  // useEffect(() => {
  //   const fetchUploadedVideos = async () => {
  //     try {
  //       const res = await fetch(`${BASE_URL}/api/videos`);
  //       const data = await res.json();

  //       if (data?.videos) {
  //         const loadedMedia: UploadedMedia[] = data.videos.map((item: any) => ({
  //           id: item._id,
  //           name: item.filename,
  //           size: item.size || 0,
  //           type: item.mediaType || 'unknown',
  //           transcriptionStatus: 'completed',
  //           thumbnail: item.filename,
  //           transcript: item.transcript || '',
  //           tags: item.tags || [],
  //           emotions: item.emotions?.join(', ') || '',
  //           story: item.story || '',
  //           storyUrl: `${BASE_URL}/uploads/${item.filename}`
  //         }));

  //         setUploadedMedia(loadedMedia);
  //       }
  //     } catch (err) {
  //       console.error('Failed to fetch videos:', err);
  //     }
  //   };
  //   fetchUploadedVideos();
  // }, []);

  const uploadFileToServer = async (mediaId: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append(
      type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
      file
    );

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setUploadedMedia((prev: any) => [
      ...prev,
      {
        id: mediaId,
        name: file.name,
        size: file.size,
        type,
        transcriptionStatus: 'processing',
        thumbnail: previewUrl,
        transcript: '',
        tags: [],
        emotions: '',
        story: '',
        images: []
      }
    ]);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [mediaId]: progress }));
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          const uploadedItem = result.uploaded?.[0];

          if (!uploadedItem) throw new Error('Upload returned no file');

          // ✅ CHANGED: Use actual metadata from backend response
          const newMedia = {
            id: uploadedItem._id || mediaId,
            name: uploadedItem.filename,
            size: file.size,
            type,
            transcriptionStatus: uploadedItem.status || 'completed',
            thumbnail:
              uploadedItem.thumbnail ||
              uploadedItem.images?.[0] ||
              (uploadedItem.filename.endsWith('.jpg') || uploadedItem.filename.endsWith('.png')
                ? uploadedItem.filename
                : previewUrl),
            transcript: uploadedItem.transcript || '',
            tags: uploadedItem.tags || [],
            emotions: uploadedItem.emotions || '',
            story: '',
            storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`,
            images: uploadedItem.images || []
          };

          setUploadedMedia((prev: any) =>
            prev.map((media: any) => (media.id === mediaId ? newMedia : media))
          );

          setMediaId(uploadedItem._id);
          setStoryText('');

          if (type === 'audio' && uploadedItem.filename) {
            setStoryAudioUrl(`${BASE_URL}/uploads/${uploadedItem.filename}`);
          }

          // ❌ REMOVED: No need to poll anymore
          // pollMediaStatus(uploadedItem._id || mediaId);

        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error('XHR upload failed');
      };

      xhr.open('POST', `${BASE_URL}/api/uploads`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedMedia(prev =>
        prev.map(media =>
          media.id === mediaId ? { ...media, transcriptionStatus: 'error' } : media
        )
      );
    }
  };


  const pollMediaStatus = async (mediaId: string) => {
    const maxAttempts = 10;
    const interval = 2000;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const res = await fetch(`${BASE_URL}/api/media/${mediaId}`);

        // Safely check if it's JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error(`Unexpected response (non-JSON): ${text}`);
          throw new Error('Non-JSON response received from server');
        }

        const data = await res.json();

        if (data.transcriptionStatus === 'completed' || attempts >= maxAttempts) {
          setUploadedMedia(prev =>
            prev.map(media => (media.id === mediaId ? { ...media, ...data } : media))
          );
        } else {
          setTimeout(poll, interval);
        }
      } catch (err) {
        console.error('Polling failed:', err);
      }
    };

    poll();
  };



  const generateStory = async () => {
    if (!uploadedMedia[0]) return;
    const stop = simulateProgress(setStoryProgress); // Start progress animation
    const prompt = 'Create a motivational story about learning to code.';
    try {

      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: uploadedMedia[0].transcript,
          prompt
        })
      });

      const result = await res.json();

      if (!res.ok || !result.story) {
        throw new Error(result.error || 'Story generation failed');
      }

      setStoryText(result.story);
      if (result.storyAudioUrl) {
        setStoryAudioUrl(result.storyAudioUrl);
      }
      setUploadedMedia(prev =>
        prev.map(m =>
          m.id === uploadedMedia[0].id
            ? { ...m, story: result.story, prompt }
            : m
        )
      );

    } catch (error) {
      console.error('Story generation error:', error);
      alert('❌ Failed to generate story');
    } finally {
      stop(); // Complete progress
    }
  };

  const generateVideoClip = async () => {
    if (!storyText || !uploadedMedia[0]) return;

    setLoadingVideo(true);
    const stop = simulateProgress(setVideoProgress);
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Show warning after 2 minutes if it's stuck
      timeoutId = setTimeout(() => {
        alert('⚠️ Video is taking longer than expected to render. Please check back later.');
      }, 2 * 60 * 1000);

      const trimmedImages = uploadedMedia[0].images?.slice(0, 10);

      const res = await fetch(`${BASE_URL}/api/speech/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText,
          images: trimmedImages || [],
          mediaId
        })
      });

      const data = await res.json();

      // ✅ FIX: Access renderId directly from data (not data.response.id)
      const renderId = data?.renderId;

      if (data.success && renderId) {
        alert(`🎬 Video rendering started!\nRender ID: ${renderId}`);

        setUploadedMedia(prev =>
          prev.map(m =>
            m.id === mediaId
              ? {
                ...m,
                type: 'video',
                storyUrl: data?.storyUrl || '', // fallback if null
                renderId,
                transcriptionStatus: 'processing'
              }
              : m
          )
        );

        // Optional: check for 202 status
        if (res.status === 202 || res.ok) {
          alert('🎬 Video render request queued. It may take a moment to start.');
        }

        // ✅ Polling render status
        const pollForResult = async () => {
          const maxTries = 15;
          const delayMs = 2000;

          for (let i = 0; i < maxTries; i++) {
            const statusRes = await fetch(`${BASE_URL}/api/speech/render-status/${renderId}`);
            const statusData = await statusRes.json();

            if (statusData.status === 'done' && statusData.url) {
              setUploadedMedia(prev =>
                prev.map(m =>
                  m.renderId === renderId
                    ? {
                      ...m,
                      storyUrl: statusData.url,
                      transcriptionStatus: 'completed'
                    }
                    : m
                )
              );
              alert('✅ Video rendering complete!');
              return;
            }

            await new Promise(res => setTimeout(res, delayMs));
          }

          alert('⚠️ Video is taking longer than expected to render. Please check back later.');
        };

        await pollForResult();
      } else {
        console.error('Unexpected response:', data);
        throw new Error('Render ID not returned from backend.');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert('❌ Video generation failed');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      stop();
      setLoadingVideo(false);
    }
  };



  const simulateProgress = (setter: (v: number) => void, duration = 3000) => {
    setter(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setter(Math.min(progress, 90)); // Cap before full completion
      if (progress >= 90) clearInterval(interval);
    }, duration / 10);
    return () => {
      clearInterval(interval);
      setter(100);
    };
  };

  const handleLike = async (id: string) => {
    await fetch(`${BASE_URL}/api/media/${id}/like`, { method: 'POST' });
  };

  const handleShare = async (id: string) => {
    await fetch(`${BASE_URL}/api/media/${id}/share`, { method: 'POST' });
  };

  const downloadVideo = (url: any) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareToX = (media: any) => {
    const tweet = encodeURIComponent(`Check out my story video! ${media.storyUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
  };



  const totalRankScore = uploadedMedia.reduce((acc, media) => acc + (media.rankScore || 0), 0);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Your Footage</h2>
        <p className="text-muted-foreground">Upload personal footage to create AI-powered stories</p>
      </div>

      <Card
        className={`relative border-2 border-dashed ${dragActive ? 'border-video-primary bg-video-primary/5' : 'border-muted-foreground/25 hover:border-video-primary/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-video-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-xl font-semibold mb-2">{dragActive ? 'Drop your videos here' : 'Upload your video memories'}</h3>
          <p className="text-muted-foreground mb-6">Drag and drop or click to upload. Supports MP4, MOV, MP3, PNG...</p>
          <Button variant="ai" size="lg" asChild>
            <label className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" /> Choose Files
              <input
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </Card>
      {/* Upload Progress (already present) */}
      {uploadedMedia.length > 0 &&
        uploadedMedia.map(media =>
          uploadProgress[media.id] !== undefined ? (
            <div key={media.id} className="w-full mt-2">
              <ProgressBar
                completed={uploadProgress[media.id]}
                maxCompleted={100}
                height="8px"
                isLabelVisible={false}
                bgColor="orange"
                baseBgColor="#e5e7eb"
                labelAlignment="right"
                animateOnRender
                customLabel={`${uploadProgress[media.id]}%`}
              />
              <div className="text-xs text-right mt-1 text-gray-600">
                {uploadProgress[media.id]}%
              </div>
            </div>
          ) : null
        )}


      {/* Story Generation Progress */}
      {/* {storyProgress > 0 && storyProgress < 100 && (
        <div className="w-full mt-4">
          <ProgressBar
            completed={storyProgress}
            maxCompleted={100}
            height="8px"
            isLabelVisible={false}
            bgColor="orange"
            baseBgColor="#e5e7eb"
            labelAlignment="right"
            animateOnRender
          />
          <div className="text-xs text-right mt-1 text-gray-600">
            Generating story: {storyProgress}%
          </div>
        </div>
      )} */}

      {/* Video Generation Progress */}
      {videoProgress > 0 && videoProgress < 100 && (
        <div className="w-full mt-4">
          <ProgressBar
            completed={videoProgress}
            maxCompleted={100}
            height="8px"
            isLabelVisible={false}
            bgColor="orange"
            baseBgColor="#e5e7eb"
            labelAlignment="right"
            animateOnRender
          />
          <div className="text-xs text-right mt-1 text-gray-600">
            Creating video: {videoProgress}%
          </div>
        </div>
      )}


      {/* {uploadedMedia.length > 0 && uploadedMedia.map(media => (
        <div key={media.id} className="border rounded-lg p-4 shadow space-y-4 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            {uploadedMedia[0].thumbnail && (
              <img
                src={`${BASE_URL}/uploads/${uploadedMedia[0].thumbnail}`}
                alt="Thumbnail"
                className="w-60 h-64 object-cover rounded shadow"
              />
            )}

            <div className="flex-1 space-y-2">
              <p><strong>Transcript:</strong> {media.transcript || 'Not available'}</p>
              <p><strong>Tags:</strong> {media.tags?.join(', ') || 'Not generated'}</p>
              <p><strong>Emotions:</strong> {media.emotions || 'Not detected'}</p>

              <Textarea
                value={media.story || ''}
                onChange={e =>
                  setUploadedMedia(prev =>
                    prev.map(m =>
                      m.id === media.id ? { ...m, story: e.target.value } : m
                    )
                  )
                }
                rows={4}
                placeholder="Story will appear here..."
              />

              <div className="flex gap-3">
                <Button onClick={generateStory}>Generate Story</Button>

                <Button
                  onClick={generateVideoClip}
                  disabled={!media.story || loadingVideo}
                >
                  {loadingVideo ? 'Generating Video...' : 'Generate Video Clip'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))} */}

      {uploadedMedia.length > 0 && (
        <div className="mt-6">
          <div className="border rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4">

            {/* Left Side: Media & Info */}
            <div className="flex flex-col gap-3 w-full md:w-[30%]" >
              {uploadedMedia.find(m => m.type === 'image')?.storyUrl && (
                <img
                  src={uploadedMedia.find(m => m.type === 'image')?.storyUrl}
                  alt="Uploaded Image"
                  className="rounded-md w-64 object-cover"
                />
              )}

              {uploadedMedia.find(m => m.type === 'video')?.storyUrl && (
                <video
                  controls
                  src={uploadedMedia.find(m => m.type === 'video')?.storyUrl}
                  className="rounded-md w-64"
                />
              )}

              {uploadedMedia.find(m => m.type === 'audio')?.voiceUrl && (
                <audio controls className="w-full">
                  <source
                    src={`${BASE_URL}/${uploadedMedia.find(m => m.type === 'audio')?.voiceUrl}`}
                    type="audio/mp3"
                  />
                  Your browser does not support the audio tag.
                </audio>
              )}

              <div className="space-y-1 text-sm">
                <p><strong>Transcript:</strong> {uploadedMedia[0]?.transcript || 'Not available'}</p>
                <p><strong>Tags:</strong> {uploadedMedia[0]?.tags?.join(', ') || 'Not generated'}</p>
                <p><strong>Emotions:</strong> {uploadedMedia[0]?.emotions || 'Not detected'}</p>
              </div>
            </div>

            {/* Right Side: Text & Actions */}
            <div className="flex flex-col gap-3 w-full md:w-[70%]">
              <Textarea
                className="w-full"
                value={uploadedMedia[0]?.story || ''}
                onChange={e =>
                  setUploadedMedia(prev =>
                    prev.map(m =>
                      m.id === uploadedMedia[0].id ? { ...m, story: e.target.value } : m
                    )
                  )
                }
                rows={6}
                placeholder="Story will appear here..."
              />

              {uploadedMedia[0] && (
                <AudioUpload
                  media={uploadedMedia[0]}
                  setUploadedMedia={setUploadedMedia}
                  BASE_URL={BASE_URL}
                />
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={generateStory}>Generate Story</Button>
                <Button
                  onClick={generateVideoClip}
                  disabled={!uploadedMedia[0]?.story || loadingVideo}
                >
                  {loadingVideo ? 'Generating Video...' : 'Generate Video Clip'}
                </Button>
              </div>

              <div className="text-sm font-semibold truncate">{uploadedMedia[0]?.name}</div>
              <div className="text-xs text-muted-foreground">
                Status: {uploadedMedia[0]?.transcriptionStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video preview */}
      {uploadedMedia.map(media => (
        <div key={media.id}>
          {/* <p><strong>{media.name}</strong> ({media.type})</p> */}
          {media.storyUrl && media.type === 'video' && (
            <div className='border p-3 mt-4 rounded'>
              <video controls className="w-64 mt-2 rounded">
                <source src={media.storyUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      ))}

    </div>
  );
};




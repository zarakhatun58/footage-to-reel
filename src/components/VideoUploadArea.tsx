import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from "@ramonak/react-progress-bar";
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import api, { BASE_URL } from '@/services/apis';
import { MediaStatsBar } from './MediaStatsBar';
import getYouTubeID from 'get-youtube-id';
import axios from 'axios';
import AudioUploadModal from './AudioUpload';


export type UploadedMedia = {
  _id: string;
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


export const VideoUploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
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
    const type =
      mimeType.startsWith('image')
        ? 'image'
        : mimeType.startsWith('video')
        ? 'video'
        : 'voiceover';

    // ✅ Only call uploadFileToServer — preview is handled there
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
    const tempId = `${Date.now()}-${Math.random()}`;
    const type: UploadedMedia['type'] =
      file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('audio')
        ? 'audio'
        : file.type.startsWith('image')
        ? 'image'
        : 'unknown';

    // ✅ No pushing here either
    uploadFileToServer(tempId, file, type);
  });
};

const uploadFileToServer = async (mediaId: string, file: File, type: string) => {
  const formData = new FormData();
  formData.append(
    type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
    file
  );

  // ✅ Add preview placeholder here
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

        const newMedia = {
          id: uploadedItem._id || mediaId,
          name: uploadedItem.filename,
          size: file.size,
          type,
          transcriptionStatus: uploadedItem.status || 'completed',
          thumbnail:
            uploadedItem.thumbnail ||
            uploadedItem.images?.[0] ||
            (uploadedItem.filename.endsWith('.jpg') ||
            uploadedItem.filename.endsWith('.png')
              ? uploadedItem.filename
              : previewUrl),
          transcript: uploadedItem.transcript || '',
          tags: uploadedItem.tags || [],
          emotions: uploadedItem.emotions || '',
          story: '',
          storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`,
          images: uploadedItem.images || []
        };

        console.log('📌 Tags:', uploadedItem.tags);
        console.log('📌 Transcript:', uploadedItem.transcript);
        console.log('📌 Emotions:', uploadedItem.emotions);

        // ✅ Replace placeholder with enriched backend data
        setUploadedMedia((prev: any) =>
          prev.map((media: any) => (media.id === mediaId ? newMedia : media))
        );

        setMediaId(uploadedItem._id);
        setStoryText('');

        if (type === 'audio' && uploadedItem.filename) {
          setStoryAudioUrl(`${BASE_URL}/uploads/${uploadedItem.filename}`);
        }
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
        media.id === mediaId
          ? { ...media, transcriptionStatus: 'error' }
          : media
      )
    );
  }
};

const generateStory = async () => {
  // ✅ Find the first media with a transcript
  const mediaWithTranscript = uploadedMedia.find(
    m => m.transcript && m.transcript.trim() !== ''
  );

  if (!mediaWithTranscript) {
    alert('❌ No transcript found. Please upload media that has a transcript first.');
    return;
  }

  const stop = simulateProgress(setStoryProgress); // progress animation
  const prompt = 'Create a motivational story about learning to code.'; // default prompt

  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: mediaWithTranscript.transcript,
        prompt
      })
    });

    const result = await res.json();

    if (!res.ok || !result.story) {
      throw new Error(result.error || 'Story generation failed');
    }

    // ✅ Update UI with story
    setStoryText(result.story);

    if (result.storyAudioUrl) {
      setStoryAudioUrl(result.storyAudioUrl);
    }

    setUploadedMedia(prev =>
      prev.map(m =>
        m.id === mediaWithTranscript.id
          ? { ...m, story: result.story, prompt }
          : m
      )
    );

    console.log('✅ Story generated:', result.story);

  } catch (error) {
    console.error('Story generation error:', error);
    alert('❌ Failed to generate story');
  } finally {
    stop(); // finish progress animation
  }
};


  // const generateStory = async () => {
  //   if (!uploadedMedia[0]) return;
  //   const stop = simulateProgress(setStoryProgress); // Start progress animation
  //   const prompt = 'Create a motivational story about learning to code.';
  //   try {

  //     const res = await fetch(`${BASE_URL}/api/generate`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         transcript: uploadedMedia[0].transcript,
  //         prompt
  //       })
  //     });

  //     const result = await res.json();

  //     if (!res.ok || !result.story) {
  //       throw new Error(result.error || 'Story generation failed');
  //     }

  //     setStoryText(result.story);
  //     if (result.storyAudioUrl) {
  //       setStoryAudioUrl(result.storyAudioUrl);
  //     }
  //     setUploadedMedia(prev =>
  //       prev.map(m =>
  //         m.id === uploadedMedia[0].id
  //           ? { ...m, story: result.story, prompt }
  //           : m
  //       )
  //     );

  //   } catch (error) {
  //     console.error('Story generation error:', error);
  //     alert('❌ Failed to generate story');
  //   } finally {
  //     stop(); // Complete progress
  //   }
  // };

  // const generateVideoClip = async () => {
  //   if (!storyText || !uploadedMedia[0]) return;

  //   setLoadingVideo(true);
  //   const stop = simulateProgress(setVideoProgress); // starts progress bar

  //   let timeoutId: NodeJS.Timeout | null = null;

  //   try {
  //     // Alert user if render takes more than 2 minutes
  //     timeoutId = setTimeout(() => {
  //       alert('⚠️ Video is taking longer than expected to render. Please check back later.');
  //     }, 2 * 60 * 1000);

  //     const trimmedImages = uploadedMedia[0].images?.slice(0, 10);

  //     const res = await fetch(`${BASE_URL}/api/speech/generate-video`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         storyText,
  //         images: trimmedImages || [],
  //         mediaId
  //       })
  //     });

  //     const data = await res.json();
  //     const renderId = data?.renderId;

  //     if (!data.success || !renderId) {
  //       console.error('❌ Backend did not return a render ID:', data);
  //       throw new Error('Render ID not returned from backend.');
  //     }

  //     alert(`🎬 Video rendering started!\nRender ID: ${renderId}`);

  //     // Update media state immediately
  //     setUploadedMedia(prev =>
  //       prev.map(m =>
  //         m.id === mediaId
  //           ? {
  //             ...m,
  //             type: 'video',
  //             storyUrl: data?.storyUrl || '',
  //             renderId,
  //             transcriptionStatus: 'processing'
  //           }
  //           : m
  //       )
  //     );

  //     // ✅ Start polling for video render status
  //     const pollForResult = async () => {
  //       const maxTries = 40;
  //       const delayMs = 2000;

  //       for (let i = 0; i < maxTries; i++) {
  //         const statusRes = await fetch(`${BASE_URL}/api/speech/render-status/${renderId}`);
  //         const statusData = await statusRes.json();
  //         console.log(`📡 Poll #${i + 1}:`, statusData);
  //         console.log(`ℹ️ Status: ${statusData.status}`);
  //         if (statusData.status === 'done' && statusData.url) {
  //           setUploadedMedia(prev =>
  //             prev.map(m =>
  //               m.renderId === renderId
  //                 ? {
  //                   ...m,
  //                   storyUrl: statusData.url,
  //                   transcriptionStatus: 'completed'
  //                 }
  //                 : m
  //             )
  //           );
  //           alert('✅ Video rendering complete!');
  //           return;
  //         }

  //         await new Promise(res => setTimeout(res, delayMs));
  //       }

  //       alert('⚠️ Video is taking longer than expected to render. Please check back later.');
  //     };

  //     await pollForResult();
  //   } catch (error) {
  //     console.error('❌ Video generation error:', error);
  //     alert('❌ Video generation failed. Please try again.');
  //   } finally {
  //     if (timeoutId) clearTimeout(timeoutId);
  //     stop(); // stop progress bar
  //     setLoadingVideo(false);
  //   }
  // };


const generateVideoClip = async () => {
  // Find the uploaded media record
  const media = uploadedMedia.find((m) => m.id === mediaId);
  if (!media) {
    alert("Media not found.");
    return;
  }

  // Extract all image filenames
  const imageNames = Array.isArray(media.images)
    ? media.images.map((imgUrl) => imgUrl.split("/").pop()).filter(Boolean)
    : [];

  // Extract audio filename (optional now)
  const audioName = media.voiceUrl ? media.voiceUrl.split("/").pop() : null;

  if (imageNames.length === 0) {
    alert("Missing required image(s).");
    return;
  }

  setLoadingVideo(true);
  const stop = simulateProgress(setVideoProgress);

  try {
    const res = await fetch(`${BASE_URL}/api/apivideo/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageNames,
        audioName, // can be null, backend handles fallback
        mediaId,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Video generation failed.");
    }

    setUploadedMedia((prev) =>
      prev.map((m) =>
        m.id === mediaId
          ? {
              ...m,
              type: "video",
              storyUrl: data.videoUrl,
              transcriptionStatus: "completed",
            }
          : m
      )
    );

    // Upload final video to backend
    if (!data.videoUrl) {
  throw new Error("Video URL is missing. Cannot upload final video.");
}
    const uploadRes = await fetch(`${BASE_URL}/api/apivideo/upload-final`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId,
        videoUrl: data.videoUrl,
        title: media.title,
        userId: media.id,
      }),
    });

    const uploadData = await uploadRes.json();
    if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");

    alert("✅ Video generated and uploaded successfully!");
  } catch (error) {
    console.error("❌ Video generation error:", error);
    alert("❌ Video generation failed. Please try again.");
  } finally {
    stop();
    setLoadingVideo(false);
  }
};


  // Fetch all public/global videos

  useEffect(() => {
    const savedVideos = localStorage.getItem('videos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      fetch(`${BASE_URL}/api/videos`)
        .then(res => res.json())
        .then(data => {
          const videosArray = Array.isArray(data) ? data : data.videos || [];
          setVideos(videosArray);
          localStorage.setItem('videos', JSON.stringify(videosArray));
        })
        .catch(console.error);
    }
  }, []);

  // Top 3 ranked videos from all videos (uploaded + global)
  const allVideosCombined = [...uploadedMedia, ...videos];
  const topRankedVideos = allVideosCombined
    .sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0))
    .slice(0, 3);
  // Whenever videos change, update localStorage




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



 const handleDeleteVideo = async (id: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/media/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      // Remove from uploadedMedia
      setUploadedMedia(prev => prev.filter(media => media._id !== id && media.id !== id));

      // Remove from all videos
      setVideos(prev => prev.filter(video => video._id !== id && video.id !== id));

    }
  } catch (err) {
    console.error("Failed to delete video", err);
  }
};


const getAllVideos = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/apivideo/all-generate-video`);
    if (res.data.success) {
      const videosArray = Array.isArray(res.data.videos) ? res.data.videos : [];
      setVideos(videosArray); // ✅ keep consistent
      localStorage.setItem('videos', JSON.stringify(videosArray));
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
  } finally {
    setLoadingVideo(false);
  }
};

useEffect(() => {
  getAllVideos();
}, []);


  const videoId = getYouTubeID('https://youtu.be/abc123XYZ');
  console.log(videoId);

  const removeMedia = (type: 'image' | 'video' | 'audio') => {
    setUploadedMedia(prev => prev.filter(m => m.type !== type));
  };
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
      {storyProgress > 0 && storyProgress < 100 && (
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
      )}

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

   {uploadedMedia.length > 0 && (() => {
  const imageMedia = uploadedMedia.find(m => m.type === 'image');
  const videoMedia = uploadedMedia.find(m => m.type === 'video');
  const audioMedia = uploadedMedia.find(m => m.type === 'audio');

  // ✅ Find the first media object that actually has transcript/tags/emotions
  const mediaWithData =
    uploadedMedia.find(
      m => (m.transcript && m.transcript.trim() !== '') ||
           (m.tags && m.tags.length > 0) ||
           (Array.isArray(m.emotions) && m.emotions.length > 0) ||
           (typeof m.emotions === 'string' && m.emotions.trim() !== '')
    ) || uploadedMedia[0];

  return (
    <div className="mt-6">
      <div className="border rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4">
        {/* ---------- Left column: previews ---------- */}
        <div className="flex flex-col gap-3 w-full md:w-[30%]">
          {imageMedia?.storyUrl && (
            <img
              src={imageMedia.storyUrl}
              alt="Uploaded Image"
              className="rounded-md w-64 object-cover"
            />
          )}

          {videoMedia?.storyUrl && (
            <video controls src={videoMedia.storyUrl} className="rounded-md w-64" />
          )}

          {audioMedia?.storyUrl && (
            <audio controls className="w-full">
              <source src={audioMedia.storyUrl} type="audio/mp3" />
              Your browser does not support the audio tag.
            </audio>
          )}

          {/* ---------- Metadata ---------- */}
          <div className="space-y-1 text-sm">
            <p><strong>Transcript:</strong> {mediaWithData?.transcript || 'Not available'}</p>
            <p><strong>Tags:</strong> {mediaWithData?.tags?.join(', ') || 'Not generated'}</p>
            <p><strong>Emotions:</strong> {
              mediaWithData?.emotions
                ? Array.isArray(mediaWithData.emotions)
                  ? mediaWithData.emotions.join(', ')
                  : mediaWithData.emotions
                : 'Not detected'
            }</p>
          </div>
        </div>

        {/* ---------- Right column: story + actions ---------- */}
        <div className="flex flex-col gap-3 w-full md:w-[70%]">
          <Textarea
            className="w-full"
            value={mediaWithData?.story || ''}
            onChange={e =>
              setUploadedMedia(prev =>
                prev.map(m =>
                  m.id === mediaWithData.id ? { ...m, story: e.target.value } : m
                )
              )
            }
            
            rows={6}
            placeholder="Story will appear here..."
          />

         
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateStory}>Generate Story</Button>
             {mediaWithData && (
            <AudioUploadModal
              media={mediaWithData}
              setUploadedMedia={setUploadedMedia}
            />
          )}

            <Button
              onClick={generateVideoClip}
              disabled={!mediaWithData?.story || loadingVideo}
            >
              {loadingVideo ? 'Generating Video...' : 'Generate Video Clip'}
            </Button>
          </div>

          <div className="text-sm font-semibold truncate">{mediaWithData?.name}</div>
          <div className="text-xs text-muted-foreground">
            Status: {mediaWithData?.transcriptionStatus}
          </div>
        </div>
      </div>
    </div>
  );
})()}


      {/* Video preview */}
      <h3 className="text-lg font-semibold mt-2">🎬 Your Generated Video</h3>
      {uploadedMedia.map(media => (
        <div key={media.id}>
          {media.storyUrl && media.type === 'video' && (
            <div className='border p-3 mt-4 rounded'>
              <video controls className="w-64 h-48 mt-2 rounded">
                <source src={media.storyUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <MediaStatsBar media={media} BASE_URL="https://footage-flow-server.onrender.com" />
              <button
                onClick={() => handleDeleteVideo(media.id)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
   
      {/* all - video  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map(video => (
          <div key={video._id} className="border rounded shadow hover:shadow-lg transition-shadow relative">
            <video
              controls
              className="w-64 h-48 object-cover rounded-t"
              src={video.storyUrl}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>

            <div className="p-3">
              <p className="truncate font-medium">{video.title || "Untitled Video"}</p>
               <MediaStatsBar media={video} BASE_URL={BASE_URL} />
            </div>

            {/* Optional delete button on top-right */}
            <button
              onClick={() => handleDeleteVideo(video._id)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              title="Delete Video"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};




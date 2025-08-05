import React, { useState, useCallback, useEffect } from 'react';
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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [editTranscriptId, setEditTranscriptId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState<string>('');
  const { toast } = useToast();
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [mediaId, setMediaId] = useState<string>('');

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

      setUploadedMedia((prev:any )=> [...prev, { id: tempId, name: file.name, type }]);
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

  // const uploadFileToServer = async (
  //   mediaId: string,
  //   file: File,
  //   type: UploadedMedia['type']
  // ) => {
  //   const formData = new FormData();
  //   formData.append(
  //     type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
  //     file
  //   );

  //   // ✅ Safe upload progress and state update
  //   setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }));

  //   setUploadedMedia((prev: any) => {
  //     if (!prev.length) return [{ id: mediaId, transcriptionStatus: 'processing' }];
  //     return prev.map((media: any) =>
  //       media.id === mediaId ? { ...media, transcriptionStatus: 'processing' } : media
  //     );
  //   });

  //   try {
  //     // ✅ 1. Upload the file
  //     const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
  //       method: 'POST',
  //       body: formData
  //     });

  //     const result = await uploadRes.json();
  //     const uploadedItem = result.uploaded?.[0];
  //     if (!uploadedItem) throw new Error('Upload returned no file');

  //     // ✅ 2. Use enriched metadata directly
  //     const newMedia: UploadedMedia = {
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
  //       storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`
  //     };

  //     // ✅ 3. Update state
  //     setUploadedMedia(prev =>
  //       prev.map(media => (media.id === mediaId ? newMedia : media))
  //     );
  //     setMediaId(uploadedItem._id);
  //     setStoryText(uploadedItem.story || '');

  //     toast({
  //       title: 'Upload complete',
  //       description: `${file.name} uploaded and analyzed.`
  //     });

  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     setUploadedMedia(prev =>
  //       prev.map(media =>
  //         media.id === mediaId
  //           ? { ...media, transcriptionStatus: 'error' }
  //           : media
  //       )
  //     );
  //     toast({
  //       title: 'Upload failed',
  //       description: `${file.name} could not be uploaded.`,
  //       variant: 'destructive'
  //     });
  //   }
  // };

const uploadFileToServer = async (mediaId: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append(
      type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
      file
    );

    setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }));

    setUploadedMedia(prev =>
      prev.map(m => (m.id === mediaId ? { ...m, transcriptionStatus: 'processing' } : m))
    );

    try {
      const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
        method: 'POST',
        body: formData
      });

      const result = await uploadRes.json();
      const uploadedItem = result.uploaded?.[0];
      if (!uploadedItem) throw new Error('Upload returned no file');

      const newMedia = {
        id: uploadedItem._id || mediaId,
        name: uploadedItem.filename,
        size: file.size,
        type,
        transcriptionStatus: 'completed',
        thumbnail:
          uploadedItem.thumbnail ||
          uploadedItem.images?.[0] ||
          (uploadedItem.filename.endsWith('.jpg') || uploadedItem.filename.endsWith('.png')
            ? uploadedItem.filename
            : null),
        transcript: uploadedItem.transcript || '',
        tags: uploadedItem.tags || [],
        emotions: uploadedItem.emotions?.join(', ') || '',
        story: uploadedItem.story || '',
        storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`,
        images: uploadedItem.images || []
      };

      setUploadedMedia((prev:any) =>
        prev.map((media:any) => (media.id === mediaId ? newMedia : media))
      );
      setMediaId(uploadedItem._id);
      setStoryText(uploadedItem.story || '');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedMedia(prev =>
        prev.map(media =>
          media.id === mediaId ? { ...media, transcriptionStatus: 'error' } : media
        )
      );
    }
  };


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

  const generateStory = async () => {
    if (!uploadedMedia[0]) return;

    try {
      const prompt = 'Create a motivational story about learning to code.';
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
    }
  };

  const generateVideoClip = async () => {
    if (!storyText || !uploadedMedia[0]) return;
    setLoadingVideo(true);

    try {
      const res = await fetch(`${BASE_URL}/api/speech/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText,
          images: uploadedMedia[0].images || [],
          mediaId
        })
      });

      const data = await res.json();

      if (data.success && data.renderId && data.videoUrl) {
        alert('🎬 Video Ready!\nRender ID: ' + data.renderId);

        // Save new video result in uploadedMedia
        setUploadedMedia(prev =>
          prev.map(m =>
            m.id === mediaId
              ? {
                ...m,
                type: 'video',
                storyUrl: data.videoUrl,
                renderId: data.renderId,
                transcriptionStatus: 'completed'
              }
              : m
          )
        );
      } else {
        throw new Error('Render failed');
      }

    } catch (error) {
      console.error('Video generation error:', error);
      alert('❌ Video generation failed');
    } finally {
      setLoadingVideo(false);
    }
  };


  const pollRenderStatus = async (renderId: string, onComplete: (videoUrl: string) => void) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/speech/render-status/${renderId}`);
        const data = await res.json();

        if (data.status === 'done' && data.url) {
          clearInterval(interval);
          onComplete(data.url);
        }

        if (data.status === 'failed') {
          clearInterval(interval);
          toast({
            title: '❌ Render failed',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Render polling error:', err);
        clearInterval(interval);
      }
    }, 5000); // check every 5 seconds
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

  const videoUrl =
    uploadedMedia?.length > 0 &&
      uploadedMedia?.[0]?.type === 'video' &&
      uploadedMedia?.[0]?.storyUrl
      ? uploadedMedia[0].storyUrl
      : null;
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
      {uploadedMedia.length > 0 &&
        uploadedMedia[0]?.id &&
        uploadProgress[uploadedMedia[0].id] !== undefined && (
          <div className="w-full mt-2">
            <ProgressBar
              completed={uploadProgress[uploadedMedia[0].id]}
              maxCompleted={100}
              height="8px"
              isLabelVisible={false}
              bgColor="orange"
              baseBgColor="#e5e7eb" // Tailwind gray-200
              labelAlignment="right"
              animateOnRender
              customLabel={`${uploadProgress[uploadedMedia[0].id]}%`}
            />
            <div className="text-xs text-right mt-1 text-gray-600">
              {uploadProgress[uploadedMedia[0].id]}%
            </div>
          </div>
        )}

      {uploadedMedia.length > 0 && uploadedMedia.map(media => (
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
      ))}
      {/* Video preview */}
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="rounded w-full col-span-2 mt-4"
        />
      )}

      {/* Audio Options */}
      <div className="col-span-2 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-music mr-2"></i>Audio Settings
          </h2>
          <div className="space-x-2">
            <Button style={{ backgroundColor: '#FF8C00' }} onClick={toggleAudioOptions}>
              {showAudioOptions ? 'Hide Audio Options' : 'Show Audio Options'}
            </Button>
            <Button style={{ backgroundColor: '#FF8C00' }} onClick={toggleManualOptions}>
              {manualOptions ? 'Auto Select' : 'Manual Select'}
            </Button>
          </div>
        </div>

        {showAudioOptions && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-gray-700 mb-4">Choose how to handle audio in your generated story</p>

            <div className="space-y-3">
              {['original', 'silent', 'custom'].map(mode => (
                <label
                  key={mode}
                  className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="radio"
                    name="audioMode"
                    value={mode}
                    checked={selectedAudioMode === mode}
                    onChange={() => handleAudioModeChange(mode)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-800 font-medium capitalize">{mode}</span>
                  <p className="ml-2 text-gray-600 text-sm">
                    {mode === 'original' && 'Use the original audio from your video footage'}
                    {mode === 'silent' && 'Create a silent video with no audio track'}
                    {mode === 'custom' && 'Upload your own audio file to replace the original'}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




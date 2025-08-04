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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReactPlayer from 'react-player';
import { BASE_URL } from '@/services/apis';
import { RenderProgress } from './RenderProgress ';
import { MediaStatsBar } from './MediaStatsBar';

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
  const [editTranscriptId, setEditTranscriptId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState<string>('');
  const { toast } = useToast();
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [renderId, setRenderId] = useState<string | null>(null);

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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
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

  const uploadFileToServer = async (mediaId: string, file: File, type: UploadedMedia['type']) => {
    const formData = new FormData();
    formData.append(
      type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover',
      file
    );

    setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }));
    setUploadedMedia(prev =>
      prev.map(media =>
        media.id === mediaId ? { ...media, transcriptionStatus: 'processing' } : media
      )
    );

    try {
      // 1. Upload the file (just upload)
      const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await uploadRes.json();
      const uploadedItem = result.uploaded?.[0];
      if (!uploadedItem) throw new Error('Upload returned no file');

      // 2. Use uploadedItem directly (already contains transcript, tags, emotions, etc.)
      const enrichedMedia = uploadedItem;

      const newMedia: UploadedMedia = {
        id: enrichedMedia._id || mediaId,
        name: enrichedMedia.filename,
        size: file.size,
        type,
        transcriptionStatus: 'completed',
        thumbnail: enrichedMedia.filename,
        transcript: enrichedMedia.transcript || '',
        tags: enrichedMedia.tags || [],
        emotions: enrichedMedia.emotions?.join(', ') || '',
        story: enrichedMedia.story || '',
        storyUrl: `${BASE_URL}/uploads/${enrichedMedia.filename}`
      };

      setUploadedMedia(prev =>
        prev.map(media => (media.id === mediaId ? newMedia : media))
      );

      toast({
        title: 'Upload complete',
        description: `${file.name} uploaded and analyzed.`
      });

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedMedia(prev =>
        prev.map(media =>
          media.id === mediaId
            ? { ...media, transcriptionStatus: 'error' }
            : media
        )
      );
      toast({
        title: 'Upload failed',
        description: `${file.name} could not be uploaded.`,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const fetchUploadedVideos = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/videos`);
        const data = await res.json();

        if (data?.videos) {
          const loadedMedia: UploadedMedia[] = data.videos.map((item: any) => ({
            id: item._id,
            name: item.filename,
            size: item.size || 0,
            type: item.mediaType || 'unknown',
            transcriptionStatus: 'completed',
            thumbnail: item.filename,
            transcript: item.transcript || '',
            tags: item.tags || [],
            emotions: item.emotions?.join(', ') || '',
            story: item.story || '',
            storyUrl: `${BASE_URL}/uploads/${item.filename}`
          }));

          setUploadedMedia(loadedMedia);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      }
    };
    fetchUploadedVideos();
  }, []);

  const generateStory = async (media: UploadedMedia) => {
    try {
      const prompt = 'Create a motivational story about learning to code.'; // or get this from user input

      // Call the story generation API
      const storyRes = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: media.transcript, prompt })
      });

      const result = await storyRes.json();

      if (!storyRes.ok || !result.story) {
        throw new Error(result.error || 'No story generated');
      }

      // Update UI with new story and prompt
      setUploadedMedia(prev =>
        prev.map(m =>
          m.id === media.id
            ? { ...m, story: result.story, prompt: result.prompt }
            : m
        )
      );

      toast({
        title: 'Story Generated',
        description: 'Your story is saved and ready to share.'
      });
    } catch (error) {
      console.error('Story generation failed:', error);
      toast({
        title: 'Failed to generate story',
        description: 'There was a problem creating the story.',
        variant: 'destructive'
      });
    }
  };

  const generateVideoClip = async (storyText: string, images: string[], mediaId?: string) => {
    setLoadingVideo(true);

    try {
      const res = await fetch(`${BASE_URL}/api/speech/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText, images, mediaId })
      });

      const data = await res.json();

      if (data.success && data.renderId) {
        toast({
          title: '🎬 Video rendering started',
          description: `Render ID: ${data.renderId}`
        });

        pollRenderStatus(data.renderId, (videoUrl) => {
          toast({
            title: '✅ Video Ready!',
            description: 'Click to view your rendered video.',
          });

          setUploadedMedia(prev =>
            prev.map(m =>
              m.id === data.id
                ? {
                  ...m,
                  type: 'video',
                  storyUrl: videoUrl,
                  transcriptionStatus: 'completed'
                }
                : m
            )
          );

          setLoadingVideo(false);
        });
      } else {
        throw new Error('Render initiation failed');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: 'Error generating video',
        description: 'Something went wrong during the video generation process.',
        variant: 'destructive'
      });
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
              <input type="file" multiple accept="video/*,audio/*,image/*" onChange={handleFileInput} className="hidden" />
            </label>
          </Button>
        </div>
      </Card>
      {uploadedMedia.map(media => (
        <div key={media.id} className="flex flex-col gap-4 p-4 bg-gradient-card rounded-lg border">
          <div className="flex items-start gap-4">
            {media.thumbnail && media.type === 'image' && (
              <img src={`${BASE_URL}/uploads/${media.thumbnail}`} alt="Thumbnail" className="w-40 h-40 rounded-md object-cover" />
            )}
            {media.type === 'video' && media.storyUrl && (
              <ReactPlayer src={media.storyUrl} controls width="30%" height="auto" className="rounded-lg shadow" />
            )}
            <div className="flex-1 min-w-0">

              {media.transcriptionStatus === 'completed' && (
                <div className="mt-2 flex items-start gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => { setEditTranscriptId(media.id); setTranscriptDraft(media.transcript || ''); }}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit Transcript
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <Textarea value={transcriptDraft} onChange={(e) => setTranscriptDraft(e.target.value)} className="h-40 mb-4" />
                      <Button onClick={() => {
                        setUploadedMedia(prev => prev.map(m => m.id === media.id ? { ...m, transcript: transcriptDraft } : m));
                        setEditTranscriptId(null);
                        generateStory({ ...media, transcript: transcriptDraft });
                      }}>Generate & Save Story</Button>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={() => generateStory(media)}>
                    Generate Story
                  </Button>
                  <Button size="sm" onClick={() => generateVideoClip(media.story || '', media.images || [], media.id)}>
                    {loadingVideo ? 'Generating...' : 'Generate Video Clip'}
                  </Button>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Transcript:</strong> {media.transcript || 'Not available'}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>AI Tags:</strong> {media.tags?.join(', ') || 'Not generated'}
                </p>
                <p className="text-sm text-pink-600 mt-2">
                  <strong>Emotion:</strong> {media.emotions || 'Not detected'}
                </p>
              </div>
            </div>
          </div>
          <div className='gap-4 p-4 '>
            <p
              className={`text-sm text-black whitespace-pre-wrap transition-all duration-300 ${expandedStoryId === media.id ? '' : 'line-clamp-3'
                }`}>
              <strong>Story:</strong> {media.story}

            </p>
            {media.story?.length > 0 && (
              <button
                onClick={() =>
                  setExpandedStoryId(prev => (prev === media.id ? null : media.id))
                }
                className="text-blue-500 text-sm mt-1 hover:underline"
              >
                {expandedStoryId === media.id ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
          {media.type === 'video' && media.storyUrl && (
            <>
              <video
                src={media.storyUrl}
                controls
                className="w-full rounded-md"
              />

            {media.renderId && <RenderProgress renderId={media.renderId} />}

              {renderedVideoUrl && (
                <video controls className="rounded w-full max-w-xl">
                  <source src={renderedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {media.renderId && status === 'done' && (
                <MediaStatsBar media={media} />
              )}
            </>
          )}

        </div>
      ))}


    </div>
  );
};




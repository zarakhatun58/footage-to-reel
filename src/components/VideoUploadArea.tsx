import React, { useState, useCallback } from 'react';
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
};



export const VideoUploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [editTranscriptId, setEditTranscriptId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState<string>('');
  const { toast } = useToast();

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
    formData.append(type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover', file);

    setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }));
    setUploadedMedia(prev =>
      prev.map(media => (media.id === mediaId ? { ...media, transcriptionStatus: 'processing' } : media))
    );

    try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      const uploadedItem = result.uploaded?.[0];
      if (!uploadedItem) return;
      const newMedia = {
        id: uploadedItem._id || mediaId,
        name: uploadedItem.filename,
        size: file.size,
        type,
        transcriptionStatus: 'completed',
        thumbnail: uploadedItem.filename,
        transcript: uploadedItem.transcript || '',
        tags: uploadedItem.tags || [],
        emotions: uploadedItem.emotions || '',
        story: uploadedItem.story || '',
        storyUrl: `${BASE_URL}/uploads/${uploadedItem.filename}`
      };
      setUploadedMedia((prev: any) =>
        prev.map((media: any) => (media.id === mediaId ? newMedia : media))
      );

      toast({ title: 'Upload complete', description: `${file.name} is uploaded.` });
    } catch (error) {
      setUploadedMedia(prev =>
        prev.map(media => (media.id === mediaId ? { ...media, transcriptionStatus: 'error' } : media))
      );
      toast({ title: 'Upload failed', description: `${file.name} could not be uploaded.`, variant: 'destructive' });
    }
  };

  const generateTagsAndStory = async (media: UploadedMedia) => {
    const tagsRes = await fetch(`${BASE_URL}/api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: media.transcript })
    });
    const tagsData = await tagsRes.json();

    const storyRes = await fetch(`${BASE_URL}/api/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: media.transcript, tags: tagsData.tags })
    });
    const story = await storyRes.json();

    await fetch(`${BASE_URL}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...story, mediaId: media.id })
    });

    setUploadedMedia(prev =>
      prev.map(m => (m.id === media.id ? { ...m, tags: tagsData.tags, story: story.story, emotions: story.emotion } : m))
    );

    toast({ title: 'Story Generated', description: 'Your story is saved and ready to share.' });
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
            {media.thumbnail && (
              <img src={`${BASE_URL}/uploads/${media.thumbnail}`} alt="Thumbnail" className="w-150 h-200 rounded-md object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{media.transcript}</p>
              <p className="text-sm text-muted-foreground">{media.story}</p>
              {media.transcriptionStatus === 'completed' && (
                <div className="mt-2 flex items-start gap-2">
                  <Dialog >
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
                        generateTagsAndStory({ ...media, transcript: transcriptDraft });
                      }}>Generate & Save Story</Button>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={() => generateTagsAndStory(media)}>
                    Generate Story
                  </Button>
                </div>
              )}

              {media.tags?.length > 0 && (
                <div className="mt-2 text-sm text-blue-700">
                  <strong>AI Tags:</strong> {media.tags.join(', ')}
                </div>
              )}
              {media.emotions && (
                <p className="text-sm text-pink-600">
                  <strong>Emotion:</strong> {media.emotions}
                </p>
              )}
             
            </div>
          </div>
          {media.type === 'video' && media.storyUrl && (
            <ReactPlayer src={media.storyUrl} controls width="100%" height="auto" className="rounded-lg shadow" />
          )}
        </div>
      ))}
    </div>
  );
};



import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  File,
  Video,
  Image,
  Music,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  Folder,
  Cloud,
  Link
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UploadedMedia } from "./VideoUploadArea";
import { BASE_URL } from "@/services/apis";
import { Textarea } from "./ui/textarea";
import AudioUploadModal from "./AudioUpload";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  preview?: string;

  // New fields for processing
  transcription?: string;
  story?: string;
  clipUrl?: string;
  audioTrack?: string;
  processingStatus?: "idle" | "processing" | "done" | "error";
}

export const UploadInterface = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [mediaId, setMediaId] = useState<string>('');
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [storyAudioUrl, setStoryAudioUrl] = useState('');
const [storyText, setStoryText] = useState('');

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('audio/')) return Music;
    return File;
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('video/')) return 'text-blue-500';
    if (type.startsWith('image/')) return 'text-green-500';
    if (type.startsWith('audio/')) return 'text-purple-500';
    return 'text-gray-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadFile[] = fileList.map(file => {
      const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      // Add placeholder to uploadedMedia
      setUploadedMedia((prev: any) => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          size: file.size,
          type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : 'unknown',
          transcriptionStatus: 'processing',
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          transcript: '',
          tags: [],
          emotions: '',
          story: '',
          images: []
        }
      ]);

      return {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id, fileList.find(f => f.name === file.name)!);
    });
  };



  const simulateUpload = async (fileId: string, file: File) => {
    const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : 'unknown';
    const formData = new FormData();
    formData.append(type === 'image' ? 'images' : type === 'video' ? 'video' : 'voiceover', file);

    const previewUrl = URL.createObjectURL(file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        const uploadedItem = result.uploaded?.[0];

        if (uploadedItem) {
          setUploadedMedia(prev => prev.map(m => m.id === fileId ? {
            ...m,
            id: uploadedItem._id || fileId,
            transcriptionStatus: uploadedItem.status || 'completed',
            thumbnail: uploadedItem.thumbnail || previewUrl,
            transcript: uploadedItem.transcript || '',
            tags: uploadedItem.tags || [],
            emotions: uploadedItem.emotions || ''
          } : m));
          setMediaId(uploadedItem._id);
        }

        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "completed", progress: 100 } : f));
      } else {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error" } : f));
      }
    };

    xhr.onerror = () => {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error" } : f));
    };

    xhr.open('POST', `${BASE_URL}/api/uploads`);
    xhr.send(formData);
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
  
     
      const prompt = 'Create a motivational story about learning to code.'; 
  
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
        stop(); 
      }
    };

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
              title: data.title || m.title,
              thumbnailUrl: data.thumbnailUrl,
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

      setLoadingVideo(false);
    }
  };
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const recentProjects = [
    { id: 1, name: "Summer Vacation 2024", files: 24, size: "2.1 GB", thumbnail: "/api/placeholder/100/60" },
    { id: 2, name: "Wedding Highlights", files: 45, size: "5.8 GB", thumbnail: "/api/placeholder/100/60" },
    { id: 3, name: "Product Demo", files: 12, size: "890 MB", thumbnail: "/api/placeholder/100/60" },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Upload Your Media</h1>
          <p className="text-muted-foreground">
            Start creating amazing stories by uploading your videos, photos, and audio files.
          </p>
        </motion.div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Cloud Import</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>From URL</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Drag & Drop Area */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
                }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="video/*,image/*,audio/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your files here' : 'Drag & drop your files here'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse your device
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Videos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Image className="w-4 h-4 text-green-500" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Music className="w-4 h-4 text-purple-500" />
                    <span>Audio</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Upload Progress */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Upload Progress</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    const colorClass = getFileTypeColor(file.type);

                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4 p-3 bg-background rounded-lg border border-border"
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <FileIcon className={`w-12 h-12 ${colorClass}`} />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>

                          {file.status === "uploading" && (
                            <div className="mt-2">
                              <Progress value={file.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.round(file.progress)}% uploaded
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {file.status === "completed" && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {file.status === "error" && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="cloud" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {['Google Drive', 'Dropbox', 'OneDrive'].map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{service}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import files from your {service} account
                  </p>
                  <Button variant="outline" className="w-full">Connect</Button>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Import from URL</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="w-full">Import Video</Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

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
              <div className="border rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ---------- Left column: previews ---------- */}
                {loadingVideo && (
                  <div className="mt-2">
                    <Progress value={videoProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(videoProgress)}% generating video
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
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
                <div className="flex flex-col gap-3">
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
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Folder className="w-5 h-5 mr-2" />
            Recent Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 hover:scale-105 transition-transform cursor-pointer group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <Play className="w-8 h-8 text-white/70 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{project.files} files</span>
                  <span>{project.size}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Film, FileVideo, Loader2 } from "lucide-react";

interface UploadedVideo {
  id: string;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'error';
}

export const VideoUploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please upload only video files",
        variant: "destructive",
      });
    }

    videoFiles.forEach(file => {
      const videoId = `${Date.now()}-${Math.random()}`;
      
      // Add video to list
      const newVideo: UploadedVideo = {
        id: videoId,
        name: file.name,
        size: file.size,
        transcriptionStatus: 'pending'
      };
      
      setUploadedVideos(prev => [...prev, newVideo]);
      
      // Simulate upload progress
      simulateUpload(videoId, file);
    });
  };

  const simulateUpload = (videoId: string, file: File) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Start transcription simulation
        setTimeout(() => {
          setUploadedVideos(prev => 
            prev.map(video => 
              video.id === videoId 
                ? { ...video, transcriptionStatus: 'processing' }
                : video
            )
          );
          
          // Complete transcription after delay
          setTimeout(() => {
            setUploadedVideos(prev => 
              prev.map(video => 
                video.id === videoId 
                  ? { ...video, transcriptionStatus: 'completed' }
                  : video
              )
            );
            
            toast({
              title: "Video Processed",
              description: `${file.name} has been transcribed and is ready for search`,
            });
          }, 3000);
        }, 1000);
      }
      
      setUploadProgress(prev => ({ ...prev, [videoId]: progress }));
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedVideo['transcriptionStatus']) => {
    switch (status) {
      case 'pending':
        return <FileVideo className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-video-primary animate-spin" />;
      case 'completed':
        return <Film className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FileVideo className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadedVideo['transcriptionStatus']) => {
    switch (status) {
      case 'pending':
        return 'Pending upload';
      case 'processing':
        return 'AI transcribing...';
      case 'completed':
        return 'Ready for search';
      case 'error':
        return 'Processing failed';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Your Videos</h2>
        <p className="text-muted-foreground">Upload your personal footage to start creating AI-powered stories</p>
      </div>

      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-video-primary bg-video-primary/5' 
            : 'border-muted-foreground/25 hover:border-video-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-video-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-xl font-semibold mb-2">
            {dragActive ? 'Drop your videos here' : 'Upload your video memories'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Drag and drop video files or click to browse. Supports MP4, MOV, AVI and more.
          </p>
          
          <Button variant="ai" size="lg" asChild>
            <label className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Choose Videos
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </Card>

      {/* Uploaded Videos List */}
      {uploadedVideos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Processing Videos</h3>
          <div className="space-y-4">
            {uploadedVideos.map(video => (
              <div key={video.id} className="flex items-center gap-4 p-4 bg-gradient-card rounded-lg border">
                <div className="flex-shrink-0">
                  {getStatusIcon(video.transcriptionStatus)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{video.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(video.size)} • {getStatusText(video.transcriptionStatus)}
                  </p>
                  
                  {uploadProgress[video.id] !== undefined && uploadProgress[video.id] < 100 && (
                    <div className="mt-2">
                      <Progress value={uploadProgress[video.id]} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {Math.round(uploadProgress[video.id])}%
                      </p>
                    </div>
                  )}
                </div>
                
                {video.transcriptionStatus === 'completed' && (
                  <Button variant="outline" size="sm">
                    View Transcript
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
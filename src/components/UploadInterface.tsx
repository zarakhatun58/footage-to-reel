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
    const newFiles: UploadFile[] = fileList.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading" as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100);
          const newStatus = newProgress === 100 ? "completed" : "uploading";
          
          if (newProgress === 100) {
            clearInterval(interval);
          }
          
          return { ...file, progress: newProgress, status: newStatus };
        }
        return file;
      }));
    }, 500);
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
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragActive 
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
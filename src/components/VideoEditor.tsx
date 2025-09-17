import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
  Copy,
  Plus,
  Eye,
  Layers,
  Music,
  Type,
  Palette,
  Download,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { BASE_URL } from "@/services/apis";


type VideoType = {
  id: string;
  _id: string;
  filename: string;
  transcript?: string;
  emotions?: string;
  story?: string;
  audioName?: string;
  tags?: string[];
  rankScore: number;
  storyUrl?: string;
  voiceUrl?: string;
  likes: number;
  views: number;
  shares: number;
  status: "generated" | "pending" | string;
  [key: string]: any;
  duration?: number;
};


export const VideoEditor = () => {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Editing state
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStory, setEditedStory] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedEmotions, setEditedEmotions] = useState<string[]>([]);
  const [editedAudioName, setEditedAudioName] = useState("");
  const [editedVideoUrl, setEditedVideoUrl] = useState("");

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [currentTime, setCurrentTime] = useState(0);

  // Mock timeline/effects
  const [timeline, setTimeline] = useState([
    { id: "1", name: "Intro", duration: 5, start: 0, type: "video", color: "bg-blue-500" },
    { id: "2", name: "Voiceover", duration: 10, start: 5, type: "audio", color: "bg-green-500" },
    { id: "3", name: "Subtitle", duration: 15, start: 10, type: "text", color: "bg-purple-500" },
  ]);

  const [effects, setEffects] = useState([
    { name: "Blur", intensity: 0.5 },
    { name: "Brightness", intensity: 0.8 },
    { name: "Contrast", intensity: 0.6 },
    { name: "Saturation", intensity: 0.7 },
  ]);

  const updateEffect = (effectName: string, value: number) => {
    setEffects((prev) =>
      prev.map((fx) =>
        fx.name === effectName ? { ...fx, intensity: value / 100 } : fx
      )
    );
  };

  // Load videos
  useEffect(() => {
    const savedVideos = localStorage.getItem("heroVideos");
    if (savedVideos) {
      const cached = JSON.parse(savedVideos);
      const sortedCached = cached.sort(
        (a: VideoType, b: VideoType) => (b.rankScore || 0) - (a.rankScore || 0)
      );
      setVideos(sortedCached);
      setLoading(false);
    }

    axios
      .get(`${BASE_URL}/api/apivideo/all-generate-video`)
      .then((res) => {
        const videosArray = Array.isArray(res.data.videos) ? res.data.videos : [];
        const sortedVideos = videosArray.sort(
          (a: VideoType, b: VideoType) => (b.rankScore || 0) - (a.rankScore || 0)
        );
        setVideos(sortedVideos);
        localStorage.setItem("heroVideos", JSON.stringify(sortedVideos));
      })
      .catch((err) => console.error("Failed to fetch videos:", err))
      .finally(() => setLoading(false));
  }, []);

  // Select a video
  const selectVideo = (video: VideoType) => {
    setSelectedVideo(video);
    setEditedTitle(video.title || "");
    setEditedStory(video.story || "");
    setEditedTags(video.tags || []);
    //  setEditedEmotions(video.emotions || []);
    setEditedAudioName(video.audioName || "");
    setEditedVideoUrl(video.storyUrl || "");
  };

  // Save edits (PUT)
  const handleEditVideo = async () => {
    if (!selectedVideo) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/apivideo/edit/${selectedVideo._id}`,
        {
          title: editedTitle,
          story: editedStory,
          tags: editedTags,
          emotions: editedEmotions,
          audioName: editedAudioName,
          videoUrl: editedVideoUrl,
        }
      );

      if (res.data.success) {
        alert("✅ Video updated successfully!");
        setVideos((prev) =>
          prev.map((v) =>
            v.id === selectedVideo.id ? { ...v, ...res.data.media } : v
          )
        );
      }
    } catch (err) {
      console.error("Failed to edit video:", err);
      alert("❌ Failed to update video");
    }
  };

  const handleAudioUpload = async (file: File) => {
    if (!selectedVideo) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/api/audio/${selectedVideo._id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.audioUrl) {
        setEditedAudioName(data.audioUrl);
        alert("🎤 Audio uploaded successfully!");
      } else {
        alert("❌ Audio upload failed");
      }
    } catch (err) {
      console.error("❌ Error uploading audio:", err);
      alert("❌ Server error while processing audio");
    }
  };


  // Save Final (POST /upload-final)
  const handleSaveFinal = async () => {
    if (!selectedVideo) return;
    try {
      const res = await axios.post(`${BASE_URL}/upload-final`, {
        mediaId: selectedVideo._id,
        title: editedTitle,
        story: editedStory,
        tags: editedTags,
        emotions: editedEmotions,
        audioName: editedAudioName,
        videoUrl: editedVideoUrl,
      });
      if (res.data.success) {
        alert("✅ Final video saved!");
      }
    } catch (err) {
      console.error("Failed to save final video:", err);
      alert("❌ Failed to save final");
    }
  };

  const tools = [
    { id: "cut", icon: Scissors, label: "Cut", shortcut: "C" },
    { id: "copy", icon: Copy, label: "Copy", shortcut: "Ctrl+C" },
    { id: "text", icon: Type, label: "Text", shortcut: "T" },
    { id: "music", icon: Music, label: "Audio", shortcut: "A" },
    { id: "effects", icon: Palette, label: "Effects", shortcut: "E" },
  ];


  return (
    <div className="h-screen bg-background flex flex-col pt-16 overflow-y-scroll">
      {/* Top Toolbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-border bg-card/50"
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Redo className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTool(tool.id)}
              className="flex flex-col items-center h-auto py-2"
            >
              <tool.icon className="w-4 h-4 mb-1" />
              <span className="text-xs">{tool.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="hero" size="sm" onClick={handleSaveFinal}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 border-r border-border bg-card/30 overflow-y-auto"
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              My Videos
            </h3>

            {loading ? (
              <p className="text-xs text-muted-foreground">Loading videos...</p>
            ) : videos.length === 0 ? (
              <p className="text-xs text-muted-foreground">No generated videos found</p>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border rounded overflow-hidden bg-background"
                  >
                    {/* Thumbnail / Player */}
                    <video
                      controls
                      className="w-full h-32 object-cover"
                      src={video.storyUrl}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>

                    {/* Small Edit Button */}
                    <div className="p-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsPlaying(false);
                          setCurrentTime(0);
                          setEditedTitle(video.title || "");
                          setEditedStory(video.story || "");
                          setEditedTags(video.tags || []);
                          // setEditedEmotions(video.emotions || []);
                          setEditedAudioName(video.audioName || "");
                          setEditedVideoUrl(video.storyUrl || "");
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-black/20 relative"
          >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden border border-border">
              {/* Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden border border-border">
                  {selectedVideo ? (
                    <video
                      ref={videoRef}
                      key={selectedVideo.id}
                      src={selectedVideo.storyUrl}
                      className="w-full h-full object-contain"
                      controls
                      onLoadedMetadata={(e) =>
                        setDuration((e.target as HTMLVideoElement).duration)
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground m-auto text-center">Select a video to preview</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <div className="w-20">
                      <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
                    </div>
                    <span className="text-sm min-w-[3rem]">{volume[0]}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-48 border-t border-border bg-card/30 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Timeline</h3>
              <div className="text-xs text-muted-foreground">
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                {videoRef.current ? Math.floor(videoRef.current.duration) + "s" : "0s"}
              </div>
            </div>

            <div className="relative h-32 bg-background rounded-lg border border-border overflow-hidden">
              {/* Ruler */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-muted/50 border-b border-border">
                {selectedVideo && videoRef.current
                  ? Array.from({ length: 10 }, (_, i) => {
                    const step = videoRef.current.duration / 10;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-border/50"
                        style={{ left: `${i * 10}%` }}
                      >
                        <span className="text-xs text-muted-foreground ml-1">
                          {Math.round(i * step)}s
                        </span>
                      </div>
                    );
                  })
                  : null}
              </div>

              {/* Tracks */}
              <div className="pt-6 space-y-1">
                {timeline.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-8 relative"
                  >
                    <div
                      className={`absolute h-6 ${track.color} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center px-2`}
                      style={{
                        left: `${(track.start / 45) * 100}%`,
                        width: `${(track.duration / 45) * 100}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium truncate">{track.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Playhead */}
              {selectedVideo && videoRef.current ? (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
                  style={{
                    left: `${(currentTime / videoRef.current.duration) * 100}%`,
                  }}
                >
                  <div className="w-3 h-3 bg-primary rounded-full -ml-1.5 -mt-1.5" />
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 border-l border-border bg-card/30 overflow-y-auto"
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3">Properties</h3>

            <div className="space-y-4">
              {/* Effects */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Effects</label>
                <div className="space-y-2 mt-2">
                  {effects.map((effect) => (
                    <div key={effect.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{effect.name}</span>
                        <span>{Math.round(effect.intensity * 100)}%</span>
                      </div>
                      <Slider
                        value={[effect.intensity * 100]}
                        onValueChange={(val) => updateEffect(effect.name, val[0])}
                        max={100}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Transform */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Transform</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["X", "Y", "Scale", "Rotation"].map((field) => (
                    <div key={field}>
                      <label className="text-xs text-muted-foreground">{field}</label>
                      <input
                        type="number"
                        className="w-full h-8 px-2 text-xs bg-background border border-border rounded"
                        defaultValue={field === "Scale" ? 100 : 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Video URL</label>
              <input
                type="text"
                value={editedVideoUrl}
                onChange={(e) => setEditedVideoUrl(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-background border border-border rounded"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Audio Name</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAudioUpload(file); 
                  }
                }}
                className="w-full text-xs bg-background border border-border rounded"
              />

              {editedAudioName && (
                <audio controls src={editedAudioName} className="mt-2 w-full" />
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tags</label>
              <input
                type="text"
                value={editedTags.join(", ")}
                onChange={(e) =>
                  setEditedTags(
                    e.target.value.split(",").map((tag) => tag.trim())
                  )
                }
                className="w-full h-8 px-2 text-xs bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Story</label>
              <textarea
                value={editedStory}
                onChange={(e) => setEditedStory(e.target.value)}
                className="w-full h-16 px-2 text-xs bg-background border border-border rounded"
              />
            </div>
            <Button variant="hero" size="sm" onClick={handleEditVideo} disabled={!selectedVideo}>
              Update Video
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

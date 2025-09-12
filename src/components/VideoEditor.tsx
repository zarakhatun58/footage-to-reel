import { useState, useEffect } from "react";
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

const BASE_URL = "http://localhost:5000"; // change to your API base

type VideoType = {
  id: string;
  title: string;
  rankScore?: number;
  url: string;
  duration?: number;
};

export const VideoEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([100]);
  const [selectedTool, setSelectedTool] = useState<string>("select");

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load generated + saved videos
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

  const tools = [
    { id: "cut", icon: Scissors, label: "Cut", shortcut: "C" },
    { id: "copy", icon: Copy, label: "Copy", shortcut: "Ctrl+C" },
    { id: "text", icon: Type, label: "Text", shortcut: "T" },
    { id: "music", icon: Music, label: "Audio", shortcut: "A" },
    { id: "effects", icon: Palette, label: "Effects", shortcut: "E" },
  ];

  const effects = [
    { name: "Blur", intensity: 0.5 },
    { name: "Brightness", intensity: 0.8 },
    { name: "Contrast", intensity: 0.6 },
    { name: "Saturation", intensity: 0.7 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
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
          <Button variant="hero" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Video List */}
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
                    className="p-2 rounded bg-background border border-border hover:bg-accent/50 cursor-pointer"
                  >
                    <p className="text-xs font-medium">{video.title}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {video.duration || 0}s • Score {video.rankScore || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Layer
            </Button>
          </div>
        </motion.div>

        {/* Center + Right (Preview, Timeline, Properties) */}
        {/* Keep your existing preview, timeline, properties code here */}
      </div>
    </div>
  );
};

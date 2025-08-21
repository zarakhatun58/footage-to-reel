
import { Button } from "@/components/ui/button";
import { Video, Search, Sparkles, Upload } from "lucide-react";
import heroImage from "@/assets/hero-video-ai.jpg";
import { EmotionDetector } from "./EmotionDetector";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";

export type VideoType = {
  _id: string;
  filename: string;
  transcript?: string;
  story?: string;
  tags?: string[];
  rankScore: number;
  storyUrl?: string;
  likes: number;
  views: number;
  shares: number;
  status: "generated" | "pending" | string;
  [key: string]: any;
};



export const HeroSection = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/videos`)
      .then((res) => {
        const sortedVideos = res.data.videos.sort(
          (a: VideoType, b: VideoType) => b.rankScore - a.rankScore
        );
        setVideos(sortedVideos);
      })
      .catch((err) => console.error("Failed to fetch videos:", err))
      .finally(() => setLoading(false));
  }, []);

  const top3Videos = videos.slice(0, 3);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute z-0">
        <img
          src={heroImage}
          alt="AI Video Editing Interface"
          className="w-full h-[50%] object-cover opacity-10"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-30">
        <Video className="w-16 h-16 text-white" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <Sparkles className="w-12 h-12 text-story-warm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-purple mb-6 leading-tight">
            Turn Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-story-warm to-accent"> Memories</span>
            <br />
            Into Stories
          </h1>
          <p className="text-xl md:text-2xl text-purple-600 mb-8 max-w-2xl mx-auto">
            Upload your footage, let AI transcribe and organize it, then create beautiful stories
            with simple prompts. Your personal memories, reimagined.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <Upload className="w-5 h-5 mr-2" />
              Start Creating Stories
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-purple-600 text-white hover:bg-white/20">
              <Search className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
          </div>

          {loading ? (
            <p className="text-white">Loading videos...</p>
          ) : top3Videos.length === 0 ? (
            <p className="text-white">No videos available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3Videos.map((video) => (
                <div
                 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-600 hover:bg-white/20 transition cursor-pointer"
                  onClick={() => window.open(video.storyUrl, "_blank")}
                >
                  <video
                    controls
                     key={video._id}
                    className="w-full h-46 object-cover rounded-t"
                    src={video.storyUrl}
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {video.story || "No story available."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
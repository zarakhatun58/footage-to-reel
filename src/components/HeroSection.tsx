import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useKeenSlider, KeenSliderInstance } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Video, Sparkles, Upload, Search, Play, Star } from "lucide-react";
import { MediaStatsBar } from "./MediaStatsBar";
import heroImage from "../assets/hero-video-ai.jpg";
import { BASE_URL } from "../services/apis";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

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
}

// Keen Slider Autoplay Plugin
const autoplay = (slider: KeenSliderInstance) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;

  const clearNextTimeout = () => clearTimeout(timeout);

  const nextTimeout = () => {
    clearNextTimeout();
    if (!mouseOver) {
      timeout = setTimeout(() => {
        slider.next();
      }, 4000);
    }
  };

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", () => (mouseOver = true));
    slider.container.addEventListener("mouseout", () => (mouseOver = false));
    nextTimeout();
  });

  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
};

export const HeroSection = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isStatsOpen, setIsStatsOpen]=useState(false)

  // Fetch videos
  useEffect(() => {
    setLoading(true);

    axios
      .get(`${BASE_URL}/api/apivideo/all-generate-video`)
      .then((res) => {
        const arr = Array.isArray(res.data.videos) ? res.data.videos : [];
        // ✅ Sort videos by rankScore (highest first)
        setVideos(arr.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)));
      })
      .catch((err) => console.error("Failed to fetch videos:", err))
      .finally(() => setLoading(false));
  }, []);

  // Keen Slider
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: "snap",
      slides: { perView: 1, spacing: 20 },
      breakpoints: {
        "(min-width: 768px)": {
          slides: { perView: 2, spacing: 20 }
        },
        "(min-width: 1024px)": {
          slides: { perView: 3, spacing: 20 }
        }
      }
    },
    [autoplay]
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="AI Video Editing Platform"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow animate-pulse-glow" />
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.6 }}
        className="absolute top-20 left-16 float"
      >
        <Video className="w-20 h-20 text-primary glow" />
      </motion.div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.6 }}
        className="absolute bottom-32 right-16 float-delayed"
      >
        <Sparkles className="w-16 h-16 text-accent pulse-glow" />
      </motion.div>

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.4 }}
        className="absolute top-1/3 left-8 float"
      >
        <Star className="w-12 h-12 text-primary-glow" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Turn Your{" "}
            <span className="gradient-text animate-gradient">
              Memories
            </span>
            <br />
            Into{" "}
            <span className="gradient-text animate-gradient">
              Stories
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Upload your footage, let AI transcribe and organize it, then create
            beautiful stories with simple prompts powered by advanced machine learning.
          </motion.p>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Button
            variant="hero"
            size="lg"
            className="hover-lift hover-glow"
            onClick={() => navigate("/upload")}
          >
            <Upload className="w-6 h-6 mr-3" />
            Start Creating Stories
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="hover-lift"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Search className="w-6 h-6 mr-3" />
            Explore Features
          </Button>
        </motion.div>

        {/* Enhanced Video Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-5xl mx-auto relative"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Featured AI-Generated Stories
          </h2>

          {loading ? (
            <div className="glass-card p-12 animate-pulse">
              <div className="flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-3 text-white/70">Loading amazing stories...</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="glass-card p-12">
              <div className="text-center">
                <Video className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-white/70 text-lg">No videos available yet.</p>
                <p className="text-white/50 text-sm mt-2">Be the first to create an AI story!</p>
              </div>
            </div>
          ) : (
            <div ref={sliderRef} className="keen-slider mb-48">
              {videos.slice(0, 3).map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="keen-slider__slide group"
                >
                  <div className="glass-card p-6 hover-lift hover-glow cursor-pointer relative">

                    <div className="relative mb-4 rounded-xl overflow-hidden">
                      <video
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        controls
                        src={video.storyUrl}
                      >
                        <source src={video.storyUrl} type="video/mp4" />
                      </video>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${video.status === 'generated'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                          {video.status}
                        </span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-glow transition-colors line-clamp-2">
                        {video.title || "Untitled Story"}
                      </h3>

                      {video.story && (
                        <p className="text-sm text-white/60 line-clamp-2">
                          {video.story}
                        </p>
                      )}

                      {/* Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {video.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-primary/20 text-primary-glow text-xs rounded-full border border-primary/30"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div>
                        <MediaStatsBar media={video} BASE_URL={BASE_URL} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-center"
      >
        <div className="text-sm mb-2">Discover More</div>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-auto"></div>
      </motion.div>
    </section>
  );
};
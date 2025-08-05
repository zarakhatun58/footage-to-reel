
import { Button } from "@/components/ui/button";
import { Video, Search, Sparkles, Upload } from "lucide-react";
import heroImage from "@/assets/hero-video-ai.jpg";
import { EmotionDetector } from "./EmotionDetector";
import { useEffect, useState } from "react";
import axios from "axios";

export const HeroSection = () => {
  const [videos, setVideos] = useState([]);

  // useEffect(() => {
  //   axios.get('http://localhost:5000/api/videos')
  //     .then(res => setVideos(res.data.videos))
  //     .catch(err => console.error(err));
  // }, []);

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

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 ">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-600 hover:bg-white/15 transition-all duration-300">
              <Upload className="w-12 h-12 text-story-warm mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Smart Upload</h3>
              <p className="text-gray-600">Upload videos from any device with intelligent processing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-600 hover:bg-white/15 transition-all duration-300">
              <Search className="w-12 h-12 text-story-warm mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-400 mb-2">AI Search</h3>
              <p className="text-gray-600">Find moments instantly with transcription-powered search</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-600 hover:bg-white/15 transition-all duration-300">
              <Sparkles className="w-12 h-12 text-story-warm mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Story Magic</h3>
              <p className="text-gray-600">Generate beautiful stories with simple AI prompts</p>
            </div>
          </div>
          {/* <EmotionDetector/> */}
          {/* {videos.map(video => (
            <div key={video.filename} className="border p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold">{video.filename}</h3>
              <p><strong>Transcript:</strong> {video.transcript?.slice(0, 100)}...</p>
              <p><strong>Story:</strong> {video.story?.slice(0, 100)}...</p>
              <p><strong>Tags:</strong> {video.tags || 'N/A'}</p>
            </div>
          ))} */}
        </div>
      </div>
    </section>
  );
};
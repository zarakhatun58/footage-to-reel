import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Video, Music, Scissors, Download, Play } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";


export type UploadedMedia = {
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

interface StoryClip {
  id: string;
  videoName: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface GeneratedStory {
  id: string;
  title: string;
  description: string;
  clips: StoryClip[];
  duration: string;
  music?: string;
  status: 'generating' | 'ready' | 'error';
  storyUrl?: string;
}

const storyTemplates = [
  "Create a story about my birthday celebrations",
  "Make a vacation highlights reel",
  "Show all my family gatherings this year",
  "Create a story about my pet's funny moments",
  "Make a montage of outdoor adventures",
  "Show the best moments with friends"
];

export const StoryGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<UploadedMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a story prompt to generate your video story",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Optionally, provide a transcript or use empty string if you don't have one
      const transcript = "Sample transcript or actual transcript from videos";

      // Start progress at some value
      setGenerationProgress(10);

      const response = await axios.post(`${BASE_URL}/api/generate`, {
        prompt,
        transcript,
        filename: 'user_prompt_input.mp4',
        mediaType: 'video',
      });

      setGenerationProgress(100);

      if (response.data && response.data.story) {
        const apiStory: GeneratedStory = {
          id: response.data.id,
          title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
          description: response.data.story,
          clips: [], // You might enhance this if API returns clips
          duration: 'Unknown',
          music: undefined,
          status: 'ready',
        };

        setGeneratedStory(apiStory);
        toast({
          title: "Story Generated!",
          description: "Your AI-powered story is ready to view and share",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || error.message || "Failed to generate story",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const autoGenerateAudio = async () => {
    if (!selectedMedia) {
      alert('No media selected');
      return;
    }
    if (!selectedMedia.story) {
      alert('No story text to generate audio from');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/audio/generate-audio/${selectedMedia.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedMedia.story }),
      });
      const data = await res.json();
      if (data.success) {
        setMediaList(prev =>
          prev.map(m => (m.id === selectedMedia.id ? { ...m, voiceUrl: data.audioUrl } : m))
        );
        alert('🎤 Audio auto-generated successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert('❌ Failed to auto-generate audio');
      console.error(err);
    }
  };

  const autoGenerateVideo = async (mediaId: string) => {
    // Find the media item from list
    const media = mediaList.find(m => m.id === mediaId);

    if (!media) {
      alert("Media not found.");
      return;
    }

    // Extract images and audio filenames
    const imageNames = Array.isArray(media.images)
      ? media.images.map(url => url.split('/').pop()).filter(Boolean)
      : [];

    const audioName = media.voiceUrl ? media.voiceUrl.split('/').pop() : null;

    if (imageNames.length === 0) {
      alert("No images available for video.");
      return;
    }

    if (!audioName) {
      alert("No audio available for video.");
      return;
    }

    setLoadingVideo(true);

    try {
      // Call backend API to generate video
      const res = await fetch(`${BASE_URL}/api/apivideo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          imageNames,
          audioName,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Video generation failed");
      }

      // Update media list with new video info
      setMediaList(prev =>
        prev.map(m =>
          m.id === mediaId
            ? {
              ...m,
              type: 'video',
              storyUrl: data.playbackUrl,
              transcriptionStatus: 'completed',
            }
            : m
        )
      );

      alert("✅ Video generated successfully!");
    } catch (error) {
      console.error("Video generation error:", error);
      alert("❌ Video generation failed. Please try again.");
    } finally {
      setLoadingVideo(false);
    }
  };
  const useTemplate = (template: string) => {
    setPrompt(template);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Generate Your Story</h2>
        <p className="text-muted-foreground">
          Tell AI what story you want to create, and it will automatically organize and edit your footage
        </p>
      </div>

      {/* Story Prompt Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Story Prompt
            </label>
            <Textarea
              placeholder="Describe the story you want to create... (e.g., 'Create a story about my birthday celebrations with family and friends')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="story"
              size="lg"
              onClick={handleGenerateStory}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGenerating ? "Generating Story..." : "Generate Story"}
            </Button>

            {generatedStory && (
              <Button variant="outline" size="lg">
                <Video className="w-5 h-5 mr-2" />
                Preview Story
              </Button>
            )}
          </div>
        </div>

        {/* Template Suggestions */}
        {!prompt && !isGenerating && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-foreground mb-3">Try these story ideas:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {storyTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => useTemplate(template)}
                  className="justify-start text-left h-auto p-3 hover:bg-gradient-card"
                >
                  <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{template}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Sparkles className="w-16 h-16 text-video-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Creating Your Story</h3>
              <p className="text-muted-foreground">AI is working its magic...</p>
            </div>

            <div className="max-w-md mx-auto">
              <Progress value={generationProgress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">{generationProgress}% complete</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Story Result */}
      {generatedStory && !isGenerating && (
        <Card className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{generatedStory.title}</h3>
              <p className="text-muted-foreground mb-4">{generatedStory.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Duration: {generatedStory.duration}</span>
                <span>Clips: {generatedStory.clips.length}</span>
                {generatedStory.music && <span>Music: {generatedStory.music}</span>}
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready
            </Badge>
          </div>

          {/* Story Clips */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Story Clips</h4>
            <div className="space-y-3">
              {generatedStory.clips.map((clip, index) => (
                <div key={clip.id} className="flex items-center gap-4 p-4 bg-gradient-card rounded-lg border">
                  <div className="w-8 h-8 bg-video-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-foreground">{clip.videoName}</p>
                    <p className="text-sm text-muted-foreground">{clip.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {clip.startTime} - {clip.endTime}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Scissors className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {mediaList.map((media) => (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              style={{
                border: selectedMedia?.id === media.id ? '2px solid blue' : '1px solid gray',
                padding: '8px',
                cursor: 'pointer',
              }}
            >
              {media.name}
            </div>
          ))}
          {/* Story Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="ai" size="lg" onClick={() => {
              if (selectedMedia?.id) {
                autoGenerateVideo(selectedMedia.id);
              } else {
                alert("No media selected");
              }
            }}>
              <Play className="w-5 h-5 mr-2" />
              Play Story
            </Button>

            <Button variant="outline" onClick={autoGenerateAudio}>
              <Music className="w-4 h-4 mr-2" />
              Change Music
            </Button>
            <Button variant="outline">
              <Scissors className="w-4 h-4 mr-2" />
              Edit Clips
            </Button>
            <Button variant="story" onClick={() => {
              if (generatedStory.storyUrl) {
                window.open(generatedStory.storyUrl, '_blank');
              } else {
                toast({
                  title: 'No video available',
                  description: 'Please generate the story video first.',
                  variant: 'destructive',
                });
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      )}

      {isPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <video
            src={generatedStory.storyUrl} // You need to populate this from API response
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
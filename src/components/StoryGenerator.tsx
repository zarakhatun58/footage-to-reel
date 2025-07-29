import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Video, Music, Scissors, Download, Play } from "lucide-react";

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

    // Simulate AI story generation process
    const steps = [
      { message: "Analyzing your prompt...", progress: 15 },
      { message: "Searching through your videos...", progress: 30 },
      { message: "Identifying relevant clips...", progress: 50 },
      { message: "Organizing story structure...", progress: 70 },
      { message: "Adding transitions and music...", progress: 90 },
      { message: "Finalizing your story...", progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(step.progress);
    }

    // Generate mock story
    const mockStory: GeneratedStory = {
      id: `story-${Date.now()}`,
      title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
      description: "AI-generated story based on your prompt and video content",
      clips: [
        {
          id: '1',
          videoName: 'Birthday_Party_2023.mp4',
          startTime: '02:15',
          endTime: '03:00',
          description: 'Birthday celebration scene with cake and candles'
        },
        {
          id: '2',
          videoName: 'Family_Dinner.mp4',
          startTime: '01:45',
          endTime: '02:15',
          description: 'Family gathering and laughter'
        },
        {
          id: '3',
          videoName: 'Beach_Vacation.mp4',
          startTime: '05:30',
          endTime: '06:50',
          description: 'Sunset beach walk finale'
        }
      ],
      duration: '02:30',
      music: 'Upbeat celebration theme',
      status: 'ready'
    };

    setGeneratedStory(mockStory);
    setIsGenerating(false);
    
    toast({
      title: "Story Generated!",
      description: "Your AI-powered story is ready to view and share",
    });
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

          {/* Story Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="ai" size="lg">
              <Play className="w-5 h-5 mr-2" />
              Play Story
            </Button>
            <Button variant="outline">
              <Music className="w-4 h-4 mr-2" />
              Change Music
            </Button>
            <Button variant="outline">
              <Scissors className="w-4 h-4 mr-2" />
              Edit Clips
            </Button>
            <Button variant="story">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
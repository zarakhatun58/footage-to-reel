import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, MapPin, Users, Heart } from "lucide-react";
import { BASE_URL } from "@/services/apis";


interface SearchResult {
  id: string;
  videoName: string;
  timestamp: string; // format "HH:MM:SS"
  duration: string; // format "HH:MM:SS"
  transcript: string;
  tags: string[];
  emotions: string[];
  storyUrl?: string;
  thumbnail?: string;
  confidence: number;
}

interface SuggestedSearch {
  text: string;
  icon: React.ElementType;
}

const iconMap: Record<string, React.ElementType> = {
  celebration: Heart,
  family: Users,
  travel: MapPin,
  recent: Clock,
};

export const SearchInterface = () => {
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedSearches, setSuggestedSearches] = useState<SuggestedSearch[]>([]);

  // Fetch dynamic suggested searches from backend on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/search-suggestions`);
        const data = await res.json();
        if (data.suggestions?.length) {
          setSuggestedSearches(
            data.suggestions.map((s: any) => ({
              text: s.text,
              icon: iconMap[s.type] || Heart,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch suggested searches", error);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s max

    try {
      const res = await fetch(
        `${BASE_URL}/api/search-videos?search=${encodeURIComponent(searchQuery.trim())}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data?.videos) {
        setSearchResults(
          data.videos.map((video: any) => ({
            id: video._id,
            videoName: video.title || "Untitled Video",
            timestamp: video.timestamp || "00:00:00",
            duration: video.duration || "00:00:30",
            transcript: video.transcript || "",
            tags: video.tags || [],
            emotions: video.emotions || [],
            confidence: video.confidence || 0,
          }))
        );
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error("❌ Search request timed out");
      } else {
        console.error("❌ Search API failed:", error);
      }
      setSearchResults([]);
    } finally {
      clearTimeout(timeoutId);
      setIsSearching(false);
    }
  };



  const handleSuggestedSearch = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Create new story on backend and save its ID
  const createStory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/newStory`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data._id) {
        setCurrentStoryId(data._id);
        return data._id;
      } else {
        alert("Failed to create story");
        return null;
      }
    } catch {
      alert("Error creating story");
      return null;
    }
  };

  // Add clip to story
  const handleUseInStory = async (result: SearchResult) => {
    try {
      let storyId = currentStoryId;
      if (!storyId) {
        storyId = await createStory();
        if (!storyId) return;
      }

      const payload = {
        videoId: result.id,
        timestamp: result.timestamp,
        duration: result.duration,
        transcript: result.transcript,
        tags: result.tags,
      };

      const res = await fetch(`${BASE_URL}/${storyId}/add-clip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) alert("Clip added to your story!");
      else alert("Failed to add clip");
    } catch {
      alert("Error adding clip");
    }
  };

  // Open video clip URL with start and duration params
  const handleViewClip = async (result: SearchResult) => {
    try {
      // Fetch clip info from backend
      const startParam = result.timestamp || "00:00:00";
      const durationParam = parseDurationToSeconds(result.duration) || 30;

      const res = await fetch(
        `${BASE_URL}/videos/${result.id}/clip?start=${startParam}&duration=${durationParam}`
      );
      const data = await res.json();
      if (res.ok && data.clipUrl) {
        // Open video URL with start time and duration info
        // For demo just open clipUrl in new tab (frontend player can seek)
        window.open(`${data.clipUrl}#t=${data.startSeconds}`, "_blank");
      } else {
        alert("Failed to fetch clip");
      }
    } catch {
      alert("Error loading clip");
    }
  };

  // Helper: convert "HH:MM:SS" or "MM:SS" to seconds number
  const parseDurationToSeconds = (durationStr: string) => {
    const parts = durationStr.split(":").map(Number);
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
      seconds = seconds * 60 + parts[i];
    }
    return seconds;
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Search Your Memories</h2>
        <p className="text-muted-foreground">Find specific moments in your videos using AI-powered search</p>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for moments... (e.g., 'birthday party', 'vacation', 'family dinner')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 text-lg h-12"
              autoFocus
            />
          </div>
          <Button
            variant="ai"
            size="lg"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-8"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Suggested Searches */}
        {!searchResults.length && !isSearching && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedSearches.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedSearch(suggestion.text)}
                    className="text-sm"
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {suggestion.text}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {isSearching && (
        <Card className="p-8 text-center">
          <div className="animate-pulse">
            <Search className="w-12 h-12 text-video-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Searching through your memories...</p>
            <p className="text-muted-foreground">AI is analyzing transcripts and tags</p>
          </div>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Found {searchResults.length} moments for "{searchQuery}"
            </h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter Results
            </Button>
          </div>

          {searchResults.map((result) => (
            <Card key={result.id} className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="flex gap-4">
                {/* Video Thumbnail Placeholder */}
                <div className="w-32 h-20 bg-gradient-ai rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-white text-xs text-center">
                    <p className="font-medium">{result.timestamp}</p>
                    <p className="opacity-80">{result.duration}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {result.thumbnail ? (
                        <img
                          src={result.thumbnail}
                          alt={result.videoName}
                          className="w-full max-h-48 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <video
                          src={result.storyUrl}
                          controls
                          className="w-full max-h-48 rounded-lg shadow"
                        />
                      )}
                      <h4 className="font-semibold text-foreground">{result.videoName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Timestamp: {result.timestamp} • Duration: {result.duration}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {result.confidence}% match
                    </Badge>
                  </div>

                  <p className="text-foreground leading-relaxed">
                    "{result.transcript}"
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {/* Tags */}
                    {result.tags?.map((tag, index) => (
                      <Badge key={`tag-${index}`} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}

                    {/* Emotions with color coding */}
                    {result.emotions?.map((emotion, index) => {
                      let colorClass = "bg-gray-200 text-gray-800"; // default

                      switch (emotion.toLowerCase()) {
                        case "happy":
                          colorClass = "bg-green-100 text-green-700";
                          break;
                        case "sad":
                          colorClass = "bg-blue-100 text-blue-700";
                          break;
                        case "angry":
                          colorClass = "bg-red-100 text-red-700";
                          break;
                        case "excited":
                          colorClass = "bg-yellow-100 text-yellow-800";
                          break;
                        case "surprised":
                          colorClass = "bg-purple-100 text-purple-700";
                          break;
                      }

                      return (
                        <Badge
                          key={`emotion-${index}`}
                          className={`text-xs ${colorClass}`}
                        >
                          {emotion}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="ai" size="sm" onClick={() => handleUseInStory(result)}>
                      Use in Story
                    </Button>
                    {/* <Button variant="outline" size="sm" onClick={() => handleViewClip(result)}>
                      View Clip
                    </Button> */}
                    <Button variant="outline" size="sm"   onClick={() => window.open(result.storyUrl, "_blank")}>
                      View Clip
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchQuery && searchResults.length === 0 && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No moments found</h3>
          <p className="text-muted-foreground mb-4">
            Try different keywords or upload more videos to expand your searchable content.
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </Card>
      )}
    </div>
  );
};
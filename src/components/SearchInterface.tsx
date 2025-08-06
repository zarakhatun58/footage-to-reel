import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, MapPin, Users, Heart } from "lucide-react";

interface SearchResult {
  id: string;
  videoName: string;
  timestamp: string;
  duration: string;
  transcript: string;
  tags: string[];
  thumbnail?: string;
  confidence: number;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    videoName: 'Birthday_Party_2023.mp4',
    timestamp: '02:15',
    duration: '00:45',
    transcript: 'Everyone singing happy birthday around the table with candles glowing on the cake',
    tags: ['birthday', 'celebration', 'family', 'cake'],
    confidence: 95
  },
  {
    id: '2',
    videoName: 'Beach_Vacation.mp4',
    timestamp: '05:30',
    duration: '01:20',
    transcript: 'Walking along the beach at sunset, waves crashing against the shore',
    tags: ['vacation', 'beach', 'sunset', 'travel'],
    confidence: 88
  },
  {
    id: '3',
    videoName: 'Family_Dinner.mp4',
    timestamp: '01:45',
    duration: '00:30',
    transcript: 'Laughing together over dinner, sharing stories about the day',
    tags: ['family', 'dinner', 'laughter', 'home'],
    confidence: 92
  }
];

const suggestedSearches = [
  { text: "birthday celebrations", icon: Heart },
  { text: "family gatherings", icon: Users },
  { text: "vacation memories", icon: MapPin },
  { text: "recent moments", icon: Clock },
];

export const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // const handleSearch = async () => {
  //   if (!searchQuery.trim()) return;
    
  //   setIsSearching(true);
    
  //   // Simulate API call
  //   setTimeout(() => {
  //     const filtered = mockSearchResults.filter(result => 
  //       result.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  //     );
  //     setSearchResults(filtered);
  //     setIsSearching(false);
  //   }, 1000);
  // };

const handleSearch = async () => {
  if (!searchQuery.trim()) return;

  setIsSearching(true);

  try {
    const res = await fetch(`/api/search-videos?search=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();

    if (data?.videos) {
      setSearchResults(
        data.videos.map((video) => ({
          id: video._id,
          videoName: video.title || 'Untitled Video',
          timestamp: video.timestamp || '00:00', // optional
          duration: video.duration || '00:30',    // optional
          transcript: video.transcript || '',
          tags: video.tags || [],
          confidence: 100 // or derive from match score if available
        }))
      );
    } else {
      setSearchResults([]);
    }
  } catch (err) {
    console.error("❌ Search API failed:", err);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};
const handleSuggestedSearch = (query: string) => {
  setSearchQuery(query);
  setTimeout(() => {
    handleSearch();
  }, 100);
};


  // const handleSuggestedSearch = (query: string) => {
  //   setSearchQuery(query);
  //   // Auto-trigger search
  //   setTimeout(() => {
  //     setIsSearching(true);
  //     setTimeout(() => {
  //       setSearchResults(mockSearchResults);
  //       setIsSearching(false);
  //     }, 800);
  //   }, 100);
  // };

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
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="ai" size="sm">
                      Use in Story
                    </Button>
                    <Button variant="outline" size="sm">
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
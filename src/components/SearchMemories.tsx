import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SearchMemoriesProps {
  onBack: () => void;
}

export const SearchMemories: React.FC<SearchMemoriesProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Implement search functionality here
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-card border border-border shadow-elegant">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Search Your Memories</h1>
                <p className="text-muted-foreground">Find specific moments, places, or experiences in your footage</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for memories (e.g., 'birthday', 'vacation', 'friends', scene names like 'dance', 'singing')"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                SEARCH
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

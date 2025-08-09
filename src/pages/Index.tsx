import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { VideoUploadArea } from "@/components/VideoUploadArea";
import { SearchInterface } from "@/components/SearchInterface";
import { StoryGenerator } from "@/components/StoryGenerator";
import CreateStorVoiceOver from "@/components/CreateStorVoiceOver";
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return <VideoUploadArea />;
      case 'search':
        return <SearchInterface />;
      case 'stories':
        return <StoryGenerator />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main>
        {renderSection()}
        
      </main>
    </div>
  );
};

export default Index;

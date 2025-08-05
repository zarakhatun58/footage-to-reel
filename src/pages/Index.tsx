import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { VideoUploadArea } from "@/components/VideoUploadArea";
import { SearchInterface } from "@/components/SearchInterface";
import { StoryGenerator } from "@/components/StoryGenerator";
import CreateStorVoiceOver from "@/components/CreateStorVoiceOver";

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
// const [currentView, setCurrentView] = useState<ViewType>('home');

//   if (currentView === 'search') {
//     return <SearchMemories onBack={() => setCurrentView('home')} />;
//   }

//   if (currentView === 'story') {
//     return <StoryCreator onBack={() => setCurrentView('home')} />;
//   }
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

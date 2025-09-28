import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResetPassword from "./components/ResetPassword";
import { StoryGenerator } from "./components/StoryGenerator";
import { SearchInterface } from "./components/SearchInterface";
import SavedEntries from "./components/SavedEntries";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { UploadInterface } from "./components/UploadInterface";
import { ProjectGallery } from "./components/ProjectGallery";
import { Navbar } from "./components/Navbar";
import { VideoUploadArea } from "./components/VideoUploadArea";
import { ThemeProvider } from "./components/ThemeProvider";
import { VideoEditor } from "./components/VideoEditor";
import Footer from "./components/Footer";
import Gallery from "./pages/Gallery";


const queryClient = new QueryClient();
export const GOOGLE_CLIENT_ID = '584714840164-0ebm888scgf8vj8rhtvsfg32i80o2b3m.apps.googleusercontent.com';

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/story-generator" element={<StoryGenerator />} />
        <Route path="/search" element={<SearchInterface />} />
        <Route path="/savedEntries" element={<SavedEntries />} />
        <Route path="/editor" element={<VideoEditor />} />
        <Route path="/upload" element={<UploadInterface />} />
        {/* <Route path="/upload" element={<VideoUploadArea />} /> */}
        <Route path="/projects" element={<ProjectGallery />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-white text-gray-900 transition-colors">
              <AppWrapper />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;

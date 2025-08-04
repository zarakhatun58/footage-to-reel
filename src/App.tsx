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

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = '584714840164-ld1ksgrg4usa5975f5gmng6dtqn4ubih.apps.googleusercontent.com';
const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/story-generator" element={<StoryGenerator />} />
            <Route path="/searchInterface" element={<SearchInterface />} />
            <Route path="/savedEntries" element={<SavedEntries />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;

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

const queryClient = new QueryClient();

const App = () => (
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
);

export default App;

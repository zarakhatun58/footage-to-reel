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
import { useEffect } from "react";
import { gapi } from 'gapi-script';

const queryClient = new QueryClient();
export const GOOGLE_CLIENT_ID = '584714840164-0ebm888scgf8vj8rhtvsfg32i80o2b3m.apps.googleusercontent.com';

declare global {
  interface Window {
    gapi: any;
  }
}

const AppWrapper = () => {
  const { loading } = useAuth();

   // SSR-safe gapi initialization
useEffect(() => {
  if (typeof window !== "undefined" && window.gapi) {
    window.gapi.load("client:auth2", () => {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (!auth2) {
        window.gapi.client.init({
          clientId: GOOGLE_CLIENT_ID,
          scope: "profile email",
        });
      }
    });
  }
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-orange-400 text-xl">
        Loading...
      </div>
    );
  }


  return (
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
  );
};

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppWrapper />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;

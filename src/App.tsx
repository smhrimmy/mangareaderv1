import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { SecretProvider } from "@/hooks/useSecret";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { VersionManager } from "@/components/VersionManager";
import { SecurityManager } from "@/components/SecurityManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Discover from "./pages/Discover";
import MangaDetail from "./pages/MangaDetail";
import ChapterReader from "./pages/ChapterReader";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SharedList from "./pages/SharedList";
import UserProfile from "./pages/UserProfile";
import Vault from "./pages/Vault";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/search" element={<Browse />} />
      <Route path="/latest" element={<Browse />} />
      <Route path="/genres" element={<Browse />} />
      
      {/* Manga Routes */}
      <Route path="/manga/:id" element={<MangaDetail />} />
      <Route path="/manga/:id/chapter/:chapterId" element={<ChapterReader />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/list/:listId" element={<SharedList />} />
      <Route path="/user/:userId" element={<UserProfile />} />
      <Route path="/vault" element={<Vault />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading or wait for critical resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds splash screen
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <SecretProvider>
              <TooltipProvider>
                <VersionManager />
                <SecurityManager />
                <Toaster />
                <Sonner />
                {isLoading && <LoadingScreen />}
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </TooltipProvider>
            </SecretProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;

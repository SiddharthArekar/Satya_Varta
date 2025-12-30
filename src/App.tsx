import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { MainAppNavBar } from "@/components/ui/tubelight-navbar-demo";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SpotlightDemo from "./pages/SpotlightDemo";
import NotFound from "./pages/NotFound";
import { Component as NotFoundDemo } from "@/components/ui/404-page-not-found";
import { GoogleFactCheckTest } from "./components/GoogleFactCheckTest";
import { TranslationTest } from "./components/TranslationTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/spotlight-demo" element={<SpotlightDemo />} />
          <Route path="/404-demo" element={<NotFoundDemo />} />
          <Route path="/test-factcheck" element={<GoogleFactCheckTest />} />
          <Route path="/test-translation" element={<TranslationTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Global Navigation Bar - Removed */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

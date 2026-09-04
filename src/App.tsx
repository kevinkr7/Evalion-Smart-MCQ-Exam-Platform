// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "@/components/AdminDashboard";
import ResultsReview from "@/components/ResultsReview";
import { QuizProvider } from "@/contexts/QuizContext";
import UserDashboard from "@/components/UserDashboard";
import StartTest from "./pages/StartTest";
import RegisterPage from "./pages/RegisterPage";

import LoginPage from "./pages/LoginPage";
import ProfileSettings from "./pages/ProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <QuizProvider>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/start" element={<StartTest />} />
            <Route path="/review" element={<ResultsReview />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QuizProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

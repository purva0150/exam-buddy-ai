import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import FacultyPage from "./pages/FacultyPage";
import ExamsPage from "./pages/ExamsPage";
import NlpPage from "./pages/NlpPage";
import AllocationPage from "./pages/AllocationPage";
import ConflictsPage from "./pages/ConflictsPage";
import RosterPage from "./pages/RosterPage";
import AssistantPage from "./pages/AssistantPage";
import NotificationsPage from "./pages/NotificationsPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/nlp" element={<NlpPage />} />
            <Route path="/allocation" element={<AllocationPage />} />
            <Route path="/conflicts" element={<ConflictsPage />} />
            <Route path="/roster" element={<RosterPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Faculty role sees faculty dashboard
  if (role === "faculty") {
    return (
      <AppLayout>
        <Routes>
          <Route path="/" element={<FacultyDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  // Admin sees full dashboard
  return (
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

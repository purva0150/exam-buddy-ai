import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const adminPageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/faculty": "Faculty Management",
  "/exams": "Exam Schedule",
  "/nlp": "NLP Request Processing",
  "/allocation": "AI Duty Allocation",
  "/conflicts": "Conflict Detection",
  "/roster": "Duty Roster",
  "/assistant": "AI Assistant",
  "/notifications": "Notifications",
};

const facultyPageTitles: Record<string, string> = {
  "/": "My Dashboard",
  "/assistant": "AI Assistant",
  "/notifications": "Notifications",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { role } = useAuth();
  const titles = role === "admin" ? adminPageTitles : facultyPageTitles;
  const title = titles[location.pathname] || "EDAS";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="system-health bg-success/10 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                System Active
              </div>
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="h-8 w-8 press-effect">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-[1200px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

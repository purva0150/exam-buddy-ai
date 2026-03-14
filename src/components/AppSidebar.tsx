import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquareText,
  Cpu,
  AlertTriangle,
  FileSpreadsheet,
  Bot,
  Bell,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Faculty", url: "/faculty", icon: Users },
  { title: "Exam Schedule", url: "/exams", icon: Calendar },
  { title: "NLP Requests", url: "/nlp", icon: MessageSquareText },
  { title: "AI Allocation", url: "/allocation", icon: Cpu },
  { title: "Conflicts", url: "/conflicts", icon: AlertTriangle },
];

const adminSecondary = [
  { title: "Duty Roster", url: "/roster", icon: FileSpreadsheet },
  { title: "Assistant", url: "/assistant", icon: Bot },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const facultyItems = [
  { title: "My Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Assistant", url: "/assistant", icon: Bot },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, profile, signOut } = useAuth();

  const mainItems = role === "admin" ? adminItems : facultyItems;
  const secondaryItems = role === "admin" ? adminSecondary : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-semibold">ED</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">EDAS</p>
              <p className="text-[10px] text-muted-foreground">Exam Duty Allocation</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground text-xs font-semibold">ED</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {secondaryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Reports & Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted/50"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border">
        {!collapsed && (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{role || "loading..."}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {collapsed && (
          <Button variant="ghost" size="icon" className="h-7 w-7 mx-auto" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

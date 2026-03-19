import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["notifications-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const unreadCount = items.filter((n: any) => !n.read).length;

  const markAllRead = async () => {
    const unreadIds = items.filter((n: any) => !n.read).map((n: any) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    queryClient.invalidateQueries({ queryKey: ["notifications-page"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
        <Button variant="outline" size="sm" onClick={markAllRead} className="press-effect">
          <Check className="h-3.5 w-3.5 mr-1.5" />Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((n: any, i: number) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`stat-card flex items-start gap-3 ${!n.read ? "border-primary/20" : "opacity-60"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
              <Bell className={`h-3.5 w-3.5 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1 data-mono">{format(new Date(n.created_at), "PPp")}</p>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notifications.</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;

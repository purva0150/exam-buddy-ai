import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ConflictsPage = () => {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["conflicts-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("conflicts")
        .select("*, exams(subject, exam_date), profiles:faculty_id(full_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const resolve = async (id: string) => {
    const { error } = await supabase.from("conflicts").update({ resolved: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Conflict resolved");
    queryClient.invalidateQueries({ queryKey: ["conflicts-page"] });
  };

  const severityColor = (s: string) => {
    if (s === "high") return "bg-warning/10 text-warning border-0";
    if (s === "medium") return "bg-warning/10 text-warning/80 border-0";
    return "bg-muted text-muted-foreground border-0";
  };

  const active = items.filter((c: any) => !c.resolved);
  const resolved = items.filter((c: any) => c.resolved);

  return (
    <div className="space-y-6">
      <div className="system-health bg-warning/10 text-warning text-sm">
        <AlertTriangle className="h-3.5 w-3.5" />
        {active.length} active conflict{active.length !== 1 ? "s" : ""} detected
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Active Conflicts</h3>
          {active.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card conflict-row flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={severityColor(c.severity)}>{c.severity}</Badge>
                </div>
                <p className="text-sm font-medium">{c.conflict_type}</p>
                <p className="text-xs text-muted-foreground">{c.profiles?.full_name || "Unknown"} · {c.exams?.subject || "Unknown"} · {c.exams?.exam_date || ""}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => resolve(c.id)} className="press-effect">Resolve</Button>
            </motion.div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Resolved</h3>
          {resolved.map((c: any) => (
            <div key={c.id} className="stat-card opacity-60 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.conflict_type}</p>
                <p className="text-xs text-muted-foreground">{c.profiles?.full_name || "Unknown"} · {c.exams?.subject || "Unknown"}</p>
              </div>
              <Check className="h-4 w-4 text-success" />
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No conflicts recorded.</p>}
    </div>
  );
};

export default ConflictsPage;

import { Users, Calendar, Building2, ClipboardCheck, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { data: exams = [] } = useQuery({
    queryKey: ["dashboard-exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*, exam_halls(name)").order("exam_date");
      return data || [];
    },
  });

  const { data: facultyList = [] } = useQuery({
    queryKey: ["dashboard-faculty"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
      if (!roles || roles.length === 0) return [];
      const ids = roles.map(r => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, department").in("id", ids);
      return data || [];
    },
  });

  const { data: halls = [] } = useQuery({
    queryKey: ["dashboard-halls"],
    queryFn: async () => {
      const { data } = await supabase.from("exam_halls").select("*");
      return data || [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["dashboard-assignments"],
    queryFn: async () => {
      const { data } = await supabase.from("duty_assignments").select("*");
      return data || [];
    },
  });

  const { data: conflictsList = [] } = useQuery({
    queryKey: ["dashboard-conflicts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("conflicts")
        .select("*, exams(subject), profiles:faculty_id(full_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const assignedExams = exams.filter((e: any) => e.status === "assigned").length;
  const pendingExams = exams.filter((e: any) => e.status === "pending").length;
  const activeConflicts = conflictsList.filter((c: any) => !c.resolved);

  // Duty counts per faculty
  const dutyCountMap: Record<string, number> = {};
  assignments.forEach((a: any) => {
    dutyCountMap[a.faculty_id] = (dutyCountMap[a.faculty_id] || 0) + 1;
  });

  const totalSlots = exams.reduce((s: number, e: any) => s + e.invigilators_needed, 0);

  const stats = [
    { label: "Faculty Members", value: facultyList.length, icon: Users, color: "text-primary" },
    { label: "Exams Scheduled", value: exams.length, icon: Calendar, color: "text-primary" },
    { label: "Exam Halls", value: halls.length, icon: Building2, color: "text-primary" },
    { label: "Duties Assigned", value: assignedExams, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending", value: pendingExams, icon: Clock, color: "text-warning" },
    { label: "Conflicts", value: activeConflicts.length, icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="system-health bg-success/10 text-success text-sm">
          <span className="w-2 h-2 rounded-full bg-success" />
          Roster: {activeConflicts.length} Conflicts / {exams.length > 0 ? Math.round((assignedExams / exams.length) * 100) : 0}% Assigned
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="stat-card press-effect cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Allocation Progress & Upcoming */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="stat-card space-y-4">
          <h3 className="text-sm font-semibold">Allocation Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slots Filled</span>
              <span className="data-mono">{assignments.length}/{totalSlots}</span>
            </div>
            <Progress value={totalSlots > 0 ? (assignments.length / totalSlots) * 100 : 0} className="h-2" />
          </div>
          <div className="space-y-2">
            {facultyList.slice(0, 5).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between text-xs">
                <span className="truncate mr-2">{f.full_name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(((dutyCountMap[f.id] || 0) / 6) * 100, 100)}%` }} />
                  </div>
                  <span className="data-mono w-8 text-right">{dutyCountMap[f.id] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card space-y-4">
          <h3 className="text-sm font-semibold">Upcoming Exams</h3>
          <div className="space-y-2">
            {exams.slice(0, 6).map((e: any) => (
              <div key={e.id} className={`flex items-center justify-between text-xs p-2 rounded-md ${e.status === "conflict" ? "conflict-row" : "hover:bg-muted/50"}`}>
                <div>
                  <p className="font-medium text-foreground">{e.subject}</p>
                  <p className="data-mono text-muted-foreground">{e.exam_halls?.name || "TBD"}</p>
                </div>
                <div className="text-right">
                  <p className="data-mono">{e.exam_date}</p>
                  <p className="data-mono text-muted-foreground">{e.exam_time}</p>
                </div>
              </div>
            ))}
            {exams.length === 0 && <p className="text-xs text-muted-foreground">No exams scheduled yet.</p>}
          </div>
        </div>
      </div>

      {/* Active Conflicts */}
      {activeConflicts.length > 0 && (
        <div className="stat-card border-warning/30">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Active Conflicts
          </h3>
          <div className="space-y-2">
            {activeConflicts.map((c: any) => (
              <div key={c.id} className="conflict-row rounded-md p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium">{c.conflict_type}</p>
                  <p className="text-muted-foreground">{c.profiles?.full_name || "Unknown"} · {c.exams?.subject || "Unknown"}</p>
                </div>
                <span className="data-mono text-muted-foreground">{c.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

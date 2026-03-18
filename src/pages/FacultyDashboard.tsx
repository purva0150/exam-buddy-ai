import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ClipboardCheck, Clock, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const FacultyDashboard = () => {
  const [nlpText, setNlpText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: assignments = [] } = useQuery({
    queryKey: ["all-assignments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("duty_assignments")
        .select("*, exams(subject, exam_date, exam_time, status, exam_halls(name))")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const upcomingDuties = assignments.filter((a: any) => a.status === "assigned");
  const completedDuties = assignments.filter((a: any) => a.status === "completed");

  const stats = [
    { label: "Upcoming Duties", value: upcomingDuties.length, icon: Calendar, color: "text-primary" },
    { label: "Completed", value: completedDuties.length, icon: ClipboardCheck, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Faculty Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of duty assignments</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="stat-card space-y-4">
        <h3 className="text-sm font-semibold">Upcoming Duties</h3>
        {upcomingDuties.length === 0 ? (
          <p className="text-xs text-muted-foreground">No upcoming duties assigned.</p>
        ) : (
          <div className="space-y-2">
            {upcomingDuties.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{a.exams?.subject}</p>
                  <p className="data-mono text-muted-foreground">{a.exams?.exam_halls?.name || "TBD"}</p>
                </div>
                <div className="text-right">
                  <p className="data-mono">{a.exams?.exam_date}</p>
                  <p className="data-mono text-muted-foreground">{a.exams?.exam_time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;

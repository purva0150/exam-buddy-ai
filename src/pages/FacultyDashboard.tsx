import { useAuth } from "@/hooks/useAuth";
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
  const { user, profile } = useAuth();
  const [nlpText, setNlpText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: assignments = [] } = useQuery({
    queryKey: ["my-assignments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("duty_assignments")
        .select("*, exams(subject, exam_date, exam_time, status, exam_halls(name))")
        .eq("faculty_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-nlp-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("nlp_requests")
        .select("*")
        .eq("faculty_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const upcomingDuties = assignments.filter((a: any) => a.status === "assigned");
  const completedDuties = assignments.filter((a: any) => a.status === "completed");

  const handleNlpSubmit = async () => {
    if (!nlpText.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("nlp_requests").insert({
        faculty_id: user.id,
        request_text: nlpText.trim(),
        status: "pending",
      });
      if (error) throw error;
      toast.success("Request submitted successfully");
      setNlpText("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: "Upcoming Duties", value: upcomingDuties.length, icon: Calendar, color: "text-primary" },
    { label: "Completed", value: completedDuties.length, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending Requests", value: myRequests.filter((r: any) => r.status === "pending").length, icon: Clock, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome, {profile?.full_name || "Faculty"}</h2>
        <p className="text-sm text-muted-foreground">{profile?.department || "Department not set"}</p>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {/* Upcoming Duties */}
      <div className="stat-card space-y-4">
        <h3 className="text-sm font-semibold">My Upcoming Duties</h3>
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

      {/* NLP Request Submission */}
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Submit Availability Request</h3>
        </div>
        <p className="text-xs text-muted-foreground">Type your request in natural language. E.g. "I am not available on 15th March."</p>
        <div className="flex gap-2">
          <input
            className="ghost-input flex-1"
            placeholder="Type your request..."
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNlpSubmit()}
          />
          <Button size="sm" onClick={handleNlpSubmit} disabled={submitting || !nlpText.trim()} className="press-effect">
            Submit
          </Button>
        </div>
      </div>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <div className="stat-card space-y-3">
          <h3 className="text-sm font-semibold">My Requests</h3>
          <div className="space-y-2">
            {myRequests.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50">
                <p className="truncate mr-2 flex-1">{r.request_text}</p>
                <span className={`token-badge ${r.status === "processed" ? "bg-success/10 text-success" : r.status === "rejected" ? "bg-destructive/10 text-destructive" : ""}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;

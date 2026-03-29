import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FacultyProfile {
  id: string;
  full_name: string;
  department: string | null;
  specialization: string | null;
}

interface ExamRow {
  id: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  invigilators_needed: number;
  status: string;
  hall_id: string | null;
  students: number;
  exam_halls: { name: string } | null;
}

const AllocationPage = () => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allocationResult, setAllocationResult] = useState<{ balanced: number; conflicts: number }>({ balanced: 0, conflicts: 0 });
  const queryClient = useQueryClient();

  // Fetch exams from DB
  const { data: exams = [] } = useQuery({
    queryKey: ["exams-for-allocation"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exams")
        .select("*, exam_halls(name)")
        .order("exam_date", { ascending: true });
      return (data || []) as ExamRow[];
    },
  });

  // Fetch faculty profiles (only those with faculty role)
  const { data: facultyList = [] } = useQuery({
    queryKey: ["faculty-for-allocation"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
      if (!roles || roles.length === 0) return [];
      const facultyIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, department, specialization")
        .in("id", facultyIds);
      return (profiles || []) as FacultyProfile[];
    },
  });

  // Fetch approved leaves to exclude faculty on leave
  const { data: approvedLeaves = [] } = useQuery({
    queryKey: ["approved-leaves-for-allocation"],
    queryFn: async () => {
      const { data } = await supabase.from("nlp_requests").select("*").eq("status", "approved");
      return data || [];
    },
  });

  // Fetch existing assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ["duty-assignments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("duty_assignments")
        .select("*, exams(subject, exam_date, exam_time, exam_halls(name)), profiles:faculty_id(full_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleGenerate = async () => {
    if (exams.length === 0) {
      toast.error("No exams found. Add exams first.");
      return;
    }
    if (facultyList.length === 0) {
      toast.error("No faculty members found.");
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 3;
      });
    }, 40);

    try {
      // --- SMART ALLOCATION ALGORITHM ---
      // Track how many duties each faculty has been assigned
      const dutyCount: Record<string, number> = {};
      facultyList.forEach(f => { dutyCount[f.id] = 0; });

      const newAssignments: { faculty_id: string; exam_id: string; status: string }[] = [];
      let conflictCount = 0;

      // Build a set of faculty on leave per date from approved NLP requests
      const facultyOnLeave: Record<string, Set<string>> = {};
      approvedLeaves.forEach((l: any) => {
        const tokens = Array.isArray(l.parsed_tokens) ? l.parsed_tokens : [];
        const dateToken = tokens.find((t: any) => t.label === "Date");
        if (dateToken) {
          if (!facultyOnLeave[dateToken.value]) facultyOnLeave[dateToken.value] = new Set();
          facultyOnLeave[dateToken.value].add(l.faculty_id);
        }
      });

      // For each exam, assign required invigilators
      for (const exam of exams) {
        const needed = exam.invigilators_needed;

        // Filter eligible faculty:
        // 1. Exclude faculty whose specialization matches the exam subject (subject teacher rule)
        // 2. Exclude faculty already assigned to an exam at the same date+time
        // 3. Exclude faculty on approved leave for that date
        const assignedAtSameSlot = new Set(
          newAssignments
            .filter(a => {
              const aExam = exams.find(e => e.id === a.exam_id);
              return aExam && aExam.exam_date === exam.exam_date && aExam.exam_time === exam.exam_time;
            })
            .map(a => a.faculty_id)
        );

        const onLeaveThisDate = facultyOnLeave[exam.exam_date] || new Set();

        const eligible = facultyList
          .filter(f => {
            // Rule 1: Subject teacher exclusion
            if (f.specialization && f.specialization.toLowerCase() === exam.subject.toLowerCase()) return false;
            // Rule 2: No same time-slot double booking
            if (assignedAtSameSlot.has(f.id)) return false;
            // Rule 3: Not already assigned to THIS exam
            if (newAssignments.some(a => a.exam_id === exam.id && a.faculty_id === f.id)) return false;
            // Rule 4: Faculty on approved leave this date
            if (onLeaveThisDate.has(f.id)) return false;
            return true;
          })
          // Sort by fewest duties first (equal distribution)
          .sort((a, b) => (dutyCount[a.id] || 0) - (dutyCount[b.id] || 0));

        const toAssign = eligible.slice(0, needed);

        if (toAssign.length < needed) {
          conflictCount += needed - toAssign.length;
        }

        for (const f of toAssign) {
          newAssignments.push({ faculty_id: f.id, exam_id: exam.id, status: "assigned" });
          dutyCount[f.id] = (dutyCount[f.id] || 0) + 1;
        }
      }

      // Clear old assignments and insert new ones
      await supabase.from("duty_assignments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (newAssignments.length > 0) {
        const { error } = await supabase.from("duty_assignments").insert(newAssignments);
        if (error) throw error;
      }

      // Update exam statuses
      for (const exam of exams) {
        const assignedCount = newAssignments.filter(a => a.exam_id === exam.id).length;
        const status = assignedCount >= exam.invigilators_needed ? "assigned" : assignedCount > 0 ? "conflict" : "pending";
        await supabase.from("exams").update({ status }).eq("id", exam.id);
      }

      clearInterval(interval);
      setProgress(100);

      const totalSlots = exams.reduce((sum, e) => sum + e.invigilators_needed, 0);
      const balanced = totalSlots > 0 ? Math.round((newAssignments.length / totalSlots) * 100) : 100;
      setAllocationResult({ balanced, conflicts: conflictCount });

      await queryClient.invalidateQueries({ queryKey: ["duty-assignments"] });

      setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
      }, 300);

      toast.success(`Allocated ${newAssignments.length} duties across ${Object.keys(dutyCount).filter(k => dutyCount[k] > 0).length} faculty`);
    } catch (err: any) {
      clearInterval(interval);
      setGenerating(false);
      toast.error(err.message || "Allocation failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="stat-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">AI Allocation Engine</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-allocates from exam timetable. Excludes subject teachers, balances workload equally, prevents duplicates.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="press-effect" size="sm">
          <Cpu className="h-3.5 w-3.5 mr-1.5" />
          {generating ? "Processing..." : "Generate Duty Roster"}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums">{exams.length}</p>
          <p className="text-xs text-muted-foreground">Exams</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums">{facultyList.length}</p>
          <p className="text-xs text-muted-foreground">Faculty</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums">{exams.reduce((s, e) => s + e.invigilators_needed, 0)}</p>
          <p className="text-xs text-muted-foreground">Slots Needed</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums">{assignments.length}</p>
          <p className="text-xs text-muted-foreground">Current Assignments</p>
        </div>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="stat-card space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Running allocation algorithm...</span>
              <span className="data-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      {generated && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`stat-card ${allocationResult.conflicts > 0 ? "border-warning/30" : "border-success/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${allocationResult.conflicts > 0 ? "bg-warning/10" : "bg-success/10"}`}>
              {allocationResult.conflicts > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> : <Check className="h-3.5 w-3.5 text-success" />}
            </div>
            <span className="text-sm font-semibold">
              {allocationResult.balanced}% Filled — {allocationResult.conflicts} Unfilled Slot{allocationResult.conflicts !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Subject teachers excluded • Duties distributed equally • No duplicate assignments</p>
        </motion.div>
      )}

      {/* Duty Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">Exam</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Hall</th>
              <th className="text-left p-3 font-medium">Assigned Faculty</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => {
              const examAssignments = assignments.filter((a: any) => a.exam_id === exam.id);
              return (
                <tr key={exam.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium">{exam.subject}</p>
                    <p className="data-mono text-muted-foreground text-xs">{exam.students} students</p>
                  </td>
                  <td className="p-3 data-mono">{exam.exam_date} {exam.exam_time}</td>
                  <td className="p-3 data-mono">{exam.exam_halls?.name || "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {examAssignments.length > 0 ? (
                        examAssignments.map((a: any) => (
                          <span key={a.id} className="text-xs bg-muted px-2 py-0.5 rounded-sm">
                            {(a as any).profiles?.full_name || "Unknown"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Not assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {exams.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">No exams in the system. Add exams first.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationPage;

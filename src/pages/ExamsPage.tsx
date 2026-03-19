import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, Table, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExamsPage = () => {
  const [view, setView] = useState<"table" | "calendar">("table");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", exam_date: "", exam_time: "", students: 0, hall_id: "", invigilators_needed: 1 });
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ["exams-page"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*, exam_halls(name)").order("exam_date");
      return data || [];
    },
  });

  const { data: halls = [] } = useQuery({
    queryKey: ["exam-halls"],
    queryFn: async () => {
      const { data } = await supabase.from("exam_halls").select("*");
      return data || [];
    },
  });

  const statusColor = (s: string) => {
    if (s === "assigned") return "bg-success/10 text-success border-0";
    if (s === "conflict") return "bg-warning/10 text-warning border-0";
    return "bg-muted text-muted-foreground border-0";
  };

  const dates = [...new Set(exams.map((e: any) => e.exam_date))].sort();

  const handleAddExam = async () => {
    if (!form.subject || !form.exam_date || !form.exam_time) {
      toast.error("Fill in required fields");
      return;
    }
    const { error } = await supabase.from("exams").insert({
      subject: form.subject,
      exam_date: form.exam_date,
      exam_time: form.exam_time,
      students: form.students,
      hall_id: form.hall_id || null,
      invigilators_needed: form.invigilators_needed,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Exam added");
    setAddOpen(false);
    setForm({ subject: "", exam_date: "", exam_time: "", students: 0, hall_id: "", invigilators_needed: 1 });
    queryClient.invalidateQueries({ queryKey: ["exams-page"] });
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV must have a header row and data"); return; }

    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const subjectIdx = header.indexOf("subject");
    const dateIdx = header.indexOf("date");
    const timeIdx = header.indexOf("time");
    const studentsIdx = header.indexOf("students");
    const invigilatorsIdx = header.indexOf("invigilators");

    if (subjectIdx === -1 || dateIdx === -1 || timeIdx === -1) {
      toast.error("CSV must have columns: subject, date, time");
      return;
    }

    const rows = lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim());
      return {
        subject: cols[subjectIdx],
        exam_date: cols[dateIdx],
        exam_time: cols[timeIdx],
        students: studentsIdx !== -1 ? parseInt(cols[studentsIdx]) || 0 : 0,
        invigilators_needed: invigilatorsIdx !== -1 ? parseInt(cols[invigilatorsIdx]) || 1 : 1,
      };
    }).filter(r => r.subject && r.exam_date && r.exam_time);

    if (rows.length === 0) { toast.error("No valid rows found"); return; }

    const { error } = await supabase.from("exams").insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`Uploaded ${rows.length} exams`);
    queryClient.invalidateQueries({ queryKey: ["exams-page"] });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted rounded-md p-0.5">
          <button onClick={() => setView("table")} className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <Table className="h-3.5 w-3.5 inline mr-1" />Table
          </button>
          <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${view === "calendar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <CalendarDays className="h-3.5 w-3.5 inline mr-1" />Calendar
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="press-effect" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />Upload CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="press-effect"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Exam</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Exam</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date *</Label><Input type="date" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} /></div>
                  <div><Label>Time *</Label><Input type="time" value={form.exam_time} onChange={e => setForm(f => ({ ...f, exam_time: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Students</Label><Input type="number" value={form.students} onChange={e => setForm(f => ({ ...f, students: parseInt(e.target.value) || 0 }))} /></div>
                  <div><Label>Invigilators Needed</Label><Input type="number" value={form.invigilators_needed} onChange={e => setForm(f => ({ ...f, invigilators_needed: parseInt(e.target.value) || 1 }))} /></div>
                </div>
                <div>
                  <Label>Hall</Label>
                  <Select value={form.hall_id} onValueChange={v => setForm(f => ({ ...f, hall_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select hall" /></SelectTrigger>
                    <SelectContent>
                      {halls.map((h: any) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddExam} className="w-full">Add Exam</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "table" ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">Subject</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Time</th>
                <th className="text-left p-3 font-medium">Students</th>
                <th className="text-left p-3 font-medium">Hall</th>
                <th className="text-left p-3 font-medium">Invigilators</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e: any, i: number) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-t border-border hover:bg-muted/30 transition-colors ${e.status === "conflict" ? "conflict-row" : ""}`}>
                  <td className="p-3 font-medium">{e.subject}</td>
                  <td className="p-3 data-mono">{e.exam_date}</td>
                  <td className="p-3 data-mono">{e.exam_time}</td>
                  <td className="p-3 tabular-nums">{e.students}</td>
                  <td className="p-3 data-mono">{e.exam_halls?.name || "—"}</td>
                  <td className="p-3 tabular-nums">{e.invigilators_needed}</td>
                  <td className="p-3"><Badge className={statusColor(e.status)}>{e.status}</Badge></td>
                </motion.tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">No exams. Add exams or upload a CSV.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map(date => (
            <div key={date} className="stat-card">
              <h3 className="text-sm font-semibold mb-3 data-mono">{date}</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {exams.filter((e: any) => e.exam_date === date).map((e: any) => (
                  <div key={e.id} className={`p-3 rounded-md border border-border text-xs ${e.status === "conflict" ? "conflict-row" : ""}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{e.subject}</p>
                      <Badge className={statusColor(e.status)}>{e.status}</Badge>
                    </div>
                    <p className="text-muted-foreground data-mono">{e.exam_time} · {e.exam_halls?.name || "TBD"} · {e.students} students · {e.invigilators_needed} req.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {exams.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No exams scheduled.</p>}
        </div>
      )}
    </div>
  );
};

export default ExamsPage;

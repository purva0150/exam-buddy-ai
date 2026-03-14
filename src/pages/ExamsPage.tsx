import { useState } from "react";
import { exams, halls } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, Table } from "lucide-react";
import { motion } from "framer-motion";

const ExamsPage = () => {
  const [view, setView] = useState<"table" | "calendar">("table");

  const statusColor = (s: string) => {
    if (s === "assigned") return "bg-success/10 text-success border-0";
    if (s === "conflict") return "bg-warning/10 text-warning border-0";
    return "bg-muted text-muted-foreground border-0";
  };

  const dates = [...new Set(exams.map(e => e.date))].sort();

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
        <Button size="sm" className="press-effect"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Exam</Button>
      </div>

      {view === "table" ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">ID</th>
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
              {exams.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-t border-border hover:bg-muted/30 transition-colors ${e.status === "conflict" ? "conflict-row" : ""}`}>
                  <td className="p-3 data-mono">{e.id}</td>
                  <td className="p-3 font-medium">{e.subject}</td>
                  <td className="p-3 data-mono">{e.date}</td>
                  <td className="p-3 data-mono">{e.time}</td>
                  <td className="p-3 tabular-nums">{e.students}</td>
                  <td className="p-3 data-mono">{e.hall}</td>
                  <td className="p-3 tabular-nums">{e.invigilators}</td>
                  <td className="p-3"><Badge className={statusColor(e.status)}>{e.status}</Badge></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map(date => (
            <div key={date} className="stat-card">
              <h3 className="text-sm font-semibold mb-3 data-mono">{date}</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {exams.filter(e => e.date === date).map(e => (
                  <div key={e.id} className={`p-3 rounded-md border border-border text-xs ${e.status === "conflict" ? "conflict-row" : ""}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{e.subject}</p>
                      <Badge className={statusColor(e.status)}>{e.status}</Badge>
                    </div>
                    <p className="text-muted-foreground data-mono">{e.time} · {e.hall} · {e.students} students · {e.invigilators} req.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsPage;

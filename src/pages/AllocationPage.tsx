import { useState } from "react";
import { faculty, exams } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Check } from "lucide-react";

const AllocationPage = () => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setGenerated(true);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const assignments = exams.map((e, i) => ({
    ...e,
    assignedFaculty: faculty.slice(i % faculty.length, (i % faculty.length) + e.invigilators).map(f => f.name),
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="stat-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">AI Allocation Engine</h3>
          <p className="text-xs text-muted-foreground mt-1">Optimizes across availability, workload balance, and department rules.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="press-effect" size="sm">
          <Cpu className="h-3.5 w-3.5 mr-1.5" />
          {generating ? "Processing..." : "Generate Duty Roster"}
        </Button>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="stat-card space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Simulating permutations...</span>
              <span className="data-mono">{Math.floor(progress * 10)} / 1,000</span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      {generated && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card border-success/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-success" />
            </div>
            <span className="text-sm font-semibold">98% Balanced — 2 Flagged Conflicts</span>
          </div>
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
            {assignments.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: generated ? i * 0.08 : 0 }} className={`border-t border-border ${a.status === "conflict" ? "conflict-row" : "hover:bg-muted/30"} transition-colors`}>
                <td className="p-3">
                  <p className="font-medium">{a.subject}</p>
                  <p className="data-mono text-muted-foreground">{a.id}</p>
                </td>
                <td className="p-3 data-mono">{a.date} {a.time}</td>
                <td className="p-3 data-mono">{a.hall}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {a.assignedFaculty.map((f, j) => (
                      <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded-sm">{f}</span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationPage;

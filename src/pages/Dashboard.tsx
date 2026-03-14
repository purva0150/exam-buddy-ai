import { Users, Calendar, Building2, ClipboardCheck, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { faculty, exams, conflicts } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Faculty Members", value: faculty.length, icon: Users, color: "text-primary" },
  { label: "Exams Scheduled", value: exams.length, icon: Calendar, color: "text-primary" },
  { label: "Exam Halls", value: 4, icon: Building2, color: "text-primary" },
  { label: "Duties Assigned", value: exams.filter(e => e.status === "assigned").length, icon: ClipboardCheck, color: "text-success" },
  { label: "Pending", value: exams.filter(e => e.status === "pending").length, icon: Clock, color: "text-warning" },
  { label: "Conflicts", value: conflicts.filter(c => !c.resolved).length, icon: AlertTriangle, color: "text-warning" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const totalDuties = faculty.reduce((s, f) => s + f.duties, 0);
  const maxDuties = faculty.reduce((s, f) => s + f.maxDuties, 0);
  const assignedExams = exams.filter(e => e.status === "assigned").length;
  const workloadVariance = 0.4;

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="system-health bg-success/10 text-success text-sm">
          <span className="w-2 h-2 rounded-full bg-success" />
          Roster: {conflicts.filter(c => !c.resolved).length} Conflicts / {Math.round((assignedExams / exams.length) * 100)}% Assigned
        </div>
        <span className="text-xs text-muted-foreground">
          Workload variance: ±{workloadVariance} duties per faculty (Optimal)
        </span>
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
              <span>Duties Filled</span>
              <span className="data-mono">{totalDuties}/{maxDuties}</span>
            </div>
            <Progress value={(totalDuties / maxDuties) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            {faculty.slice(0, 5).map(f => (
              <div key={f.id} className="flex items-center justify-between text-xs">
                <span className="truncate mr-2">{f.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(f.duties / f.maxDuties) * 100}%` }} />
                  </div>
                  <span className="data-mono w-8 text-right">{f.duties}/{f.maxDuties}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card space-y-4">
          <h3 className="text-sm font-semibold">Upcoming Exams</h3>
          <div className="space-y-2">
            {exams.map(e => (
              <div key={e.id} className={`flex items-center justify-between text-xs p-2 rounded-md ${e.status === "conflict" ? "conflict-row" : "hover:bg-muted/50"}`}>
                <div>
                  <p className="font-medium text-foreground">{e.subject}</p>
                  <p className="data-mono text-muted-foreground">{e.id} · {e.hall}</p>
                </div>
                <div className="text-right">
                  <p className="data-mono">{e.date}</p>
                  <p className="data-mono text-muted-foreground">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Conflicts */}
      {conflicts.filter(c => !c.resolved).length > 0 && (
        <div className="stat-card border-warning/30">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Active Conflicts
          </h3>
          <div className="space-y-2">
            {conflicts.filter(c => !c.resolved).map(c => (
              <div key={c.id} className="conflict-row rounded-md p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium">{c.type}</p>
                  <p className="text-muted-foreground">{c.faculty} · {c.exam}</p>
                </div>
                <span className="data-mono text-muted-foreground">{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

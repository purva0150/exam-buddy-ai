import { conflicts } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const ConflictsPage = () => {
  const [items, setItems] = useState(conflicts);

  const resolve = (id: string) => {
    setItems(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c));
  };

  const severityColor = (s: string) => {
    if (s === "high") return "bg-warning/10 text-warning border-0";
    if (s === "medium") return "bg-warning/10 text-warning/80 border-0";
    return "bg-muted text-muted-foreground border-0";
  };

  const active = items.filter(c => !c.resolved);
  const resolved = items.filter(c => c.resolved);

  return (
    <div className="space-y-6">
      <div className="system-health bg-warning/10 text-warning text-sm">
        <AlertTriangle className="h-3.5 w-3.5" />
        {active.length} active conflict{active.length !== 1 ? "s" : ""} detected
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Active Conflicts</h3>
          {active.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card conflict-row flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="data-mono text-muted-foreground">{c.id}</span>
                  <Badge className={severityColor(c.severity)}>{c.severity}</Badge>
                </div>
                <p className="text-sm font-medium">{c.type}</p>
                <p className="text-xs text-muted-foreground">{c.faculty} · {c.exam} · {c.date}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => resolve(c.id)} className="press-effect">Resolve</Button>
            </motion.div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Resolved</h3>
          {resolved.map(c => (
            <div key={c.id} className="stat-card opacity-60 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.type}</p>
                <p className="text-xs text-muted-foreground">{c.faculty} · {c.exam}</p>
              </div>
              <Check className="h-4 w-4 text-success" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictsPage;

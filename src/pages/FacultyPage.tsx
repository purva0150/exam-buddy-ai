import { useState } from "react";
import { motion } from "framer-motion";
import { faculty, departments } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Upload } from "lucide-react";

const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

const FacultyPage = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filtered = faculty.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || f.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="press-effect"><Upload className="h-3.5 w-3.5 mr-1.5" />Import CSV</Button>
          <Button size="sm" className="press-effect"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Faculty</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Department</th>
              <th className="text-left p-3 font-medium">Workload</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <motion.tr key={f.id} variants={item} initial="hidden" animate="show" transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 data-mono">{f.id}</td>
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3 text-muted-foreground">{f.department}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${f.duties >= f.maxDuties ? "bg-warning" : "bg-primary"}`} style={{ width: `${(f.duties / f.maxDuties) * 100}%` }} />
                    </div>
                    <span className="data-mono text-xs">{f.duties}/{f.maxDuties}</span>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant={f.available ? "default" : "secondary"} className={f.available ? "bg-success/10 text-success border-0" : ""}>{f.available ? "Available" : "Unavailable"}</Badge>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyPage;

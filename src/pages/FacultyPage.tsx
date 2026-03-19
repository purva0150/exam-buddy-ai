import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

const FacultyPage = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const { data: facultyList = [] } = useQuery({
    queryKey: ["faculty-page-list"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
      if (!roles || roles.length === 0) return [];
      const ids = roles.map(r => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, department, specialization").in("id", ids);
      return data || [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["faculty-page-assignments"],
    queryFn: async () => {
      const { data } = await supabase.from("duty_assignments").select("faculty_id, status");
      return data || [];
    },
  });

  const departments = [...new Set(facultyList.map((f: any) => f.department).filter(Boolean))];

  const dutyCountMap: Record<string, number> = {};
  assignments.forEach((a: any) => {
    dutyCountMap[a.faculty_id] = (dutyCountMap[a.faculty_id] || 0) + 1;
  });

  const filtered = facultyList.filter((f: any) => {
    const matchSearch = f.full_name.toLowerCase().includes(search.toLowerCase());
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
              {departments.map(d => <SelectItem key={d} value={d!}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Department</th>
              <th className="text-left p-3 font-medium">Specialization</th>
              <th className="text-left p-3 font-medium">Duties Assigned</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f: any, i: number) => (
              <motion.tr key={f.id} variants={item} initial="hidden" animate="show" transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{f.full_name}</td>
                <td className="p-3 text-muted-foreground">{f.department || "—"}</td>
                <td className="p-3 text-muted-foreground">{f.specialization || "—"}</td>
                <td className="p-3">
                  <Badge variant="secondary">{dutyCountMap[f.id] || 0} duties</Badge>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">No faculty found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyPage;

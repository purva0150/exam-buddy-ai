import { exams, faculty } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

const RosterPage = () => {
  const assignments = exams.map((e, i) => ({
    ...e,
    assignedFaculty: faculty.slice(i % faculty.length, (i % faculty.length) + e.invigilators).map(f => f.name),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Spring 2024 Final Exams: {exams.length} Duties Allocated</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="press-effect"><Download className="h-3.5 w-3.5 mr-1.5" />Export PDF</Button>
          <Button variant="outline" size="sm" className="press-effect"><Download className="h-3.5 w-3.5 mr-1.5" />Export Excel</Button>
          <Button variant="outline" size="sm" className="press-effect"><Printer className="h-3.5 w-3.5 mr-1.5" />Print</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">Subject</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Time</th>
              <th className="text-left p-3 font-medium">Hall</th>
              <th className="text-left p-3 font-medium">Invigilators</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3 data-mono">{a.id}</td>
                <td className="p-3 font-medium">{a.subject}</td>
                <td className="p-3 data-mono">{a.date}</td>
                <td className="p-3 data-mono">{a.time}</td>
                <td className="p-3 data-mono">{a.hall}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {a.assignedFaculty.map((f, j) => (
                      <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded-sm">{f}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Faculty Summary */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-3">Faculty Duty Summary</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {faculty.map(f => (
            <div key={f.id} className="p-3 rounded-md border border-border text-xs">
              <p className="font-medium text-sm">{f.name}</p>
              <p className="text-muted-foreground mt-1">{f.department}</p>
              <p className="data-mono mt-1">{f.duties} duties assigned</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RosterPage;

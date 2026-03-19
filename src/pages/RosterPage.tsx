import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RosterPage = () => {
  const { data: exams = [] } = useQuery({
    queryKey: ["roster-exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*, exam_halls(name)").order("exam_date");
      return data || [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["roster-assignments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("duty_assignments")
        .select("*, profiles:faculty_id(full_name)");
      return data || [];
    },
  });

  const { data: facultyList = [] } = useQuery({
    queryKey: ["roster-faculty"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
      if (!roles || roles.length === 0) return [];
      const ids = roles.map(r => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, department").in("id", ids);
      return data || [];
    },
  });

  // Build roster data
  const rosterData = exams.map((exam: any) => {
    const examAssignments = assignments.filter((a: any) => a.exam_id === exam.id);
    return {
      ...exam,
      assignedFaculty: examAssignments.map((a: any) => a.profiles?.full_name || "Unknown"),
    };
  });

  // Faculty duty summary
  const dutyCountMap: Record<string, number> = {};
  assignments.forEach((a: any) => {
    dutyCountMap[a.faculty_id] = (dutyCountMap[a.faculty_id] || 0) + 1;
  });

  const getTableData = () =>
    rosterData.map((r: any) => [
      r.subject,
      r.exam_date,
      r.exam_time,
      r.exam_halls?.name || "—",
      r.assignedFaculty.join(", ") || "Not assigned",
    ]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Exam Duty Roster", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Subject", "Date", "Time", "Hall", "Invigilators"]],
      body: getTableData(),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 98, 168] },
    });

    // Faculty summary
    const finalY = (doc as any).lastAutoTable?.finalY || 35;
    doc.setFontSize(12);
    doc.text("Faculty Duty Summary", 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Faculty", "Department", "Duties"]],
      body: facultyList.map((f: any) => [f.full_name, f.department || "—", dutyCountMap[f.id] || 0]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 98, 168] },
    });

    doc.save("exam-duty-roster.pdf");
  };

  const exportDOC = () => {
    let html = `<html><head><meta charset="utf-8"><style>
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; font-size: 12px; }
      th { background: #2962a8; color: white; }
      h1 { font-size: 18px; } h2 { font-size: 14px; margin-top: 20px; }
    </style></head><body>`;
    html += `<h1>Exam Duty Roster</h1><p>Generated: ${new Date().toLocaleDateString()}</p>`;
    html += `<table><tr><th>Subject</th><th>Date</th><th>Time</th><th>Hall</th><th>Invigilators</th></tr>`;
    rosterData.forEach((r: any) => {
      html += `<tr><td>${r.subject}</td><td>${r.exam_date}</td><td>${r.exam_time}</td><td>${r.exam_halls?.name || "—"}</td><td>${r.assignedFaculty.join(", ") || "Not assigned"}</td></tr>`;
    });
    html += `</table>`;
    html += `<h2>Faculty Duty Summary</h2><table><tr><th>Faculty</th><th>Department</th><th>Duties</th></tr>`;
    facultyList.forEach((f: any) => {
      html += `<tr><td>${f.full_name}</td><td>${f.department || "—"}</td><td>${dutyCountMap[f.id] || 0}</td></tr>`;
    });
    html += `</table></body></html>`;

    const blob = new Blob(['\ufeff', html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-duty-roster.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{exams.length} Exams · {assignments.length} Duties Allocated</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="press-effect" onClick={exportPDF}><Download className="h-3.5 w-3.5 mr-1.5" />Export PDF</Button>
          <Button variant="outline" size="sm" className="press-effect" onClick={exportDOC}><Download className="h-3.5 w-3.5 mr-1.5" />Export DOC</Button>
          <Button variant="outline" size="sm" className="press-effect" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1.5" />Print</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">Subject</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Time</th>
              <th className="text-left p-3 font-medium">Hall</th>
              <th className="text-left p-3 font-medium">Invigilators</th>
            </tr>
          </thead>
          <tbody>
            {rosterData.map((a: any) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3 font-medium">{a.subject}</td>
                <td className="p-3 data-mono">{a.exam_date}</td>
                <td className="p-3 data-mono">{a.exam_time}</td>
                <td className="p-3 data-mono">{a.exam_halls?.name || "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {a.assignedFaculty.length > 0 ? a.assignedFaculty.map((f: string, j: number) => (
                      <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded-sm">{f}</span>
                    )) : <span className="text-xs text-muted-foreground">Not assigned</span>}
                  </div>
                </td>
              </tr>
            ))}
            {rosterData.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No exam data. Add exams first.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Faculty Summary */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-3">Faculty Duty Summary</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {facultyList.map((f: any) => (
            <div key={f.id} className="p-3 rounded-md border border-border text-xs">
              <p className="font-medium text-sm">{f.full_name}</p>
              <p className="text-muted-foreground mt-1">{f.department || "—"}</p>
              <p className="data-mono mt-1">{dutyCountMap[f.id] || 0} duties assigned</p>
            </div>
          ))}
          {facultyList.length === 0 && <p className="text-xs text-muted-foreground">No faculty in the system.</p>}
        </div>
      </div>
    </div>
  );
};

export default RosterPage;

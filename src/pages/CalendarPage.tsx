import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, UserX } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026

  const { data: exams = [] } = useQuery({
    queryKey: ["calendar-exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*, exam_halls(name)").order("exam_date");
      return data || [];
    },
  });

  const { data: approvedLeaves = [] } = useQuery({
    queryKey: ["calendar-leaves"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nlp_requests")
        .select("*, profiles:faculty_id(full_name)")
        .eq("status", "approved");
      return data || [];
    },
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDayOfWeek = getDay(days[0]); // 0=Sun

  const getExamsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return exams.filter((e: any) => e.exam_date === dateStr);
  };

  const getLeavesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return approvedLeaves.filter((l: any) => {
      const tokens = Array.isArray(l.parsed_tokens) ? l.parsed_tokens : [];
      return tokens.some((t: any) => t.label === "Date" && t.value === dateStr);
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
          Exam Scheduled
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-warning" />
          Faculty on Leave
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map(d => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-border">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
          ))}

          {days.map((day, i) => {
            const dayExams = getExamsForDate(day);
            const dayLeaves = getLeavesForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`min-h-[100px] border-b border-r border-border p-1.5 transition-colors hover:bg-muted/30 ${isToday ? "bg-primary/5" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </div>

                {/* Exams */}
                {dayExams.map((e: any) => (
                  <div key={e.id} className="mb-1 px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] leading-tight truncate" title={`${e.subject} - ${e.exam_time} - ${e.exam_halls?.name || "TBD"}`}>
                    <BookOpen className="h-2.5 w-2.5 inline mr-0.5" />
                    {e.subject}
                  </div>
                ))}

                {/* Leaves */}
                {dayLeaves.map((l: any) => (
                  <div key={l.id} className="mb-1 px-1.5 py-0.5 rounded-sm bg-warning/10 text-warning text-[10px] leading-tight truncate" title={`${l.profiles?.full_name} - On Leave`}>
                    <UserX className="h-2.5 w-2.5 inline mr-0.5" />
                    {l.profiles?.full_name?.split(" ").slice(-1)[0] || "Leave"}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel - upcoming exams with leaves */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="stat-card space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Exams This Month
          </h3>
          {exams.filter((e: any) => {
            const d = new Date(e.exam_date);
            return isSameMonth(d, currentMonth);
          }).length === 0 && <p className="text-xs text-muted-foreground">No exams this month.</p>}
          {exams.filter((e: any) => {
            const d = new Date(e.exam_date);
            return isSameMonth(d, currentMonth);
          }).map((e: any) => (
            <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-md border border-border">
              <div>
                <p className="font-medium">{e.subject}</p>
                <p className="text-muted-foreground data-mono">{e.exam_halls?.name || "TBD"}</p>
              </div>
              <div className="text-right">
                <p className="data-mono">{e.exam_date}</p>
                <p className="text-muted-foreground data-mono">{e.exam_time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="stat-card space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <UserX className="h-3.5 w-3.5 text-warning" />
            Approved Leaves This Month
          </h3>
          {approvedLeaves.filter((l: any) => {
            const tokens = Array.isArray(l.parsed_tokens) ? l.parsed_tokens : [];
            return tokens.some((t: any) => {
              if (t.label !== "Date") return false;
              const d = new Date(t.value);
              return isSameMonth(d, currentMonth);
            });
          }).length === 0 && <p className="text-xs text-muted-foreground">No approved leaves this month.</p>}
          {approvedLeaves.filter((l: any) => {
            const tokens = Array.isArray(l.parsed_tokens) ? l.parsed_tokens : [];
            return tokens.some((t: any) => {
              if (t.label !== "Date") return false;
              const d = new Date(t.value);
              return isSameMonth(d, currentMonth);
            });
          }).map((l: any) => {
            const dateToken = (Array.isArray(l.parsed_tokens) ? l.parsed_tokens : []).find((t: any) => t.label === "Date");
            const reasonToken = (Array.isArray(l.parsed_tokens) ? l.parsed_tokens : []).find((t: any) => t.label === "Reason");
            return (
              <div key={l.id} className="flex items-center justify-between text-xs p-2 rounded-md border border-warning/30">
                <div>
                  <p className="font-medium">{l.profiles?.full_name}</p>
                  <p className="text-muted-foreground">{reasonToken?.value || "Leave"}</p>
                </div>
                <Badge className="bg-warning/10 text-warning border-0 text-[10px]">{dateToken?.value}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Brain, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// NLP token extraction engine
const extractTokens = (text: string): { label: string; value: string }[] => {
  const tokens: { label: string; value: string }[] = [];
  const lower = text.toLowerCase();

  // Date extraction
  const datePatterns = [
    { regex: /(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i, handler: (m: RegExpMatchArray) => {
      const months: Record<string, string> = { january:"01",february:"02",march:"03",april:"04",may:"05",june:"06",july:"07",august:"08",september:"09",october:"10",november:"11",december:"12" };
      return `2026-${months[m[3].toLowerCase()]}-${m[1].padStart(2,"0")}`;
    }},
    { regex: /(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, handler: (m: RegExpMatchArray) => {
      const months: Record<string, string> = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };
      return `2026-${months[m[3].toLowerCase()]}-${m[1].padStart(2,"0")}`;
    }},
    { regex: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (m: RegExpMatchArray) => m[1] },
    { regex: /(tomorrow|today|next week)/i, handler: (m: RegExpMatchArray) => m[1] },
  ];
  for (const p of datePatterns) {
    const match = text.match(p.regex);
    if (match) { tokens.push({ label: "Date", value: p.handler(match) }); break; }
  }

  // Time extraction
  if (lower.includes("morning")) tokens.push({ label: "Time", value: "09:00-12:00" });
  else if (lower.includes("afternoon")) tokens.push({ label: "Time", value: "12:00-17:00" });
  else if (lower.includes("evening")) tokens.push({ label: "Time", value: "17:00-20:00" });
  else {
    const timeMatch = text.match(/(\d{1,2}:\d{2})\s*(am|pm)?/i);
    if (timeMatch) tokens.push({ label: "Time", value: timeMatch[0] });
  }

  // Status / Action extraction
  if (lower.includes("not available") || lower.includes("unavailable") || lower.includes("can't") || lower.includes("cannot") || lower.includes("unable")) {
    tokens.push({ label: "Status", value: "Unavailable" });
  } else if (lower.includes("swap") || lower.includes("exchange") || lower.includes("trade")) {
    tokens.push({ label: "Action", value: "Swap Request" });
  } else if (lower.includes("prefer") || lower.includes("would like")) {
    tokens.push({ label: "Action", value: "Preference" });
  }

  // Reason extraction
  const reasons = [
    { keywords: ["conference", "seminar", "workshop"], value: "Conference" },
    { keywords: ["medical", "health", "doctor", "hospital", "sick"], value: "Medical" },
    { keywords: ["personal", "family", "emergency"], value: "Personal" },
    { keywords: ["travel", "traveling", "outstation"], value: "Travel" },
    { keywords: ["class", "lecture", "teaching"], value: "Teaching Conflict" },
  ];
  for (const r of reasons) {
    if (r.keywords.some(k => lower.includes(k))) {
      tokens.push({ label: "Reason", value: r.value });
      break;
    }
  }

  // Duty limits
  if (lower.includes("one duty") || lower.includes("1 duty") || lower.match(/max(imum)?\s*(one|1)/)) {
    tokens.push({ label: "Max Duties", value: "1/day" });
  } else if (lower.includes("two dut") || lower.includes("2 dut") || lower.match(/max(imum)?\s*(two|2)/)) {
    tokens.push({ label: "Max Duties", value: "2/day" });
  }

  if (tokens.length === 0) {
    tokens.push({ label: "Action", value: "Noted" });
  }

  return tokens;
};

const NlpPage = () => {
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [liveTokens, setLiveTokens] = useState<{ label: string; value: string }[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch faculty list
  const { data: facultyList = [] } = useQuery({
    queryKey: ["nlp-faculty"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
      if (!roles || roles.length === 0) return [];
      const ids = roles.map(r => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name, department").in("id", ids);
      return data || [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["nlp-requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nlp_requests")
        .select("*, profiles:faculty_id(full_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleSubmit = async () => {
    if (!input.trim() || !selectedFaculty) {
      if (!selectedFaculty) toast.error("Please select a faculty member first");
      return;
    }
    setProcessing(true);
    setLiveTokens([]);

    const extractedTokens = extractTokens(input);

    // Animate tokens appearing one by one
    extractedTokens.forEach((t, i) => {
      setTimeout(() => setLiveTokens(prev => [...prev, t]), (i + 1) * 250);
    });

    setTimeout(async () => {
      const { error } = await supabase.from("nlp_requests").insert({
        faculty_id: selectedFaculty,
        request_text: input,
        parsed_tokens: extractedTokens,
        status: "processed",
      });

      if (error) {
        toast.error(error.message);
      } else {
        queryClient.invalidateQueries({ queryKey: ["nlp-requests"] });
        toast.success("Request processed and tokens extracted");
      }

      setInput("");
      setProcessing(false);
      setLiveTokens([]);
    }, extractedTokens.length * 250 + 500);
  };

  const pendingCount = requests.filter((r: any) => r.status === "pending").length;
  const processedCount = requests.filter((r: any) => r.status === "processed").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums">{requests.length}</p>
          <p className="text-xs text-muted-foreground">Total Requests</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums text-success">{processedCount}</p>
          <p className="text-xs text-muted-foreground">Processed</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-semibold tabular-nums text-warning">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5" />
          NLP Request Processing — Type a faculty request in natural language
        </div>

        {/* Faculty selector */}
        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Select faculty member" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {facultyList.map((f: any) => (
              <SelectItem key={f.id} value={f.id}>
                {f.full_name} {f.department ? `· ${f.department}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Live tokens */}
        <AnimatePresence>
          {liveTokens.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2">
              {liveTokens.map((t, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="token-badge">
                  {t.label}: {t.value}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            className="ghost-input flex-1"
            placeholder='e.g. "I am not available on 2nd April due to a conference"'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            disabled={processing}
          />
          <button
            onClick={handleSubmit}
            disabled={processing || !input.trim() || !selectedFaculty}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-effect disabled:opacity-40 shrink-0"
          >
            {processing ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-[10px] text-muted-foreground/60">
          Extracts: dates, times, availability status, reasons, duty limits, swap requests
        </div>
      </div>

      {/* Request History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Request History
        </h3>
        {requests.map((r: any, i: number) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{(r as any).profiles?.full_name || "Unknown"}</p>
                  <span className="text-[10px] text-muted-foreground data-mono">
                    {format(new Date(r.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">"{r.request_text}"</p>
              </div>
              <Badge
                variant={r.status === "processed" ? "default" : "secondary"}
                className={r.status === "processed" ? "bg-success/10 text-success border-0 shrink-0" : "shrink-0"}
              >
                {r.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(Array.isArray(r.parsed_tokens) ? r.parsed_tokens : []).map((t: any, j: number) => (
                <span key={j} className="token-badge">{t.label}: {t.value}</span>
              ))}
            </div>
          </motion.div>
        ))}
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No requests yet. Submit a faculty request above.</p>
        )}
      </div>
    </div>
  );
};

export default NlpPage;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const NlpPage = () => {
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [liveTokens, setLiveTokens] = useState<{ label: string; value: string }[]>([]);
  const queryClient = useQueryClient();

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
    if (!input.trim()) return;
    setProcessing(true);
    setLiveTokens([]);

    // Simulate NLP token extraction
    const simulatedTokens: { label: string; value: string }[] = [];
    const lower = input.toLowerCase();
    if (lower.includes("march") || lower.includes("monday") || lower.includes("tuesday")) {
      simulatedTokens.push({ label: "Date", value: "2024-03-19" });
    }
    if (lower.includes("morning")) {
      simulatedTokens.push({ label: "Time", value: "08:00-12:00" });
    }
    if (lower.includes("not available") || lower.includes("unavailable") || lower.includes("can't")) {
      simulatedTokens.push({ label: "Status", value: "Unavailable" });
    }
    if (lower.includes("one duty") || lower.includes("max")) {
      simulatedTokens.push({ label: "Max Duties", value: "1/day" });
    }
    if (simulatedTokens.length === 0) {
      simulatedTokens.push({ label: "Action", value: "Noted" });
    }

    simulatedTokens.forEach((t, i) => {
      setTimeout(() => setLiveTokens(prev => [...prev, t]), (i + 1) * 300);
    });

    setTimeout(async () => {
      // Get first faculty profile as a placeholder since no auth
      const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
      const facultyId = profiles?.[0]?.id;

      if (facultyId) {
        await supabase.from("nlp_requests").insert({
          faculty_id: facultyId,
          request_text: input,
          parsed_tokens: simulatedTokens,
          status: "processed",
        });
        queryClient.invalidateQueries({ queryKey: ["nlp-requests"] });
      }

      setInput("");
      setProcessing(false);
      setLiveTokens([]);
      toast.success("Request processed");
    }, simulatedTokens.length * 300 + 600);
  };

  return (
    <div className="space-y-6">
      {/* Ghost Input */}
      <div className="stat-card space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          Type your request in natural language
        </div>
        <AnimatePresence>
          {liveTokens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {liveTokens.map((t, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="token-badge">
                  {t.label}: {t.value}
                </motion.span>
              ))}
            </div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <input
            className="ghost-input flex-1"
            placeholder='e.g. "I am not available on 15th March"'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={processing || !input.trim()}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-effect disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Request History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Request History</h3>
        {requests.map((r: any, i: number) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground data-mono">{(r as any).profiles?.full_name || "Unknown"}</p>
                <p className="text-sm mt-1">"{r.request_text}"</p>
              </div>
              <Badge variant={r.status === "processed" ? "default" : "secondary"} className={r.status === "processed" ? "bg-success/10 text-success border-0" : ""}>{r.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(Array.isArray(r.parsed_tokens) ? r.parsed_tokens : []).map((t: any, j: number) => (
                <span key={j} className="token-badge">{t.label}: {t.value}</span>
              ))}
            </div>
          </motion.div>
        ))}
        {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
      </div>
    </div>
  );
};

export default NlpPage;

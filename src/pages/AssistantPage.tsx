import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const responses: Record<string, string> = {
  "duty": "You have 3 duties next week. Your heaviest day is Wednesday with 2 invigilation sessions.",
  "next": "Your next duty is Data Structures on March 18 at 09:00 in Hall A.",
  "swap": "Duty swap requests can be submitted through the NLP Request Processing section. Navigate there and type your swap request.",
  "schedule": "Your schedule for next week:\n• Mon 18 Mar — Data Structures (09:00, Hall A)\n• Wed 20 Mar — Cell Biology (09:00, Hall B)\n• Wed 20 Mar — Machine Learning (14:00, Hall D)",
  "conflict": "You currently have 0 conflicts. All your duties are properly scheduled.",
  "workload": "Your current workload is 4/6 duties (67%). Department average is 3.8 duties.",
};

const findResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(responses)) {
    if (lower.includes(key)) return val;
  }
  return "I can help you with duty schedules, swaps, conflicts, and workload information. Try asking about your next duty or schedule.";
};

const AssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your EDAS assistant. Ask me about your duties, schedule, or conflicts." },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: findResponse(input) }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-auto space-y-3 pb-4">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <input
          className="ghost-input flex-1"
          placeholder="Ask about your duties, schedule, or conflicts..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim()} className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-effect disabled:opacity-40 shrink-0">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AssistantPage;

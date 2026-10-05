"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { chatAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Bot, Send, ArrowLeft, User } from "lucide-react";

const QUICK_QUESTIONS = [
  "How do I cancel a ride?",
  "Where is my driver?",
  "How are fares calculated?",
  "What if I lost something?",
  "How do I report an issue?",
  "Tell me about safety features",
];

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! 👋 I'm your RideX Support Assistant. How can I help you today? Feel free to ask about rides, payments, safety, or anything else!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatAPI.askBot(msg);
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I'm having trouble right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-black">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold">RideX Support</div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Always Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 mb-4 overflow-y-auto min-h-0" style={{ maxHeight: "55vh" }}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "bot" ? "bg-black" : "bg-gray-200"
                }`}>
                  {msg.role === "bot" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-gray-600" />}
                </div>
                <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "bot"
                    ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                    : "bg-black text-white rounded-tr-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Quick questions */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="whitespace-nowrap text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything..."
            className="input-field flex-1"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

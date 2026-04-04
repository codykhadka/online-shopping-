import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, ChevronDown } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { getAuthUser } from "../utils/auth";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authUser = getAuthUser();

  const userId = authUser?.id || (() => {
    let id = localStorage.getItem("chat_guest_id");
    if (!id) { id = "guest_" + Math.random().toString(36).substr(2, 9); localStorage.setItem("chat_guest_id", id); }
    return id;
  })();
  const userName = authUser?.name || authUser?.username || "Guest User";

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("user_identify", { userId, userName });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("admin_message", (data: { text: string; timestamp: string; userId: string }) => {
      if (data.userId !== userId) return;
      const msg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: data.text,
        isUser: false,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      if (!isOpen) {
        setHasUnread(true);
        setUnreadCount(c => c + 1);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setUnreadCount(0);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    socketRef.current.emit("user_message", {
      text: inputValue.trim(),
      userId,
      userName,
    });
    setInputValue("");
    // Simulate admin typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 8000);
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "absolute",
              bottom: "72px",
              right: 0,
              width: "340px",
              background: "linear-gradient(180deg, #0f172a 0%, #0c0f1a 100%)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "480px",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageSquare size={18} color="white" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: "white", lineHeight: 1 }}>Danphe Support</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: isConnected ? "#4ade80" : "#ef4444",
                      boxShadow: isConnected ? "0 0 6px #4ade80" : "none",
                    }} />
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {isConnected ? "Live" : "Connecting..."}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{
                background: "rgba(255,255,255,0.1)",
                border: "none", borderRadius: "8px",
                padding: "6px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}>
                <ChevronDown size={18} color="white" />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "16px",
              display: "flex", flexDirection: "column", gap: "10px",
              minHeight: "260px", maxHeight: "300px",
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 16px", color: "#4b5563" }}>
                  <MessageSquare size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                  <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Hi {userName.split(" ")[0]}! 👋
                  </p>
                  <p style={{ fontSize: "11px", marginTop: "4px", color: "#374151" }}>
                    Ask us anything about Danphe Organic
                  </p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: "flex",
                  justifyContent: msg.isUser ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "78%",
                    padding: "9px 13px",
                    borderRadius: msg.isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.isUser
                      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                      : "rgba(255,255,255,0.05)",
                    color: msg.isUser ? "white" : "#e2e8f0",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    border: msg.isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: msg.isUser ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                  }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <p style={{
                      margin: "4px 0 0",
                      fontSize: "9px",
                      fontWeight: 700,
                      textAlign: "right",
                      color: msg.isUser ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "16px 16px 16px 4px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", gap: "4px", alignItems: "center",
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "#3b82f6",
                        animation: `bounce 1.2s infinite ${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
              padding: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
              display: "flex", gap: "8px", alignItems: "center",
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "9px 13px",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || !isConnected}
                style={{
                  background: inputValue.trim() ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "9px",
                  cursor: inputValue.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: inputValue.trim() ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                }}
              >
                <Send size={16} color="white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: "56px", height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(37,99,235,0.4), 0 0 0 1px rgba(59,130,246,0.2)",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} color="white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
        {hasUnread && !isOpen && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "#ef4444",
              borderRadius: "9999px",
              minWidth: "20px", height: "20px",
              fontSize: "10px", fontWeight: 800,
              color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white",
              padding: "0 4px",
              boxShadow: "0 0 8px rgba(239,68,68,0.5)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
        {/* Pulse ring when offline */}
        {!isOpen && (
          <div style={{
            position: "absolute", inset: "-4px",
            borderRadius: "20px",
            border: "2px solid rgba(59,130,246,0.3)",
            animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
            pointerEvents: "none",
          }} />
        )}
      </motion.button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

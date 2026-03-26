import { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export function LiveChat({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Persist guest ID so refreshes don't spawn new users for admins
  const guestId = useRef(
    localStorage.getItem("livechat_guest_id") || "guest_" + Math.random().toString(36).substring(2, 8)
  );
  
  // FRESH Chat every refresh (per user request)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! Have any questions about our organic products?",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevUserIdRef = useRef<string | null>(user?.id || null);

  // Clear chat when user logs in or out to prevent cross-talk
  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      // Identity changed! Clear local state and storage
      const welcomeMsg = {
        id: "welcome",
        text: "Hello! Have any questions about our organic products?",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      localStorage.removeItem("livechat_messages");
      
      // If socket exists, force a reconnect to register the new identity
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      
      prevUserIdRef.current = user?.id || null;
    }
  }, [user?.id]);

  // Initialize guest ID if not present
  useEffect(() => {
    if (!localStorage.getItem("livechat_guest_id")) {
      localStorage.setItem("livechat_guest_id", guestId.current);
    }
  }, []);

  // Initialize Socket connection when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !socketRef.current) {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      // Ensure we connect to the root, not /api
      const serverUrl = apiUrl.replace(/\/api\/?$/, "");
      
      const socket = io(serverUrl);
      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        // Identify immediately so backend knows our userId/socketId mapping
        const identityId = user?.id ? `user_${user.id}` : guestId.current;
        const identityName = user?.name ? user.name : `Guest ${guestId.current.substring(6)}`;
        
        socket.emit("user_identify", {
          userId: identityId,
          userName: identityName
        });
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("admin_reply", (data: { text: string; timestamp: string }) => {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            text: data.text,
            isUser: false,
            timestamp: data.timestamp
          }
        ]);
      });
    }

    return () => {
      // Don't disconnect immediately on close, so they still receive messages
      // Only disconnect on unmount
    };
  }, [isOpen]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Determine identity
    const identityId = user?.id ? `user_${user.id}` : guestId.current;
    const identityName = (user?.name || user?.username) ? (user.name || user.username) : `Guest ${guestId.current.substring(6)}`;

    // Send to backend
    socketRef.current.emit("user_message", {
      text: newMessage.text,
      userId: identityId,
      userName: identityName
    });

    setInputValue("");
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg shadow-green-900/30 hover:bg-green-500 transition-colors flex items-center justify-center cursor-pointer"
          >
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-green-600"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-zinc-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-600 p-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-green-500">
                    <img src="/images/organic_hero.png" alt="Agent" className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-green-600 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Farmer's Support</h3>
                  <p className="text-green-100 text-xs flex items-center gap-1">
                    {isConnected ? "Agent is Active" : "Connecting..."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.isUser 
                        ? "bg-green-600 text-white rounded-br-none shadow-sm" 
                        : "bg-white text-zinc-800 rounded-bl-none shadow border border-zinc-100"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.isUser ? "text-green-200" : "text-zinc-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-100 flex items-end gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-100 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-shadow"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || !isConnected}
                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-500 disabled:opacity-50 disabled:bg-zinc-300 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

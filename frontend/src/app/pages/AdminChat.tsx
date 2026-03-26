import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface UserSession {
  userId: string;
  userName: string;
  socketId: string;
  messages: ChatMessage[];
  lastActive: string;
  unreadCount: number;
  isOnline?: boolean;
}

export function AdminChat() {
  const [sessions, setSessions] = useState<{ [key: string]: UserSession }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_admin");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("sync_sessions", (syncedSessions: { [key: string]: UserSession }) => {
      setSessions(syncedSessions);
    });

    socket.on("user_message", (data: { text: string; userId: string; userName: string; socketId: string; timestamp: string; isHistory?: boolean }) => {
      setSessions(prev => {
        const existingSession = prev[data.userId] || {
          userId: data.userId,
          userName: data.userName || "Guest User",
          socketId: data.socketId,
          messages: [],
          lastActive: data.timestamp,
          unreadCount: 0
        };

        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          text: data.text,
          isUser: true,
          timestamp: data.timestamp
        };

        return {
          ...prev,
          [data.userId]: {
            ...existingSession,
            userName: data.userName || existingSession.userName, // Always update name in case they logged in
            socketId: data.socketId, // Update socket ID in case they reconnected
            messages: [...existingSession.messages, newMessage],
            lastActive: data.timestamp,
            // Increment unread if not currently looking at this user and not a history replay payload
            unreadCount: (selectedUserIdRef.current === data.userId || data.isHistory) ? 0 : existingSession.unreadCount + 1
          }
        };
      });
    });

    socket.on("update_user_status", (data: { userId: string; userName: string; socketId: string; lastActive: string; isOnline?: boolean }) => {
      setSessions(prev => {
        if (!prev[data.userId]) {
          // New session discovered via identity broadcast
          return {
            ...prev,
            [data.userId]: {
              userId: data.userId,
              userName: data.userName,
              socketId: data.socketId,
              messages: [],
              lastActive: data.lastActive,
              unreadCount: 0,
              isOnline: data.isOnline
            }
          };
        }
        // Update existing session
        return {
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            userName: data.userName || prev[data.userId].userName,
            socketId: data.socketId || prev[data.userId].socketId,
            lastActive: data.lastActive || prev[data.userId].lastActive,
            isOnline: data.isOnline !== undefined ? data.isOnline : prev[data.userId].isOnline
          }
        };
      });
    });

    socket.on("user_disconnected", (data: { socketId: string }) => {
      // Could mark user offline if we tracked it by socketId
    });

    socket.on("admin_message_received", (data: { userId: string; text: string; timestamp: string }) => {
      setSessions(prev => {
        if (!prev[data.userId]) return prev;
        
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          text: data.text,
          isUser: false,
          timestamp: data.timestamp
        };

        // Don't add if it's already there (to avoid duplicates from our own local update)
        // But local update is now removed in favor of socket echo for consistency
        const messages = [...prev[data.userId].messages, newMessage];
        
        return {
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            messages,
            lastActive: data.timestamp
          }
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Only connect once on mount

  // Sync ref and clear unread count when selection changes
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
    if (selectedUserId) {
      setSessions(prev => {
        if (!prev[selectedUserId] || prev[selectedUserId].unreadCount === 0) return prev;
        return {
          ...prev,
          [selectedUserId]: {
            ...prev[selectedUserId],
            unreadCount: 0
          }
        };
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessions, selectedUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUserId || !socketRef.current) return;

    // Use current socket state to get the specific target socketId
    const session = sessions[selectedUserId];
    if (!session) return;

    // Send through socket - Backend will echo this back to all admins via 'admin_message_received'
    socketRef.current.emit("admin_message", {
      userId: selectedUserId, // Pass userId so backend knows who this belongs to
      text: inputValue.trim(),
      targetSocketId: session.socketId
    });

    setInputValue("");
  };

  const activeSession = selectedUserId ? sessions[selectedUserId] : null;
  const sessionList = Object.values(sessions).sort((a, b) => 
    new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sessions Sidebar */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900/40 flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-500" />
            Active Channels
          </h2>
          <div className={`size-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"} animate-pulse`} title={isConnected ? "Connected to Server" : "Disconnected"} />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-2 space-y-1">
          {sessionList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60">
              <AlertCircle size={32} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">
                No active signals
                <br/>Waiting for users...
              </p>
            </div>
          ) : (
            sessionList.map(session => (
              <button
                key={session.userId}
                onClick={() => setSelectedUserId(session.userId)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
                  selectedUserId === session.userId 
                    ? "bg-blue-600/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "border-transparent hover:bg-zinc-800/60 text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className={`size-1.5 rounded-full flex-shrink-0 ${session.isOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`}></span>
                    <User size={14} className={selectedUserId === session.userId ? "text-blue-400" : "text-zinc-500"} />
                    <span className={`text-xs font-semibold truncate ${selectedUserId === session.userId ? "text-blue-50" : ""}`}>
                      {session.userName}
                    </span>
                  </div>
                  {session.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                      {session.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <Clock size={10} />
                  <span className="text-[9px] font-medium tracking-wide">
                    {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0c0c0e]">
        {activeSession ? (
          <>
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <User size={16} />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-zinc-900 ${activeSession.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{activeSession.userName}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    ID: {activeSession.userId.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-dark">
              {activeSession.messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${!msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] tracking-wide ${
                      !msg.isUser 
                        ? "bg-blue-600 text-white rounded-tr-none shadow-[0_4px_14px_rgba(37,99,235,0.2)]" 
                        : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/50"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[9px] mt-1.5 text-right font-medium uppercase tracking-wider ${!msg.isUser ? "text-blue-200" : "text-zinc-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900/40">
              <div className="relative group flex items-end gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Transmit encrypted reply..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center shrink-0"
                >
                  <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <h3 className="text-zinc-400 font-bold mb-1">Command Channel Offline</h3>
            <p className="text-xs text-zinc-600">Select an active transmission to establish connection.</p>
          </div>
        )}
      </div>
    </div>
  );
}

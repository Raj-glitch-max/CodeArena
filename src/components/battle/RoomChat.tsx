import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X } from "lucide-react";

interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface RoomChatProps {
  roomCode: string;
  currentUser: { username: string; avatar: string };
  players: Array<{ username: string; avatar: string; isHost?: boolean }>;
  isOpen: boolean;
  onClose: () => void;
}

const RoomChat = ({ roomCode, currentUser, players, isOpen, onClose }: RoomChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-1",
      username: "System",
      avatar: "🤖",
      message: `Welcome to room ${roomCode}! Chat with other players before the battle begins.`,
      timestamp: new Date(),
      isSystem: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      username: currentUser.username,
      avatar: currentUser.avatar,
      message: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate bot responses for demo
    if (players.length > 1) {
      setTimeout(() => {
        const otherPlayer = players.find((p) => p.username !== currentUser.username);
        if (otherPlayer) {
          const responses = [
            "Good luck! ⚔️",
            "Ready to battle!",
            "Let's do this! 🔥",
            "May the best coder win!",
            "Prepare to lose 😎",
          ];
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-bot`,
              username: otherPlayer.username,
              avatar: otherPlayer.avatar,
              message: responses[Math.floor(Math.random() * responses.length)],
              timestamp: new Date(),
            },
          ]);
        }
      }, 1500 + Math.random() * 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-bg-tertiary border-l border-accent/20 flex flex-col z-50 shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-accent/20 flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            <span className="font-display text-sm text-white tracking-wider">ROOM CHAT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Players Online */}
        <div className="px-4 py-2 border-b border-accent/10 bg-background/30">
          <div className="text-xs text-muted-foreground font-mono mb-2">
            PLAYERS ({players.length})
          </div>
          <div className="flex gap-2">
            {players.map((player) => (
              <div
                key={player.username}
                className="flex items-center gap-1 px-2 py-1 bg-bg-tertiary rounded-sm border border-accent/20"
              >
                <span className="text-sm">{player.avatar}</span>
                <span className="text-xs text-white font-mono">{player.username}</span>
                {player.isHost && (
                  <span className="text-xs text-warning">👑</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${msg.isSystem ? "text-center" : ""}`}
            >
              {msg.isSystem ? (
                <div className="text-xs text-muted-foreground font-mono italic px-4 py-2 bg-accent/5 rounded-sm">
                  {msg.message}
                </div>
              ) : (
                <div
                  className={`flex gap-2 ${
                    msg.username === currentUser.username ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-sm bg-bg-tertiary border border-accent/30 flex items-center justify-center text-lg flex-shrink-0">
                    {msg.avatar}
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      msg.username === currentUser.username ? "text-right" : ""
                    }`}
                  >
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      {msg.username}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-sm text-sm ${
                        msg.username === currentUser.username
                          ? "bg-accent/20 text-white"
                          : "bg-bg-tertiary text-white"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-accent/20 bg-background/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-bg-tertiary border border-accent/20 rounded-sm text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-3 py-2 bg-accent/20 border border-accent/40 rounded-sm text-accent hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomChat;
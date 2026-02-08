import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/shared/GlassCard";
import NeonButton from "@/components/shared/NeonButton";
import RoomChat from "./RoomChat";
import {
  X, Users, Swords, Zap, Clock, Trophy,
  ChevronRight, Plus, Copy, Lock, MessageCircle
} from "lucide-react";

interface MatchFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MatchMode = "select" | "1v1" | "group";
type Difficulty = "easy" | "medium" | "hard" | "random";

const difficulties: { id: Difficulty; label: string; color: string; time: string }[] = [
  { id: "easy", label: "Easy", color: "success", time: "10 min" },
  { id: "medium", label: "Medium", color: "warning", time: "15 min" },
  { id: "hard", label: "Hard", color: "danger", time: "20 min" },
  { id: "random", label: "Random", color: "purple", time: "Varies" },
];

const MatchFinderModal = ({ isOpen, onClose }: MatchFinderModalProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<MatchMode>("select");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium");
  const [isSearching, setIsSearching] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [mockPlayers, setMockPlayers] = useState<Array<{ username: string; avatar: string; isHost?: boolean }>>([]);

  const handleFind1v1 = () => {
    setIsSearching(true);
    // Simulate matchmaking then navigate
    setTimeout(() => {
      navigate(`/battle?mode=1v1&difficulty=${selectedDifficulty}`);
    }, 2000);
  };

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setMockPlayers([{ username: "You", avatar: "🥷", isHost: true }]);
    
    // Simulate other players joining
    setTimeout(() => {
      setMockPlayers(prev => [...prev, { username: "CodeSamurai", avatar: "⚔️" }]);
    }, 3000);
    setTimeout(() => {
      setMockPlayers(prev => [...prev, { username: "ByteHunter", avatar: "🎯" }]);
    }, 6000);
  };

  const handleJoinRoom = () => {
    if (joinRoomCode.length >= 4) {
      navigate(`/battle?mode=group&room=${joinRoomCode}`);
    }
  };

  const handleStartRoom = () => {
    navigate(`/battle?mode=group&room=${roomCode}&host=true&difficulty=${selectedDifficulty}`);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <GlassCard corners className="relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mode Selection */}
            {mode === "select" && (
              <div>
                <h2 className="font-display font-bold text-2xl text-white tracking-wider mb-2">
                  SELECT MATCH TYPE
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Choose how you want to battle
                </p>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("1v1")}
                    className="w-full p-4 glass-card flex items-center gap-4 hover:border-accent/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-display text-lg text-white tracking-wider">1 VS 1 BATTLE</div>
                      <div className="text-sm text-muted-foreground">Quick match against a random opponent</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("group")}
                    className="w-full p-4 glass-card flex items-center gap-4 hover:border-purple/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-sm bg-purple/20 border border-purple/30 flex items-center justify-center text-purple group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-display text-lg text-white tracking-wider">GROUP MATCH</div>
                      <div className="text-sm text-muted-foreground">Create or join a private room</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple transition-colors" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* 1v1 Mode */}
            {mode === "1v1" && !isSearching && (
              <div>
                <button
                  onClick={() => setMode("select")}
                  className="text-muted-foreground hover:text-white text-sm font-mono mb-4 flex items-center gap-1"
                >
                  ← Back
                </button>

                <h2 className="font-display font-bold text-2xl text-white tracking-wider mb-2">
                  1 VS 1 BATTLE
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Select difficulty level
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {difficulties.map((diff) => (
                    <motion.button
                      key={diff.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`p-4 rounded-sm border transition-all ${
                        selectedDifficulty === diff.id
                          ? `bg-${diff.color}/20 border-${diff.color}/50`
                          : "bg-bg-tertiary border-accent/10 hover:border-accent/30"
                      }`}
                    >
                      <div className={`font-display text-lg tracking-wider ${
                        selectedDifficulty === diff.id ? `text-${diff.color}` : "text-white"
                      }`}>
                        {diff.label.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-1 justify-center mt-1">
                        <Clock className="w-3 h-3" /> {diff.time}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <NeonButton
                  variant="primary"
                  glow
                  className="w-full"
                  onClick={handleFind1v1}
                  icon={<Zap className="w-5 h-5" />}
                >
                  Find Match
                </NeonButton>
              </div>
            )}

            {/* 1v1 Searching */}
            {mode === "1v1" && isSearching && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                <h2 className="font-display font-bold text-2xl text-white tracking-wider mb-2">
                  SEARCHING...
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Finding a worthy opponent
                </p>
                <div className="text-accent font-mono text-sm">
                  Difficulty: {selectedDifficulty.toUpperCase()}
                </div>
              </div>
            )}

            {/* Group Mode */}
            {mode === "group" && (
              <div>
                <button
                  onClick={() => { setMode("select"); setRoomCode(""); }}
                  className="text-muted-foreground hover:text-white text-sm font-mono mb-4 flex items-center gap-1"
                >
                  ← Back
                </button>

                <h2 className="font-display font-bold text-2xl text-white tracking-wider mb-2">
                  GROUP MATCH
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Create a room or join with a code
                </p>

                {!roomCode ? (
                  <div className="space-y-4">
                    {/* Create Room */}
                    <div className="p-4 bg-bg-tertiary rounded-sm border border-accent/10">
                      <div className="font-display text-sm text-white tracking-wider mb-3">CREATE ROOM</div>
                      <NeonButton
                        variant="primary"
                        className="w-full"
                        onClick={handleCreateRoom}
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Create New Room
                      </NeonButton>
                    </div>

                    {/* Join Room */}
                    <div className="p-4 bg-bg-tertiary rounded-sm border border-accent/10">
                      <div className="font-display text-sm text-white tracking-wider mb-3">JOIN ROOM</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={joinRoomCode}
                          onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          maxLength={6}
                          className="flex-1 px-3 py-2 bg-background border border-accent/20 rounded-sm text-white font-mono uppercase focus:outline-none focus:border-accent/50"
                        />
                        <NeonButton
                          variant="secondary"
                          onClick={handleJoinRoom}
                          disabled={joinRoomCode.length < 4}
                        >
                          Join
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Room Created */}
                    <div className="text-center p-6 bg-bg-tertiary rounded-sm border border-purple/30">
                      <div className="text-sm text-muted-foreground font-mono mb-2">ROOM CODE</div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="font-display font-bold text-4xl text-purple tracking-[0.3em]">
                          {roomCode}
                        </span>
                        <button
                          onClick={copyRoomCode}
                          className="p-2 bg-purple/20 rounded-sm text-purple hover:bg-purple/30 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-muted-foreground text-xs">Share this code with friends to join</p>
                    </div>

                    {/* Difficulty Selection for Host */}
                    <div>
                      <div className="font-display text-sm text-white tracking-wider mb-3">SELECT DIFFICULTY</div>
                      <div className="grid grid-cols-2 gap-2">
                        {difficulties.map((diff) => (
                          <button
                            key={diff.id}
                            onClick={() => setSelectedDifficulty(diff.id)}
                            className={`p-2 rounded-sm border text-sm transition-all ${
                              selectedDifficulty === diff.id
                                ? `bg-${diff.color}/20 border-${diff.color}/50 text-${diff.color}`
                                : "bg-bg-tertiary border-accent/10 text-muted-foreground hover:border-accent/30"
                            }`}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Players in Room */}
                    <div className="p-4 bg-bg-tertiary rounded-sm border border-accent/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-display text-sm text-white tracking-wider">PLAYERS ({mockPlayers.length}/8)</div>
                        <button
                          onClick={() => setShowChat(true)}
                          className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </div>
                      <div className="space-y-2">
                        {mockPlayers.map((player) => (
                          <div key={player.username} className="flex items-center gap-3 p-2 bg-background/50 rounded-sm">
                            <div className="w-8 h-8 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-lg">
                              {player.avatar}
                            </div>
                            <span className="font-display text-sm text-white">{player.username}</span>
                            {player.isHost && <Trophy className="w-4 h-4 text-warning ml-auto" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <NeonButton
                      variant="primary"
                      glow
                      className="w-full"
                      onClick={handleStartRoom}
                      icon={<Zap className="w-5 h-5" />}
                      disabled={mockPlayers.length < 2}
                    >
                      Start Battle ({mockPlayers.length} players)
                    </NeonButton>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
        
        {/* Room Chat Sidebar */}
        {roomCode && (
          <RoomChat
            roomCode={roomCode}
            currentUser={{ username: "You", avatar: "🥷" }}
            players={mockPlayers}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchFinderModal;

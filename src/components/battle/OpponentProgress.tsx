import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Send, CheckCircle, XCircle, Loader2, Code } from "lucide-react";

interface OpponentAction {
  id: string;
  type: "run" | "submit" | "typing";
  timestamp: Date;
  result?: "success" | "fail" | "partial";
  passedTests?: number;
  totalTests?: number;
}

interface OpponentProgressProps {
  opponent: {
    username: string;
    avatar: string;
    rating: number;
  };
  isActive: boolean;
}

const OpponentProgress = ({ opponent, isActive }: OpponentProgressProps) => {
  const [actions, setActions] = useState<OpponentAction[]>([]);
  const [currentAction, setCurrentAction] = useState<OpponentAction | null>(null);
  const [testsCompleted, setTestsCompleted] = useState(0);

  // Simulate opponent actions during battle
  useEffect(() => {
    if (!isActive) return;

    const simulateActions = () => {
      const actionTypes: OpponentAction["type"][] = ["typing", "run", "submit"];
      const weights = [0.6, 0.3, 0.1]; // Typing most common

      let cumulative = 0;
      const rand = Math.random();
      let selectedType: OpponentAction["type"] = "typing";
      
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          selectedType = actionTypes[i];
          break;
        }
      }

      const newAction: OpponentAction = {
        id: `action-${Date.now()}`,
        type: selectedType,
        timestamp: new Date(),
      };

      if (selectedType === "run" || selectedType === "submit") {
        // Simulate test results
        const passed = Math.floor(Math.random() * 5) + 1;
        const total = 5;
        newAction.passedTests = passed;
        newAction.totalTests = total;
        newAction.result = passed === total ? "success" : passed > 2 ? "partial" : "fail";
        
        if (selectedType === "submit" && passed === total) {
          setTestsCompleted(total);
        }
      }

      setCurrentAction(newAction);
      setActions(prev => [newAction, ...prev].slice(0, 5));

      // Clear current action after animation
      if (selectedType !== "typing") {
        setTimeout(() => setCurrentAction(null), 3000);
      } else {
        setTimeout(() => setCurrentAction(null), 1000);
      }
    };

    // Initial delay before opponent starts
    const initialDelay = setTimeout(() => {
      simulateActions();
    }, 3000 + Math.random() * 5000);

    // Periodic actions
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of action
        simulateActions();
      }
    }, 4000 + Math.random() * 6000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [isActive]);

  const getActionIcon = (action: OpponentAction) => {
    switch (action.type) {
      case "run":
        return <Play className="w-3 h-3" />;
      case "submit":
        return <Send className="w-3 h-3" />;
      case "typing":
        return <Code className="w-3 h-3" />;
    }
  };

  const getActionColor = (action: OpponentAction) => {
    if (action.type === "typing") return "text-muted-foreground";
    if (!action.result) return "text-accent";
    switch (action.result) {
      case "success":
        return "text-success";
      case "partial":
        return "text-warning";
      case "fail":
        return "text-danger";
    }
  };

  const getActionText = (action: OpponentAction) => {
    switch (action.type) {
      case "typing":
        return "Coding...";
      case "run":
        return action.passedTests !== undefined 
          ? `Ran tests: ${action.passedTests}/${action.totalTests}` 
          : "Running tests...";
      case "submit":
        return action.passedTests !== undefined 
          ? `Submitted: ${action.passedTests}/${action.totalTests}` 
          : "Submitting...";
    }
  };

  return (
    <div className="bg-bg-tertiary/50 border border-accent/20 rounded-sm p-3">
      {/* Opponent Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-sm bg-danger/20 border border-danger/30 flex items-center justify-center text-lg">
          {opponent.avatar}
        </div>
        <div className="flex-1">
          <div className="text-sm text-white font-medium">{opponent.username}</div>
          <div className="text-xs text-muted-foreground font-mono">{opponent.rating} ELO</div>
        </div>
        {testsCompleted === 5 && (
          <div className="flex items-center gap-1 text-success text-xs font-mono">
            <CheckCircle className="w-4 h-4" />
            Complete
          </div>
        )}
      </div>

      {/* Current Activity */}
      <AnimatePresence mode="wait">
        {currentAction && (
          <motion.div
            key={currentAction.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`flex items-center gap-2 px-2 py-1.5 bg-background/50 rounded-sm ${getActionColor(currentAction)}`}
          >
            {currentAction.type === "typing" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : currentAction.result ? (
              currentAction.result === "success" ? (
                <CheckCircle className="w-3 h-3" />
              ) : currentAction.result === "fail" ? (
                <XCircle className="w-3 h-3" />
              ) : (
                getActionIcon(currentAction)
              )
            ) : (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            <span className="text-xs font-mono">{getActionText(currentAction)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      {testsCompleted > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono mb-1">
            <span>Progress</span>
            <span>{testsCompleted}/5 tests</span>
          </div>
          <div className="h-1 bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(testsCompleted / 5) * 100}%` }}
              className="h-full bg-gradient-to-r from-accent to-success"
            />
          </div>
        </div>
      )}

      {/* Recent Actions */}
      {actions.length > 0 && !currentAction && (
        <div className="mt-2 text-xs text-muted-foreground font-mono">
          Last: {getActionText(actions[0])}
        </div>
      )}
    </div>
  );
};

export default OpponentProgress;
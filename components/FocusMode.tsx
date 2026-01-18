import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TaskEntry } from "../types";
import { PRIORITY_DOTS } from "@/constants";
import { Icon } from "./Icons";

interface FocusModeProps {
  task: TaskEntry;
  onExit: () => void;
  onUpdate: (task: TaskEntry) => Promise<void>;
  onComplete: (task: TaskEntry) => Promise<void>;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  onExit,
  onUpdate,
  onComplete,
}) => {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"WORK" | "BREAK">("WORK");
  const [sessionNotes, setSessionNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Logic for timer finish (could auto-switch modes or play sound)
  useEffect(() => {
    if (timeLeft === 0 && !isActive) {
      if (mode === "WORK") {
        // Switch to break?
      }
    }
  }, [timeLeft, isActive, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "WORK" ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: "WORK" | "BREAK") => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "WORK" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveAndExit = async () => {
    if (sessionNotes.trim()) {
      // Append notes to description
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = new Date().toLocaleDateString();
      const newDescription = `${task.description}\n\n**[Focus Session ${dateStr} ${timestamp}]**\n${sessionNotes}`;

      await onUpdate({ ...task, description: newDescription });
    }
    onExit();
  };

  const handleCompleteTask = async () => {
    if (window.confirm("Mark mission accomplished?")) {
      if (sessionNotes.trim()) {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = new Date().toLocaleDateString();
        const newDescription = `${task.description}\n\n**[Focus Session ${dateStr} ${timestamp} - FINAL]**\n${sessionNotes}`;
        await onComplete({ ...task, description: newDescription });
      } else {
        await onComplete(task);
      }
      onExit();
    }
  };

  const progress =
    mode === "WORK"
      ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
      : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text flex flex-col animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-notion-light-bg dark:bg-notion-dark-bg rounded-xl shadow-sm border border-notion-light-border dark:border-notion-dark-border">
            <Icon.Focus
              size={20}
              className="text-notion-light-text dark:text-notion-dark-text"
            />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-notion-light-muted dark:text-notion-dark-muted">
              Deep Work Protocol
            </div>
            <div className="text-[15px] font-bold text-notion-light-text dark:text-notion-dark-text flex items-center gap-2">
              {task.project}
              <span
                className={`w-2 h-2 rounded-full shadow-sm ${PRIORITY_DOTS[task.priority]}`}
              ></span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveAndExit}
          className="px-5 py-2.5 bg-notion-light-bg dark:bg-notion-dark-bg hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text text-[11px] font-bold uppercase tracking-widest rounded-xl border border-notion-light-border dark:border-notion-dark-border transition-all active:scale-95 shadow-sm"
        >
          Exit Session
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left: The Timer & Controls */}
        <div className="flex flex-col items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-notion-light-border dark:border-notion-dark-border relative overflow-hidden bg-notion-light-sidebar/10 dark:bg-notion-dark-sidebar/5">
          {/* Background Pulse Effect */}
          {isActive && (
            <div className="absolute inset-0 bg-notion-light-text/5 dark:bg-notion-dark-text/5 animate-pulse pointer-events-none"></div>
          )}

          <div className="relative z-10 text-center space-y-12">
            <div className="inline-flex bg-notion-light-bg dark:bg-notion-dark-bg p-1.5 rounded-2xl border border-notion-light-border dark:border-notion-dark-border shadow-sm">
              <button
                onClick={() => switchMode("WORK")}
                className={`px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all ${mode === "WORK" ? "bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg shadow-lg shadow-notion-light-text/20 dark:shadow-notion-dark-text/20" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
              >
                Focus
              </button>
              <button
                onClick={() => switchMode("BREAK")}
                className={`px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all ${mode === "BREAK" ? "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text shadow-lg border border-notion-light-border dark:border-notion-dark-border" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
              >
                Rest
              </button>
            </div>

            <div className="relative group">
              {/* Progress Ring */}
              <svg className="w-80 h-80 transform -rotate-90 filter drop-shadow-xl">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-notion-light-sidebar dark:text-notion-dark-sidebar"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-linear ${mode === "WORK" ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted"}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-8xl font-black tracking-tighter text-notion-light-text dark:text-notion-dark-text tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-notion-light-muted dark:text-notion-dark-muted">
                  {mode === "WORK" ? "Concentrating" : "Recovering"}
                </div>
              </div>
            </div>

            <div className="flex gap-6 justify-center">
              <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg active:scale-95 ${isActive ? "border-notion-light-muted dark:border-notion-dark-muted text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar" : "border-notion-light-text dark:border-notion-dark-text text-notion-light-text dark:text-notion-dark-text bg-notion-light-text/5 dark:bg-notion-dark-text/5 hover:bg-notion-light-text dark:hover:bg-notion-dark-text hover:text-notion-light-bg dark:hover:text-notion-dark-bg"}`}
              >
                {isActive ? (
                  <Icon.Pause size={28} className="fill-current" />
                ) : (
                  <Icon.Play size={28} className="fill-current ml-1" />
                )}
              </button>
              <button
                onClick={resetTimer}
                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted hover:border-notion-light-text dark:hover:border-notion-dark-text bg-notion-light-bg dark:bg-notion-dark-bg transition-all active:scale-95 shadow-sm"
              >
                <Icon.Reset size={28} />
              </button>
              <button
                onClick={handleCompleteTask}
                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-notion-light-text dark:border-notion-dark-text text-notion-light-text dark:text-notion-dark-text bg-notion-light-text/5 dark:bg-notion-dark-text/5 hover:bg-notion-light-text dark:hover:bg-notion-dark-text hover:text-notion-light-bg dark:hover:text-notion-dark-bg transition-all active:scale-95 shadow-lg ml-6"
                title="Mark Done"
              >
                <Icon.Check size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Task Context & Notes */}
        <div className="flex flex-col h-full overflow-hidden bg-notion-light-bg dark:bg-notion-dark-bg">
          {/* Task Info */}
          <div className="p-10 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/10">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-notion-light-text dark:text-notion-dark-text leading-tight tracking-tight">
                {task.description.split("\n")[0]}
              </h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text text-[10px] uppercase font-black tracking-widest flex items-center gap-2 px-3 py-1.5 bg-notion-light-bg dark:bg-notion-dark-bg rounded-lg border border-notion-light-border dark:border-notion-dark-border shadow-sm transition-all"
              >
                <Icon.Preview size={14} />
                {showDetails ? "Hide" : "Details"}
              </button>
            </div>
            {showDetails && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-notion-light-text dark:text-notion-dark-text max-h-60 overflow-y-auto custom-scrollbar p-5 bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl border border-notion-light-border dark:border-notion-dark-border shadow-inner animate-in slide-in-from-top-2 duration-300">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div className="flex-1 flex flex-col p-10 min-h-0">
            <label className="text-[11px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              <Icon.Edit
                size={16}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
              Session Intelligence Log
            </label>
            <textarea
              className="flex-1 w-full bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/20 border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-muted/50 dark:placeholder-notion-dark-muted/50 focus:outline-none focus:ring-4 focus:ring-notion-light-text/10 dark:focus:ring-notion-dark-text/10 focus:border-notion-light-text/30 dark:focus:border-notion-dark-text/30 transition-all font-mono text-[15px] resize-none leading-relaxed shadow-sm"
              placeholder="Log your progress, strategic insights, or critical blockers here. Documentation is power..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-notion-light-text dark:bg-notion-dark-text animate-pulse"></div>
                Active Auto-Save
              </p>
              <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted opacity-50">
                Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

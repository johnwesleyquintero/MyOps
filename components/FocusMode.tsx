
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { TaskEntry } from '../types';
import { PRIORITY_DOTS } from '../constants';
import { Icon, iconProps } from './Icons';

interface FocusModeProps {
  task: TaskEntry;
  onExit: () => void;
  onUpdate: (task: TaskEntry) => Promise<void>;
  onComplete: (task: TaskEntry) => Promise<void>;
}

export const FocusMode: React.FC<FocusModeProps> = ({ task, onExit, onUpdate, onComplete }) => {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Logic for timer finish (could auto-switch modes or play sound)
      if (mode === 'WORK') {
          // Switch to break?
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'WORK' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'WORK' | 'BREAK') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'WORK' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExit = async () => {
    if (sessionNotes.trim()) {
       // Append notes to description
       const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       const dateStr = new Date().toLocaleDateString();
       const newDescription = `${task.description}\n\n**[Focus Session ${dateStr} ${timestamp}]**\n${sessionNotes}`;
       
       await onUpdate({ ...task, description: newDescription });
    }
    onExit();
  };

  const handleCompleteTask = async () => {
    if (window.confirm("Mark mission accomplished?")) {
        if (sessionNotes.trim()) {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date().toLocaleDateString();
            const newDescription = `${task.description}\n\n**[Focus Session ${dateStr} ${timestamp} - FINAL]**\n${sessionNotes}`;
            await onComplete({ ...task, description: newDescription });
        } else {
            await onComplete(task);
        }
        onExit(); 
    }
  };

  const progress = mode === 'WORK' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-slate-100 flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800 rounded-lg">
                <Icon.Focus {...iconProps(20, "text-indigo-400")} />
             </div>
             <div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deep Work Protocol</div>
                 <div className="text-sm font-bold text-white flex items-center gap-2">
                    {task.project}
                    <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`}></span>
                 </div>
             </div>
        </div>
        <button 
          onClick={handleSaveAndExit}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-slate-700 transition-colors"
        >
          Exit Session
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
         
         {/* Left: The Timer & Controls */}
         <div className="flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
            {/* Background Pulse Effect */}
            {isActive && (
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse-soft pointer-events-none"></div>
            )}
            
            <div className="relative z-10 text-center space-y-8">
                <div className="inline-flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => switchMode('WORK')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${mode === 'WORK' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Focus
                    </button>
                    <button 
                        onClick={() => switchMode('BREAK')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${mode === 'BREAK' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Rest
                    </button>
                </div>

                <div className="relative">
                    {/* Progress Ring */}
                    <svg className="w-64 h-64 transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                            className={`transition-all duration-1000 ease-linear ${mode === 'WORK' ? 'text-indigo-500' : 'text-emerald-500'}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-mono font-bold tracking-tighter text-white">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={toggleTimer}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white' : 'border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white'}`}
                    >
                        {isActive ? (
                            <Icon.Pause {...iconProps(24, "fill-current")} />
                        ) : (
                            <Icon.Play {...iconProps(24, "fill-current ml-1")} />
                        )}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white transition-all"
                    >
                        <Icon.Reset {...iconProps(24)} />
                    </button>
                    <button 
                        onClick={handleCompleteTask}
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all ml-8"
                        title="Mark Done"
                    >
                        <Icon.Check {...iconProps(24)} />
                    </button>
                </div>
            </div>
         </div>

         {/* Right: Task Context & Notes */}
         <div className="flex flex-col h-full overflow-hidden bg-slate-900">
            {/* Task Info */}
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white leading-snug">{task.description.split('\n')[0]}</h2>
                    <button onClick={() => setShowDetails(!showDetails)} className="text-slate-500 hover:text-indigo-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <Icon.Preview {...iconProps(14)} />
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
                {showDetails && (
                    <div className="prose prose-invert prose-sm max-w-none text-slate-400 max-h-40 overflow-y-auto custom-scrollbar p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <ReactMarkdown>{task.description}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Session Notes */}
            <div className="flex-1 flex flex-col p-6 min-h-0">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Icon.Edit {...iconProps(14)} />
                    Session Log
                </label>
                <textarea
                    className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm resize-none leading-relaxed"
                    placeholder="Log your progress, blockers, or thoughts here. This will be appended to the task history upon exit..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                />
                <p className="text-[10px] text-slate-600 mt-2 text-right">
                    Notes are auto-saved to description on exit.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};

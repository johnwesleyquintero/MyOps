
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { TaskEntry } from '../types';
import { PRIORITY_DOTS } from '../constants';

interface FocusModeProps {
  task: TaskEntry;
  onExit: () => void;
  onUpdate: (task: TaskEntry) => Promise<void>;
  onComplete: (task: TaskEntry) => Promise<void>;
}

export const FocusMode: React.FC<FocusModeProps> = ({ task, onExit, onUpdate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');
  const [sessionNotes, setSessionNotes] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

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
       const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       const dateStr = new Date().toLocaleDateString();
       const newDescription = `${task.description}\n\n**[Mission Log ${dateStr} ${timestamp}]**\n${sessionNotes}`;
       await onUpdate({ ...task, description: newDescription });
    }
    onExit();
  };

  const handleCompleteTask = async () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString();
    const finalDesc = sessionNotes.trim() 
      ? `${task.description}\n\n**[Mission Accomplished ${dateStr} ${timestamp}]**\n${sessionNotes}`
      : task.description;
    await onComplete({ ...task, description: finalDesc });
    onExit();
  };

  const progress = mode === 'WORK' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10"></div>
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-indigo-900/30 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-900/30 rounded border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500/70">Operational Mode: Deep Focus</div>
                 <div className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    {task.project} <span className="text-slate-500">/</span> {task.priority} Priority
                 </div>
             </div>
        </div>
        <div className="flex gap-4">
            <button onClick={handleSaveAndExit} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all">Abort & Sync</button>
            <button onClick={handleCompleteTask} className="px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/30 transition-all">Mission Complete</button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* Left: Timer Hub */}
         <div className="flex-1 flex flex-col items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-indigo-900/20">
            <div className="space-y-12 text-center">
                <div className="inline-flex bg-slate-900/60 p-1.5 rounded-lg border border-indigo-500/20 shadow-2xl">
                    <button onClick={() => switchMode('WORK')} className={`px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${mode === 'WORK' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-500 hover:text-slate-300'}`}>Engagement</button>
                    <button onClick={() => switchMode('BREAK')} className={`px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${mode === 'BREAK' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 'text-slate-500 hover:text-slate-300'}`}>Recovery</button>
                </div>

                <div className="relative group">
                    <svg className="w-80 h-80 transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-800/50" />
                        <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 140} strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)} className={`transition-all duration-1000 ease-linear ${mode === 'WORK' ? 'text-indigo-500' : 'text-emerald-500'}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-7xl font-mono font-bold tracking-tighter text-white tabular-nums drop-shadow-md">{formatTime(timeLeft)}</span>
                        <div className="mt-4 flex gap-6">
                            <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-indigo-500 text-indigo-500 hover:bg-indigo-500/10'}`}>
                                {isActive ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                            </button>
                            <button onClick={resetTimer} className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-slate-700 text-slate-500 hover:text-white transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Right: Tactical Log */}
         <div className="w-full lg:w-[450px] flex flex-col bg-slate-900/40 backdrop-blur-xl border-l border-indigo-900/20">
            <div className="p-8 border-b border-indigo-900/20">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4">Objective Parameters</h3>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 max-h-48 overflow-y-auto custom-scrollbar font-sans leading-relaxed">
                    <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-8 min-h-0">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                    Operational Log
                </label>
                <textarea
                    className="flex-1 w-full bg-slate-950/50 border border-indigo-900/30 rounded-xl p-6 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-sm resize-none leading-relaxed shadow-inner"
                    placeholder="Document progress, blockers, or mission-critical insights..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                />
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-[10px] text-slate-600 font-mono italic">Persistence enabled via auto-sync.</div>
                    <div className="flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-indigo-500/40"></span>
                        <span className="w-1 h-1 rounded-full bg-indigo-500/40"></span>
                        <span className="w-1 h-1 rounded-full bg-indigo-500/40"></span>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { MentalStateEntry, AppConfig } from "@/types";
import {
  fetchMentalStates,
  saveMentalState,
} from "@/services/awarenessService";

interface AwarenessViewProps {
  config: AppConfig;
}

export const AwarenessView: React.FC<AwarenessViewProps> = ({ config }) => {
  const [history, setHistory] = useState<MentalStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<MentalStateEntry>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    energy: "medium",
    clarity: "neutral",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMentalStates(config);
        setHistory(data);
        const today = new Date().toISOString().split("T")[0];
        const existing = data.find((e) => e.date === today);
        if (existing) {
          setTodayEntry(existing);
        }
      } catch (e) {
        console.error("Failed to load awareness data", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [config]);

  const handleSave = async () => {
    try {
      const saved = await saveMentalState(todayEntry, config);
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.date !== saved.date);
        return [saved, ...filtered];
      });
      alert("Mental state logged. System updated.");
    } catch (e) {
      console.error("Failed to save mental state", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-light-text dark:border-notion-dark-text"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">
          Mental Awareness
        </h1>
        <p className="text-notion-light-muted dark:text-notion-dark-muted text-sm uppercase tracking-widest font-black opacity-50">
          Constraints Awareness Check-in
        </p>
      </section>

      <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-3xl p-8 shadow-xl">
        <div className="space-y-8">
          {/* Energy Level */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              Energy Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setTodayEntry({ ...todayEntry, energy: level })
                  }
                  className={`py-4 rounded-2xl border-2 transition-all font-bold capitalize ${
                    todayEntry.energy === level
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "border-notion-light-border dark:border-notion-dark-border hover:border-notion-light-muted dark:hover:border-notion-dark-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Clarity Level */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              Clarity level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["foggy", "neutral", "sharp"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setTodayEntry({ ...todayEntry, clarity: level })
                  }
                  className={`py-4 rounded-2xl border-2 transition-all font-bold capitalize ${
                    todayEntry.clarity === level
                      ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                      : "border-notion-light-border dark:border-notion-dark-border hover:border-notion-light-muted dark:hover:border-notion-dark-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              Context (Optional)
            </label>
            <textarea
              value={todayEntry.notes || ""}
              onChange={(e) =>
                setTodayEntry({ ...todayEntry, notes: e.target.value })
              }
              placeholder="Any specific constraints today?"
              className="notion-input w-full min-h-[100px] bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full notion-button notion-button-primary py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20"
          >
            Lock Daily Check-in
          </button>
        </div>
      </div>

      {/* History mini-view */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-30 text-center">
            Recent Operating States
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {history.slice(0, 7).map((entry) => (
              <div
                key={entry.date}
                className="flex flex-col items-center p-2 rounded-xl bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border"
                title={`${entry.date}: Energy ${entry.energy}, Clarity ${entry.clarity}`}
              >
                <div
                  className={`w-3 h-3 rounded-full mb-1 ${
                    entry.energy === "high"
                      ? "bg-emerald-500"
                      : entry.energy === "medium"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
                <span className="text-[8px] opacity-50">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

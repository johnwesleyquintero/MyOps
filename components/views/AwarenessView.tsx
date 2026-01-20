import React, { useState, useEffect } from "react";
import { MentalStateEntry, AppConfig } from "@/types";
import {
  fetchMentalStates,
  saveMentalState,
} from "@/services/awarenessService";
import { ViewHeader } from "../ViewHeader";
import { Icon } from "../Icons";
import { toast } from "sonner";
import { MODULE_COLORS } from "@/constants";

interface AwarenessViewProps {
  config: AppConfig;
}

export const AwarenessView: React.FC<AwarenessViewProps> = ({ config }) => {
  const [history, setHistory] = useState<MentalStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const colors = MODULE_COLORS.awareness;
  const clarityColors = MODULE_COLORS.strategy; // Using strategy's fuchsia for clarity differentiation

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
        toast.error("Failed to load history");
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
      toast.success("Mental state logged", {
        description: "Your capacity constraints have been updated.",
      });
    } catch (e) {
      console.error("Failed to save mental state", e);
      toast.error("Failed to save state");
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
    <div className="animate-fade-in space-y-8">
      <ViewHeader
        title="Mental Awareness"
        subTitle="Constraints Awareness & Capacity Check-in"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left: Check-in Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`p-2.5 ${colors.bg} ${colors.text} rounded-xl border ${colors.border}`}
              >
                <Icon.Play size={20} />
              </div>
              <div>
                <h3
                  className={`text-sm font-black uppercase tracking-widest ${colors.text}`}
                >
                  Daily Check-in
                </h3>
                <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider">
                  Operational Readiness Assessment
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            ? `${colors.border.replace("/20", "").replace("/30", "")} ${colors.bg} ${colors.text}`
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
                            ? `${clarityColors.border.replace("/20", "").replace("/30", "")} ${clarityColors.bg} ${clarityColors.text}`
                            : "border-notion-light-border dark:border-notion-dark-border hover:border-notion-light-muted dark:hover:border-notion-dark-muted"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
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
                  className={`w-full min-h-[100px] bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border focus:ring-2 ${colors.dot.replace("bg-", "ring-")} rounded-2xl p-4 text-sm focus:outline-none transition-all`}
                />
              </div>

              <button
                onClick={handleSave}
                className={`w-full ${colors.bg.replace("/10", "").replace("/20", "")} text-white border ${colors.border} py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-black/5 active:scale-[0.98] transition-all`}
              >
                Lock Daily Check-in
              </button>
            </div>
          </div>
        </div>

        {/* Right: Status & History */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Readiness Briefing */}
          <div
            className={`rounded-2xl p-6 ${colors.bg.replace("/10", "").replace("/20", "")} text-white border-none shadow-lg relative overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Icon.Ai size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md border border-white/10">
                  <Icon.Ai size={18} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                    Mindset Briefing
                  </h3>
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                    Operational Capacity
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium leading-relaxed italic border-l-2 border-white/30 pl-4 py-1">
                  {todayEntry.energy === "high" &&
                  todayEntry.clarity === "sharp"
                    ? "Systems at 100%. Peak operational capacity detected. Focus on high-complexity missions."
                    : todayEntry.energy === "low" ||
                        todayEntry.clarity === "foggy"
                      ? "Resource constraints detected. Prioritize low-complexity maintenance or recovery protocols."
                      : "Balanced state. Steady progress on standard objectives is recommended."}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                      Energy
                    </span>
                    <span className="text-lg font-bold capitalize">
                      {todayEntry.energy}
                    </span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                      Clarity
                    </span>
                    <span className="text-lg font-bold capitalize">
                      {todayEntry.clarity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Widget */}
          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xs font-black uppercase tracking-widest ${colors.text}`}
              >
                Recent History
              </h3>
              <Icon.History size={16} className="opacity-30" />
            </div>

            <div className="space-y-3">
              {history.slice(0, 5).map((entry) => (
                <div
                  key={entry.date}
                  className={`flex items-center gap-4 p-3 rounded-xl bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border group ${colors.border.replace("border-", "hover:border-")} transition-all`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                      entry.energy === "high"
                        ? MODULE_COLORS.crm.dot
                        : entry.energy === "medium"
                          ? MODULE_COLORS.docs.dot
                          : MODULE_COLORS.error.dot
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        {entry.clarity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-10 text-center opacity-40 italic text-xs">
                  No historical data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

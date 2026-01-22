import React, { useState, useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { RewardContext } from "./RewardContext";
import { BADGES, Badge } from "../constants/rewards";
import { useNotification } from "../hooks/useNotification";
import { OperatorMetrics } from "../types";

export const RewardProvider: React.FC<{
  children: React.ReactNode;
  metrics: OperatorMetrics;
}> = ({ children, metrics }) => {
  const { showToast } = useNotification();
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem("myops_unlocked_badges");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastXpPop, setLastXpPop] = useState<{
    amount: number;
    id: string;
  } | null>(null);

  const prevMetrics = useRef<OperatorMetrics | null>(null);

  const triggerXpPop = useCallback((amount: number) => {
    setLastXpPop({ amount, id: Math.random().toString(36).substr(2, 9) });
    // Auto-clear after animation
    setTimeout(() => setLastXpPop(null), 2000);
  }, []);

  const triggerLevelUp = useCallback(
    (level: number) => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"],
      });
      showToast(`LEVEL UP! You are now Level ${level}`, "success");
    },
    [showToast],
  );

  const triggerBadgeUnlock = useCallback(
    (badge: Badge) => {
      setUnlockedBadges((prev) => {
        if (prev.includes(badge.id)) return prev;
        const next = [...prev, badge.id];
        localStorage.setItem("myops_unlocked_badges", JSON.stringify(next));
        return next;
      });

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.8 },
        colors: ["#fbbf24", "#f59e0b"],
      });

      showToast(`BADGE UNLOCKED: ${badge.name}`, "success");
    },
    [showToast],
  );

  // Monitor metrics for changes
  useEffect(() => {
    if (!prevMetrics.current) {
      prevMetrics.current = metrics;
      return;
    }

    // Level Up Check
    if (metrics.level > prevMetrics.current.level) {
      triggerLevelUp(metrics.level);
    }

    // XP Pop Check (simplified - usually triggered by actions)
    if (metrics.xp > prevMetrics.current.xp) {
      const diff = metrics.xp - prevMetrics.current.xp;
      triggerXpPop(diff);
    }

    // Badge Check
    BADGES.forEach((badge) => {
      if (!unlockedBadges.includes(badge.id)) {
        let isEligible = false;
        if (badge.requirement === "streak" && metrics.streak >= badge.threshold)
          isEligible = true;
        if (
          badge.requirement === "totalTasksCompleted" &&
          metrics.totalTasksCompleted >= badge.threshold
        )
          isEligible = true;
        if (badge.requirement === "xp" && metrics.xp >= badge.threshold)
          isEligible = true;
        if (
          badge.requirement === "peak_state_count" &&
          metrics.peakStateCompletions >= badge.threshold
        )
          isEligible = true;

        if (isEligible) {
          triggerBadgeUnlock(badge);
        }
      }
    });

    prevMetrics.current = metrics;
  }, [
    metrics,
    unlockedBadges,
    triggerLevelUp,
    triggerXpPop,
    triggerBadgeUnlock,
  ]);

  return (
    <RewardContext.Provider
      value={{
        unlockedBadges,
        lastXpPop,
        triggerXpPop,
        triggerLevelUp,
        triggerBadgeUnlock,
      }}
    >
      {children}

      {/* XP Pop Overlay */}
      {lastXpPop && (
        <div
          key={lastXpPop.id}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-bounce"
        >
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.6)] border border-indigo-400 flex items-center gap-3">
            <span className="text-2xl font-black">+{lastXpPop.amount} XP</span>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
          </div>
        </div>
      )}
    </RewardContext.Provider>
  );
};

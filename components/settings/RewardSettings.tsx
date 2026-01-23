import React, { useContext, useState, useEffect } from "react";
import { PersonalReward, MilestoneType } from "../../types";
import { Icon } from "../Icons";
import { Button } from "../ui";
import { DataContext } from "../../contexts/DataContext";
import { RewardContext } from "../../contexts/RewardContext";
import { toast } from "sonner";

const RewardNameInput: React.FC<{
  reward: PersonalReward;
  onUpdate: (id: string, updates: Partial<PersonalReward>) => Promise<void>;
}> = ({ reward, onUpdate }) => {
  const [localName, setLocalName] = useState(reward.name);
  const [prevName, setPrevName] = useState(reward.name);

  if (reward.name !== prevName) {
    setPrevName(reward.name);
    setLocalName(reward.name);
  }

  useEffect(() => {
    if (localName === reward.name) return;

    const timer = setTimeout(() => {
      onUpdate(reward.id, { name: localName });
    }, 500);

    return () => clearTimeout(timer);
  }, [localName, reward.id, reward.name, onUpdate]);

  return (
    <input
      type="text"
      value={localName}
      onChange={(e) => setLocalName(e.target.value)}
      className="w-full bg-transparent border-none p-0 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:ring-0 placeholder:opacity-30"
      placeholder="Reward name (e.g. 15-Min Coffee Break)"
    />
  );
};

const RewardThresholdInput: React.FC<{
  reward: PersonalReward;
  onUpdate: (id: string, updates: Partial<PersonalReward>) => Promise<void>;
}> = ({ reward, onUpdate }) => {
  const [localValue, setLocalValue] = useState(
    reward.milestone.threshold.toString(),
  );
  const [prevThreshold, setPrevThreshold] = useState(
    reward.milestone.threshold,
  );

  if (reward.milestone.threshold !== prevThreshold) {
    setPrevThreshold(reward.milestone.threshold);
    setLocalValue(reward.milestone.threshold.toString());
  }

  useEffect(() => {
    const numericValue = parseInt(localValue) || 0;
    if (numericValue === reward.milestone.threshold) return;

    const timer = setTimeout(() => {
      onUpdate(reward.id, {
        milestone: {
          ...reward.milestone,
          threshold: numericValue,
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, reward.id, reward.milestone, onUpdate]);

  return (
    <input
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className="w-20 text-[11px] font-black bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all shadow-sm"
    />
  );
};

export const RewardSettings: React.FC = () => {
  const data = useContext(DataContext);
  const { areRewardsEnabled, toggleRewardsEnabled } = useContext(
    RewardContext,
  ) || { areRewardsEnabled: true, toggleRewardsEnabled: () => {} };
  const rewardsContext = data?.rewards;
  const rewards = rewardsContext?.rewards || [];

  const MILESTONE_TYPES: { value: MilestoneType; label: string }[] = [
    { value: "tasks", label: "Missions Completed" },
    { value: "streak", label: "Day Streak" },
    { value: "xp", label: "Total XP" },
    { value: "level", label: "Operator Level" },
    { value: "peak_state", label: "Peak State Sessions" },
  ];

  const handleUpdateReward = async (
    id: string,
    updates: Partial<PersonalReward>,
    silent = false,
  ) => {
    const reward = rewards.find((r) => r.id === id);
    if (reward && rewardsContext) {
      const success = await rewardsContext.updateReward({
        ...reward,
        ...updates,
      });
      if (success && !silent) {
        toast.success("Reward updated");
      }
    }
  };

  const handleAddReward = async () => {
    if (rewardsContext) {
      const newReward: PersonalReward = {
        id: `reward_${Date.now()}`,
        name: "New Personalized Reward",
        isEnabled: true,
        milestone: { type: "tasks", threshold: 5 },
      };
      const success = await rewardsContext.addReward(newReward);
      if (success) {
        toast.success("Reward added");
      }
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (rewardsContext) {
      const success = await rewardsContext.deleteReward(id);
      if (success) {
        toast.success("Reward deleted");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5 ml-1">
            <Icon.Star size={12} className="opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Operator Incentives
            </span>
          </div>
          <h3 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-tight">
            Personalized Rewards
          </h3>
          <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted mt-1 italic leading-relaxed">
            Configure custom deployment milestones and secure tactical
            incentives upon achievement.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleRewardsEnabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
              areRewardsEnabled
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${areRewardsEnabled ? "bg-green-500 animate-pulse" : "bg-notion-light-muted dark:bg-notion-dark-muted"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {areRewardsEnabled ? "Protocol Active" : "Protocol Offline"}
            </span>
          </button>
          <Button
            variant="custom"
            onClick={handleAddReward}
            className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-indigo-600 text-white border border-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Icon.Plus size={14} />
            Add Incentive
          </Button>
        </div>
      </div>

      <div
        className={`space-y-4 transition-all duration-300 ${!areRewardsEnabled ? "opacity-50 pointer-events-none grayscale" : ""}`}
      >
        {rewards.length === 0 ? (
          <div className="text-center py-16 bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 border-2 border-dashed border-notion-light-border dark:border-notion-dark-border rounded-3xl">
            <p className="text-[11px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest">
              No tactical incentives configured.
            </p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-6 rounded-3xl border transition-all duration-300 ${
                reward.isEnabled
                  ? "bg-notion-light-bg dark:bg-notion-dark-bg border-notion-light-border dark:border-notion-dark-border shadow-lg shadow-black/5 hover:shadow-xl"
                  : "bg-notion-light-hover/20 dark:bg-notion-dark-hover/20 border-transparent opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 rounded-2xl p-4 border border-notion-light-border dark:border-notion-dark-border backdrop-blur-sm">
                  <RewardNameInput
                    reward={reward}
                    onUpdate={(id, updates) =>
                      handleUpdateReward(id, updates, true)
                    }
                  />
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() =>
                      handleUpdateReward(reward.id, {
                        isEnabled: !reward.isEnabled,
                      })
                    }
                    className={`p-3 rounded-2xl transition-all duration-300 ${
                      reward.isEnabled
                        ? "text-green-500 bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/10"
                        : "text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border"
                    }`}
                  >
                    {reward.isEnabled ? (
                      <Icon.Check size={16} />
                    ) : (
                      <Icon.X size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-3 text-notion-light-muted dark:text-notion-dark-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-2xl transition-all duration-300 shadow-sm"
                  >
                    <Icon.Trash size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-notion-light-text/30 dark:text-notion-dark-text/30">
                    Protocol
                  </span>
                  <select
                    value={reward.milestone.type}
                    onChange={(e) =>
                      handleUpdateReward(reward.id, {
                        milestone: {
                          ...reward.milestone,
                          type: e.target.value as MilestoneType,
                        },
                      })
                    }
                    className="text-[11px] font-black bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer appearance-none shadow-sm min-w-[160px]"
                  >
                    {MILESTONE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-notion-light-text/30 dark:text-notion-dark-text/30">
                    Target
                  </span>
                  <RewardThresholdInput
                    reward={reward}
                    onUpdate={(id, updates) =>
                      handleUpdateReward(id, updates, true)
                    }
                  />
                </div>

                {reward.milestone.lastAwardedValue !== undefined && (
                  <div className="flex items-center gap-2.5 ml-auto bg-green-500/5 dark:bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.1em]">
                      Secured at {reward.milestone.lastAwardedValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

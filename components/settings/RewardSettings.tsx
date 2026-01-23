import React, { useContext } from "react";
import { PersonalReward, MilestoneType } from "../../types";
import { Icon } from "../Icons";
import { Button } from "../ui";
import { DataContext } from "../../contexts/DataContext";

export const RewardSettings: React.FC = () => {
  const data = useContext(DataContext);
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
  ) => {
    const reward = rewards.find((r) => r.id === id);
    if (reward && rewardsContext) {
      await rewardsContext.updateReward({ ...reward, ...updates });
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
      await rewardsContext.addReward(newReward);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (rewardsContext) {
      await rewardsContext.deleteReward(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
            Personalized Rewards
          </h3>
          <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted mt-0.5">
            Set your own milestones and treat yourself when you hit them.
          </p>
        </div>
        <Button
          variant="custom"
          onClick={handleAddReward}
          className="text-[10px] font-bold px-3 py-1 bg-notion-light-hover dark:bg-notion-dark-hover rounded border border-notion-light-border dark:border-notion-dark-border"
          leftIcon={<Icon.Plus className="w-3 h-3" />}
        >
          ADD REWARD
        </Button>
      </div>

      <div className="space-y-4">
        {rewards.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-notion-light-border dark:border-notion-dark-border rounded-xl">
            <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted">
              No personalized rewards configured yet.
            </p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-4 rounded-xl border transition-all ${
                reward.isEnabled
                  ? "bg-notion-light-bg dark:bg-notion-dark-bg border-notion-light-border dark:border-notion-dark-border shadow-sm"
                  : "bg-notion-light-hover/30 dark:bg-notion-dark-hover/30 border-transparent opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={reward.name}
                    onChange={(e) =>
                      handleUpdateReward(reward.id, { name: e.target.value })
                    }
                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:ring-0 placeholder:opacity-30"
                    placeholder="Reward name (e.g. 15-Min Coffee Break)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateReward(reward.id, {
                        isEnabled: !reward.isEnabled,
                      })
                    }
                    className={`p-1.5 rounded-lg transition-colors ${
                      reward.isEnabled
                        ? "text-green-500 bg-green-500/10 hover:bg-green-500/20"
                        : "text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-hover dark:bg-notion-dark-hover"
                    }`}
                  >
                    {reward.isEnabled ? (
                      <Icon.Check size={14} />
                    ) : (
                      <Icon.X size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-1.5 text-notion-light-muted dark:text-notion-dark-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Icon.Trash size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                    When
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
                    className="text-[11px] font-bold bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded px-2 py-1 focus:outline-none"
                  >
                    {MILESTONE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                    Hits
                  </span>
                  <input
                    type="number"
                    value={reward.milestone.threshold}
                    onChange={(e) =>
                      handleUpdateReward(reward.id, {
                        milestone: {
                          ...reward.milestone,
                          threshold: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-16 text-[11px] font-bold bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded px-2 py-1 focus:outline-none"
                  />
                </div>

                {reward.milestone.lastAwardedValue !== undefined && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                      Claimed at {reward.milestone.lastAwardedValue}
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

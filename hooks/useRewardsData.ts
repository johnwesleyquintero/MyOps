import { useState, useEffect, useCallback } from "react";
import { PersonalReward, AppConfig } from "../types";
import { rewardService } from "../services/rewardService";

export const useRewardsData = (config: AppConfig) => {
  const [rewards, setRewards] = useState<PersonalReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await rewardService.getRewards(config);
      setRewards(data);
    } catch (error) {
      console.error("Failed to load rewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const addReward = async (reward: PersonalReward) => {
    const success = await rewardService.saveReward(reward, false, config);
    if (success) {
      setRewards((prev) => [...prev, reward]);
    }
    return success;
  };

  const updateReward = async (reward: PersonalReward) => {
    const success = await rewardService.saveReward(reward, true, config);
    if (success) {
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? reward : r)));
    }
    return success;
  };

  const deleteReward = async (id: string) => {
    const success = await rewardService.deleteReward(id, config);
    if (success) {
      setRewards((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  };

  return {
    rewards,
    isLoading,
    addReward,
    updateReward,
    deleteReward,
    refreshRewards: loadRewards,
  };
};

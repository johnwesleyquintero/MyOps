import { PersonalReward, AppConfig } from "../types";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

const STORAGE_KEY = "myops_personal_rewards";

const DEFAULT_REWARDS: PersonalReward[] = [
  {
    id: "reward_1",
    name: "15-Min Coffee Break",
    isEnabled: true,
    milestone: { type: "tasks", threshold: 3 },
  },
  {
    id: "reward_2",
    name: "Gaming Session (30m)",
    isEnabled: true,
    milestone: { type: "streak", threshold: 3 },
  },
  {
    id: "reward_3",
    name: "Buy a new Book",
    isEnabled: true,
    milestone: { type: "level", threshold: 5 },
  },
];

export const rewardService = {
  getRewards: async (config: AppConfig): Promise<PersonalReward[]> => {
    if (config.mode === "DEMO") {
      const stored = storage.get<PersonalReward[]>(
        STORAGE_KEY,
        DEFAULT_REWARDS,
      );
      return stored;
    }

    if (!config.gasDeploymentUrl) return DEFAULT_REWARDS;
    try {
      const rewards = await fetchFromGas<PersonalReward>(
        config,
        "personal_rewards",
      );
      return rewards.length > 0 ? rewards : DEFAULT_REWARDS;
    } catch (error) {
      console.error("Failed to fetch rewards from GAS:", error);
      return DEFAULT_REWARDS;
    }
  },

  saveReward: async (
    reward: PersonalReward,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const rewards = await rewardService.getRewards(config);
      let updated;
      if (isUpdate) {
        updated = rewards.map((r) => (r.id === reward.id ? reward : r));
      } else {
        updated = [...rewards, reward];
      }
      storage.set(STORAGE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "personal_rewards",
      entry: reward,
      token: config.apiToken,
    });
    return true;
  },

  deleteReward: async (id: string, config: AppConfig): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const rewards = await rewardService.getRewards(config);
      const updated = rewards.filter((r) => r.id !== id);
      storage.set(STORAGE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "personal_rewards",
      entry: { id },
      token: config.apiToken,
    });
    return true;
  },
};

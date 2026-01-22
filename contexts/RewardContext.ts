import { createContext, useContext } from "react";
import { Badge } from "../constants/rewards";

interface RewardContextType {
  unlockedBadges: string[];
  lastXpPop: { amount: number; id: string } | null;
  triggerXpPop: (amount: number) => void;
  triggerLevelUp: (level: number) => void;
  triggerBadgeUnlock: (badge: Badge) => void;
}

export const RewardContext = createContext<RewardContextType | undefined>(
  undefined,
);

export const useRewards = () => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error("useRewards must be used within a RewardProvider");
  }
  return context;
};

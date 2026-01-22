import { Icon } from "../components/Icons";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  requirement: string;
  threshold: number;
  type: "streak" | "tasks" | "xp" | "peak_state";
}

export const BADGES: Badge[] = [
  {
    id: "streak_3",
    name: "Consistent Operator",
    description: "Maintained a 3-day streak",
    icon: Icon.Streak,
    requirement: "streak",
    threshold: 3,
    type: "streak",
  },
  {
    id: "streak_7",
    name: "Elite Consistency",
    description: "Maintained a 7-day streak",
    icon: Icon.Streak,
    requirement: "streak",
    threshold: 7,
    type: "streak",
  },
  {
    id: "tasks_10",
    name: "Mission Specialist",
    description: "Completed 10 missions",
    icon: Icon.Check,
    requirement: "totalTasksCompleted",
    threshold: 10,
    type: "tasks",
  },
  {
    id: "tasks_50",
    name: "Execution Master",
    description: "Completed 50 missions",
    icon: Icon.Check,
    requirement: "totalTasksCompleted",
    threshold: 50,
    type: "tasks",
  },
  {
    id: "xp_5000",
    name: "Power User",
    description: "Earned 5,000 XP",
    icon: Icon.Zap,
    requirement: "xp",
    threshold: 5000,
    type: "xp",
  },
  {
    id: "peak_1",
    name: "Flow State",
    description: "Completed a mission in peak mental state",
    icon: Icon.Activity,
    requirement: "peak_state_count",
    threshold: 1,
    type: "peak_state",
  },
];

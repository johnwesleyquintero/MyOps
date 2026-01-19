import { TaskEntry } from "../types";

// Task Analytics Utils
// Financial charts have been deprecated in v3.0, but utility functions are maintained for backward compatibility.

export const generateSVGPoints = (
  chartData: { date: string; val: number }[],
  width: number,
  height: number,
  padding: number,
): string => {
  if (chartData.length === 0) return "";

  if (chartData.length === 1) {
    const y = height / 2;
    return `${padding},${y} ${width - padding},${y}`;
  }

  const maxVal = Math.max(...chartData.map((d) => d.val));
  const minVal = Math.min(...chartData.map((d) => d.val));
  const range = maxVal - minVal;

  return chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y =
        range === 0
          ? height / 2
          : height -
            padding -
            ((d.val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
};

export const generateAreaPath = (
  points: string,
  width: number,
  height: number,
): string => {
  if (!points) return "";

  const pointList = points.split(" ");
  const firstPoint = pointList[0];
  const lastPoint = pointList[pointList.length - 1];

  if (!firstPoint || !lastPoint) return "";

  const firstX = firstPoint.split(",")[0];
  const lastX = lastPoint.split(",")[0];

  return `M ${points} L ${lastX},${height} L ${firstX},${height} Z`;
};

export const calculateDailyTrend = (
  entries: TaskEntry[],
): { date: string; val: number }[] => {
  const map = new Map<string, number>();

  entries.forEach((e) => {
    if (!e.date) return;
    const current = map.get(e.date) || 0;
    map.set(e.date, current + 1);
  });

  const sortedDates = Array.from(map.keys()).sort();

  return sortedDates.map((date) => ({
    date,
    val: map.get(date) || 0,
  }));
};

export const calculateProjectDistribution = (
  entries: TaskEntry[],
): { cat: string; val: number; pct: number }[] => {
  // Adapted to calculate Top Projects by task count
  const map = new Map<string, number>();
  let total = 0;

  entries.forEach((e) => {
    if (!e.project) return;
    const current = map.get(e.project) || 0;
    map.set(e.project, current + 1);
    total++;
  });

  const result = Array.from(map.entries()).map(([cat, val]) => ({
    cat,
    val,
    pct: total > 0 ? (val / total) * 100 : 0,
  }));

  // Sort descending by count and take top 5
  return result.sort((a, b) => b.val - a.val).slice(0, 5);
};

import React, { useMemo } from "react";
import { TaskEntry } from "../../types";
import { MODULE_COLORS } from "../../constants/ui";
import {
  calculateDailyTrend,
  generateSVGPoints,
  generateAreaPath,
} from "../../utils/analyticsUtils";

import { Card, Badge } from "../ui";

interface MissionTrendChartProps {
  entries: TaskEntry[];
}

export const MissionTrendChart: React.FC<MissionTrendChartProps> = ({
  entries,
}) => {
  const colors = MODULE_COLORS.analytics;
  // SVG Geometry Constants
  const width = 600;
  const height = 150;
  const padding = 20;

  // Data Prep
  const chartData = useMemo(() => calculateDailyTrend(entries), [entries]);
  const points = useMemo(
    () => generateSVGPoints(chartData, width, height, padding),
    [chartData],
  );
  const areaPath = useMemo(
    () => generateAreaPath(points, width, height),
    [points],
  );

  return (
    <Card
      hoverEffect
      className="flex flex-col justify-between h-full border-slate-200/60 dark:border-white/5 relative overflow-hidden group"
    >
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex flex-col gap-1">
          <Badge
            variant="ghost"
            size="xs"
            className="!p-0 uppercase tracking-[0.2em] opacity-50 font-black"
          >
            Mission Volume Trend
          </Badge>
          <Badge
            variant="ghost"
            size="xs"
            className={`w-fit !p-0 lowercase !tracking-normal ${colors.text} opacity-70`}
          >
            Operational Velocity
          </Badge>
        </div>
      </div>

      <div className="relative w-full h-[150px] overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible preserve-3d"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity="0.2"
                className={colors.text}
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
                className={colors.text}
              />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#chartGradient)" />

          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            points={points}
            strokeLinejoin="round"
            strokeLinecap="round"
            className={`${colors.text} drop-shadow-sm`}
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-bold uppercase tracking-widest leading-none">
        <span>{chartData[0]?.date || "-"}</span>
        <span>{chartData[chartData.length - 1]?.date || "-"}</span>
      </div>
    </Card>
  );
};

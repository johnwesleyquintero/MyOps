import React, { useMemo } from "react";
import { TaskEntry } from "../../types";
import { MODULE_COLORS } from "../../constants/ui";
import {
  calculateDailyTrend,
  generateSVGPoints,
  generateAreaPath,
} from "../../utils/analyticsUtils";

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
    <div className="notion-card p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 h-full border-slate-200/60 dark:border-white/5 bg-white dark:bg-notion-dark-sidebar/30 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Mission Volume Trend
          </h3>
          <span
            className={`text-[9px] font-black uppercase tracking-[0.1em] ${colors.text} opacity-70`}
          >
            Operational Velocity
          </span>
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
      <div className="flex justify-between mt-2 text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-bold uppercase tracking-widest">
        <span>{chartData[0]?.date || "-"}</span>
        <span>{chartData[chartData.length - 1]?.date || "-"}</span>
      </div>
    </div>
  );
};

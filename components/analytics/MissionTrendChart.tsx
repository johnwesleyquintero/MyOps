import React, { useMemo } from "react";
import { TaskEntry } from "../../types";
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
    <div className="notion-card p-5 flex flex-col justify-between transition-colors duration-300 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="notion-label">Mission Volume Trend</h3>
        <span className="text-xs text-notion-light-muted dark:text-notion-dark-muted font-mono">
          Operational Velocity
        </span>
      </div>

      <div className="relative w-full h-[150px] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible preserve-3d"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#chartGradient)" />

          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-mono">
        <span>{chartData[0]?.date || "-"}</span>
        <span>{chartData[chartData.length - 1]?.date || "-"}</span>
      </div>
    </div>
  );
};

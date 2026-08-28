import React, { useState } from 'react';
import { DailyForecast, GolfCourse } from '../types';
import { getTierColor } from '../utils/golfability';
import {
  Calendar,
  Sun,
  CloudRain,
  Zap,
  Wind,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface WeekViewProps {
  course: GolfCourse;
  daily: DailyForecast[];
  unit: 'metric' | 'imperial';
  onSelectDay: (day: DailyForecast) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  course,
  daily,
  unit,
  onSelectDay,
}) => {
  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  // Find best day of the week
  const bestDay = [...daily].sort((a, b) => b.golfabilityScore - a.golfabilityScore)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A261E] p-6 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
              7-Day Planning Horizon
            </span>
            <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">Week View</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-1">
            7-Day Golfability Outlook
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            Advance planning for {course.name}. Select any day to view its detailed hourly breakdown.
          </p>
        </div>

        {/* Best Day Callout */}
        {bestDay && (
          <div className="p-3.5 bg-[#E8EDDF] dark:bg-[#233327] rounded-2xl border border-[#DCE3D4] dark:border-[#2F4435] flex items-center gap-3 shrink-0">
            <Sparkles className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1] shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">
                Best Day: {bestDay.dayName} ({bestDay.shortDate})
              </div>
              <div className="text-[#2D4635] dark:text-[#A8C2A1] font-mono font-medium">
                Score {bestDay.golfabilityScore}/100 • {bestDay.bestWindow}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Interactive Card Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {daily.map((day, idx) => {
          const tierStyle = getTierColor(day.golfabilityTier);
          const isWinner = bestDay?.date === day.date;

          return (
            <button
              key={day.date}
              id={`select-day-${day.date}`}
              onClick={() => onSelectDay(day)}
              className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between hover:scale-101 hover:shadow-md relative overflow-hidden group ${
                isWinner
                  ? 'bg-[#E8EDDF]/90 dark:bg-[#233327]/80 border-[#DCE3D4] dark:border-[#2F4435] ring-2 ring-[#2D4635]/20'
                  : 'bg-white dark:bg-[#1A261E] border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs'
              }`}
            >
              {isWinner && (
                <span className="absolute top-0 right-0 bg-[#2D4635] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-2xl">
                  Best Day
                </span>
              )}

              <div>
                {/* Top: Day and Score */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-lg text-[#1B261E] dark:text-[#E8EFE8] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1] transition-colors">
                      {day.dayName}
                    </h3>
                    <div className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                      {day.shortDate}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-black font-mono ${tierStyle.text}`}>
                      {day.golfabilityScore}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#6B7D6A]">
                      /100
                    </span>
                  </div>
                </div>

                {/* Weather condition & Icon */}
                <div className="flex items-center gap-3 my-3 p-2.5 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1A261E] shrink-0 shadow-xs">
                    {day.lightningRisk === 'High' ? (
                      <Zap className="w-5 h-5 text-[#9E3535]" />
                    ) : day.precipitationProb > 50 ? (
                      <CloudRain className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#A68A64]" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs text-[#1B261E] dark:text-[#E8EFE8] truncate">
                      {day.condition}
                    </div>
                    <div className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] font-mono mt-0.5">
                      High: {displayTemp(day.tempMaxC)} • Low: {displayTemp(day.tempMinC)}
                    </div>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-[#F0F4EE] dark:bg-[#16221A] rounded-xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
                    <div className="text-[10px] text-[#6B7D6A] uppercase font-sans">Rain Prob</div>
                    <div className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">{day.precipitationProb}%</div>
                  </div>

                  <div className="p-2 bg-[#F0F4EE] dark:bg-[#16221A] rounded-xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
                    <div className="text-[10px] text-[#6B7D6A] uppercase font-sans">Wind Max</div>
                    <div className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">{displayWind(day.maxWindSpeedKmh)}</div>
                  </div>
                </div>

                {/* Best Window Callout */}
                <div className="mt-3 text-xs bg-[#E8EDDF] dark:bg-[#233327] p-2.5 rounded-xl border border-[#DCE3D4] dark:border-[#2F4435]">
                  <span className="text-[10px] uppercase font-bold text-[#2D4635] dark:text-[#A8C2A1] block">
                    Optimal Tee Time Window
                  </span>
                  <span className="font-semibold text-[#1B261E] dark:text-[#E8EFE8]">
                    {day.bestWindow}
                  </span>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-4 pt-3 border-t border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between text-xs font-bold text-[#2D4635] dark:text-[#A8C2A1] group-hover:translate-x-0.5 transition-transform">
                <span>Inspect Hourly Breakdown</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

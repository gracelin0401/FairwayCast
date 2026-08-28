import React, { useState } from 'react';
import {
  HourlyForecast,
  TeeTimeWindow,
  GolfCourse,
  GolfabilityTier,
} from '../types';
import { getTierColor } from '../utils/golfability';
import {
  Calendar,
  Clock,
  Sparkles,
  Sun,
  CloudRain,
  Wind,
  Zap,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface TodayViewProps {
  course: GolfCourse;
  hourly: HourlyForecast[];
  goldenWindows: TeeTimeWindow[];
  unit: 'metric' | 'imperial';
  onOpenHourlyBreakdown: (selectedHour?: number) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  course,
  hourly,
  goldenWindows,
  unit,
  onOpenHourlyBreakdown,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'afternoon' | 'twilight'>('all');

  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  const filteredHours = hourly.filter((h) => {
    if (activeFilter === 'morning') return h.hour >= 6 && h.hour < 12;
    if (activeFilter === 'afternoon') return h.hour >= 12 && h.hour < 17;
    if (activeFilter === 'twilight') return h.hour >= 17 && h.hour <= 19;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Flow Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1A261E] p-6 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
              24-Hour Horizon
            </span>
            <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">Today View</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-1">
            Golden Tee-Time Windows & 24h Timeline
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            Ranked playing windows for {course.name} to avoid thunderstorms and optimize scoring.
          </p>
        </div>

        <button
          id="open-hourly-breakdown-btn"
          onClick={() => onOpenHourlyBreakdown()}
          className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#2D4635] hover:bg-[#233729] text-white flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <span>Open Full Hourly Breakdown</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Golden Tee-Time Recommender Cards (Ranked Windows) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1]" />
            <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
              Ranked Playing Windows (Next 24h)
            </h3>
          </div>
          <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
            Optimized for Weather & Turf
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goldenWindows.map((win) => {
            const tierStyle = getTierColor(win.tier);
            const isTopPick = win.golfabilityScore >= 90;

            return (
              <div
                key={win.id}
                className={`rounded-3xl p-5 sm:p-6 border transition flex flex-col justify-between relative overflow-hidden ${
                  isTopPick
                    ? 'bg-[#E8EDDF]/90 dark:bg-[#233327]/80 border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                    : 'bg-white dark:bg-[#1A261E] border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs'
                }`}
              >
                {isTopPick && (
                  <div className="absolute top-0 right-0 bg-[#2D4635] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl shadow-xs">
                    ★ Best Choice
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 pr-12">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#6B7D6A] dark:text-[#9FB19E] block">
                        {win.durationLabel}
                      </span>
                      <h4 className="text-lg font-black text-[#1B261E] dark:text-[#E8EFE8]">
                        {win.startHour} – {win.endHour}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black font-mono ${tierStyle.text}`}>
                        {win.golfabilityScore}
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#6B7D6A]">
                        Score / 100
                      </span>
                    </div>
                  </div>

                  {/* Badges strip */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${tierStyle.badge}`}>
                      {win.tier}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4EE] dark:bg-[#16221A] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E] font-mono">
                      Rain: {win.rainRiskPct}%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4EE] dark:bg-[#16221A] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E] font-mono">
                      Max: {displayTemp(win.maxTempC)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4EE] dark:bg-[#16221A] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E] font-mono">
                      Lightning: {win.lightningRisk}
                    </span>
                  </div>

                  {/* Highlights Bullet List */}
                  <ul className="mt-3.5 space-y-1.5 text-xs text-[#6B7D6A] dark:text-[#9FB19E] border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-3">
                    {win.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2D4635] dark:text-[#A8C2A1] font-bold shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B7D6A]">
                    Verdict: <span className="text-[#1B261E] dark:text-[#E8EFE8] font-bold">{win.verdict}</span>
                  </span>
                  <button
                    onClick={() => onOpenHourlyBreakdown(parseInt(win.startHour.split(':')[0], 10))}
                    className="text-xs font-bold text-[#2D4635] dark:text-[#A8C2A1] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Hours</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive 24-Hour Timeline */}
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
              24-Hour Golfability Timeline
            </h3>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
              Click any hour to open the in-depth meteorological drilldown
            </p>
          </div>

          {/* Time of Day Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F0F4EE] dark:bg-[#16221A] p-1 rounded-full border border-[#E2E8DF] dark:border-[#2A3B2E]">
            {(['all', 'morning', 'afternoon', 'twilight'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  activeFilter === filter
                    ? 'bg-[#2D4635] text-white shadow-xs'
                    : 'text-[#6B7D6A] hover:text-[#1B261E] dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Scroll Hourly Track */}
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex gap-2.5 min-w-max">
            {filteredHours.map((h) => {
              const tierStyle = getTierColor(h.golfabilityTier);
              return (
                <button
                  key={h.time}
                  onClick={() => onOpenHourlyBreakdown(h.hour)}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between w-24 hover:scale-102 hover:shadow-md ${
                    h.recommended
                      ? 'bg-[#E8EDDF] dark:bg-[#233327] border-[#DCE3D4] dark:border-[#2F4435]'
                      : 'bg-[#F0F4EE] dark:bg-[#16221A] border-[#E2E8DF] dark:border-[#2A3B2E]'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#6B7D6A] dark:text-[#9FB19E]">
                    {h.time}
                  </span>

                  <div className="my-2">
                    {h.lightningRisk === 'Severe' ? (
                      <Zap className="w-5 h-5 text-[#9E3535] mx-auto" />
                    ) : h.precipitationProb > 50 ? (
                      <CloudRain className="w-5 h-5 text-blue-500 mx-auto" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#A68A64] mx-auto" />
                    )}
                  </div>

                  <div className="font-mono text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8]">
                    {displayTemp(h.tempC)}
                  </div>

                  <div className="text-[11px] text-[#6B7D6A] font-mono mt-0.5">
                    {h.precipitationProb}% rain
                  </div>

                  <div
                    className={`text-xs font-black font-mono mt-2 px-2.5 py-0.5 rounded-full ${tierStyle.badge}`}
                  >
                    {h.golfabilityScore}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

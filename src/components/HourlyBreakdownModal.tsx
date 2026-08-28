import React, { useState } from 'react';
import { DailyForecast, HourlyForecast, GolfCourse } from '../types';
import { getTierColor } from '../utils/golfability';
import {
  X,
  Clock,
  Calendar,
  Sun,
  CloudRain,
  Wind,
  Zap,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface HourlyBreakdownModalProps {
  course: GolfCourse;
  isOpen: boolean;
  onClose: () => void;
  dayTitle: string; // e.g. "Today (Aug 28)" or "Saturday (Aug 29)"
  hourlyData: HourlyForecast[];
  unit: 'metric' | 'imperial';
  initialSelectedHour?: number;
}

export const HourlyBreakdownModal: React.FC<HourlyBreakdownModalProps> = ({
  course,
  isOpen,
  onClose,
  dayTitle,
  hourlyData,
  unit,
  initialSelectedHour,
}) => {
  const [filterRecommendedOnly, setFilterRecommendedOnly] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(initialSelectedHour ?? null);

  if (!isOpen) return null;

  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  const displayedHours = filterRecommendedOnly
    ? hourlyData.filter((h) => h.golfabilityScore >= 75)
    : hourlyData;

  const activeHourDetail = selectedHour !== null
    ? hourlyData.find((h) => h.hour === selectedHour) || hourlyData[0]
    : hourlyData[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between bg-[#F0F4EE] dark:bg-[#16221A]">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
              <h2 className="font-bold text-lg sm:text-xl text-[#1B261E] dark:text-[#E8EFE8]">
                Hourly Breakdown: {dayTitle}
              </h2>
            </div>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Detailed meteorological & golfability telemetry for {course.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterRecommendedOnly(!filterRecommendedOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filterRecommendedOnly
                  ? 'bg-[#2D4635] text-white border-[#2D4635] shadow-xs'
                  : 'bg-white dark:bg-[#1A261E] text-[#1B261E] dark:text-[#E8EFE8] border-[#E2E8DF] dark:border-[#2A3B2E] hover:bg-[#F0F4EE]'
              }`}
            >
              {filterRecommendedOnly ? '✓ Showing Recommended Only' : 'Filter: Prime Play Hours'}
            </button>

            <button
              id="close-hourly-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E2E8DF] dark:hover:bg-[#2A3B2E] text-[#6B7D6A] font-bold transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          {/* Active Hour Quick Highlight Card if selected */}
          {activeHourDetail && (
            <div className="p-4 rounded-2xl bg-[#E8EDDF] dark:bg-[#233327] border border-[#DCE3D4] dark:border-[#2F4435] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#2D4635] text-white text-center font-mono shrink-0">
                  <div className="text-xs font-medium">Hour</div>
                  <div className="text-lg font-bold">{activeHourDetail.time}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
                      {activeHourDetail.condition}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTierColor(activeHourDetail.golfabilityTier).badge}`}>
                      {activeHourDetail.golfabilityTier} ({activeHourDetail.golfabilityScore}/100)
                    </span>
                  </div>
                  <div className="text-xs text-[#2D4635] dark:text-[#D8E6DA] mt-1">
                    Temp: <span className="font-semibold">{displayTemp(activeHourDetail.tempC)}</span> (Feels {displayTemp(activeHourDetail.feelsLikeC)}) • Rain: <span className="font-semibold">{activeHourDetail.precipitationProb}%</span> ({activeHourDetail.precipitationMm} mm) • Wind: <span className="font-semibold">{displayWind(activeHourDetail.windSpeedKmh)} {activeHourDetail.windDirectionText}</span> • UV: <span className="font-semibold">{activeHourDetail.uvIndex}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-right shrink-0">
                {activeHourDetail.lightningRisk === 'Severe' ? (
                  <span className="text-[#9E3535] dark:text-[#F08585] bg-[#FCE8E8] dark:bg-[#3D1E1E] px-2.5 py-1 rounded-md">
                    ⚡ High Siren Risk
                  </span>
                ) : (
                  <span className="text-[#2D4635] dark:text-[#A8C2A1] bg-[#E8EDDF] dark:bg-[#16221A] px-2.5 py-1 rounded-md">
                    ✓ Playable Window
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Detailed Hourly Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0F4EE] dark:bg-[#16221A] text-[#6B7D6A] dark:text-[#9FB19E] font-semibold border-b border-[#E2E8DF] dark:border-[#2A3B2E]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Temp / Feels</th>
                  <th className="p-3">Rain Risk</th>
                  <th className="p-3">Wind / Gusts</th>
                  <th className="p-3">UV / AQI</th>
                  <th className="p-3">Lightning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8DF] dark:divide-[#2A3B2E] bg-white dark:bg-[#1A261E]">
                {displayedHours.map((h) => {
                  const tierStyle = getTierColor(h.golfabilityTier);
                  const isSelected = selectedHour === h.hour;

                  return (
                    <tr
                      key={h.time}
                      onClick={() => setSelectedHour(h.hour)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F0F4EE]/80 dark:bg-[#233327]/50'
                          : 'hover:bg-[#F7F9F5] dark:hover:bg-[#16221A]'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-[#1B261E] dark:text-[#E8EFE8]">
                        {h.time}
                      </td>

                      <td className="p-3">
                        <span
                          className={`font-mono font-black px-2 py-0.5 rounded-full text-xs ${tierStyle.badge}`}
                        >
                          {h.golfabilityScore}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {h.lightningRisk === 'Severe' ? (
                            <Zap className="w-4 h-4 text-[#9E3535] shrink-0" />
                          ) : h.precipitationProb > 50 ? (
                            <CloudRain className="w-4 h-4 text-[#A68A64] shrink-0" />
                          ) : (
                            <Sun className="w-4 h-4 text-[#A68A64] shrink-0" />
                          )}
                          <span className="truncate max-w-[130px] text-[#1B261E] dark:text-[#E8EFE8]">{h.condition}</span>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-semibold text-[#1B261E] dark:text-[#E8EFE8]">
                          {displayTemp(h.tempC)}
                        </div>
                        <div className="text-[11px] text-[#6B7D6A]">
                          Feels {displayTemp(h.feelsLikeC)}
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className={`font-semibold ${h.precipitationProb > 50 ? 'text-[#2D4635] dark:text-[#A8C2A1]' : 'text-[#6B7D6A] dark:text-[#9FB19E]'}`}>
                          {h.precipitationProb}%
                        </div>
                        <div className="text-[11px] text-[#6B7D6A]">
                          {h.precipitationMm > 0 ? `${h.precipitationMm} mm/h` : '0 mm'}
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-semibold text-[#1B261E] dark:text-[#E8EFE8]">
                          {displayWind(h.windSpeedKmh)} {h.windDirectionText}
                        </div>
                        <div className="text-[11px] text-[#6B7D6A]">
                          Gusts {displayWind(h.windGustKmh)}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[#1B261E] dark:text-[#E8EFE8]">
                        <div>UV {h.uvIndex}</div>
                        <div className="text-[11px] text-[#6B7D6A]">AQI {h.aqi}</div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            h.lightningRisk === 'Severe'
                              ? 'bg-[#FCE8E8] text-[#9E3535] dark:bg-[#3D1E1E] dark:text-[#F08585]'
                              : h.lightningRisk === 'Moderate'
                              ? 'bg-[#F7EFEA] text-[#A68A64] dark:bg-[#2A201A] dark:text-[#D4B896]'
                              : 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1]'
                          }`}
                        >
                          {h.lightningRisk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8DF] dark:border-[#2A3B2E] bg-[#F0F4EE] dark:bg-[#16221A] flex items-center justify-between">
          <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
            Observed & Forecast data refreshed continuously
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#2D4635] text-white hover:opacity-90 transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

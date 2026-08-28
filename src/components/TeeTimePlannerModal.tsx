import React, { useState } from 'react';
import { GolfCourse, HourlyForecast } from '../types';
import {
  X,
  Sparkles,
  Clock,
  Sun,
  CloudRain,
  Wind,
  CheckSquare,
  Square,
  Shield,
  Compass,
  Zap,
} from 'lucide-react';

interface TeeTimePlannerModalProps {
  course: GolfCourse;
  isOpen: boolean;
  onClose: () => void;
  hourly: HourlyForecast[];
  unit: 'metric' | 'imperial';
}

export const TeeTimePlannerModal: React.FC<TeeTimePlannerModalProps> = ({
  course,
  isOpen,
  onClose,
  hourly,
  unit,
}) => {
  const [selectedTeeHour, setSelectedTeeHour] = useState<number>(7); // 7 AM default
  const [roundType, setRoundType] = useState<'9-holes' | '18-holes'>('18-holes');
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    'waterproof-cover': true,
    'rain-gloves': false,
    'uv-sleeves': true,
    'electrolytes': true,
    'wide-brim-hat': false,
    'extra-towels': true,
  });

  if (!isOpen) return null;

  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Simulate round duration: 9 holes = ~2.25 hours, 18 holes = ~4.5 hours
  const hoursNeeded = roundType === '18-holes' ? 5 : 3;
  const roundHours = hourly.filter(
    (h) => h.hour >= selectedTeeHour && h.hour < selectedTeeHour + hoursNeeded
  );

  // Worst lightning and rain risk during round
  const maxRainProb = Math.max(...roundHours.map((h) => h.precipitationProb), 0);
  const maxTemp = Math.max(...roundHours.map((h) => h.tempC), 25);
  const maxWind = Math.max(...roundHours.map((h) => h.windSpeedKmh), 10);
  const hasSevereLightning = roundHours.some((h) => h.lightningRisk === 'Severe');
  const avgGolfScore = roundHours.length > 0
    ? Math.round(roundHours.reduce((acc, h) => acc + h.golfabilityScore, 0) / roundHours.length)
    : 80;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between bg-[#F0F4EE] dark:bg-[#16221A]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
              <h2 className="font-bold text-lg sm:text-xl text-[#1B261E] dark:text-[#E8EFE8]">
                Round Weather & Gear Planner
              </h2>
            </div>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Simulate weather progression for your specific tee time at {course.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E2E8DF] dark:hover:bg-[#2A3B2E] text-[#6B7D6A] font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* Controls: Tee Time & Round Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <label className="text-xs font-bold text-[#1B261E] dark:text-[#E8EFE8] block mb-2">
                Planned Tee-Off Time
              </label>
              <select
                value={selectedTeeHour}
                onChange={(e) => setSelectedTeeHour(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-[#1A261E] p-2.5 rounded-xl border border-[#E2E8DF] dark:border-[#2A3B2E] text-sm font-semibold text-[#1B261E] dark:text-[#E8EFE8] outline-none"
              >
                {hourly.filter((h) => h.hour >= 6 && h.hour <= 17).map((h) => (
                  <option key={h.hour} value={h.hour}>
                    {h.time} (Score: {h.golfabilityScore}/100 • {h.condition})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <label className="text-xs font-bold text-[#1B261E] dark:text-[#E8EFE8] block mb-2">
                Round Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoundType('18-holes')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                    roundType === '18-holes'
                      ? 'bg-[#2D4635] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1A261E] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E]'
                  }`}
                >
                  18 Holes (~4.5h)
                </button>
                <button
                  type="button"
                  onClick={() => setRoundType('9-holes')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                    roundType === '9-holes'
                      ? 'bg-[#2D4635] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1A261E] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E]'
                  }`}
                >
                  9 Holes (~2.25h)
                </button>
              </div>
            </div>
          </div>

          {/* Round Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E8EDDF] dark:bg-[#233327] border border-[#DCE3D4] dark:border-[#2F4435] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#2D4635] dark:text-[#A8C2A1] bg-white/70 dark:bg-[#16221A]/80 px-2.5 py-0.5 rounded-full border border-[#DCE3D4] dark:border-[#2F4435]">
                  Round Forecast
                </span>
                <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                  {selectedTeeHour.toString().padStart(2, '0')}:00 to {(selectedTeeHour + hoursNeeded - 1).toString().padStart(2, '0')}:00
                </span>
              </div>
              <h3 className="font-bold text-lg text-[#1B261E] dark:text-[#E8EFE8] mt-1">
                Average Golfability Score: {avgGolfScore}/100
              </h3>
              <p className="text-xs text-[#2D4635] dark:text-[#D8E6DA] mt-0.5">
                Peak Rain Risk: <strong>{maxRainProb}%</strong> • Peak Temp: <strong>{displayTemp(maxTemp)}</strong> • Max Wind: <strong>{displayWind(maxWind)}</strong>
              </p>
            </div>

            <div className="text-right shrink-0">
              {hasSevereLightning ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCE8E8] text-[#9E3535] dark:bg-[#3D1E1E] dark:text-[#F08585] border border-[#F5C2C2] dark:border-[#522929]">
                  ⚡ Caution: Mid-Round Storm Risk
                </span>
              ) : (
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#2D4635] text-white shadow-xs">
                  ✓ High Confidence Play Window
                </span>
              )}
            </div>
          </div>

          {/* Hour-by-hour progression through the round */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7D6A] dark:text-[#9FB19E] mb-2.5">
              Round Timeline Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {roundHours.map((h, i) => (
                <div
                  key={h.time}
                  className="p-3 bg-[#F0F4EE] dark:bg-[#16221A] rounded-xl border border-[#E2E8DF] dark:border-[#2A3B2E] text-center text-xs"
                >
                  <div className="font-mono font-bold text-[#1B261E] dark:text-[#E8EFE8]">
                    {h.time}
                  </div>
                  <div className="text-[11px] text-[#6B7D6A] font-medium">
                    {roundType === '18-holes'
                      ? i === 0 ? 'Holes 1–4' : i === 1 ? 'Holes 5–8' : i === 2 ? 'Turn (H9–12)' : i === 3 ? 'Holes 13–16' : 'Finishing 17–18'
                      : i === 0 ? 'Holes 1–3' : i === 1 ? 'Holes 4–6' : 'Finishing 7–9'}
                  </div>
                  <div className="font-bold my-1 text-[#1B261E] dark:text-[#E8EFE8]">
                    {displayTemp(h.tempC)}
                  </div>
                  <div className="text-[11px] text-[#2D4635] dark:text-[#A8C2A1] font-mono">
                    {h.precipitationProb}% rain
                  </div>
                  <div className="text-[10px] font-mono mt-1 font-bold text-[#2D4635] dark:text-[#A8C2A1]">
                    {h.golfabilityScore} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Golfer Bag & Gear Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7D6A] dark:text-[#9FB19E] mb-2.5">
              Smart Golfer Packing Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'waterproof-cover', label: 'Waterproof Bag Hood & Rain Cover', reason: maxRainProb > 30 ? 'Rain showers likely' : 'Precautionary' },
                { id: 'rain-gloves', label: 'All-Weather / Wet-Weather Grip Gloves', reason: maxRainProb > 40 ? 'Vital for wet grip retention' : 'Recommended' },
                { id: 'uv-sleeves', label: 'UV Sun Sleeves & 50+ Sunscreen', reason: maxTemp > 30 ? 'High thermal & solar exposure' : 'Sun protection' },
                { id: 'electrolytes', label: '2L Water & Isotonic Electrolytes', reason: maxTemp > 31 ? 'Prevents fatigue on back 9' : 'Standard hydration' },
                { id: 'extra-towels', label: '2 Dry Microfiber Towels (Zipper Sealed)', reason: 'Wiping grips & clubfaces dry' },
                { id: 'wide-brim-hat', label: 'Bucket Hat / UV Umbrella', reason: 'Maximum shade coverage' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                    checklist[item.id]
                      ? 'bg-[#E8EDDF] dark:bg-[#233327] border-[#DCE3D4] dark:border-[#2F4435] text-[#1B261E] dark:text-[#E8EFE8]'
                      : 'bg-[#F0F4EE] dark:bg-[#16221A] border-[#E2E8DF] dark:border-[#2A3B2E] text-[#6B7D6A] dark:text-[#9FB19E]'
                  }`}
                >
                  <div className="mt-0.5 text-[#2D4635] dark:text-[#A8C2A1]">
                    {checklist[item.id] ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">{item.reason}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8DF] dark:border-[#2A3B2E] bg-[#F0F4EE] dark:bg-[#16221A] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-[#2D4635] hover:bg-[#23382A] text-white transition shadow-xs"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
};

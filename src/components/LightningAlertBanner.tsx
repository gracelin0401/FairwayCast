import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Siren, Navigation, Info, ChevronRight, Volume2, ShieldAlert } from 'lucide-react';
import { LightningAlert } from '../types';

interface LightningAlertBannerProps {
  lightning: LightningAlert;
  onSimulateChange?: (alert: LightningAlert) => void;
}

export const LightningAlertBanner: React.FC<LightningAlertBannerProps> = ({
  lightning,
  onSimulateChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showShelterGuide, setShowShelterGuide] = useState(false);

  const isRedAlert = lightning.courseSirenSounded || lightning.level === 'Red Alert - Siren Active' || lightning.nearestStrikeKm < 8;
  const isAdvisory = !isRedAlert && (lightning.level === 'Advisory' || lightning.nearestStrikeKm < 20);

  return (
    <div className="w-full mb-6">
      {/* Main Alert Card */}
      <div
        className={`rounded-3xl border transition-all shadow-xs overflow-hidden ${
          isRedAlert
            ? 'bg-[#FDF0F0] dark:bg-[#361919]/60 border-[#F9D6D6] dark:border-[#4D2222] text-[#1B261E] dark:text-[#E8EFE8] ring-2 ring-[#9E3535]/20 animate-pulse-slow'
            : isAdvisory
            ? 'bg-[#FDF8F3] dark:bg-[#2A231C]/60 border-[#F9F0E5] dark:border-[#3D3328] text-[#1B261E] dark:text-[#E8EFE8]'
            : 'bg-[#E8EDDF] dark:bg-[#233327]/60 border-[#DCE3D4] dark:border-[#2F4435] text-[#1B261E] dark:text-[#E8EFE8]'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Status Icon & Title */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  isRedAlert
                    ? 'bg-[#9E3535] text-white shadow-md shadow-[#9E3535]/30'
                    : isAdvisory
                    ? 'bg-[#A68A64] text-white shadow-md shadow-[#A68A64]/30'
                    : 'bg-[#2D4635] text-white shadow-md shadow-[#2D4635]/30'
                }`}
              >
                {isRedAlert ? (
                  <Siren className="w-6 h-6 animate-bounce" />
                ) : isAdvisory ? (
                  <Zap className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isRedAlert
                        ? 'bg-[#9E3535] text-white'
                        : isAdvisory
                        ? 'bg-[#A68A64] text-white'
                        : 'bg-[#2D4635] text-white'
                    }`}
                  >
                    {isRedAlert ? 'Red Alert: Siren Active' : isAdvisory ? 'Lightning Advisory' : 'Lightning Safety Clear'}
                  </span>
                  <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                    Updated 1 min ago • Proximity Radar
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg mt-1 text-[#1B261E] dark:text-[#E8EFE8]">
                  {isRedAlert
                    ? 'Immediate Play Stoppage Required — Discharges Detected in 8km Perimeter'
                    : isAdvisory
                    ? `Thunderstorm Cells Detected within ${lightning.nearestStrikeKm} km`
                    : 'Course Perimeter All Clear (> 30 km Safe Margin)'}
                </h3>

                <p className="text-xs sm:text-sm mt-0.5 text-[#6B7D6A] dark:text-[#9FB19E] leading-relaxed">
                  {isRedAlert
                    ? 'Course siren triggered. Abandon open fairways and metal golf clubs. Seek designated grounded lightning shelters immediately.'
                    : isAdvisory
                    ? `Cells are ${lightning.trend.toLowerCase()} from the south-west. Nearest strike recorded ${lightning.nearestStrikeKm} km away.`
                    : 'No atmospheric electrical discharges detected in the 30 km playing zone. Conditions are safe for play.'}
                </p>
              </div>
            </div>

            {/* Right: Key Metrics & Action Button */}
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <div className="text-right font-mono hidden md:block">
                <div className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">Nearest Strike</div>
                <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8]">
                  {lightning.nearestStrikeKm < 50 ? `${lightning.nearestStrikeKm} km` : '> 50 km (Safe)'}
                </div>
              </div>

              <button
                id="lightning-shelter-button"
                onClick={() => setShowShelterGuide(!showShelterGuide)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  isRedAlert
                    ? 'bg-[#9E3535] hover:bg-[#832929] text-white'
                    : 'bg-white dark:bg-[#1A261E] hover:bg-[#F0F4EE] dark:hover:bg-[#233327] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#A68A64]" />
                <span>{showShelterGuide ? 'Hide Shelter Guide' : 'Shelter Protocol'}</span>
              </button>

              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition"
                title="Toggle details"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* Shelter Guidance Banner if open */}
          {showShelterGuide && (
            <div className="mt-4 p-4.5 bg-white dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] text-xs sm:text-sm text-[#1B261E] dark:text-[#E8EFE8] animate-in fade-in duration-150 shadow-xs">
              <div className="font-bold text-sm mb-2 flex items-center gap-2 text-[#9E3535] dark:text-[#F08585]">
                <AlertTriangle className="w-4 h-4" />
                <span>Golf Course Lightning Safety Protocol (30/30 Rule)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#1E2D22] rounded-xl border border-[#E2E8DF] dark:border-[#2D4233]">
                  <div className="font-semibold text-xs text-[#2D4635] dark:text-[#A8C2A1] mb-1">1. Immediate Evacuation</div>
                  <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
                    When the siren blares (one continuous blast), mark your ball, do not complete putting out, and leave open fairways.
                  </p>
                </div>
                <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#1E2D22] rounded-xl border border-[#E2E8DF] dark:border-[#2D4233]">
                  <div className="font-semibold text-xs text-[#2D4635] dark:text-[#A8C2A1] mb-1">2. Unsafe Locations</div>
                  <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
                    NEVER shelter under isolated trees, golf buggies/carts (not Faraday cages), or open rain shelters without lightning rods.
                  </p>
                </div>
                <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#1E2D22] rounded-xl border border-[#E2E8DF] dark:border-[#2D4233]">
                  <div className="font-semibold text-xs text-[#2D4635] dark:text-[#A8C2A1] mb-1">3. Resumption Window</div>
                  <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
                    Play may only safely resume 30 minutes after the last thunder clap or upon two distinct all-clear siren blasts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Technical Radar Detail */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px] font-medium">Lightning Siren Status</div>
                <div className="font-bold font-mono mt-0.5 text-[#1B261E] dark:text-[#E8EFE8]">
                  {lightning.courseSirenSounded ? 'ACTIVE SIREN (Blast 1)' : 'ALL CLEAR (Standby)'}
                </div>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px] font-medium">Strikes in Last 30m</div>
                <div className="font-bold font-mono mt-0.5 text-[#1B261E] dark:text-[#E8EFE8]">{lightning.strikeCountLast30Min} Discharges</div>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px] font-medium">Storm Motion Trend</div>
                <div className="font-bold font-mono mt-0.5 text-[#1B261E] dark:text-[#E8EFE8]">{lightning.trend}</div>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px] font-medium">Est. Safe Resumption</div>
                <div className="font-bold font-mono mt-0.5 text-[#1B261E] dark:text-[#E8EFE8]">
                  {lightning.safeWindowEstimatedMin > 0 ? `~${lightning.safeWindowEstimatedMin} mins` : 'Immediate'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

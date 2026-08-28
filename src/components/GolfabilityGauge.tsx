import React, { useState } from 'react';
import {
  GolfabilityScore,
  GolfabilityTier,
  ScoreFactor,
} from '../types';
import { getTierColor } from '../utils/golfability';
import {
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  Info,
  SlidersHorizontal,
  ShieldCheck,
  Wind,
  Droplets,
  Sun,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

interface GolfabilityGaugeProps {
  score: GolfabilityScore;
  onOpenBreakdown?: () => void;
}

export const GolfabilityGauge: React.FC<GolfabilityGaugeProps> = ({ score }) => {
  const [showFactorModal, setShowFactorModal] = useState(false);
  const tierStyle = getTierColor(score.tier);

  // SVG Gauge calculations (Semi-circle meter)
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (score.total / 100) * circumference;

  const getCategoryIcon = (category: ScoreFactor['category']) => {
    switch (category) {
      case 'lightning':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'rain':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-teal-500" />;
      case 'temp':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'uv':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'aqi':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 sm:p-8 shadow-xs transition">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Arc Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-28 sm:w-56 sm:h-32 flex items-end justify-center">
            <svg className="w-48 h-28 sm:w-56 sm:h-32 overflow-visible" viewBox="0 0 200 110">
              {/* Background Track Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="currentColor"
                className="text-[#E2E8DF] dark:text-[#2A3B2E]"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Animated Foreground Score Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="currentColor"
                className={tierStyle.text}
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease-out',
                }}
              />
            </svg>

            {/* Centered Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#1B261E] dark:text-[#E8EFE8] font-mono">
                {score.total}
              </div>
              <div className="text-xs uppercase font-bold text-[#6B7D6A] dark:text-[#9FB19E] tracking-wider">
                out of 100
              </div>
            </div>
          </div>

          {/* Tier Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${tierStyle.badge}`}
            >
              {score.tier} Conditions
            </span>
          </div>

          <button
            id="view-score-drivers-button"
            onClick={() => setShowFactorModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D4635] dark:text-[#A8C2A1] hover:text-[#1B261E] dark:hover:text-white transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Why this score? (Factor Breakdown)</span>
          </button>
        </div>

        {/* Right Column: Verdict, Decision Summary & Key Driving Factors */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7D6A] dark:text-[#9FB19E]">
                Actionable Playability Verdict
              </span>
              <span className="text-xs font-semibold text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                Recommended: {score.roundRecommendation}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-1">
              {score.verdict}
            </h2>

            <p className="text-sm text-[#6B7D6A] dark:text-[#9FB19E] mt-1.5 leading-relaxed">
              {score.summary}
            </p>
          </div>

          {/* Transparent Score Drivers Pills */}
          <div className="bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl p-4 border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#1B261E] dark:text-[#E8EFE8] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#6B7D6A]" />
                Score Drivers (Transparent Algorithm)
              </span>
              <span className="text-[11px] text-[#6B7D6A]">
                Baseline: 100 pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {score.factors.slice(0, 4).map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1E2D22] border border-[#E2E8DF] dark:border-[#2D4233] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getCategoryIcon(factor.category)}
                    <div className="truncate">
                      <span className="font-medium text-[#1B261E] dark:text-[#E8EFE8] truncate block">
                        {factor.name}
                      </span>
                      <span className="text-[10px] text-[#6B7D6A] dark:text-[#9FB19E] truncate block">
                        {factor.value}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold shrink-0 ml-2 px-2 py-0.5 rounded text-[11px] ${
                      factor.impact < 0
                        ? 'bg-[#FDF0F0] text-[#9E3535] dark:bg-[#361919] dark:text-[#F08585]'
                        : 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1]'
                    }`}
                  >
                    {factor.impact === 0 ? '0' : `${factor.impact}`} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Modal / Drawer */}
      {showFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1A261E] rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1B261E] dark:text-[#E8EFE8]">
                  Golfability Algorithm Breakdown
                </h3>
                <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
                  Current Score: {score.total}/100 • {score.tier}
                </p>
              </div>
              <button
                onClick={() => setShowFactorModal(false)}
                className="p-2 rounded-full hover:bg-[#F0F4EE] dark:hover:bg-[#233327] text-[#6B7D6A] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 custom-scrollbar flex-1">
              <div className="p-3.5 bg-[#E8EDDF] dark:bg-[#233327] rounded-2xl text-xs text-[#2D4635] dark:text-[#A8C2A1] mb-4 border border-[#DCE3D4] dark:border-[#2F4435]">
                <span className="font-bold">Transparent Scoring:</span> We start at 100 points and apply weighted penalties based on safety (lightning siren), precipitation rate, wind shear, heat stress index, solar UV radiation, and atmospheric air quality (AQI/PSI).
              </div>

              {score.factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F0F4EE] dark:bg-[#16221A] border border-[#E2E8DF] dark:border-[#2A3B2E]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(factor.category)}
                      <span className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8]">
                        {factor.name}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded ${
                        factor.impact < 0
                          ? 'bg-[#FDF0F0] text-[#9E3535] dark:bg-[#361919] dark:text-[#F08585]'
                          : 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1]'
                      }`}
                    >
                      {factor.impact === 0 ? '0' : `${factor.impact}`} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6B7D6A] dark:text-[#9FB19E] mb-1.5 font-mono">
                    <span>Reading: {factor.value}</span>
                    <span className="capitalize font-semibold">{factor.status}</span>
                  </div>

                  <p className="text-xs text-[#1B261E] dark:text-[#E8EFE8] bg-white dark:bg-[#1E2D22] p-3 rounded-xl border border-[#E2E8DF] dark:border-[#2D4233]">
                    <span className="font-semibold text-[#2D4635] dark:text-[#A8C2A1]">Golfer Advice:</span> {factor.advice}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#E2E8DF] dark:border-[#2A3B2E] bg-[#F0F4EE] dark:bg-[#16221A] flex justify-end">
              <button
                onClick={() => setShowFactorModal(false)}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#2D4635] hover:bg-[#233729] text-white transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

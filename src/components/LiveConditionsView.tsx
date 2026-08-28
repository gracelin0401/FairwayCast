import React, { useState, useEffect } from 'react';
import { CurrentWeather, GolfCourse, LightningAlert } from '../types';
import { calculateWindVsHole } from '../utils/golfability';
import {
  Radio,
  Compass,
  Zap,
  Wind,
  Shield,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Info,
  MapPin,
  Flame,
  Droplets,
  Eye,
} from 'lucide-react';

interface LiveConditionsViewProps {
  course: GolfCourse;
  current: CurrentWeather;
  lightning: LightningAlert;
  unit: 'metric' | 'imperial';
}

export const LiveConditionsView: React.FC<LiveConditionsViewProps> = ({
  course,
  current,
  lightning,
  unit,
}) => {
  const [holeHeading, setHoleHeading] = useState<number>(course.defaultHoleHeadingDeg || 90);
  const [radarPlaying, setRadarPlaying] = useState<boolean>(true);
  const [radarFrame, setRadarFrame] = useState<number>(0); // 0, 1, 2, 3, 4

  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  // Animate radar frames
  useEffect(() => {
    if (!radarPlaying) return;
    const interval = setInterval(() => {
      setRadarFrame((prev) => (prev + 1) % 5);
    }, 1200);
    return () => clearInterval(interval);
  }, [radarPlaying]);

  const windVsHole = calculateWindVsHole(current.windDirectionDeg, holeHeading, current.windSpeedKmh);

  const radarTimeLabels = ['-30 min', '-15 min', 'Live Now', '+15 min', '+30 min'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A261E] p-6 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D4635] dark:bg-[#A8C2A1] animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">Live Conditions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-1">
            Doppler Radar & Wind Vector Tool
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            Real-time storm cell proximity, lightning distance rings, and hole-by-hole wind drift calculator for {course.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#F0F4EE] dark:bg-[#16221A] text-[#1B261E] dark:text-[#E8EFE8] px-3.5 py-2 rounded-full border border-[#E2E8DF] dark:border-[#2A3B2E]">
          <MapPin className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1]" />
          <span>{course.lat.toFixed(4)}°N, {course.lon.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Main Grid: Radar & Wind Compass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Live Doppler Radar & Lightning Rings */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
                  Storm Proximity Radar (30km Radius)
                </h3>
              </div>

              {/* Radar controls */}
              <div className="flex items-center gap-1.5 bg-[#F0F4EE] dark:bg-[#16221A] p-1 rounded-full border border-[#E2E8DF] dark:border-[#2A3B2E]">
                <button
                  id="radar-play-toggle-btn"
                  onClick={() => setRadarPlaying(!radarPlaying)}
                  className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#233327] text-[#1B261E] dark:text-[#E8EFE8] transition"
                  title={radarPlaying ? 'Pause Radar Loop' : 'Play Radar Loop'}
                >
                  {radarPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono font-bold px-2.5 text-[#2D4635] dark:text-[#A8C2A1]">
                  {radarTimeLabels[radarFrame]}
                </span>
              </div>
            </div>

            {/* Simulated Radar Visualizer Screen */}
            <div className="relative aspect-4/3 w-full bg-[#111914] rounded-2xl overflow-hidden border border-[#2A3B2E] flex items-center justify-center shadow-inner">
              {/* Radar Grid Circles */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                {/* Crosshairs */}
                <line x1="200" y1="0" x2="200" y2="300" stroke="#2D4635" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="#2D4635" strokeWidth="1" strokeDasharray="3 3" />

                {/* Range Rings: 30km, 15km, 8km, 3km */}
                <circle cx="200" cy="150" r="130" fill="none" stroke="#23382A" strokeWidth="1.5" />
                <text x="205" y="30" fill="#6B7D6A" fontSize="10" fontFamily="monospace">30 km</text>

                <circle cx="200" cy="150" r="85" fill="none" stroke="#A68A64" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 2" />
                <text x="205" y="75" fill="#A68A64" fontSize="10" fontFamily="monospace">15 km (Advisory)</text>

                <circle cx="200" cy="150" r="45" fill="none" stroke="#9E3535" strokeWidth="2" strokeOpacity="0.7" />
                <text x="205" y="115" fill="#F08585" fontSize="10" fontFamily="monospace">8 km (Siren Zone)</text>

                {/* Animated Doppler Precipitation Cloud Cells */}
                <g
                  transform={`translate(${Math.sin((radarFrame / 5) * Math.PI * 2) * 15 - 20}, ${
                    Math.cos((radarFrame / 5) * Math.PI * 2) * 10 - 15
                  })`}
                  className="transition-all duration-1000 ease-in-out opacity-80"
                >
                  <ellipse cx="260" cy="90" rx="65" ry="40" fill="#2D4635" fillOpacity="0.45" filter="blur(10px)" />
                  <ellipse cx="270" cy="95" rx="40" ry="25" fill="#A68A64" fillOpacity="0.55" filter="blur(8px)" />
                  <ellipse cx="275" cy="100" rx="20" ry="12" fill="#9E3535" fillOpacity="0.75" filter="blur(5px)" />
                </g>

                {/* Course Center Pin */}
                <circle cx="200" cy="150" r="5" fill="#A8C2A1" />
                <circle cx="200" cy="150" r="12" fill="none" stroke="#A8C2A1" strokeWidth="2" className="animate-ping" />
                <text x="200" y="172" fill="#A8C2A1" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Clubhouse
                </text>

                {/* Simulated Lightning strike ping if within 30km */}
                {lightning.nearestStrikeKm < 40 && (
                  <g transform={`translate(275, 100)`}>
                    <polygon points="0,-12 6,-2 2,-2 8,10 -2,0 2,0" fill="#FACC15" className="animate-bounce" />
                    <circle cx="0" cy="0" r="15" fill="none" stroke="#FACC15" strokeWidth="1.5" className="animate-ping" />
                  </g>
                )}
              </svg>

              {/* Radar overlay stats */}
              <div className="absolute top-3 left-3 bg-[#16221A]/90 backdrop-blur-md px-3 py-2 rounded-xl text-[11px] font-mono text-[#DCE8DB] border border-[#2A3B2E] space-y-0.5">
                <div>Cell Heading: <span className="text-[#A8C2A1] font-bold">240° WSW</span></div>
                <div>Cell Velocity: <span className="text-[#A8C2A1] font-bold">18 km/h</span></div>
                <div>Top Reflectivity: <span className="text-[#A68A64] font-bold">48 dBZ</span></div>
              </div>

              {/* Nearest strike pill */}
              <div className="absolute bottom-3 right-3 bg-[#16221A]/90 backdrop-blur-md px-3 py-2 rounded-xl text-[11px] font-mono text-[#DCE8DB] border border-[#2A3B2E] flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Nearest Strike: <strong className="text-white">{lightning.nearestStrikeKm} km</strong></span>
              </div>
            </div>

            {/* Radar Scrubber Bar */}
            <div className="flex items-center gap-2 mt-4">
              {radarTimeLabels.map((lbl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRadarFrame(idx);
                    setRadarPlaying(false);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-mono transition text-center ${
                    radarFrame === idx
                      ? 'bg-[#2D4635] text-white font-bold'
                      : 'bg-[#F0F4EE] dark:bg-[#16221A] text-[#6B7D6A] dark:text-[#9FB19E] hover:bg-[#E8EDDF]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
            <span>Doppler radar sweeps updated every 60 seconds</span>
            <span className="font-semibold text-[#2D4635] dark:text-[#A8C2A1]">Live Calibration: Online</span>
          </div>
        </div>

        {/* Right (5 cols): Wind Compass & Hole Alignment */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
                  Hole Wind Alignment Tool
                </h3>
              </div>
              <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                {displayWind(current.windSpeedKmh)} {current.windDirectionText}
              </span>
            </div>

            {/* Interactive Compass Graphic */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-2 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-center">
                <span className="absolute top-2 font-mono text-xs font-bold text-[#6B7D6A]">N (0°)</span>
                <span className="absolute right-2 font-mono text-xs font-bold text-[#6B7D6A]">E (90°)</span>
                <span className="absolute bottom-2 font-mono text-xs font-bold text-[#6B7D6A]">S (180°)</span>
                <span className="absolute left-2 font-mono text-xs font-bold text-[#6B7D6A]">W (270°)</span>
              </div>

              {/* Tee Shot Heading Vector (Green Arrow) */}
              <div
                className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${holeHeading}deg)` }}
              >
                <div className="h-24 w-1 bg-[#2D4635] dark:bg-[#A8C2A1] rounded-full origin-bottom flex flex-col items-center justify-start -translate-y-12">
                  <div className="w-3 h-3 bg-[#2D4635] dark:bg-[#A8C2A1] rotate-45 -mt-1 rounded-xs" />
                  <span className="text-[10px] font-bold text-[#2D4635] dark:text-[#A8C2A1] whitespace-nowrap -mt-6">
                    Tee Shot
                  </span>
                </div>
              </div>

              {/* Wind Vector (Gold Arrow) */}
              <div
                className="absolute w-full h-full flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
              >
                <div className="h-20 w-1 bg-[#A68A64] rounded-full origin-bottom flex flex-col items-center justify-start -translate-y-10">
                  <div className="w-3 h-3 bg-[#A68A64] rotate-45 -mt-1 rounded-xs" />
                  <span className="text-[10px] font-bold text-[#A68A64] whitespace-nowrap -mt-6">
                    Wind
                  </span>
                </div>
              </div>

              {/* Center Pivot Hub */}
              <div className="w-10 h-10 rounded-full bg-[#2D4635] text-white flex items-center justify-center text-xs font-black font-mono shadow-md z-10">
                {holeHeading}°
              </div>
            </div>

            {/* Slider to adjust Tee Shot Heading */}
            <div className="mt-4 p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-[#1B261E] dark:text-[#E8EFE8]">Set Hole / Fairway Heading:</span>
                <span className="font-mono text-[#2D4635] dark:text-[#A8C2A1] font-bold">{holeHeading}° ({holeHeading < 90 ? 'NE' : holeHeading < 180 ? 'SE' : holeHeading < 270 ? 'SW' : 'NW'})</span>
              </div>
              <input
                type="range"
                min="0"
                max="355"
                step="5"
                value={holeHeading}
                onChange={(e) => setHoleHeading(parseInt(e.target.value, 10))}
                className="w-full accent-[#2D4635] h-2 bg-[#E2E8DF] dark:bg-[#2A3B2E] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#6B7D6A] font-mono mt-1">
                <span>0° N</span>
                <span>90° E</span>
                <span>180° S</span>
                <span>270° W</span>
                <span>360°</span>
              </div>
            </div>

            {/* Real-time Drift & Club Advice */}
            <div className="mt-3 p-4 bg-[#E8EDDF] dark:bg-[#233327] rounded-2xl border border-[#DCE3D4] dark:border-[#2F4435] text-xs">
              <div className="font-bold text-[#1B261E] dark:text-[#E8EFE8] mb-1">
                {windVsHole.label}
              </div>
              <div className="text-[#2D4635] dark:text-[#A8C2A1] space-y-1 font-mono text-[11px]">
                <div>• Headwind component: <span className="font-bold">{displayWind(Math.abs(windVsHole.headwindKmh))}</span></div>
                <div>• Crosswind push component: <span className="font-bold">{displayWind(Math.abs(windVsHole.crosswindKmh))}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8DF] dark:border-[#2A3B2E] text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
            Wind telemetry calculated at 10m fairway altitude
          </div>
        </div>
      </div>

      {/* 3. Observed vs Forecast Telemetry Comparison Card */}
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
            <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8]">
              Observed On-Course Sensors vs Regional Numerical Model
            </h3>
          </div>
          <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
            Variance: Low (±2%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px]">Station Barometer</div>
            <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-0.5">
              {current.pressureHpa} hPa (Stable)
            </div>
            <div className="text-[10px] text-[#6B7D6A] font-sans mt-1">Normal air density</div>
          </div>

          <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px]">Dew Point</div>
            <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-0.5">
              {displayTemp(current.dewPointC)}
            </div>
            <div className="text-[10px] text-[#6B7D6A] font-sans mt-1">
              {current.dewPointC > 24 ? 'Oppressive sweat humidity' : 'Comfortable'}
            </div>
          </div>

          <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px]">Cloud Cover</div>
            <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-0.5">
              {current.cloudCoverPct}% Cover
            </div>
            <div className="text-[10px] text-[#6B7D6A] font-sans mt-1">High cumulus clouds</div>
          </div>

          <div className="p-4 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
            <div className="text-[#6B7D6A] dark:text-[#9FB19E] text-[11px]">Optical Visibility</div>
            <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-0.5">
              {current.visibilityKm} km (Clear)
            </div>
            <div className="text-[10px] text-[#6B7D6A] font-sans mt-1">Easy pin tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
};

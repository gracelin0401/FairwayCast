import React from 'react';
import {
  CurrentWeather,
  GolfabilityScore,
  LightningAlert,
  MicrocastInterval,
  GolfCourse,
} from '../types';
import { GolfabilityGauge } from './GolfabilityGauge';
import {
  CloudRain,
  Wind,
  Sun,
  Flame,
  Activity,
  Droplets,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Eye,
  Sunrise,
  Sunset,
  Zap,
  Radio,
  Thermometer,
} from 'lucide-react';

interface NowViewProps {
  course: GolfCourse;
  current: CurrentWeather;
  score: GolfabilityScore;
  lightning: LightningAlert;
  microcast: MicrocastInterval[];
  unit: 'metric' | 'imperial';
  onNavigateTab: (tab: 'today' | 'week' | 'live') => void;
  onOpenPlanner: () => void;
}

export const NowView: React.FC<NowViewProps> = ({
  course,
  current,
  score,
  lightning,
  microcast,
  unit,
  onNavigateTab,
  onOpenPlanner,
}) => {
  // Convert units helper
  const displayTemp = (c: number) => (unit === 'metric' ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);
  const displayWind = (kmh: number) => (unit === 'metric' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`);

  // Calculate 9-hole window viability (Need ~2 hours)
  const is9HolesSafe = microcast.slice(0, 8).every((m) => m.precipitationMm < 2.0 && m.lightningRisk !== 'Severe');
  const rainArrivalInterval = microcast.find((m) => m.precipitationMm > 1.0 || m.precipitationProb > 65);

  return (
    <div className="space-y-6">
      {/* 1. Primary Golfability Assessment Gauge */}
      <GolfabilityGauge score={score} />

      {/* 2. Next 2-Hour Microcast (15-Minute Resolution) */}
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />
              <h3 className="font-bold text-lg text-[#1B261E] dark:text-[#E8EFE8]">
                2-Hour Microcast (15-Min Breakdown)
              </h3>
            </div>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              High-resolution rain & lightning progression for immediate play/delay decisions
            </p>
          </div>

          {/* Quick Decision Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                is9HolesSafe
                  ? 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]'
                  : 'bg-[#FDF8F3] text-[#8A6F49] dark:bg-[#2A231C] dark:text-[#D4BFA4] border border-[#F9F0E5] dark:border-[#3D3328]'
              }`}
            >
              {is9HolesSafe ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
                  <span>Squeeze 9 Holes: SAFE</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-[#A68A64]" />
                  <span>
                    {rainArrivalInterval
                      ? `Rain in ~${rainArrivalInterval.relativeMinutes}m`
                      : 'Showers Approaching'}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 15-Minute Timeline Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {microcast.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between min-w-[80px] ${
                m.lightningRisk === 'Severe' || m.precipitationMm > 3
                  ? 'bg-[#FDF0F0] dark:bg-[#361919]/60 border-[#F9D6D6] dark:border-[#4D2222] text-[#1B261E] dark:text-[#E8EFE8]'
                  : m.precipitationProb > 45 || m.precipitationMm > 0.5
                  ? 'bg-[#FDF8F3] dark:bg-[#2A231C]/60 border-[#F9F0E5] dark:border-[#3D3328] text-[#1B261E] dark:text-[#E8EFE8]'
                  : 'bg-[#F0F4EE] dark:bg-[#16221A] border-[#E2E8DF] dark:border-[#2A3B2E] text-[#1B261E] dark:text-[#E8EFE8]'
              }`}
            >
              <div className="text-[11px] font-bold font-mono text-[#6B7D6A] dark:text-[#9FB19E]">
                {m.relativeMinutes === 0 ? 'Now' : `+${m.relativeMinutes}m`}
              </div>
              <div className="text-xs font-semibold my-0.5">{m.time}</div>

              {/* Rain or Weather Icon */}
              <div className="my-1.5">
                {m.lightningRisk === 'Severe' ? (
                  <Zap className="w-5 h-5 text-[#9E3535] mx-auto" />
                ) : m.precipitationMm > 2 ? (
                  <CloudRain className="w-5 h-5 text-blue-500 mx-auto" />
                ) : m.precipitationProb > 30 ? (
                  <Droplets className="w-5 h-5 text-cyan-600 mx-auto" />
                ) : (
                  <Sun className="w-5 h-5 text-[#A68A64] mx-auto" />
                )}
              </div>

              <div className="font-mono text-xs font-bold">
                {m.precipitationMm > 0 ? `${m.precipitationMm}mm` : `${m.precipitationProb}%`}
              </div>

              <div
                className={`text-[10px] mt-1.5 font-bold px-2 py-0.5 rounded-full ${
                  m.golfability >= 80
                    ? 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1]'
                    : m.golfability >= 60
                    ? 'bg-[#FDF8F3] text-[#8A6F49] dark:bg-[#2A231C] dark:text-[#D4BFA4]'
                    : 'bg-[#FDF0F0] text-[#9E3535] dark:bg-[#361919] dark:text-[#F08585]'
                }`}
              >
                {m.golfability}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Golfer Meteorological Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temp & Feels Like */}
        <div className="bg-white dark:bg-[#1A261E] p-5 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7D6A] dark:text-[#9FB19E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Thermal Load</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1B261E] dark:text-[#E8EFE8]">
            {displayTemp(current.tempC)}
          </div>
          <div className="text-xs font-semibold text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            Feels like {displayTemp(current.feelsLikeC)}
          </div>
          <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-2 border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-2">
            {current.feelsLikeC > 34
              ? 'High heat index: Drink 1L water every 6 holes'
              : 'Comfortable playing temperature'}
          </p>
        </div>

        {/* Card 2: Wind & Direction */}
        <div className="bg-white dark:bg-[#1A261E] p-5 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7D6A] dark:text-[#9FB19E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wind Vector</span>
            <Wind className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1B261E] dark:text-[#E8EFE8] flex items-center gap-1.5">
            <span>{displayWind(current.windSpeedKmh)}</span>
            <span className="text-xs font-normal text-[#6B7D6A]">
              {current.windDirectionText}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            Gusts up to {displayWind(current.windGustKmh)}
          </div>
          <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-2 border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-2">
            {current.windSpeedKmh > 20
              ? '1-2 clubs difference on into-wind approaches'
              : 'True ball flight, minimal crosswind drift'}
          </p>
        </div>

        {/* Card 3: UV Index & Solar Protection */}
        <div className="bg-white dark:bg-[#1A261E] p-5 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7D6A] dark:text-[#9FB19E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Solar UV Radiation</span>
            <Sun className="w-4 h-4 text-[#A68A64]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1B261E] dark:text-[#E8EFE8]">
            {current.uvIndex.toFixed(0)} <span className="text-xs font-normal text-[#6B7D6A]">Index</span>
          </div>
          <div className="text-xs font-semibold text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
            {current.uvIndex >= 9 ? 'Extreme UV (Burn in <15m)' : current.uvIndex >= 6 ? 'High UV (SPF 50+)' : 'Low UV'}
          </div>
          <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-2 border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-2">
            {current.uvIndex >= 8
              ? 'Wear UV arm sleeves, polarized eyewear & bucket hat'
              : 'Standard sun protection'}
          </p>
        </div>

        {/* Card 4: Air Quality (PSI/AQI) & Daylight */}
        <div className="bg-white dark:bg-[#1A261E] p-5 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7D6A] dark:text-[#9FB19E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Air Quality & Daylight</span>
            <Activity className="w-4 h-4 text-[#6B7D6A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1B261E] dark:text-[#E8EFE8] flex items-center justify-between">
            <span>{current.sgTelemetry ? `PSI ${current.sgTelemetry.airQuality.psi}` : `AQI ${current.aqi}`}</span>
            <span className="text-xs font-bold text-[#2D4635] bg-[#E8EDDF] dark:bg-[#233327] dark:text-[#A8C2A1] px-2.5 py-0.5 rounded-full">
              {current.aqiStatus}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5 flex items-center gap-2">
            <Sunset className="w-3.5 h-3.5 text-[#A68A64]" />
            <span>Sunset at {current.sunsetTime}</span>
          </div>
          <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-2 border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-2">
            {current.sgTelemetry ? `PM2.5: ${current.sgTelemetry.airQuality.pm25} µg/m³ • Region: ${current.sgTelemetry.airQuality.region.toUpperCase()}` : 'Clean air conditions: Ideal for 4.5h outdoor cardio.'}
          </p>
        </div>
      </div>

      {/* Official Singapore Data.gov.sg Telemetry Badge & Station Ribbon */}
      {current.sgTelemetry && (
        <div className="bg-[#E8EDDF] dark:bg-[#233327] rounded-3xl p-5 sm:p-6 border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2D4635] text-white">
                <Radio className="w-4 h-4 text-[#A8C2A1] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-[#1B261E] dark:text-[#E8EFE8]">
                    Data.gov.sg Real-Time Meteorological Ground Stations
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-[#16221A]/80 text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
                    10 Active APIs
                  </span>
                </div>
                <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E]">
                  Ground-truth sensor calibration for {course.name} ({course.region})
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-[#2D4635] dark:text-[#A8C2A1] font-semibold bg-white/70 dark:bg-[#16221A]/70 px-3 py-1.5 rounded-full border border-[#DCE3D4] dark:border-[#2F4435] self-start sm:self-auto">
              2-Hr Zone: {current.sgTelemetry.twoHourForecast.area} ({current.sgTelemetry.twoHourForecast.forecast})
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-[#1A261E] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <div className="text-[#6B7D6A] text-[11px] font-semibold flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <span>Station Air Temp</span>
              </div>
              <div className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] mt-1 font-mono">
                {current.sgTelemetry.airTemperature.celsius}°C
              </div>
              <div className="text-[10px] text-[#6B7D6A] truncate mt-0.5">
                {current.sgTelemetry.airTemperature.stationName}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1A261E] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <div className="text-[#6B7D6A] text-[11px] font-semibold flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <span>Perimeter Rain Gauge</span>
              </div>
              <div className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] mt-1 font-mono">
                {current.sgTelemetry.rainfall.rainfallMm} mm/h
              </div>
              <div className="text-[10px] text-[#6B7D6A] truncate mt-0.5">
                {current.sgTelemetry.rainfall.stationName}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1A261E] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <div className="text-[#6B7D6A] text-[11px] font-semibold flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <span>Surface Anemometer</span>
              </div>
              <div className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] mt-1 font-mono">
                {current.sgTelemetry.windSpeed.speedKmh} km/h
              </div>
              <div className="text-[10px] text-[#6B7D6A] truncate mt-0.5">
                {current.sgTelemetry.windSpeed.stationName}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#1A261E] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E]">
              <div className="text-[#6B7D6A] text-[11px] font-semibold flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
                <span>Solar UV & Humidity</span>
              </div>
              <div className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] mt-1 font-mono">
                UV {current.sgTelemetry.uv.index} • {current.sgTelemetry.relativeHumidity.percent}% RH
              </div>
              <div className="text-[10px] text-[#6B7D6A] truncate mt-0.5">
                National Sensor Grid
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Course Conditions & Caddy Tactical Matrix */}
      <div className="bg-[#2D4635] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-[#3D5C48]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#A8C2A1]" />
            <h3 className="font-bold text-base sm:text-lg">Course Conditions & Caddy Matrix</h3>
          </div>
          <span className="text-xs text-[#A8C2A1] font-mono">
            {course.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#395843] p-4 rounded-2xl border border-[#4D715B]">
            <div className="text-xs text-[#A8C2A1] font-medium">Putting Greens</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {score.courseCondition.greens}
            </div>
            <p className="text-xs text-[#D4E7D2] mt-1">
              {score.courseCondition.greens === 'Fast & Firm'
                ? 'Stimp 10.5–11.0: Aggressive rollout on putts; hold lines true.'
                : 'Stimp 9.0: Soft greens bite aggressively; target the pin directly.'}
            </p>
          </div>

          <div className="bg-[#395843] p-4 rounded-2xl border border-[#4D715B]">
            <div className="text-xs text-[#A8C2A1] font-medium">Fairway Roll-Out</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {score.courseCondition.fairways}
            </div>
            <p className="text-xs text-[#D4E7D2] mt-1">
              {score.courseCondition.fairways.includes('Maximum Roll')
                ? 'Firm baked fairways yield +15 to +20 yards on tee shots.'
                : 'Normal fairway turf interaction; moderate rollout on center drives.'}
            </p>
          </div>

          <div className="bg-[#395843] p-4 rounded-2xl border border-[#4D715B]">
            <div className="text-xs text-[#A8C2A1] font-medium">Sand Bunkers</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {score.courseCondition.bunkers}
            </div>
            <p className="text-xs text-[#D4E7D2] mt-1">
              {score.courseCondition.bunkers === 'Dry / Fluffy'
                ? 'Use high bounce wedge (10°–14°); slide smoothly through sand.'
                : 'Compacted wet sand: Use square blade, less bounce to avoid bouncing into ball.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#23382A] border border-[#344E3C] rounded-2xl flex items-start gap-3 text-xs text-[#DCE8DB]">
          <Shield className="w-5 h-5 text-[#A8C2A1] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Caddy Shot Adjustment: </span>
            {score.clubAdjustment}
          </div>
        </div>
      </div>

      {/* 5. Navigation Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          id="goto-today-button"
          onClick={() => onNavigateTab('today')}
          className="group p-5 bg-white dark:bg-[#1A261E] hover:bg-[#F0F4EE] dark:hover:bg-[#233327] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] hover:border-[#2D4635] dark:hover:border-[#A8C2A1] text-left transition shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#6B7D6A] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1] mb-2">
              <Layers className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1]">
              Today View (24h)
            </h4>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-1">
              Ranked Golden Tee Times & Hourly breakdown for the next 24 hours.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2D4635] dark:text-[#A8C2A1] mt-3 block">
            View 24h Windows →
          </span>
        </button>

        <button
          id="goto-week-button"
          onClick={() => onNavigateTab('week')}
          className="group p-5 bg-white dark:bg-[#1A261E] hover:bg-[#F0F4EE] dark:hover:bg-[#233327] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] hover:border-[#2D4635] dark:hover:border-[#A8C2A1] text-left transition shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#6B7D6A] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1] mb-2">
              <Clock className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1]">
              Week View (7-Day Planning)
            </h4>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-1">
              Plan advance tee times, pick the best day, and drill down into hourly curves.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2D4635] dark:text-[#A8C2A1] mt-3 block">
            Plan 7 Days →
          </span>
        </button>

        <button
          id="goto-live-radar-button"
          onClick={() => onNavigateTab('live')}
          className="group p-5 bg-white dark:bg-[#1A261E] hover:bg-[#F0F4EE] dark:hover:bg-[#233327] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] hover:border-[#2D4635] dark:hover:border-[#A8C2A1] text-left transition shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#6B7D6A] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1] mb-2">
              <Compass className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm text-[#1B261E] dark:text-[#E8EFE8] group-hover:text-[#2D4635] dark:group-hover:text-[#A8C2A1]">
              Live Radar & Wind Compass
            </h4>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-1">
              Doppler storm tracker, lightning strike rings, and hole heading alignment.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2D4635] dark:text-[#A8C2A1] mt-3 block">
            Open Radar & Compass →
          </span>
        </button>
      </div>
    </div>
  );
};

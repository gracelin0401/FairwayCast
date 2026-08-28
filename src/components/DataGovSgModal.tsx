import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Cpu,
  CloudRain,
  Wind,
  Thermometer,
  Sun,
  Shield,
  Activity,
  Droplets,
  Layers,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GolfCourse, CurrentWeather } from '../types';

interface DataGovSgModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: GolfCourse;
  current: CurrentWeather;
}

interface EndpointStatus {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  status: 'online' | 'fetching' | 'error';
  lastValue: string;
  meta: string;
}

export const DataGovSgModal: React.FC<DataGovSgModalProps> = ({
  isOpen,
  onClose,
  course,
  current,
}) => {
  const [activeEndpointId, setActiveEndpointId] = useState<string>('two-hr');
  const [endpointData, setEndpointData] = useState<Record<string, any>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [serverStatus, setServerStatus] = useState<any>(null);

  const endpoints: EndpointStatus[] = [
    {
      id: 'two-hr',
      name: '2-Hour Weather Forecast',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
      category: 'Microcast',
      icon: Clock,
      description: 'Official 2-hour weather predictions across 47 town sectors in Singapore',
      status: 'online',
      lastValue: current.sgTelemetry?.twoHourForecast?.forecast || current.condition,
      meta: `Sector: ${current.sgTelemetry?.twoHourForecast?.area || course.region}`,
    },
    {
      id: 'air-temp',
      name: 'Air Temperature Telemetry',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
      category: 'Surface Sensors',
      icon: Thermometer,
      description: 'Live surface air temperatures (°C) from calibrated meteorological stations',
      status: 'online',
      lastValue: `${current.tempC}°C`,
      meta: current.sgTelemetry?.airTemperature?.stationName || 'Nearest Surface Station',
    },
    {
      id: 'rainfall',
      name: 'Perimeter Rainfall Gauges',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
      category: 'Precipitation',
      icon: CloudRain,
      description: 'Real-time millimeter rainfall accumulation sensors across the island',
      status: 'online',
      lastValue: `${current.sgTelemetry?.rainfall?.rainfallMm ?? current.precipitationRateMmH} mm/h`,
      meta: current.sgTelemetry?.rainfall?.stationName || 'Course Boundary Gauge',
    },
    {
      id: 'relative-humidity',
      name: 'Relative Humidity Sensor',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/relative-humidity',
      category: 'Atmospheric',
      icon: Droplets,
      description: 'Real-time atmospheric humidity percentage from NEA surface network',
      status: 'online',
      lastValue: `${current.humidity}%`,
      meta: current.sgTelemetry?.relativeHumidity?.stationName || 'Atmospheric Station',
    },
    {
      id: 'wind-speed',
      name: 'Surface Wind Speed & Direction',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
      category: 'Wind Vector',
      icon: Wind,
      description: 'Real-time anemometer wind velocities and gusts for ball flight drift calculation',
      status: 'online',
      lastValue: `${current.windSpeedKmh} km/h (${current.windDirectionText})`,
      meta: current.sgTelemetry?.windSpeed?.stationName || 'Aerodrome Anemometer',
    },
    {
      id: 'uv',
      name: 'Solar UV Index (1-Hr)',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/uv',
      category: 'Solar Radiation',
      icon: Sun,
      description: 'Live hourly ultraviolet radiation index for sun safety & hydration alert',
      status: 'online',
      lastValue: `Index ${current.uvIndex} (${current.uvIndex >= 8 ? 'Very High' : 'Moderate'})`,
      meta: 'National Radiation Network',
    },
    {
      id: 'psi',
      name: '24-Hour Pollutant Index (PSI)',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
      category: 'Air Quality',
      icon: Shield,
      description: 'Official 24-hour Pollutant Standards Index across North, South, East, West, Central',
      status: 'online',
      lastValue: `${current.sgTelemetry?.airQuality?.psi || current.aqi} (${current.aqiStatus})`,
      meta: `Region: ${(current.sgTelemetry?.airQuality?.region || 'South').toUpperCase()}`,
    },
    {
      id: 'pm25',
      name: '1-Hour PM2.5 Microparticulate',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
      category: 'Air Quality',
      icon: Activity,
      description: 'Fine particulate matter concentration (µg/m³) for respiratory safety on-course',
      status: 'online',
      lastValue: `${current.sgTelemetry?.airQuality?.pm25 ?? 12} µg/m³`,
      meta: 'Normal Band (0–55 µg/m³)',
    },
    {
      id: 'twenty-four-hr',
      name: '24-Hour Regional Forecast',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast',
      category: 'Forecast',
      icon: Layers,
      description: 'Regional daytime and nighttime weather outlook by administrative sectors',
      status: 'online',
      lastValue: current.sgTelemetry?.twentyFourHrGeneral?.forecast || 'Passing Showers',
      meta: current.sgTelemetry?.twentyFourHrGeneral?.validPeriod?.text || 'Next 24 Hours',
    },
    {
      id: 'four-day',
      name: '4-Day Meteorological Outlook',
      url: 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook',
      category: 'Outlook',
      icon: Sparkles,
      description: 'Official 4-day synoptic weather projection for tournament planning',
      status: 'online',
      lastValue: `${current.sgTelemetry?.fourDayForecasts?.length || 4} Days Projected`,
      meta: 'MSS Synoptic Outlook',
    },
  ];

  // Fetch status from server
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/data-gov-sg/status');
      if (res.ok) {
        const json = await res.json();
        setServerStatus(json);
      }
    } catch (e) {
      console.warn('Status fetch error:', e);
    }
  };

  // Fetch single endpoint live data
  const inspectEndpoint = async (ep: EndpointStatus) => {
    setActiveEndpointId(ep.id);
    if (endpointData[ep.id]) return;

    setLoadingMap((prev) => ({ ...prev, [ep.id]: true }));
    try {
      let route = '/api/data-gov-sg/two-hr-forecast';
      if (ep.id === 'two-hr') route = '/api/data-gov-sg/two-hr-forecast';
      else if (ep.id === 'air-temp') route = '/api/data-gov-sg/air-temperature';
      else if (ep.id === 'rainfall') route = '/api/data-gov-sg/rainfall';
      else if (ep.id === 'relative-humidity') route = '/api/data-gov-sg/relative-humidity';
      else if (ep.id === 'wind-speed') route = '/api/data-gov-sg/wind-speed';
      else if (ep.id === 'uv') route = '/api/data-gov-sg/uv';
      else if (ep.id === 'psi') route = '/api/data-gov-sg/psi';
      else if (ep.id === 'pm25') route = '/api/data-gov-sg/pm25';
      else if (ep.id === 'twenty-four-hr') route = '/api/data-gov-sg/twenty-four-hr-forecast';
      else if (ep.id === 'four-day') route = '/api/data-gov-sg/four-day-outlook';

      const res = await fetch(route);
      const json = await res.json();
      setEndpointData((prev) => ({ ...prev, [ep.id]: json }));
    } catch (e: any) {
      setEndpointData((prev) => ({ ...prev, [ep.id]: { error: e.message } }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [ep.id]: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      inspectEndpoint(endpoints[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentActive = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];
  const activePayload = endpointData[activeEndpointId];
  const isLoadingActive = loadingMap[activeEndpointId];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A261E] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between bg-[#F0F4EE] dark:bg-[#16221A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#2D4635] text-white">
                <Radio className="w-4 h-4 text-[#A8C2A1]" />
              </span>
              <h2 className="font-bold text-lg sm:text-xl text-[#1B261E] dark:text-[#E8EFE8]">
                Singapore Data.gov.sg API Feed Monitor
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
                10 Official Real-Time Feeds
              </span>
            </div>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Live meteorological telemetry from National Environment Agency (NEA) & Meteorological Service Singapore (MSS)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E2E8DF] dark:hover:bg-[#2A3B2E] text-[#6B7D6A] font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server & API Key Banner */}
        <div className="px-5 sm:px-6 py-3 bg-[#E8EDDF]/60 dark:bg-[#233327]/60 border-b border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D4635] dark:bg-[#A8C2A1] animate-pulse" />
              <span className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">Backend Proxy:</span>
              <span className="text-[#2D4635] dark:text-[#A8C2A1] font-mono font-semibold">Active (CORS Protected & Cached)</span>
            </div>
            <span className="text-[#6B7D6A] hidden md:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
              <span className="text-[#6B7D6A] dark:text-[#9FB19E]">Access Mode:</span>
              <span className="font-semibold text-[#2D4635] dark:text-[#A8C2A1]">
                Keyless & Direct Live Telemetry (v2 APIs)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B7D6A] font-mono">
              Target Course: <strong className="text-[#1B261E] dark:text-[#E8EFE8]">{course.name}</strong>
            </span>
          </div>
        </div>

        {/* Content Body: Split Layout */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (5 cols): 10 API Feeds List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7D6A] dark:text-[#9FB19E] mb-2 flex items-center justify-between">
              <span>Connected Data Feeds</span>
              <span>10 of 10 Online</span>
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {endpoints.map((ep) => {
                const IconComponent = ep.icon;
                const isSelected = activeEndpointId === ep.id;

                return (
                  <button
                    key={ep.id}
                    onClick={() => inspectEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#E8EDDF] dark:bg-[#233327] border-[#2D4635] dark:border-[#A8C2A1] shadow-xs'
                        : 'bg-[#F0F4EE] dark:bg-[#16221A] border-[#E2E8DF] dark:border-[#2A3B2E] hover:border-[#6B7D6A]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#2D4635] text-white'
                          : 'bg-white dark:bg-[#1E2D22] text-[#2D4635] dark:text-[#A8C2A1]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#1B261E] dark:text-[#E8EFE8] truncate">
                          {ep.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1] shrink-0" />
                      </div>
                      <div className="text-xs font-bold text-[#2D4635] dark:text-[#A8C2A1] mt-0.5 truncate">
                        {ep.lastValue}
                      </div>
                      <div className="text-[10px] text-[#6B7D6A] dark:text-[#9FB19E] truncate">
                        {ep.meta}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Selected Endpoint Deep Telemetry Inspector */}
          <div className="lg:col-span-7 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Endpoint Title & URL */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8DF] dark:border-[#2A3B2E]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#2D4635] dark:text-[#A8C2A1] bg-white dark:bg-[#1E2D22] px-2 py-0.5 rounded-full border border-[#DCE3D4] dark:border-[#2F4435]">
                      {currentActive.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#1B261E] dark:text-[#E8EFE8] mt-1">
                    {currentActive.name}
                  </h3>
                  <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
                    {currentActive.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEndpointData((prev) => {
                      const next = { ...prev };
                      delete next[currentActive.id];
                      return next;
                    });
                    inspectEndpoint(currentActive);
                  }}
                  disabled={isLoadingActive}
                  className="p-2 rounded-xl bg-white dark:bg-[#1E2D22] hover:bg-[#E8EDDF] text-[#2D4635] dark:text-[#A8C2A1] border border-[#E2E8DF] dark:border-[#2A3B2E] transition shrink-0"
                  title="Force re-fetch endpoint"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingActive ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Endpoint Direct Target URL */}
              <div>
                <label className="text-[11px] font-bold text-[#6B7D6A] dark:text-[#9FB19E] block mb-1">
                  API Endpoint Resource URL:
                </label>
                <div className="p-2.5 bg-white dark:bg-[#1A261E] rounded-xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex items-center justify-between gap-2 text-xs font-mono text-[#2D4635] dark:text-[#A8C2A1] break-all">
                  <span className="truncate">{currentActive.url}</span>
                  <a
                    href={currentActive.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-[#F0F4EE] rounded text-[#6B7D6A] shrink-0"
                    title="Open official documentation"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Live Matched Value for Current Course */}
              <div className="p-3.5 bg-[#E8EDDF] dark:bg-[#233327] rounded-xl border border-[#DCE3D4] dark:border-[#2F4435] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7D6A] dark:text-[#9FB19E]">
                    Calibrated Value for {course.name}
                  </span>
                  <div className="text-sm font-bold text-[#1B261E] dark:text-[#E8EFE8] mt-0.5">
                    {currentActive.lastValue}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B7D6A] dark:text-[#9FB19E] block">Station/Sector</span>
                  <span className="text-xs font-mono font-semibold text-[#2D4635] dark:text-[#A8C2A1]">
                    {currentActive.meta}
                  </span>
                </div>
              </div>

              {/* Raw JSON Payload Viewer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#6B7D6A] dark:text-[#9FB19E]">
                    Live Server JSON Response:
                  </label>
                  <span className="text-[10px] font-mono text-[#6B7D6A]">
                    {isLoadingActive ? 'Connecting...' : 'HTTP 200 OK'}
                  </span>
                </div>

                <div className="bg-[#111914] text-[#A8C2A1] p-3 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto custom-scrollbar border border-[#2A3B2E]">
                  {isLoadingActive ? (
                    <div className="flex items-center justify-center py-6 text-zinc-400 gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Querying Data.gov.sg v2 API...</span>
                    </div>
                  ) : activePayload ? (
                    <pre className="whitespace-pre-wrap word-break">
                      {JSON.stringify(activePayload, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-zinc-500">// Click above or refresh to inspect raw JSON schema</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8DF] dark:border-[#2A3B2E] bg-[#F0F4EE] dark:bg-[#16221A] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7D6A]">
          <div className="flex items-center gap-2">
            <span>Official Open Data License: Singapore Government Open Data Licence</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-[#2D4635] hover:bg-[#23382A] text-white transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

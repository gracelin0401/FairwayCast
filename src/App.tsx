/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CurrentWeather,
  DailyForecast,
  GolfCourse,
  GolfabilityScore,
  HourlyForecast,
  LightningAlert,
  MicrocastInterval,
  TeeTimeWindow,
} from './types';
import { POPULAR_GOLF_COURSES } from './data/courses';
import { calculateGolfability } from './utils/golfability';
import { fetchCourseWeatherData } from './utils/weatherApi';
import { Navbar } from './components/Navbar';
import { LightningAlertBanner } from './components/LightningAlertBanner';
import { NowView } from './components/NowView';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { LiveConditionsView } from './components/LiveConditionsView';
import { HourlyBreakdownModal } from './components/HourlyBreakdownModal';
import { StrategyMiroBoard } from './components/StrategyMiroBoard';
import { TeeTimePlannerModal } from './components/TeeTimePlannerModal';
import { DataGovSgModal } from './components/DataGovSgModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse>(POPULAR_GOLF_COURSES[0]);
  const [activeTab, setActiveTab] = useState<'now' | 'today' | 'week' | 'live' | 'miro'>('now');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Weather data state
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [lightningAlert, setLightningAlert] = useState<LightningAlert | null>(null);
  const [microcast, setMicrocast] = useState<MicrocastInterval[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [goldenWindows, setGoldenWindows] = useState<TeeTimeWindow[]>([]);
  const [golfabilityScore, setGolfabilityScore] = useState<GolfabilityScore | null>(null);

  // Modal states
  const [hourlyModalOpen, setHourlyModalOpen] = useState<boolean>(false);
  const [hourlyModalDayTitle, setHourlyModalDayTitle] = useState<string>('Today');
  const [hourlyModalData, setHourlyModalData] = useState<HourlyForecast[]>([]);
  const [hourlyModalInitialHour, setHourlyModalInitialHour] = useState<number | undefined>(undefined);
  const [plannerModalOpen, setPlannerModalOpen] = useState<boolean>(false);
  const [dataGovSgModalOpen, setDataGovSgModalOpen] = useState<boolean>(false);

  // Load weather when course changes
  const loadWeatherData = async (course: GolfCourse, showRefreshAnim = false) => {
    if (showRefreshAnim) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchCourseWeatherData(course);
      setCurrentWeather(data.current);
      setLightningAlert(data.lightning);
      setMicrocast(data.microcast);
      setHourlyForecast(data.hourly);
      setDailyForecast(data.daily);
      setGoldenWindows(data.goldenWindows);

      // Compute primary score
      const calcScore = calculateGolfability(data.current, data.lightning);
      setGolfabilityScore(calcScore);
    } catch (err) {
      console.error('Failed loading course weather data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeatherData(selectedCourse);
  }, [selectedCourse]);

  // Handler for inspecting hourly from Today view
  const handleOpenHourlyFromToday = (selectedHour?: number) => {
    setHourlyModalDayTitle('Today (Next 24 Hours)');
    setHourlyModalData(hourlyForecast);
    setHourlyModalInitialHour(selectedHour);
    setHourlyModalOpen(true);
  };

  // Handler for inspecting hourly from Week view day selection
  const handleSelectDayFromWeek = (day: DailyForecast) => {
    setHourlyModalDayTitle(`${day.dayName} (${day.shortDate})`);
    setHourlyModalData(day.hourly);
    setHourlyModalInitialHour(undefined);
    setHourlyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-[#111914] text-[#1B261E] dark:text-[#E8EFE8] flex flex-col font-sans selection:bg-[#2D4635] selection:text-white transition-colors">
      {/* Top Navbar & View Switcher */}
      <Navbar
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unit={unit}
        onToggleUnit={() => setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'))}
        isRefreshing={isRefreshing}
        onRefresh={() => loadWeatherData(selectedCourse, true)}
        onOpenPlanner={() => setPlannerModalOpen(true)}
        onOpenDataGovSg={() => setDataGovSgModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading || !currentWeather || !golfabilityScore || !lightningAlert ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 text-[#2D4635] dark:text-[#A8C2A1] animate-spin" />
            <p className="text-sm font-medium text-[#6B7D6A] font-mono">
              Calibrating Doppler Radar & Golfability Index for {selectedCourse.name}...
            </p>
          </div>
        ) : (
          <div>
            {/* Prominent High-Priority Lightning Alert Banner (Visible on all weather tabs) */}
            {activeTab !== 'miro' && (
              <LightningAlertBanner lightning={lightningAlert} />
            )}

            {/* View 1: Home / Now View */}
            {activeTab === 'now' && (
              <NowView
                course={selectedCourse}
                current={currentWeather}
                score={golfabilityScore}
                lightning={lightningAlert}
                microcast={microcast}
                unit={unit}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenPlanner={() => setPlannerModalOpen(true)}
              />
            )}

            {/* View 2: Today View (24 Hours) */}
            {activeTab === 'today' && (
              <TodayView
                course={selectedCourse}
                hourly={hourlyForecast}
                goldenWindows={goldenWindows}
                unit={unit}
                onOpenHourlyBreakdown={handleOpenHourlyFromToday}
              />
            )}

            {/* View 3: Week View (7-Day Planning) */}
            {activeTab === 'week' && (
              <WeekView
                course={selectedCourse}
                daily={dailyForecast}
                unit={unit}
                onSelectDay={handleSelectDayFromWeek}
              />
            )}

            {/* View 4: Live Conditions, Radar & Wind Compass */}
            {activeTab === 'live' && (
              <LiveConditionsView
                course={selectedCourse}
                current={currentWeather}
                lightning={lightningAlert}
                unit={unit}
              />
            )}

            {/* View 5: Miro Product Strategy Board */}
            {activeTab === 'miro' && <StrategyMiroBoard />}
          </div>
        )}
      </main>

      {/* Hourly Breakdown Modal (shared across Today & Week view drilldowns) */}
      {currentWeather && (
        <HourlyBreakdownModal
          course={selectedCourse}
          isOpen={hourlyModalOpen}
          onClose={() => setHourlyModalOpen(false)}
          dayTitle={hourlyModalDayTitle}
          hourlyData={hourlyModalData}
          unit={unit}
          initialSelectedHour={hourlyModalInitialHour}
        />
      )}

      {/* Round Weather Planner & Gear Checklist Modal */}
      {currentWeather && (
        <TeeTimePlannerModal
          course={selectedCourse}
          isOpen={plannerModalOpen}
          onClose={() => setPlannerModalOpen(false)}
          hourly={hourlyForecast}
          unit={unit}
        />
      )}

      {/* Singapore Data.gov.sg 10-Endpoint Telemetry Modal */}
      {currentWeather && (
        <DataGovSgModal
          course={selectedCourse}
          isOpen={dataGovSgModalOpen}
          onClose={() => setDataGovSgModalOpen(false)}
          current={currentWeather}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E2E8DF] dark:border-[#2A3B2E] bg-white/70 dark:bg-[#16221A]/70 py-6 text-xs text-[#6B7D6A] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[#2D4635] dark:text-[#E8EFE8]">FairwayCast</span> • Actionable Golf Meteorological System
          </div>
          <div className="flex items-center gap-4">
            <span>Course Safety 30/30 Protocol</span>
            <span>•</span>
            <span>Doppler Microcast Engine</span>
            <span>•</span>
            <span>Natural Tones Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

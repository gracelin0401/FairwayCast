import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  Calendar,
  Clock,
  Radio,
  Layers,
  Thermometer,
  RefreshCw,
  ChevronDown,
  Kanban,
  MessageSquare,
} from 'lucide-react';
import { GolfCourse } from '../types';
import { POPULAR_GOLF_COURSES } from '../data/courses';

interface NavbarProps {
  selectedCourse: GolfCourse;
  onSelectCourse: (course: GolfCourse) => void;
  activeTab: 'now' | 'today' | 'week' | 'live' | 'community' | 'miro';
  onChangeTab: (tab: 'now' | 'today' | 'week' | 'live' | 'community' | 'miro') => void;
  unit: 'metric' | 'imperial';
  onToggleUnit: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenPlanner: () => void;
  onOpenDataGovSg?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCourse,
  onSelectCourse,
  activeTab,
  onChangeTab,
  unit,
  onToggleUnit,
  isRefreshing,
  onRefresh,
  onOpenPlanner,
  onOpenDataGovSg,
}) => {
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = POPULAR_GOLF_COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCourse: GolfCourse = {
            id: 'current-gps-location',
            name: 'Local Course (Current GPS)',
            region: 'Current Location',
            country: 'Local',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            holes: 18,
            par: 72,
            elevationM: 10,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            typicalMicroclimate: 'Local GPS coordinates weather station',
            defaultHoleHeadingDeg: 90,
          };
          onSelectCourse(userCourse);
          setCourseDropdownOpen(false);
        },
        (err) => {
          alert('Could not retrieve GPS location. Please select a course from the list.');
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#16221A]/95 backdrop-blur-md border-b border-[#E2E8DF] dark:border-[#2A3B2E] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-[#2D4635] text-white flex items-center justify-center shadow-md shadow-[#2D4635]/20 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#1B261E] dark:text-[#E8EFE8] tracking-tight">
                  FairwayCast
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
                  Golf Weather Intelligence
                </span>
              </div>
              <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] truncate hidden md:block">
                Actionable Playability & Lightning Radar
              </p>
            </div>
          </div>

          {/* Center: Course Selector Pill */}
          <div className="relative">
            <button
              id="course-selector-button"
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#F0F4EE] dark:bg-[#1E2D22] hover:bg-[#E8EDDF] dark:hover:bg-[#26382B] text-[#1B261E] dark:text-[#E8EFE8] border border-[#E2E8DF] dark:border-[#2A3B2E] transition shadow-xs text-xs sm:text-sm font-medium max-w-[200px] sm:max-w-[280px]"
            >
              <MapPin className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1] shrink-0" />
              <span className="truncate text-left">{selectedCourse.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7D6A] shrink-0 ml-auto" />
            </button>

            {courseDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A261E] rounded-3xl shadow-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl mb-2">
                  <Search className="w-4 h-4 text-[#6B7D6A]" />
                  <input
                    type="text"
                    placeholder="Search golf club or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm text-[#1B261E] dark:text-[#E8EFE8] outline-none w-full placeholder:text-[#6B7D6A]"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#2D4635] dark:text-[#A8C2A1] bg-[#E8EDDF] dark:bg-[#233327] hover:bg-[#DCE3D4] dark:hover:bg-[#2F4435] mb-2 transition"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use My Current GPS Location</span>
                </button>

                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7D6A] px-2 py-1">
                  Premier Golf Courses
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCourses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCourse(c);
                        setCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs transition flex items-start justify-between ${
                        selectedCourse.id === c.id
                          ? 'bg-[#2D4635] text-white font-semibold shadow-xs'
                          : 'hover:bg-[#F0F4EE] dark:hover:bg-[#233327] text-[#1B261E] dark:text-[#E8EFE8]'
                      }`}
                    >
                      <div>
                        <div className="font-medium truncate">{c.name}</div>
                        <div
                          className={`text-[11px] ${
                            selectedCourse.id === c.id
                              ? 'text-[#A8C2A1]'
                              : 'text-[#6B7D6A]'
                          }`}
                        >
                          {c.region}, {c.country}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          selectedCourse.id === c.id
                            ? 'bg-[#3D5C48] text-white'
                            : 'bg-[#E8EDDF] dark:bg-[#1E2D22] text-[#2D4635] dark:text-[#A8C2A1]'
                        }`}
                      >
                        Par {c.par}
                      </span>
                    </button>
                  ))}
                  {filteredCourses.length === 0 && (
                    <div className="text-center py-4 text-xs text-[#6B7D6A]">
                      No courses found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Tools & Planner */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenDataGovSg && (
              <button
                id="data-gov-sg-status-button"
                onClick={onOpenDataGovSg}
                title="View 10 Data.gov.sg real-time meteorological API feeds"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D4635] dark:text-[#A8C2A1] bg-[#E8EDDF] dark:bg-[#233327] hover:bg-[#DCE3D4] dark:hover:bg-[#2F4435] border border-[#DCE3D4] dark:border-[#2F4435] transition shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1] animate-pulse" />
                <span>10 Live Feeds</span>
              </button>
            )}

            <button
              id="round-planner-button"
              onClick={onOpenPlanner}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#2D4635] text-white hover:bg-[#233729] transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A8C2A1]" />
              <span>Round Planner</span>
            </button>

            <button
              id="unit-toggle-button"
              onClick={onToggleUnit}
              title={`Switch to ${unit === 'metric' ? 'Imperial (°F, mph)' : 'Metric (°C, km/h)'}`}
              className="px-3 py-2 rounded-full text-xs font-mono font-semibold text-[#2D4635] dark:text-[#A8C2A1] bg-[#F0F4EE] dark:bg-[#1E2D22] hover:bg-[#E8EDDF] dark:hover:bg-[#26382B] border border-[#E2E8DF] dark:border-[#2A3B2E] transition"
            >
              {unit === 'metric' ? '°C | km/h' : '°F | mph'}
            </button>

            <button
              id="refresh-weather-button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh live telemetry"
              className="p-2.5 rounded-full text-[#2D4635] dark:text-[#A8C2A1] bg-[#F0F4EE] dark:bg-[#1E2D22] hover:bg-[#E8EDDF] dark:hover:bg-[#26382B] border border-[#E2E8DF] dark:border-[#2A3B2E] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2D4635]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar border-t border-[#E2E8DF] dark:border-[#2A3B2E] pt-1.5 pb-1.5">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              id="tab-now"
              onClick={() => onChangeTab('now')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'now'
                  ? 'bg-[#E8EDDF] dark:bg-[#233327] text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#1B261E] dark:hover:text-[#E8EFE8] hover:bg-[#F0F4EE] dark:hover:bg-[#1E2D22]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Now / Live Conditions</span>
            </button>

            <button
              id="tab-today"
              onClick={() => onChangeTab('today')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'today'
                  ? 'bg-[#E8EDDF] dark:bg-[#233327] text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#1B261E] dark:hover:text-[#E8EFE8] hover:bg-[#F0F4EE] dark:hover:bg-[#1E2D22]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Today View (24 Hours)</span>
            </button>

            <button
              id="tab-week"
              onClick={() => onChangeTab('week')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'week'
                  ? 'bg-[#E8EDDF] dark:bg-[#233327] text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#1B261E] dark:hover:text-[#E8EFE8] hover:bg-[#F0F4EE] dark:hover:bg-[#1E2D22]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Week View (7 Days)</span>
            </button>

            <button
              id="tab-live"
              onClick={() => onChangeTab('live')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-[#E8EDDF] dark:bg-[#233327] text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#1B261E] dark:hover:text-[#E8EFE8] hover:bg-[#F0F4EE] dark:hover:bg-[#1E2D22]'
              }`}
            >
              <Radio className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1]" />
              <span>Live Radar & Wind</span>
            </button>

            <button
              id="tab-community"
              onClick={() => onChangeTab('community')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'community'
                  ? 'bg-[#E8EDDF] dark:bg-[#233327] text-[#2D4635] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#1B261E] dark:hover:text-[#E8EFE8] hover:bg-[#F0F4EE] dark:hover:bg-[#1E2D22]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1]" />
              <span>Clubhouse Chat</span>
            </button>

            <button
              id="tab-miro"
              onClick={() => onChangeTab('miro')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'miro'
                  ? 'bg-[#FDF8F3] dark:bg-[#2A231C] text-[#8A6F49] dark:text-[#D4BFA4] border border-[#F9F0E5] dark:border-[#3D3328] shadow-xs'
                  : 'text-[#6B7D6A] dark:text-[#9FB19E] hover:text-[#8A6F49] hover:bg-[#FDF8F3] dark:hover:bg-[#2A231C]'
              }`}
            >
              <Kanban className="w-4 h-4 text-[#A68A64]" />
              <span>Miro Strategy Board</span>
            </button>
          </nav>

          <button
            onClick={onOpenPlanner}
            className="lg:hidden flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#2D4635] text-white rounded-full shrink-0 ml-2"
          >
            <Sparkles className="w-3 h-3 text-[#A8C2A1]" />
            <span>Planner</span>
          </button>
        </div>
      </div>
    </header>
  );
};

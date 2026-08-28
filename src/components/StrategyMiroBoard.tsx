import React, { useState } from 'react';
import { STRATEGY_SECTIONS, StrategySectionDef } from '../data/strategyBoard';
import { StrategySticky } from '../types';
import {
  Kanban,
  Search,
  Filter,
  Layers,
  Sparkles,
  Download,
  CheckCircle,
  Tag,
  AlertTriangle,
  Users,
  Target,
  GitCommit,
  Cpu,
  Layout,
  Compass,
} from 'lucide-react';

export const StrategyMiroBoard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Collect all unique tags across stickies
  const allTags = Array.from(
    new Set(
      STRATEGY_SECTIONS.flatMap((s) => s.stickies.flatMap((sticky) => sticky.tags))
    )
  );

  const getStickyBgColor = (color: StrategySticky['color']) => {
    switch (color) {
      case 'yellow':
        return 'bg-[#FBF6EE] dark:bg-[#2C251C] border-[#EDE0CC] dark:border-[#3D3328] text-[#3D3020] dark:text-[#EAE0D2] shadow-xs';
      case 'green':
        return 'bg-[#EEF4EE] dark:bg-[#1A261E] border-[#D6E3D5] dark:border-[#2A3B2E] text-[#1B2B1E] dark:text-[#D8E6DA] shadow-xs';
      case 'blue':
        return 'bg-[#EEF3F7] dark:bg-[#1B242C] border-[#D3E0EA] dark:border-[#293744] text-[#1D2A35] dark:text-[#D4E2EC] shadow-xs';
      case 'purple':
        return 'bg-[#F4EEF6] dark:bg-[#271E2B] border-[#E2D4E6] dark:border-[#3B2D40] text-[#321E38] dark:text-[#E4D7E8] shadow-xs';
      case 'pink':
        return 'bg-[#F8EEEE] dark:bg-[#2B1E1E] border-[#E8D4D4] dark:border-[#3E2A2A] text-[#3A2020] dark:text-[#EAD6D6] shadow-xs';
      case 'orange':
        return 'bg-[#F7EFEA] dark:bg-[#2A201A] border-[#E7D6CC] dark:border-[#3D2D23] text-[#392318] dark:text-[#E8D7CE] shadow-xs';
    }
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-[#A68A64]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />;
      case 'Target':
        return <Target className="w-5 h-5 text-[#A68A64]" />;
      case 'GitCommit':
        return <GitCommit className="w-5 h-5 text-[#6B7D6A]" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />;
      case 'Layout':
        return <Layout className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#2D4635] dark:text-[#A8C2A1]" />;
      default:
        return <Kanban className="w-5 h-5 text-[#6B7D6A]" />;
    }
  };

  const filteredSections = STRATEGY_SECTIONS.filter((sec) => {
    if (selectedSection !== 'all' && sec.id !== selectedSection) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A261E] p-6 sm:p-8 rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2D4635] text-white shadow-xs">
                Product Architecture
              </span>
              <span className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] font-mono">
                Miro Strategy Board
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1B261E] dark:text-[#E8EFE8] mt-2">
              FairwayCast Product & Strategy Map
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7D6A] dark:text-[#9FB19E] mt-1 max-w-3xl leading-relaxed">
              Complete product mapping from Problem Statement → Golfer Personas → JTBD → User Journey → Golfability Algorithm → IA → MVP & Future Roadmap. Formatted as interactive Miro-style sticky cards.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono bg-[#F0F4EE] dark:bg-[#16221A] px-3.5 py-2 rounded-full border border-[#E2E8DF] dark:border-[#2A3B2E] text-[#1B261E] dark:text-[#E8EFE8]">
              {STRATEGY_SECTIONS.reduce((acc, s) => acc + s.stickies.length, 0)} Sticky Notes
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-[#E2E8DF] dark:border-[#2A3B2E] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#F0F4EE] dark:bg-[#16221A] rounded-full border border-[#E2E8DF] dark:border-[#2A3B2E] text-xs w-full md:w-72 shadow-xs">
            <Search className="w-4 h-4 text-[#6B7D6A]" />
            <input
              type="text"
              placeholder="Search sticky notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[#1B261E] dark:text-[#E8EFE8] outline-none w-full placeholder:text-[#6B7D6A] text-xs"
            />
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedSection === 'all'
                  ? 'bg-[#2D4635] text-white shadow-xs'
                  : 'bg-[#F0F4EE] dark:bg-[#16221A] text-[#6B7D6A] dark:text-[#9FB19E] hover:bg-[#E8EDDF]'
              }`}
            >
              All Sections
            </button>
            {STRATEGY_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedSection === sec.id
                    ? 'bg-[#2D4635] text-white shadow-xs'
                    : 'bg-[#F0F4EE] dark:bg-[#16221A] text-[#6B7D6A] dark:text-[#9FB19E] hover:bg-[#E8EDDF]'
                }`}
              >
                {sec.title.split('.')[1] || sec.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections & Sticky Grid */}
      <div className="space-y-8">
        {filteredSections.map((sec) => {
          const stickiesInSec = sec.stickies.filter((st) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              st.title.toLowerCase().includes(q) ||
              st.content.some((c) => c.toLowerCase().includes(q)) ||
              st.tags.some((t) => t.toLowerCase().includes(q))
            );
          });

          if (stickiesInSec.length === 0 && searchQuery) return null;

          return (
            <div
              key={sec.id}
              className="bg-white dark:bg-[#1A261E] rounded-3xl p-6 sm:p-7 border border-[#E2E8DF] dark:border-[#2A3B2E] shadow-xs"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#F0F4EE] dark:bg-[#16221A] shrink-0 border border-[#E2E8DF] dark:border-[#2A3B2E]">
                    {getSectionIcon(sec.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg sm:text-xl text-[#1B261E] dark:text-[#E8EFE8]">
                        {sec.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1]">
                        {sec.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#6B7D6A] hidden sm:block">
                  {stickiesInSec.length} Notes
                </span>
              </div>

              {/* Sticky Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stickiesInSec.map((sticky) => (
                  <div
                    key={sticky.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[220px] ${getStickyBgColor(
                      sticky.color
                    )}`}
                  >
                    <div>
                      {/* Sticky Pin visual */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2D4635]/30 dark:bg-white/30" />
                        <span className="text-[10px] font-mono opacity-60 uppercase">
                          {sticky.id}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm leading-snug mb-3">
                        {sticky.title}
                      </h4>

                      <ul className="space-y-1.5 text-xs opacity-90 leading-relaxed">
                        {sticky.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="font-bold opacity-60">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1">
                      {sticky.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/5 dark:bg-white/10 opacity-80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

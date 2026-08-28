import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, Sparkles, RefreshCw, MapPin, ShieldAlert, CloudSun } from 'lucide-react';
import { GolfCourse } from '../types';

interface DisqusCommentsProps {
  course: GolfCourse;
  embedded?: boolean;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: () => void;
      }) => void;
    };
    disqus_config?: () => void;
  }
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({ course, embedded = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const threadElem = document.getElementById('disqus_thread');
    if (!threadElem) return;

    try {
      const pageUrl = window.location.href.split('#')[0] + `?course=${course.id}`;
      const pageIdentifier = `fairwaycast-course-${course.id}`;
      const pageTitle = `${course.name} - FairwayCast Golf Weather Discussion`;

      // Configure window.disqus_config
      window.disqus_config = function (this: any) {
        this.page.url = pageUrl;
        this.page.identifier = pageIdentifier;
        this.page.title = pageTitle;
      };

      if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
        try {
          window.DISQUS.reset({
            reload: true,
            config: function (this: any) {
              this.page.url = pageUrl;
              this.page.identifier = pageIdentifier;
              this.page.title = pageTitle;
            },
          });
          setIsLoaded(true);
        } catch (resetErr) {
          console.warn('Disqus reset notice:', resetErr);
        }
      } else {
        const existingScript = document.querySelector('script[src*="gracelin.disqus.com/embed.js"]');
        if (!existingScript) {
          const d = document;
          const s = d.createElement('script');
          s.src = 'https://gracelin.disqus.com/embed.js';
          s.setAttribute('data-timestamp', (+new Date()).toString());
          s.async = true;
          s.onload = () => setIsLoaded(true);
          s.onerror = () => {
            console.warn('Disqus embed could not be loaded directly (cross-origin or adblocker).');
          };
          (d.head || d.body).appendChild(s);
        } else {
          setIsLoaded(true);
        }
      }
    } catch (e) {
      console.warn('Disqus setup notice:', e);
    }
  }, [course.id, course.name]);

  const handleManualReset = () => {
    try {
      if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
        const pageUrl = window.location.href.split('#')[0] + `?course=${course.id}`;
        const pageIdentifier = `fairwaycast-course-${course.id}`;
        const pageTitle = `${course.name} - FairwayCast Golf Weather Discussion`;
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = pageUrl;
            this.page.identifier = pageIdentifier;
            this.page.title = pageTitle;
          },
        });
      }
    } catch (e) {
      console.warn('Disqus manual reload notice:', e);
    }
  };

  return (
    <div
      id="clubhouse-discussion-section"
      className={`bg-white dark:bg-[#1A261E] rounded-3xl border border-[#E2E8DF] dark:border-[#2A3B2E] p-6 sm:p-8 shadow-xs ${
        embedded ? 'mt-8' : ''
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8DF] dark:border-[#2A3B2E]">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#2D4635] text-white shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5 text-[#A8C2A1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg sm:text-xl text-[#1B261E] dark:text-[#E8EFE8]">
                Clubhouse & Golfer Community Discussion
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border border-[#DCE3D4] dark:border-[#2F4435]">
                <Sparkles className="w-3 h-3 text-[#2D4635] dark:text-[#A8C2A1]" />
                Live Disqus Thread
              </span>
            </div>
            <p className="text-xs text-[#6B7D6A] dark:text-[#9FB19E] mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2D4635] dark:text-[#A8C2A1]" />
              <span>
                Active Course: <strong className="text-[#1B261E] dark:text-[#E8EFE8]">{course.name}</strong> ({course.region}, {course.country})
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleManualReset}
            title="Reload comments thread"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D4635] dark:text-[#A8C2A1] bg-[#F0F4EE] dark:bg-[#1E2D22] hover:bg-[#E8EDDF] dark:hover:bg-[#26382B] border border-[#E2E8DF] dark:border-[#2A3B2E] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Thread</span>
          </button>
        </div>
      </div>

      {/* Community Tips Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6 text-xs">
        <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex items-start gap-2.5">
          <CloudSun className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">Live Ground Reports</span>
            <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Share green speeds, fairway moisture, and bunker drainage after rain.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex items-start gap-2.5">
          <Users className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">Tee Time Matchmaking</span>
            <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Connect with fellow members to fill 4-ball slots in upcoming golden windows.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[#F0F4EE] dark:bg-[#16221A] rounded-2xl border border-[#E2E8DF] dark:border-[#2A3B2E] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#2D4635] dark:text-[#A8C2A1] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#1B261E] dark:text-[#E8EFE8]">Lightning & Siren Updates</span>
            <p className="text-[11px] text-[#6B7D6A] dark:text-[#9FB19E] mt-0.5">
              Post real-time siren klaxon status or play resumption calls.
            </p>
          </div>
        </div>
      </div>

      {/* Required Disqus Container */}
      <div className="min-h-[280px] bg-transparent rounded-2xl p-2 sm:p-4">
        <div id="disqus_thread"></div>
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" className="text-[#2D4635] underline">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </div>
  );
};

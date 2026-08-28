import { StrategySticky } from '../types';

export interface StrategySectionDef {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  stickies: StrategySticky[];
}

export const STRATEGY_SECTIONS: StrategySectionDef[] = [
  {
    id: 'problem-statement',
    title: '1. Problem Statement',
    description: 'Why generic weather apps fail golfers, especially in tropical & volatile climates',
    iconName: 'AlertTriangle',
    badge: 'Core Problem',
    stickies: [
      {
        id: 'prob-1',
        section: 'problem-statement',
        color: 'pink',
        title: 'Generic Apps Lack Golfer Context',
        content: [
          'Standard apps say "30% chance of rain" without context.',
          'Golfers need to know: Will the course siren blow?',
          'Is rain a 10-min passing shower or a 3-hour washout?'
        ],
        tags: ['Pain Point', 'Relevance']
      },
      {
        id: 'prob-2',
        section: 'problem-statement',
        color: 'pink',
        title: 'High Risk of Wasted Green Fees',
        content: [
          'Green fees cost $150–$450+ per round in SE Asia & globally.',
          'Booking the wrong slot leads to lightning suspension or unplayable greens.',
          'No clear "Go / No-Go" confidence indicator exists.'
        ],
        tags: ['Financial Loss', 'Decision Fatigue']
      },
      {
        id: 'prob-3',
        section: 'problem-statement',
        color: 'orange',
        title: 'Sudden Tropical Micro-Storms',
        content: [
          'In Singapore/SE Asia, storms develop in 20 minutes.',
          'Radar is often buried behind 5 taps in generic meteorological apps.',
          'Lightning distance is the #1 safety concern, not just wetness.'
        ],
        tags: ['Safety', 'Tropical Climate']
      },
      {
        id: 'prob-4',
        section: 'problem-statement',
        color: 'yellow',
        title: 'Physical Impact Ignored',
        content: [
          'High humidity + 34°C feels-like creates severe heat exhaustion.',
          'Extreme UV (Index 11+) ruins endurance on the back 9.',
          'Hazy PSI/AQI above 100 strains breathing over 4.5 hours.'
        ],
        tags: ['Performance', 'Health']
      }
    ]
  },
  {
    id: 'personas',
    title: '2. Golfer Personas',
    description: 'Target users and behavioral profiles',
    iconName: 'Users',
    badge: 'Target Audience',
    stickies: [
      {
        id: 'per-1',
        section: 'personas',
        color: 'blue',
        title: 'Persona A: Marcus (Weekend Club Member)',
        content: [
          'Age: 42 | Handicap: 14 | Plays: Saturday mornings',
          'Goal: Book 18 holes 5 days ahead, avoid midday lightning.',
          'Frustration: Booked 1:30 PM slot, round abandoned at hole 6 due to thunderstorm.'
        ],
        tags: ['Member', 'Planner']
      },
      {
        id: 'per-2',
        section: 'personas',
        color: 'green',
        title: 'Persona B: Elena (Spontaneous 9-Holer)',
        content: [
          'Age: 31 | Handicap: 22 | Plays: Twilight & flexible weekday afternoons',
          'Goal: Check phone at 3:30 PM: "Can I squeeze 9 holes before sunset and rain?"',
          'Needs: Instant 2-hour microcast countdown and siren status.'
        ],
        tags: ['Quick Play', 'Mobile-First']
      },
      {
        id: 'per-3',
        section: 'personas',
        color: 'purple',
        title: 'Persona C: David (Competitive / Scratch Player)',
        content: [
          'Age: 28 | Handicap: 3 | Plays: Tournaments & weekly medals',
          'Goal: Precise wind direction vs hole layouts, green firmness, air density impact on carry.',
          'Needs: Club adjustment recommendations and gust vectors.'
        ],
        tags: ['Performance', 'Data-Driven']
      }
    ]
  },
  {
    id: 'jtbd',
    title: '3. Jobs to Be Done (JTBD)',
    description: 'Core functional, emotional, and social jobs',
    iconName: 'Target',
    badge: 'Core Jobs',
    stickies: [
      {
        id: 'jtbd-1',
        section: 'jtbd',
        color: 'yellow',
        title: 'JTBD 1: Immediate Play Verdict',
        content: [
          'When I am standing at the clubhouse or driving to the course...',
          'I want an unequivocal "Play / Delay / Avoid" verdict...',
          'So that I do not start a paid round only to get stranded by a lightning horn.'
        ],
        tags: ['Now Decision']
      },
      {
        id: 'jtbd-2',
        section: 'jtbd',
        color: 'yellow',
        title: 'JTBD 2: 24h Golden Window Selection',
        content: [
          'When I have tomorrow off or a weekend tee sheet opening...',
          'I want the app to rank the best 4-hour and 2-hour playing windows...',
          'So that I choose the optimal balance of low rain, bearable heat, and manageable wind.'
        ],
        tags: ['Tee Time Booking']
      },
      {
        id: 'jtbd-3',
        section: 'jtbd',
        color: 'green',
        title: 'JTBD 3: 7-Day Planning Outlook',
        content: [
          'When booking tee times a week in advance...',
          'I want an at-a-glance rating of daily conditions and monsoon fronts...',
          'So that our golf group locks in the best day.'
        ],
        tags: ['Advance Planning']
      },
      {
        id: 'jtbd-4',
        section: 'jtbd',
        color: 'blue',
        title: 'JTBD 4: Round Tactical Preparation',
        content: [
          'Before stepping onto the 1st tee...',
          'I want to know green receptiveness, bunker wetness, and wind club adjustments...',
          'So that I pack the right gear and club appropriately.'
        ],
        tags: ['Course Tactics']
      }
    ]
  },
  {
    id: 'user-journey',
    title: '4. User Journey & Time Horizons',
    description: 'Progressive disclosure from 7-day planning to real-time play',
    iconName: 'GitCommit',
    badge: 'UX Flow',
    stickies: [
      {
        id: 'uj-1',
        section: 'user-journey',
        color: 'purple',
        title: '7 Days Out → Macro Planning',
        content: [
          'Focus: Daily Golfability Score (0-100), major monsoon troughs, rain trend.',
          'Action: Choose best day of week to book.'
        ],
        tags: ['Week View']
      },
      {
        id: 'uj-2',
        section: 'user-journey',
        color: 'blue',
        title: '24 Hours Out → Tee Time Selection',
        content: [
          'Focus: Hourly breakdown, Golden Windows (e.g. 7:00 AM - 9:30 AM vs 3:00 PM Storm).',
          'Action: Pick 9-hole or 18-hole tee time.'
        ],
        tags: ['Today View', 'Hourly']
      },
      {
        id: 'uj-3',
        section: 'user-journey',
        color: 'yellow',
        title: '2 Hours Out → Commute & Decision',
        content: [
          'Focus: 15-minute microcast rain trajectory, lightning cell proximity (<15km).',
          'Action: Confirm departure or delay tee time by 45 mins.'
        ],
        tags: ['Now View', 'Microcast']
      },
      {
        id: 'uj-4',
        section: 'user-journey',
        color: 'green',
        title: 'At Course / On Tee → Live Play Conditions',
        content: [
          'Focus: Live siren alerts, wind compass vs hole heading, club carry adjustments.',
          'Action: Play safely and make smart club selections.'
        ],
        tags: ['Live Conditions']
      }
    ]
  },
  {
    id: 'golfability-algorithm',
    title: '5. Golfability Algorithm (0–100)',
    description: 'Transparent, weighted scoring engine for golfers',
    iconName: 'Cpu',
    badge: 'Algorithm Specs',
    stickies: [
      {
        id: 'algo-1',
        section: 'golfability-algorithm',
        color: 'green',
        title: 'Scoring Tiers',
        content: [
          '• 90–100: Excellent (Ideal, no rain, light breeze, low heat)',
          '• 75–89: Good (Playable, slight heat or mild breeze)',
          '• 60–74: Fair (Challenging; rain threat, humid, gusty)',
          '• 40–59: Poor (Heavy rain likely, severe heat, strong gusts)',
          '• 0–39: Avoid (Active lightning siren, torrential storm, toxic AQI)'
        ],
        tags: ['Tiers', 'Visual Feedback']
      },
      {
        id: 'algo-2',
        section: 'golfability-algorithm',
        color: 'orange',
        title: 'Lightning & Safety Override',
        content: [
          'Safety First: Lightning within 8km immediately forces score < 30 (Avoid).',
          'Strike within 15km caps max score at 55 (Poor).',
          'Course siren sounding triggers Red Alert modal.'
        ],
        tags: ['Critical Rule', 'Safety']
      },
      {
        id: 'algo-3',
        section: 'golfability-algorithm',
        color: 'yellow',
        title: 'Precipitation & Rain Rate',
        content: [
          'Precipitation Prob 0-20%: 0 pt deduction',
          'Precipitation Prob 20-50%: -5 to -15 pts',
          'Precipitation Prob 50-80%: -20 to -35 pts',
          'Rainfall Intensity > 5mm/hr: -30 pts (Greens flooding)'
        ],
        tags: ['Precipitation']
      },
      {
        id: 'algo-4',
        section: 'golfability-algorithm',
        color: 'blue',
        title: 'Wind & Gust Penalties',
        content: [
          '< 15 km/h: Ideal (0 penalty)',
          '15–28 km/h: Moderate (-5 to -10 pts)',
          '28–42 km/h: High (-15 to -25 pts, club selection difficult)',
          '> 42 km/h: Extreme (-35 pts, ball oscillates on greens)'
        ],
        tags: ['Wind Impact']
      },
      {
        id: 'algo-5',
        section: 'golfability-algorithm',
        color: 'pink',
        title: 'Thermal & Health Factors',
        content: [
          'Feels-Like > 36°C: -15 pts (Heat exhaustion risk)',
          'UV Index > 10: -10 pts (Extreme burn risk in <15 min)',
          'AQI/PSI > 100: -15 pts | > 150: -35 pts (Respiratory strain)'
        ],
        tags: ['Heat Index', 'UV', 'AQI']
      }
    ]
  },
  {
    id: 'features-ia',
    title: '6. Features & Information Architecture',
    description: 'Structural layout following the kickoff flow chart',
    iconName: 'Layout',
    badge: 'Information Architecture',
    stickies: [
      {
        id: 'feat-1',
        section: 'features-ia',
        color: 'yellow',
        title: 'Screen 1: Home / Now View',
        content: [
          '• Large Golfability Gauge (0-100) with Tier Badge',
          '• Prominent Lightning Safety Banner (Siren status & strike distance)',
          '• 2-Hour Microcast Slider (15-min precipitation & trend)',
          '• Quick Golf Verdict ("Squeeze 9 holes" / "Great 18 holes" / "Wait 45m")',
          '• Vitals Grid: Temp, Feels-like, Wind vector, UV, AQI, Rain %'
        ],
        tags: ['Now Screen']
      },
      {
        id: 'feat-2',
        section: 'features-ia',
        color: 'blue',
        title: 'Screen 2: Today View (24 Hours)',
        content: [
          '• Golden Tee-Time Recommender (Ranked Morning, Mid-day, Twilight)',
          '• 24-Hour Interactive Timeline with Golfability curve',
          '• Course Playability Matrix (Green speed, bunker wetness, fairway roll)',
          '• Tap-to-inspect Hourly Breakdown'
        ],
        tags: ['Today Screen']
      },
      {
        id: 'feat-3',
        section: 'features-ia',
        color: 'purple',
        title: 'Screen 3: Week View (7 Days)',
        content: [
          '• 7-day card strip with daily Golfability Scores & conditions',
          '• "Best Day This Week" callout badge',
          '• Select Day -> Instant Hourly Breakdown drill-down',
          '• Weekend comparison forecast'
        ],
        tags: ['Week Screen']
      },
      {
        id: 'feat-4',
        section: 'features-ia',
        color: 'green',
        title: 'Screen 4: Live Conditions & Radar',
        content: [
          '• Interactive Doppler Radar Simulation with storm path vectors',
          '• Real-time Lightning Strike proximity rings (3km, 8km, 15km)',
          '• Live Wind Compass with Hole Heading alignment (Cross/Head/Tailwind)',
          '• Observed vs Forecast sensor variance tracker'
        ],
        tags: ['Live Screen']
      },
      {
        id: 'feat-5',
        section: 'features-ia',
        color: 'orange',
        title: 'Screen 5: Round Planner & Club Caddy',
        content: [
          '• Pick Tee Time -> Hole-by-hole weather simulator',
          '• Club carry adjustments (e.g. +1 club for heavy wet air and headwind)',
          '• Golfer Packing Checklist (Umbrella, Rain gloves, UV sleeves, Electrolytes)'
        ],
        tags: ['Planner Tool']
      }
    ]
  },
  {
    id: 'mvp-roadmap',
    title: '7. MVP Scope & Future Roadmap',
    description: 'Prioritized feature phasing and expansion plan',
    iconName: 'Compass',
    badge: 'Roadmap',
    stickies: [
      {
        id: 'mvp-1',
        section: 'mvp-roadmap',
        color: 'green',
        title: 'MVP Scope (Current Release)',
        content: [
          '✓ Real-time Golfability Score (0-100) with transparent drivers',
          '✓ High-prominence Lightning Alert system & Siren status',
          '✓ 2-Hour 15-min Microcast rain trajectory',
          '✓ 24-Hour hourly forecast & Golden Tee-Time rankings',
          '✓ 7-Day Planning calendar with day-to-hour drilldown',
          '✓ Live Radar & Wind Compass with hole alignment',
          '✓ SE Asia & Global Golf Course Database + GPS Search'
        ],
        tags: ['MVP Ready']
      },
      {
        id: 'road-1',
        section: 'mvp-roadmap',
        color: 'blue',
        title: 'Phase 2: Push Notifications & Group Sync',
        content: [
          '• 45-minute rain warning push alert before scheduled tee time',
          '• Share "Round Weather Briefing" card to WhatsApp / Golf Groups',
          '• Course superintendent API link for official siren integration'
        ],
        tags: ['Phase 2']
      },
      {
        id: 'road-2',
        section: 'mvp-roadmap',
        color: 'purple',
        title: 'Phase 3: Smart Club AI & Caddy Tracker',
        content: [
          '• GPS hole-by-hole shot tracking adjusted for live barometric density',
          '• Garmin / Apple Watch complication for wrist glance',
          '• Historical scoring performance correlation vs humidity/wind'
        ],
        tags: ['Phase 3']
      }
    ]
  }
];

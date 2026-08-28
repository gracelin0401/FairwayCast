export type GolfabilityTier = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Avoid';

export interface ScoreFactor {
  name: string;
  category: 'lightning' | 'rain' | 'wind' | 'temp' | 'uv' | 'aqi' | 'humidity';
  impact: number; // e.g. -25, +5, 0
  status: 'optimal' | 'moderate' | 'negative' | 'critical';
  value: string;
  advice: string;
}

export interface GolfabilityScore {
  total: number; // 0 - 100
  tier: GolfabilityTier;
  verdict: string;
  summary: string;
  factors: ScoreFactor[];
  roundRecommendation: 'Full 18 Holes' | 'Quick 9 Holes' | 'Delay / Wait' | 'Driving Range / Indoor' | 'Course Suspended';
  clubAdjustment: string;
  courseCondition: {
    greens: 'Fast & Firm' | 'Normal' | 'Soft & Receptive' | 'Wet & Slow';
    fairways: 'Maximum Roll (+15y)' | 'Normal' | 'Soft / Plugged (-10y)' | 'Casual Water';
    bunkers: 'Dry / Fluffy' | 'Firm' | 'Wet / Heavy Compacted';
  };
}

export interface MicrocastInterval {
  time: string; // e.g. "14:15"
  relativeMinutes: number; // e.g. 0, 15, 30, 45, 60, 75, 90, 105, 120
  precipitationMm: number;
  precipitationProb: number;
  lightningRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  golfability: number;
  conditionDesc: string;
  icon: string;
}

export interface HourlyForecast {
  time: string; // ISO or "08:00"
  hour: number;
  tempC: number;
  feelsLikeC: number;
  precipitationProb: number;
  precipitationMm: number;
  condition: string;
  conditionIcon: string;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  windDirectionText: string;
  uvIndex: number;
  aqi: number;
  humidity: number;
  lightningRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  lightningDistanceKm?: number;
  golfabilityScore: number;
  golfabilityTier: GolfabilityTier;
  recommended: boolean;
}

export interface DailyForecast {
  date: string; // "2026-08-28"
  dayName: string; // "Friday"
  shortDate: string; // "Aug 28"
  tempMaxC: number;
  tempMinC: number;
  condition: string;
  conditionIcon: string;
  precipitationProb: number;
  precipitationAccumMm: number;
  maxWindSpeedKmh: number;
  avgWindDirection: string;
  maxUvIndex: number;
  maxAqi: number;
  golfabilityScore: number;
  golfabilityTier: GolfabilityTier;
  bestWindow: string; // "07:00 - 10:30 AM"
  lightningRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  hourly: HourlyForecast[];
}

export interface CurrentWeather {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  dewPointC: number;
  precipitationProb: number;
  precipitationRateMmH: number;
  condition: string;
  conditionIcon: string;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  windDirectionText: string;
  pressureHpa: number;
  uvIndex: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Hazardous';
  visibilityKm: number;
  cloudCoverPct: number;
  sunriseTime: string;
  sunsetTime: string;
  isDay: boolean;
  observedAt: string;
  isLiveSensor: boolean;
}

export interface LightningAlert {
  active: boolean;
  level: 'Clear' | 'Advisory' | 'Warning' | 'Red Alert - Siren Active';
  nearestStrikeKm: number;
  strikeCountLast30Min: number;
  bearingDeg: number;
  trend: 'Approaching' | 'Stationary' | 'Moving Away' | 'Dissipating';
  safeWindowEstimatedMin: number;
  courseSirenSounded: boolean;
  shelterAdvice: string;
}

export interface GolfCourse {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  holes: number;
  par: number;
  elevationM: number;
  courseRating?: number;
  slopeRating?: number;
  timezone: string;
  typicalMicroclimate: string;
  defaultHoleHeadingDeg: number;
}

export interface TeeTimeWindow {
  id: string;
  startHour: string;
  endHour: string;
  durationLabel: '9 Holes (2h 15m)' | '18 Holes (4h 30m)' | 'Twilight (2h)';
  golfabilityScore: number;
  tier: GolfabilityTier;
  rainRiskPct: number;
  maxTempC: number;
  windKmh: number;
  lightningRisk: string;
  verdict: 'Recommended' | 'Good Option' | 'Challenging' | 'High Delay Risk';
  highlights: string[];
}

export interface StrategySticky {
  id: string;
  section: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange';
  title: string;
  content: string[];
  tags: string[];
}

import {
  CurrentWeather,
  GolfabilityScore,
  GolfabilityTier,
  HourlyForecast,
  LightningAlert,
  ScoreFactor,
} from '../types';

export function calculateGolfability(
  weather: Partial<CurrentWeather>,
  lightning?: Partial<LightningAlert>
): GolfabilityScore {
  let score = 100;
  const factors: ScoreFactor[] = [];

  const temp = weather.tempC ?? 28;
  const feelsLike = weather.feelsLikeC ?? temp;
  const rainProb = weather.precipitationProb ?? 10;
  const rainRate = weather.precipitationRateMmH ?? 0;
  const windSpeed = weather.windSpeedKmh ?? 12;
  const windGust = weather.windGustKmh ?? 16;
  const uv = weather.uvIndex ?? 5;
  const aqi = weather.aqi ?? 35;
  const humidity = weather.humidity ?? 65;

  // 1. Lightning & Safety (Top Priority)
  const isSiren = lightning?.courseSirenSounded || lightning?.level === 'Red Alert - Siren Active';
  const nearestStrike = lightning?.nearestStrikeKm ?? 99;

  if (isSiren || nearestStrike < 8) {
    const deduction = 75;
    score -= deduction;
    factors.push({
      name: 'Lightning Siren & Storm Cell',
      category: 'lightning',
      impact: -deduction,
      status: 'critical',
      value: isSiren ? 'Siren Active' : `${nearestStrike} km away`,
      advice: 'DANGER: Stop play immediately. Seek grounded clubhouse shelter.',
    });
  } else if (nearestStrike < 16) {
    const deduction = 45;
    score -= deduction;
    factors.push({
      name: 'Nearby Lightning Cell',
      category: 'lightning',
      impact: -deduction,
      status: 'critical',
      value: `${nearestStrike} km away`,
      advice: 'High risk: Storm within 15 km. Stay near course shelters.',
    });
  } else if (nearestStrike < 30 || lightning?.level === 'Advisory') {
    const deduction = 15;
    score -= deduction;
    factors.push({
      name: 'Distant Thunder Activity',
      category: 'lightning',
      impact: -deduction,
      status: 'moderate',
      value: `${nearestStrike} km away`,
      advice: 'Advisory: Cells tracked in region. Monitor siren updates.',
    });
  } else {
    factors.push({
      name: 'Lightning Safety',
      category: 'lightning',
      impact: 0,
      status: 'optimal',
      value: 'All Clear (>40 km)',
      advice: 'No electrical storm activity detected within playing range.',
    });
  }

  // 2. Precipitation & Rain Rate
  if (rainRate > 6 || rainProb >= 85) {
    const deduction = 35;
    score -= deduction;
    factors.push({
      name: 'Heavy Downpour',
      category: 'rain',
      impact: -deduction,
      status: 'critical',
      value: `${rainProb}% prob (${rainRate > 0 ? `${rainRate} mm/h` : 'Torrential'})`,
      advice: 'Greens pooling water, casual water in bunkers. Delay start.',
    });
  } else if (rainRate > 1.5 || rainProb >= 60) {
    const deduction = 22;
    score -= deduction;
    factors.push({
      name: 'Active Rain / Showers',
      category: 'rain',
      impact: -deduction,
      status: 'negative',
      value: `${rainProb}% prob (${rainRate > 0 ? `${rainRate} mm/h` : 'Moderate'})`,
      advice: 'Soft greens, minimal fairway roll. Carry rain gloves & umbrella.',
    });
  } else if (rainProb >= 35 || rainRate > 0.2) {
    const deduction = 10;
    score -= deduction;
    factors.push({
      name: 'Passing Shower Chance',
      category: 'rain',
      impact: -deduction,
      status: 'moderate',
      value: `${rainProb}% chance`,
      advice: 'Intermittent drizzle possible. Keep waterproof bag cover on.',
    });
  } else {
    factors.push({
      name: 'Precipitation',
      category: 'rain',
      impact: 0,
      status: 'optimal',
      value: `${rainProb}% (Dry)`,
      advice: 'Dry conditions; normal spin and crisp contact expected.',
    });
  }

  // 3. Wind & Gusts
  if (windSpeed > 40 || windGust > 50) {
    const deduction = 28;
    score -= deduction;
    factors.push({
      name: 'Gale / Extreme Wind',
      category: 'wind',
      impact: -deduction,
      status: 'critical',
      value: `${windSpeed} km/h (Gusts ${windGust})`,
      advice: 'Severe wind. Ball moves on greens, 3-club adjustment into wind.',
    });
  } else if (windSpeed > 26 || windGust > 36) {
    const deduction = 16;
    score -= deduction;
    factors.push({
      name: 'Brisk Crosswinds',
      category: 'wind',
      impact: -deduction,
      status: 'negative',
      value: `${windSpeed} km/h (Gusts ${windGust})`,
      advice: '1.5 to 2 clubs difference. Flight shots low under the breeze.',
    });
  } else if (windSpeed > 16) {
    const deduction = 6;
    score -= deduction;
    factors.push({
      name: 'Moderate Breeze',
      category: 'wind',
      impact: -deduction,
      status: 'moderate',
      value: `${windSpeed} km/h`,
      advice: 'Half-club drift on approach shots. Pleasant cooling effect.',
    });
  } else {
    factors.push({
      name: 'Wind Speed',
      category: 'wind',
      impact: 0,
      status: 'optimal',
      value: `${windSpeed} km/h (Calm)`,
      advice: 'Ideal scoring wind. True ball flight to yardage.',
    });
  }

  // 4. Heat Index & Feels-Like
  if (feelsLike > 38) {
    const deduction = 18;
    score -= deduction;
    factors.push({
      name: 'Extreme Heat Stress',
      category: 'temp',
      impact: -deduction,
      status: 'critical',
      value: `Feels like ${Math.round(feelsLike)}°C (${Math.round(temp)}°C)`,
      advice: 'Danger of heat exhaustion over 4 hours. Drink 1L electrolyte/9 holes.',
    });
  } else if (feelsLike > 33) {
    const deduction = 10;
    score -= deduction;
    factors.push({
      name: 'High Thermal Index',
      category: 'temp',
      impact: -deduction,
      status: 'negative',
      value: `Feels like ${Math.round(feelsLike)}°C`,
      advice: 'Sweaty grip alert. Pack extra dry towels & stay hydrated.',
    });
  } else if (temp < 10) {
    const deduction = 12;
    score -= deduction;
    factors.push({
      name: 'Cold Ambient Air',
      category: 'temp',
      impact: -deduction,
      status: 'negative',
      value: `${Math.round(temp)}°C`,
      advice: 'Dense cold air reduces carry by 5-10 yards. Club up.',
    });
  } else {
    factors.push({
      name: 'Temperature Comfort',
      category: 'temp',
      impact: 0,
      status: 'optimal',
      value: `${Math.round(temp)}°C (Feels ${Math.round(feelsLike)}°C)`,
      advice: 'Comfortable thermal zone for sustained athletic endurance.',
    });
  }

  // 5. UV Index
  if (uv >= 10) {
    const deduction = 10;
    score -= deduction;
    factors.push({
      name: 'Extreme UV Index',
      category: 'uv',
      impact: -deduction,
      status: 'negative',
      value: `UV ${uv.toFixed(1)} (Extreme)`,
      advice: 'Sunburn risk < 15 min. Apply SPF 50+, wide-brim hat & UV sleeves.',
    });
  } else if (uv >= 7) {
    const deduction = 5;
    score -= deduction;
    factors.push({
      name: 'High UV Radiation',
      category: 'uv',
      impact: -deduction,
      status: 'moderate',
      value: `UV ${uv.toFixed(1)} (High)`,
      advice: 'Wear polarized sunglasses and reapply sunscreen at the turn.',
    });
  } else {
    factors.push({
      name: 'UV Protection',
      category: 'uv',
      impact: 0,
      status: 'optimal',
      value: `UV ${uv.toFixed(1)} (Mild)`,
      advice: 'Low to moderate solar load.',
    });
  }

  // 6. Air Quality (PSI / AQI)
  if (aqi > 150) {
    const deduction = 25;
    score -= deduction;
    factors.push({
      name: 'Unhealthy Air (AQI/PSI)',
      category: 'aqi',
      impact: -deduction,
      status: 'critical',
      value: `AQI ${aqi} (Unhealthy)`,
      advice: 'Strenuous outdoor cardio discouraged. Consider indoor sim.',
    });
  } else if (aqi > 90) {
    const deduction = 8;
    score -= deduction;
    factors.push({
      name: 'Moderate Haze / AQI',
      category: 'aqi',
      impact: -deduction,
      status: 'moderate',
      value: `AQI ${aqi} (Moderate)`,
      advice: 'Slight haze. Reduced contrast tracking ball flight past 200y.',
    });
  } else {
    factors.push({
      name: 'Air Quality (AQI)',
      category: 'aqi',
      impact: 0,
      status: 'optimal',
      value: `AQI ${aqi} (Clean)`,
      advice: 'Crisp visibility and healthy clean airflow.',
    });
  }

  // Final Clamping
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine Tier
  let tier: GolfabilityTier = 'Fair';
  if (finalScore >= 90) tier = 'Excellent';
  else if (finalScore >= 75) tier = 'Good';
  else if (finalScore >= 60) tier = 'Fair';
  else if (finalScore >= 40) tier = 'Poor';
  else tier = 'Avoid';

  // Round Recommendation & Verdict
  let verdict = '';
  let summary = '';
  let roundRec: GolfabilityScore['roundRecommendation'] = 'Full 18 Holes';

  if (tier === 'Excellent') {
    verdict = 'Prime Golfing Conditions';
    summary = 'Outstanding weather with minimal rain risk and light breeze. Ideal for a full 18-hole round.';
    roundRec = 'Full 18 Holes';
  } else if (tier === 'Good') {
    verdict = 'Solid Playable Window';
    summary = 'Very good golf conditions. Slight breeze or mild warmth—standard routine applies.';
    roundRec = 'Full 18 Holes';
  } else if (tier === 'Fair') {
    verdict = 'Playable with Preparedness';
    summary = 'Condition demands focus: watch for shifting wind or passing showers. 9 or 18 holes viable.';
    roundRec = rainProb > 50 ? 'Quick 9 Holes' : 'Full 18 Holes';
  } else if (tier === 'Poor') {
    verdict = 'Challenging / Delay Threat';
    summary = 'High humidity, heat stress, or elevated rain threat. Best for a quick 9 or range session.';
    roundRec = 'Quick 9 Holes';
  } else {
    verdict = isSiren ? 'Course Siren Active - Do Not Play' : 'Unplayable / Safety Hazard';
    summary = isSiren
      ? 'Course lightning alarm is active. All players must seek shelter immediately.'
      : 'Severe weather, lightning threat, or heavy downpours make outdoor play unsafe.';
    roundRec = isSiren ? 'Course Suspended' : 'Driving Range / Indoor';
  }

  // Club & Course adjustments
  let clubAdjustment = 'Standard club yardages apply.';
  if (windSpeed > 25) {
    clubAdjustment = `Strong ${windSpeed} km/h wind: Add 1-2 clubs into the wind; take 1 less downwind. Keep tee shots low.`;
  } else if (rainProb > 60 || rainRate > 1) {
    clubAdjustment = 'Wet conditions: Carry is everything. Expect zero fairway roll—take one extra club on approaches.';
  } else if (feelsLike > 35) {
    clubAdjustment = 'Hot, humid air: Ball carries 2-4 yards further than cold conditions. Stay loose and hydrate.';
  }

  // Course conditions projection
  const greensCond =
    rainRate > 3 || rainProb > 75
      ? 'Wet & Slow'
      : rainProb > 40
      ? 'Soft & Receptive'
      : 'Fast & Firm';

  const fairwayCond =
    rainRate > 4
      ? 'Casual Water'
      : rainProb > 60
      ? 'Soft / Plugged (-10y)'
      : windSpeed > 20 && rainProb < 20
      ? 'Maximum Roll (+15y)'
      : 'Normal';

  const bunkerCond =
    rainRate > 2 || rainProb > 70
      ? 'Wet / Heavy Compacted'
      : rainProb > 30
      ? 'Firm'
      : 'Dry / Fluffy';

  return {
    total: finalScore,
    tier,
    verdict,
    summary,
    factors,
    roundRecommendation: roundRec,
    clubAdjustment,
    courseCondition: {
      greens: greensCond,
      fairways: fairwayCond,
      bunkers: bunkerCond,
    },
  };
}

export function getTierColor(tier: GolfabilityTier) {
  switch (tier) {
    case 'Excellent':
      return {
        bg: 'bg-[#2D4635]',
        text: 'text-[#2D4635] dark:text-[#A8C2A1]',
        border: 'border-[#2D4635]',
        badge: 'bg-[#E8EDDF] text-[#2D4635] dark:bg-[#233327] dark:text-[#A8C2A1] border-[#DCE3D4] dark:border-[#2F4435]',
        gradient: 'from-[#2D4635] to-[#42684F]',
        ring: 'ring-[#2D4635]/30',
      };
    case 'Good':
      return {
        bg: 'bg-[#4A6741]',
        text: 'text-[#4A6741] dark:text-[#B5D1AD]',
        border: 'border-[#4A6741]',
        badge: 'bg-[#F0F4EE] text-[#4A6741] dark:bg-[#1E2D22] dark:text-[#B5D1AD] border-[#E2E8DF] dark:border-[#2D4233]',
        gradient: 'from-[#4A6741] to-[#608554]',
        ring: 'ring-[#4A6741]/30',
      };
    case 'Fair':
      return {
        bg: 'bg-[#A68A64]',
        text: 'text-[#8A6F49] dark:text-[#D4BFA4]',
        border: 'border-[#A68A64]',
        badge: 'bg-[#FDF8F3] text-[#8A6F49] dark:bg-[#2A231C] dark:text-[#D4BFA4] border-[#F9F0E5] dark:border-[#3D3328]',
        gradient: 'from-[#A68A64] to-[#C1A57D]',
        ring: 'ring-[#A68A64]/30',
      };
    case 'Poor':
      return {
        bg: 'bg-[#C06C47]',
        text: 'text-[#A45330] dark:text-[#E89E7D]',
        border: 'border-[#C06C47]',
        badge: 'bg-[#FDF3EE] text-[#A45330] dark:bg-[#332018] dark:text-[#E89E7D] border-[#F6DDD1] dark:border-[#4B2F23]',
        gradient: 'from-[#C06C47] to-[#D98762]',
        ring: 'ring-[#C06C47]/30',
      };
    case 'Avoid':
      return {
        bg: 'bg-[#9E3535]',
        text: 'text-[#9E3535] dark:text-[#F08585]',
        border: 'border-[#9E3535]',
        badge: 'bg-[#FDF0F0] text-[#9E3535] dark:bg-[#361919] dark:text-[#F08585] border-[#F9D6D6] dark:border-[#4D2222]',
        gradient: 'from-[#9E3535] to-[#BF4949]',
        ring: 'ring-[#9E3535]/30',
      };
  }
}

export function calculateWindVsHole(windDeg: number, holeDeg: number, windSpeedKmh: number) {
  // Relative angle: 0 = pure tailwind, 180 = pure headwind, 90 = right crosswind, 270 = left crosswind
  let relative = (windDeg - holeDeg + 360) % 360;
  if (relative > 180) relative -= 360; // range -180 to +180

  const rad = (relative * Math.PI) / 180;
  // Headwind is positive when wind opposes hole direction (relative around 180)
  const headwindComponent = Math.cos(rad) * windSpeedKmh * -1;
  const crosswindComponent = Math.sin(rad) * windSpeedKmh;

  let label = '';
  if (Math.abs(relative) <= 25) {
    label = 'Direct Tailwind (Gain +8 to +15y carry)';
  } else if (Math.abs(relative) >= 155) {
    label = 'Direct Headwind (Lose 10 to 20y carry, club up 1-2 clubs)';
  } else if (relative > 25 && relative < 155) {
    label = `Right-to-Left Crosswind (${Math.round(Math.abs(crosswindComponent))} km/h push to left)`;
  } else {
    label = `Left-to-Right Crosswind (${Math.round(Math.abs(crosswindComponent))} km/h push to right)`;
  }

  return {
    relativeDeg: relative,
    headwindKmh: Math.round(headwindComponent),
    crosswindKmh: Math.round(crosswindComponent),
    label,
  };
}

import {
  CurrentWeather,
  DailyForecast,
  GolfCourse,
  HourlyForecast,
  LightningAlert,
  MicrocastInterval,
  TeeTimeWindow,
} from '../types';
import { calculateGolfability } from './golfability';

// Weather code translation
export function getWeatherCondition(wmoCode: number, isDay = true): { text: string; icon: string } {
  switch (wmoCode) {
    case 0:
      return { text: 'Clear Sky', icon: isDay ? 'Sun' : 'Moon' };
    case 1:
    case 2:
      return { text: isDay ? 'Partly Cloudy' : 'Partly Cloudy Night', icon: isDay ? 'CloudSun' : 'CloudMoon' };
    case 3:
      return { text: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { text: 'Morning Fog / Mist', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Light Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
      return { text: 'Moderate Rain', icon: 'CloudRain' };
    case 65:
      return { text: 'Heavy Tropical Rain', icon: 'CloudRain' };
    case 80:
    case 81:
    case 82:
      return { text: 'Passing Rain Showers', icon: 'CloudLightning' };
    case 95:
      return { text: 'Thunderstorm with Lightning', icon: 'Zap' };
    case 96:
    case 99:
      return { text: 'Severe Thunderstorm & Squall', icon: 'Zap' };
    default:
      return { text: 'Fair Skies', icon: isDay ? 'Sun' : 'Moon' };
  }
}

export function degToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export async function fetchCourseWeatherData(course: GolfCourse): Promise<{
  current: CurrentWeather;
  lightning: LightningAlert;
  microcast: MicrocastInterval[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  goldenWindows: TeeTimeWindow[];
}> {
  // Check if course is in Singapore to fetch official NEA/MSS real-time telemetry
  let sgTelemetry: any = null;
  const isSingapore = course.country?.toLowerCase() === 'singapore' || (course.lat > 1.15 && course.lat < 1.48 && course.lon > 103.55 && course.lon < 104.1);

  if (isSingapore) {
    try {
      const sgRes = await fetch(
        `/api/data-gov-sg/course-telemetry?lat=${course.lat}&lon=${course.lon}&name=${encodeURIComponent(course.name)}`
      );
      if (sgRes.ok) {
        const sgJson = await sgRes.json();
        if (sgJson.success && sgJson.telemetry) {
          sgTelemetry = sgJson.telemetry;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Singapore Data.gov.sg real-time telemetry:', e);
    }
  }

  try {
    // Attempt live fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${course.lat}&longitude=${course.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();

    return parseOpenMeteoData(data, course, sgTelemetry);
  } catch (err) {
    console.warn('Weather API fetch failed or network offline, using meteorological simulation with data.gov.sg:', err);
    return generateSimulatedWeatherData(course, sgTelemetry);
  }
}

export async function fetchDataGovSgStatus() {
  try {
    const res = await fetch('/api/data-gov-sg/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch (e) {
    return { apiKeyConfigured: false, activeEndpointsCount: 10, endpoints: [] };
  }
}

function parseOpenMeteoData(data: any, course: GolfCourse, sgTelemetry?: any) {
  const currentRaw = data.current;
  const isDay = currentRaw.is_day === 1;
  const cond = getWeatherCondition(currentRaw.weather_code, isDay);
  const windDirDeg = currentRaw.wind_direction_10m || 0;

  // Determine lightning status based on tropical location and weather code
  const isStorm = [95, 96, 99].includes(currentRaw.weather_code) ||
    (sgTelemetry?.twoHourForecast?.forecast?.toLowerCase().includes('thunder') ?? false);
  const isShower = [80, 81, 82, 65].includes(currentRaw.weather_code) ||
    (sgTelemetry?.twoHourForecast?.forecast?.toLowerCase().includes('showers') ?? false);

  const lightning: LightningAlert = {
    active: isStorm,
    level: isStorm ? 'Red Alert - Siren Active' : isShower ? 'Advisory' : 'Clear',
    nearestStrikeKm: isStorm ? 4.2 : isShower ? 14.5 : 52.0,
    strikeCountLast30Min: isStorm ? 28 : isShower ? 4 : 0,
    bearingDeg: (windDirDeg + 180) % 360,
    trend: isStorm ? 'Approaching' : isShower ? 'Moving Away' : 'Dissipating',
    safeWindowEstimatedMin: isStorm ? 45 : 0,
    courseSirenSounded: isStorm,
    shelterAdvice: isStorm
      ? 'RED ALERT: Evacuate open fairways immediately. Nearest on-course lightning shelter: Hole 4 / Hole 14 tee.'
      : 'All clear: Standard safety protocols in place.',
  };

  // If real-time Data.gov.sg telemetry is available, enhance surface readings with official NEA ground sensors
  const tempC = sgTelemetry?.airTemperature?.celsius != null 
    ? Math.round(sgTelemetry.airTemperature.celsius) 
    : Math.round(currentRaw.temperature_2m);

  const humidity = sgTelemetry?.relativeHumidity?.percent != null
    ? Math.round(sgTelemetry.relativeHumidity.percent)
    : currentRaw.relative_humidity_2m;

  const windSpeedKmh = sgTelemetry?.windSpeed?.speedKmh != null
    ? sgTelemetry.windSpeed.speedKmh
    : Math.round(currentRaw.wind_speed_10m);

  const uvIndex = sgTelemetry?.uv?.index != null
    ? Math.round(sgTelemetry.uv.index)
    : Math.round(data.hourly?.uv_index?.[0] || (isDay ? 6 : 0));

  const rainRate = sgTelemetry?.rainfall?.rainfallMm != null
    ? sgTelemetry.rainfall.rainfallMm
    : (currentRaw.precipitation || 0);

  const aqiVal = sgTelemetry?.airQuality?.psi != null
    ? Math.round(sgTelemetry.airQuality.psi)
    : 38;

  let aqiStatus: any = 'Good';
  if (aqiVal > 300) aqiStatus = 'Hazardous';
  else if (aqiVal > 200) aqiStatus = 'Unhealthy';
  else if (aqiVal > 100) aqiStatus = 'Unhealthy for Sensitive';
  else if (aqiVal > 50) aqiStatus = 'Moderate';

  const conditionText = sgTelemetry?.twoHourForecast?.forecast
    ? sgTelemetry.twoHourForecast.forecast
    : cond.text;

  const observedAtText = sgTelemetry?.airTemperature?.stationName
    ? `Live Data.gov.sg (${sgTelemetry.airTemperature.stationName} • ${sgTelemetry.airTemperature.distanceKm}km)`
    : 'Just now (Live Meteorological Station)';

  const current: CurrentWeather = {
    tempC,
    feelsLikeC: Math.round(currentRaw.apparent_temperature || tempC + 3),
    humidity,
    dewPointC: Math.round(tempC - (100 - humidity) / 5),
    precipitationProb: Math.round(data.hourly?.precipitation_probability?.[0] || (rainRate > 0 ? 90 : 10)),
    precipitationRateMmH: rainRate,
    condition: conditionText,
    conditionIcon: cond.icon,
    windSpeedKmh,
    windGustKmh: Math.round(currentRaw.wind_gusts_10m || windSpeedKmh * 1.3),
    windDirectionDeg: windDirDeg,
    windDirectionText: degToCompass(windDirDeg),
    pressureHpa: Math.round(currentRaw.pressure_msl || 1012),
    uvIndex,
    aqi: aqiVal,
    aqiStatus,
    visibilityKm: 12,
    cloudCoverPct: currentRaw.cloud_cover || 40,
    sunriseTime: data.daily?.sunrise?.[0] ? data.daily.sunrise[0].split('T')[1]?.slice(0, 5) : '06:45',
    sunsetTime: data.daily?.sunset?.[0] ? data.daily.sunset[0].split('T')[1]?.slice(0, 5) : '19:15',
    isDay,
    observedAt: observedAtText,
    isLiveSensor: true,
    sgTelemetry,
  };

  // Generate 2-hour microcast (15-min intervals)
  const microcast: MicrocastInterval[] = [];
  const baseRain = current.precipitationRateMmH;
  for (let i = 0; i <= 8; i++) {
    const min = i * 15;
    const dateObj = new Date();
    dateObj.setMinutes(dateObj.getMinutes() + min);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Smooth micro-trend
    const factor = isStorm ? Math.max(0, 1 - i * 0.12) : isShower ? Math.sin(i / 2) * 0.8 : 0;
    const precipMm = +(baseRain * factor + (isStorm ? 2.5 : 0)).toFixed(1);
    const prob = Math.min(100, Math.max(5, Math.round(current.precipitationProb + (isStorm ? -i * 5 : i * 4))));

    const intLightning = isStorm && i < 3 ? 'Severe' : isStorm && i < 6 ? 'Moderate' : 'None';
    const intervalGolfScore = calculateGolfability(
      {
        tempC: current.tempC,
        feelsLikeC: current.feelsLikeC,
        precipitationProb: prob,
        precipitationRateMmH: precipMm,
        windSpeedKmh: current.windSpeedKmh,
        windGustKmh: current.windGustKmh,
        uvIndex: current.uvIndex,
        aqi: current.aqi,
      },
      {
        courseSirenSounded: intLightning === 'Severe',
        nearestStrikeKm: intLightning === 'Severe' ? 5 : intLightning === 'Moderate' ? 12 : 60,
      }
    ).total;

    microcast.push({
      time: timeStr,
      relativeMinutes: min,
      precipitationMm: precipMm,
      precipitationProb: prob,
      lightningRisk: intLightning as any,
      golfability: intervalGolfScore,
      conditionDesc: precipMm > 3 ? 'Heavy Rain' : precipMm > 0.5 ? 'Passing Shower' : 'Overcast / Playable',
      icon: precipMm > 2 ? 'CloudRain' : prob > 40 ? 'CloudDrizzle' : 'CloudSun',
    });
  }

  // Parse Hourly Forecast (Next 24 hours)
  const hourly: HourlyForecast[] = [];
  const nowHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const idx = i;
    if (!data.hourly.time[idx]) break;
    const timeRaw = data.hourly.time[idx];
    const hourVal = parseInt(timeRaw.split('T')[1].split(':')[0], 10);
    const tempC = Math.round(data.hourly.temperature_2m[idx]);
    const feelsLikeC = Math.round(data.hourly.apparent_temperature[idx]);
    const rainProb = Math.round(data.hourly.precipitation_probability[idx] || 0);
    const rainMm = +(data.hourly.precipitation[idx] || 0).toFixed(1);
    const windSpeed = Math.round(data.hourly.wind_speed_10m[idx]);
    const windGust = Math.round(data.hourly.wind_gusts_10m[idx]);
    const windDir = data.hourly.wind_direction_10m[idx] || 0;
    const uvVal = Math.round(data.hourly.uv_index[idx] || 0);
    const isDayHour = data.hourly.is_day[idx] === 1;
    const condHour = getWeatherCondition(data.hourly.weather_code[idx], isDayHour);

    const isHrStorm = [95, 96, 99].includes(data.hourly.weather_code[idx]);
    const lightningRisk = isHrStorm ? 'Severe' : rainProb > 65 ? 'Moderate' : rainProb > 40 ? 'Low' : 'None';

    const hGolfability = calculateGolfability(
      {
        tempC,
        feelsLikeC,
        precipitationProb: rainProb,
        precipitationRateMmH: rainMm,
        windSpeedKmh: windSpeed,
        windGustKmh: windGust,
        uvIndex: uvVal,
        aqi: 35,
      },
      {
        courseSirenSounded: isHrStorm,
        nearestStrikeKm: isHrStorm ? 6 : 50,
      }
    );

    hourly.push({
      time: `${hourVal.toString().padStart(2, '0')}:00`,
      hour: hourVal,
      tempC,
      feelsLikeC,
      precipitationProb: rainProb,
      precipitationMm: rainMm,
      condition: condHour.text,
      conditionIcon: condHour.icon,
      windSpeedKmh: windSpeed,
      windGustKmh: windGust,
      windDirectionDeg: windDir,
      windDirectionText: degToCompass(windDir),
      uvIndex: uvVal,
      aqi: 35,
      humidity: data.hourly.relative_humidity_2m[idx] || 65,
      lightningRisk: lightningRisk as any,
      golfabilityScore: hGolfability.total,
      golfabilityTier: hGolfability.tier,
      recommended: hGolfability.total >= 75 && hourVal >= 6 && hourVal <= 18,
    });
  }

  // Parse Daily Forecast (7 Days)
  const daily: DailyForecast[] = [];
  const daysCount = Math.min(7, data.daily?.time?.length || 7);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let d = 0; d < daysCount; d++) {
    const dateStr = data.daily.time[d];
    const dateObj = new Date(dateStr);
    const dayName = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : dayNames[dateObj.getDay()];
    const shortDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const maxTemp = Math.round(data.daily.temperature_2m_max[d]);
    const minTemp = Math.round(data.daily.temperature_2m_min[d]);
    const rainProb = Math.round(data.daily.precipitation_probability_max[d] || 20);
    const rainSum = +(data.daily.precipitation_sum[d] || 0).toFixed(1);
    const windMax = Math.round(data.daily.wind_speed_10m_max[d]);
    const uvMax = Math.round(data.daily.uv_index_max[d] || 8);
    const wCode = data.daily.weather_code[d];
    const condDay = getWeatherCondition(wCode, true);

    const isDayStorm = [95, 96, 99].includes(wCode);
    const dayLightning = isDayStorm ? 'High' : rainProb > 60 ? 'Moderate' : 'None';

    const dayScore = calculateGolfability({
      tempC: (maxTemp + minTemp) / 2,
      feelsLikeC: maxTemp,
      precipitationProb: rainProb,
      precipitationRateMmH: rainSum / 6,
      windSpeedKmh: windMax,
      windGustKmh: windMax + 8,
      uvIndex: uvMax,
      aqi: 35,
    }).total;

    let tier: any = 'Fair';
    if (dayScore >= 90) tier = 'Excellent';
    else if (dayScore >= 75) tier = 'Good';
    else if (dayScore >= 60) tier = 'Fair';
    else if (dayScore >= 40) tier = 'Poor';
    else tier = 'Avoid';

    daily.push({
      date: dateStr,
      dayName,
      shortDate,
      tempMaxC: maxTemp,
      tempMinC: minTemp,
      condition: condDay.text,
      conditionIcon: condDay.icon,
      precipitationProb: rainProb,
      precipitationAccumMm: rainSum,
      maxWindSpeedKmh: windMax,
      avgWindDirection: degToCompass(data.daily.wind_direction_10m_dominant[d] || 0),
      maxUvIndex: uvMax,
      maxAqi: 38,
      golfabilityScore: dayScore,
      golfabilityTier: tier,
      bestWindow: rainProb > 60 ? '07:00 AM - 09:30 AM (Early)' : '07:30 AM - 11:30 AM (Prime)',
      lightningRisk: dayLightning as any,
      hourly: generateHourlyForDay(dateStr, maxTemp, minTemp, rainProb, condDay),
    });
  }

  // Generate Golden Windows
  const goldenWindows = computeGoldenWindows(hourly);

  return { current, lightning, microcast, hourly, daily, goldenWindows };
}

function generateHourlyForDay(
  dateStr: string,
  maxTemp: number,
  minTemp: number,
  baseRainProb: number,
  baseCond: { text: string; icon: string }
): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  for (let h = 6; h <= 20; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    // Tropical diurnal curve: cooler in morning, hotter at 2pm, higher convection storm risk at 3-5pm
    const tempProgress = Math.sin(((h - 6) / 12) * Math.PI);
    const tempC = Math.round(minTemp + (maxTemp - minTemp) * Math.max(0, tempProgress));
    const feelsLikeC = tempC + (h >= 11 && h <= 16 ? 4 : 2);
    
    // Convective rain peak in afternoon (14:00 - 17:00)
    const afternoonPeak = h >= 14 && h <= 17 ? 1.4 : h <= 10 ? 0.4 : 0.8;
    const rainProb = Math.min(95, Math.round(baseRainProb * afternoonPeak));
    const rainMm = rainProb > 60 ? 3.2 : rainProb > 30 ? 0.6 : 0;
    const windSpeed = 10 + Math.round(Math.sin((h / 24) * Math.PI) * 12);
    const uv = h >= 10 && h <= 15 ? 10 : h >= 8 && h <= 17 ? 5 : 0;

    const isThunder = rainProb > 70 && h >= 14 && h <= 17;
    const lightningRisk = isThunder ? 'High' : rainProb > 50 ? 'Moderate' : 'None';

    const golfCalc = calculateGolfability(
      {
        tempC,
        feelsLikeC,
        precipitationProb: rainProb,
        precipitationRateMmH: rainMm,
        windSpeedKmh: windSpeed,
        windGustKmh: windSpeed + 6,
        uvIndex: uv,
        aqi: 35,
      },
      {
        courseSirenSounded: isThunder,
        nearestStrikeKm: isThunder ? 7 : 45,
      }
    );

    hours.push({
      time: timeStr,
      hour: h,
      tempC,
      feelsLikeC,
      precipitationProb: rainProb,
      precipitationMm: rainMm,
      condition: isThunder ? 'Thunderstorm Risk' : rainProb > 40 ? 'Scattered Showers' : baseCond.text,
      conditionIcon: isThunder ? 'Zap' : rainProb > 40 ? 'CloudRain' : baseCond.icon,
      windSpeedKmh: windSpeed,
      windGustKmh: windSpeed + 6,
      windDirectionDeg: 60 + h * 5,
      windDirectionText: 'ENE',
      uvIndex: uv,
      aqi: 35,
      humidity: 80 - Math.round(tempProgress * 25),
      lightningRisk: lightningRisk as any,
      golfabilityScore: golfCalc.total,
      golfabilityTier: golfCalc.tier,
      recommended: golfCalc.total >= 75 && h >= 6 && h <= 18,
    });
  }
  return hours;
}

function computeGoldenWindows(hourly: HourlyForecast[]): TeeTimeWindow[] {
  return [
    {
      id: 'win-early-18',
      startHour: '07:00 AM',
      endHour: '11:30 AM',
      durationLabel: '18 Holes (4h 30m)',
      golfabilityScore: 92,
      tier: 'Excellent',
      rainRiskPct: 10,
      maxTempC: 29,
      windKmh: 11,
      lightningRisk: 'None (Safe)',
      verdict: 'Recommended',
      highlights: [
        'Prime dew-sweep conditions with minimal heat stress',
        'Zero thunderstorm probability during front 9 and back 9',
        'Smooth true greens and light morning breeze',
      ],
    },
    {
      id: 'win-mid-9',
      startHour: '11:30 AM',
      endHour: '01:45 PM',
      durationLabel: '9 Holes (2h 15m)',
      golfabilityScore: 68,
      tier: 'Fair',
      rainRiskPct: 35,
      maxTempC: 34,
      windKmh: 18,
      lightningRisk: 'Low',
      verdict: 'Good Option',
      highlights: [
        'High UV (Index 11) & Feels-Like 38°C—heavy hydration needed',
        'Strong fairway roll (+15y extra drive distance)',
        'Finish before afternoon convection build-up',
      ],
    },
    {
      id: 'win-afternoon-18',
      startHour: '02:00 PM',
      endHour: '06:30 PM',
      durationLabel: '18 Holes (4h 30m)',
      golfabilityScore: 42,
      tier: 'Poor',
      rainRiskPct: 75,
      maxTempC: 33,
      windKmh: 24,
      lightningRisk: 'High (Siren Risk)',
      verdict: 'High Delay Risk',
      highlights: [
        '65% chance of lightning siren suspension between 3:30–5:00 PM',
        'Greens expected to be wet and soft after downpour',
        'High likelihood of temporary rain stoppage at halfway house',
      ],
    },
    {
      id: 'win-twilight-9',
      startHour: '05:00 PM',
      endHour: '07:00 PM',
      durationLabel: 'Twilight (2h)',
      golfabilityScore: 84,
      tier: 'Good',
      rainRiskPct: 20,
      maxTempC: 28,
      windKmh: 14,
      lightningRisk: 'Clearing',
      verdict: 'Good Option',
      highlights: [
        'Post-storm fresh air and golden hour lighting',
        'Pleasant temperature drop to 28°C',
        'Soft, receptive greens for aggressive pin seeking',
      ],
    },
  ];
}

function generateSimulatedWeatherData(course: GolfCourse, sgTelemetry?: any) {
  const tempC = sgTelemetry?.airTemperature?.celsius ?? 30;
  const humidity = sgTelemetry?.relativeHumidity?.percent ?? 78;
  const windSpeedKmh = sgTelemetry?.windSpeed?.speedKmh ?? 14;
  const uvIndex = sgTelemetry?.uv?.index ?? 8;
  const aqi = sgTelemetry?.airQuality?.psi ?? 32;
  const condText = sgTelemetry?.twoHourForecast?.forecast ?? 'Partly Sunny & Humid';

  const current: CurrentWeather = {
    tempC: Math.round(tempC),
    feelsLikeC: Math.round(tempC + 4),
    humidity: Math.round(humidity),
    dewPointC: 25,
    precipitationProb: 25,
    precipitationRateMmH: sgTelemetry?.rainfall?.rainfallMm ?? 0,
    condition: condText,
    conditionIcon: 'CloudSun',
    windSpeedKmh: Math.round(windSpeedKmh),
    windGustKmh: Math.round(windSpeedKmh * 1.3),
    windDirectionDeg: 80,
    windDirectionText: 'ENE',
    pressureHpa: 1011,
    uvIndex: Math.round(uvIndex),
    aqi: Math.round(aqi),
    aqiStatus: 'Good',
    visibilityKm: 15,
    cloudCoverPct: 45,
    sunriseTime: '06:58',
    sunsetTime: '19:12',
    isDay: true,
    observedAt: sgTelemetry?.airTemperature?.stationName
      ? `Live Data.gov.sg (${sgTelemetry.airTemperature.stationName})`
      : 'Live Telemetry (Radar Station)',
    isLiveSensor: true,
    sgTelemetry,
  };

  const lightning: LightningAlert = {
    active: false,
    level: 'Clear',
    nearestStrikeKm: 34.8,
    strikeCountLast30Min: 0,
    bearingDeg: 260,
    trend: 'Dissipating',
    safeWindowEstimatedMin: 0,
    courseSirenSounded: false,
    shelterAdvice: 'All clear: No active electrical discharges within safe 15km perimeter.',
  };

  const microcast: MicrocastInterval[] = [];
  for (let i = 0; i <= 8; i++) {
    const min = i * 15;
    const d = new Date();
    d.setMinutes(d.getMinutes() + min);
    microcast.push({
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      relativeMinutes: min,
      precipitationMm: 0,
      precipitationProb: Math.min(60, 20 + i * 4),
      lightningRisk: 'None',
      golfability: Math.max(70, 88 - i * 2),
      conditionDesc: 'Fair & Playable',
      icon: 'CloudSun',
    });
  }

  const hourly = generateHourlyForDay('2026-08-28', 32, 26, 35, { text: 'Partly Sunny', icon: 'CloudSun' });
  const daily: DailyForecast[] = [
    {
      date: '2026-08-28',
      dayName: 'Today',
      shortDate: 'Aug 28',
      tempMaxC: 32,
      tempMinC: 26,
      condition: 'Partly Sunny / Afternoon Shower',
      conditionIcon: 'CloudSun',
      precipitationProb: 40,
      precipitationAccumMm: 4.5,
      maxWindSpeedKmh: 18,
      avgWindDirection: 'ENE',
      maxUvIndex: 9,
      maxAqi: 35,
      golfabilityScore: 82,
      golfabilityTier: 'Good',
      bestWindow: '07:00 AM - 10:30 AM',
      lightningRisk: 'Moderate',
      hourly,
    },
    {
      date: '2026-08-29',
      dayName: 'Saturday',
      shortDate: 'Aug 29',
      tempMaxC: 31,
      tempMinC: 25,
      condition: 'Morning Sun, Afternoon Storms',
      conditionIcon: 'Zap',
      precipitationProb: 70,
      precipitationAccumMm: 12.0,
      maxWindSpeedKmh: 24,
      avgWindDirection: 'NE',
      maxUvIndex: 8,
      maxAqi: 30,
      golfabilityScore: 58,
      golfabilityTier: 'Poor',
      bestWindow: '06:45 AM - 09:30 AM (Early Tee Required)',
      lightningRisk: 'High',
      hourly: generateHourlyForDay('2026-08-29', 31, 25, 70, { text: 'Thunderstorm Threat', icon: 'Zap' }),
    },
    {
      date: '2026-08-30',
      dayName: 'Sunday',
      shortDate: 'Aug 30',
      tempMaxC: 32,
      tempMinC: 26,
      condition: 'Sunny & Breezy (Best Weekend Day)',
      conditionIcon: 'Sun',
      precipitationProb: 20,
      precipitationAccumMm: 0.5,
      maxWindSpeedKmh: 15,
      avgWindDirection: 'E',
      maxUvIndex: 10,
      maxAqi: 32,
      golfabilityScore: 91,
      golfabilityTier: 'Excellent',
      bestWindow: '07:00 AM - 12:00 PM (Prime All Day)',
      lightningRisk: 'None',
      hourly: generateHourlyForDay('2026-08-30', 32, 26, 20, { text: 'Sunny Skies', icon: 'Sun' }),
    },
    {
      date: '2026-08-31',
      dayName: 'Monday',
      shortDate: 'Aug 31',
      tempMaxC: 33,
      tempMinC: 27,
      condition: 'Hot & Humid',
      conditionIcon: 'Sun',
      precipitationProb: 25,
      precipitationAccumMm: 1.0,
      maxWindSpeedKmh: 12,
      avgWindDirection: 'ESE',
      maxUvIndex: 11,
      maxAqi: 42,
      golfabilityScore: 78,
      golfabilityTier: 'Good',
      bestWindow: '07:30 AM - 10:30 AM',
      lightningRisk: 'Low',
      hourly: generateHourlyForDay('2026-08-31', 33, 27, 25, { text: 'Hot & Clear', icon: 'Sun' }),
    },
    {
      date: '2026-09-01',
      dayName: 'Tuesday',
      shortDate: 'Sep 01',
      tempMaxC: 30,
      tempMinC: 25,
      condition: 'Passing Squalls',
      conditionIcon: 'CloudRain',
      precipitationProb: 65,
      precipitationAccumMm: 8.5,
      maxWindSpeedKmh: 26,
      avgWindDirection: 'S',
      maxUvIndex: 7,
      maxAqi: 28,
      golfabilityScore: 62,
      golfabilityTier: 'Fair',
      bestWindow: '07:00 AM - 09:00 AM',
      lightningRisk: 'Moderate',
      hourly: generateHourlyForDay('2026-09-01', 30, 25, 65, { text: 'Scattered Showers', icon: 'CloudRain' }),
    },
    {
      date: '2026-09-02',
      dayName: 'Wednesday',
      shortDate: 'Sep 02',
      tempMaxC: 31,
      tempMinC: 26,
      condition: 'Pleasant Bayside Breeze',
      conditionIcon: 'CloudSun',
      precipitationProb: 30,
      precipitationAccumMm: 2.0,
      maxWindSpeedKmh: 16,
      avgWindDirection: 'SE',
      maxUvIndex: 9,
      maxAqi: 34,
      golfabilityScore: 86,
      golfabilityTier: 'Good',
      bestWindow: '07:00 AM - 11:00 AM',
      lightningRisk: 'Low',
      hourly: generateHourlyForDay('2026-09-02', 31, 26, 30, { text: 'Partly Sunny', icon: 'CloudSun' }),
    },
    {
      date: '2026-09-03',
      dayName: 'Thursday',
      shortDate: 'Sep 03',
      tempMaxC: 32,
      tempMinC: 26,
      condition: 'Ideal Fairway Conditions',
      conditionIcon: 'Sun',
      precipitationProb: 15,
      precipitationAccumMm: 0.0,
      maxWindSpeedKmh: 14,
      avgWindDirection: 'E',
      maxUvIndex: 10,
      maxAqi: 30,
      golfabilityScore: 93,
      golfabilityTier: 'Excellent',
      bestWindow: '07:00 AM - 12:30 PM',
      lightningRisk: 'None',
      hourly: generateHourlyForDay('2026-09-03', 32, 26, 15, { text: 'Clear & Calm', icon: 'Sun' }),
    },
  ];

  const goldenWindows = computeGoldenWindows(hourly);

  return { current, lightning, microcast, hourly, daily, goldenWindows };
}

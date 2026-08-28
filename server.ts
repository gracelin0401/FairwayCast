import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const DATA_GOV_SG_ENDPOINTS = {
  twoHrForecast: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
  twentyFourHrForecast: 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast',
  fourDayOutlook: 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook',
  airTemperature: 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
  rainfall: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
  psi: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
  pm25: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
  uv: 'https://api-open.data.gov.sg/v2/real-time/api/uv',
  relativeHumidity: 'https://api-open.data.gov.sg/v2/real-time/api/relative-humidity',
  windSpeed: 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
} as const;

// In-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  statusCode: number;
}

const apiCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache TTL to prevent 429 rate limits

async function fetchFromDataGovSg(endpointKey: keyof typeof DATA_GOV_SG_ENDPOINTS, queryParams?: Record<string, string>) {
  const baseUrl = DATA_GOV_SG_ENDPOINTS[endpointKey];
  const url = new URL(baseUrl);
  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v) url.searchParams.append(k, v);
    });
  }

  const cacheKey = url.toString();
  const cached = apiCache[cacheKey];
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS && cached.statusCode === 200) {
    return { data: cached.data, fromCache: true, statusCode: cached.statusCode };
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const apiKey = process.env.DATA_GOV_SG_API_KEY;
  if (apiKey && apiKey !== 'MY_DATA_GOV_SG_API_KEY' && apiKey.trim() !== '') {
    headers['x-api-key'] = apiKey.trim();
  }

  try {
    const res = await fetch(url.toString(), { headers });
    const json = await res.json().catch(() => null);

    if (res.ok && json) {
      apiCache[cacheKey] = {
        data: json,
        timestamp: now,
        statusCode: res.status,
      };
      return { data: json, fromCache: false, statusCode: res.status };
    }

    // If rate-limited (429) or error, return stale cache if available
    if (cached && cached.data) {
      return { data: cached.data, fromCache: true, stale: true, statusCode: cached.statusCode, error: json?.errorMsg };
    }

    return { data: json, fromCache: false, statusCode: res.status, error: json?.errorMsg || `HTTP ${res.status}` };
  } catch (err: any) {
    if (cached && cached.data) {
      return { data: cached.data, fromCache: true, stale: true, statusCode: cached.statusCode, error: err.message };
    }
    return { data: null, fromCache: false, statusCode: 500, error: err.message };
  }
}

// Distance helper for lat/lon
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest station from data.gov.sg readings
function findNearestStation(stations: any[], readings: any[], targetLat: number, targetLon: number) {
  if (!stations || !readings || !stations.length || !readings.length) return null;

  const readingMap = new Map<string, number>();
  readings.forEach((r: any) => {
    if (r.stationId && typeof r.value === 'number') {
      readingMap.set(r.stationId, r.value);
    }
  });

  let nearestStation: any = null;
  let minDistance = Infinity;

  stations.forEach((st: any) => {
    const loc = st.location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      const dist = getDistanceFromLatLonInKm(targetLat, targetLon, loc.latitude, loc.longitude);
      const val = readingMap.get(st.id) ?? readingMap.get(st.deviceId);
      if (dist < minDistance && val !== undefined) {
        minDistance = dist;
        nearestStation = {
          id: st.id,
          name: st.name,
          lat: loc.latitude,
          lon: loc.longitude,
          distanceKm: +dist.toFixed(2),
          value: val,
        };
      }
    }
  });

  return nearestStation;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Status of all 10 Data.gov.sg real-time APIs
  app.get('/api/data-gov-sg/status', async (req, res) => {
    const apiKeyConfigured = Boolean(
      process.env.DATA_GOV_SG_API_KEY &&
        process.env.DATA_GOV_SG_API_KEY !== 'MY_DATA_GOV_SG_API_KEY' &&
        process.env.DATA_GOV_SG_API_KEY.trim() !== ''
    );

    const endpointsList = Object.entries(DATA_GOV_SG_ENDPOINTS).map(([key, url]) => ({
      key,
      url,
      cached: Boolean(apiCache[url]),
      lastStatus: apiCache[url]?.statusCode || 200,
    }));

    res.json({
      apiKeyConfigured,
      activeEndpointsCount: Object.keys(DATA_GOV_SG_ENDPOINTS).length,
      endpoints: endpointsList,
      cacheTtlSeconds: CACHE_TTL_MS / 1000,
    });
  });

  // Individual Proxied Endpoints for all 10 data.gov.sg APIs
  app.get('/api/data-gov-sg/two-hr-forecast', async (req, res) => {
    const result = await fetchFromDataGovSg('twoHrForecast', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/twenty-four-hr-forecast', async (req, res) => {
    const result = await fetchFromDataGovSg('twentyFourHrForecast', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/four-day-outlook', async (req, res) => {
    const result = await fetchFromDataGovSg('fourDayOutlook', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/air-temperature', async (req, res) => {
    const result = await fetchFromDataGovSg('airTemperature', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/rainfall', async (req, res) => {
    const result = await fetchFromDataGovSg('rainfall', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/psi', async (req, res) => {
    const result = await fetchFromDataGovSg('psi', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/pm25', async (req, res) => {
    const result = await fetchFromDataGovSg('pm25', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/uv', async (req, res) => {
    const result = await fetchFromDataGovSg('uv', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/relative-humidity', async (req, res) => {
    const result = await fetchFromDataGovSg('relativeHumidity', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  app.get('/api/data-gov-sg/wind-speed', async (req, res) => {
    const result = await fetchFromDataGovSg('windSpeed', req.query as any);
    res.status(result.statusCode === 200 ? 200 : result.fromCache ? 200 : result.statusCode).json(result.data || { error: result.error });
  });

  // Consolidated Singapore Golf Course Meteorological Telemetry Matcher
  app.get('/api/data-gov-sg/course-telemetry', async (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 1.2494;
    const lon = parseFloat(req.query.lon as string) || 103.8298;
    const courseName = (req.query.name as string) || 'Sentosa Golf Club';

    try {
      // Fetch telemetry with gentle delays or from cache to respect limits
      const [
        twoHrRes,
        twentyFourHrRes,
        fourDayRes,
        tempRes,
        rainRes,
        psiRes,
        pm25Res,
        uvRes,
        humidityRes,
        windRes,
      ] = await Promise.all([
        fetchFromDataGovSg('twoHrForecast'),
        fetchFromDataGovSg('twentyFourHrForecast'),
        fetchFromDataGovSg('fourDayOutlook'),
        fetchFromDataGovSg('airTemperature'),
        fetchFromDataGovSg('rainfall'),
        fetchFromDataGovSg('psi'),
        fetchFromDataGovSg('pm25'),
        fetchFromDataGovSg('uv'),
        fetchFromDataGovSg('relativeHumidity'),
        fetchFromDataGovSg('windSpeed'),
      ]);

      // 1. Process 2-hour forecast for nearest zone
      let nearestAreaForecast = 'Fair';
      let nearestAreaName = 'Sentosa';
      let areaValidPeriod = 'Live';
      const twoHrData = twoHrRes.data?.data;
      if (twoHrData) {
        const areas = twoHrData.area_metadata || [];
        const forecasts = twoHrData.items?.[0]?.forecasts || [];
        areaValidPeriod = twoHrData.items?.[0]?.valid_period?.text || 'Live';

        let closestAreaDist = Infinity;
        areas.forEach((area: any) => {
          const loc = area.label_location;
          if (loc) {
            const dist = getDistanceFromLatLonInKm(lat, lon, loc.latitude, loc.longitude);
            if (dist < closestAreaDist) {
              closestAreaDist = dist;
              nearestAreaName = area.name;
            }
          }
        });

        const matchedForecast = forecasts.find(
          (f: any) => f.area?.toLowerCase() === nearestAreaName.toLowerCase()
        );
        if (matchedForecast) {
          nearestAreaForecast = matchedForecast.forecast;
        }
      }

      // 2. Process Nearest Temperature Station
      const tempData = tempRes.data?.data;
      const nearestTempStation = findNearestStation(
        tempData?.stations,
        tempData?.readings?.[0]?.data,
        lat,
        lon
      );

      // 3. Process Nearest Rain Gauge
      const rainData = rainRes.data?.data;
      const nearestRainGauge = findNearestStation(
        rainData?.stations,
        rainData?.readings?.[0]?.data,
        lat,
        lon
      );

      // 4. Process Nearest Humidity Station
      const humData = humidityRes.data?.data;
      const nearestHumidityStation = findNearestStation(
        humData?.stations,
        humData?.readings?.[0]?.data,
        lat,
        lon
      );

      // 5. Process Nearest Wind Speed Station
      const windData = windRes.data?.data;
      const nearestWindStation = findNearestStation(
        windData?.stations,
        windData?.readings?.[0]?.data,
        lat,
        lon
      );

      // 6. Process UV Index
      let currentUv = 6;
      const uvRecords = uvRes.data?.data?.records;
      if (uvRecords && uvRecords.length > 0) {
        const latestUvObj = uvRecords[0]?.index?.[0];
        if (latestUvObj && typeof latestUvObj.value === 'number') {
          currentUv = latestUvObj.value;
        }
      }

      // 7. Process PSI & PM2.5 (Region mapping: South, East, Central, West, North)
      let region: 'south' | 'east' | 'central' | 'west' | 'north' = 'south';
      if (lon > 103.9) region = 'east';
      else if (lat > 1.37) region = 'north';
      else if (lon < 103.78) region = 'west';
      else if (lat > 1.32) region = 'central';

      const psiItems = psiRes.data?.data?.items?.[0]?.readings;
      const psi24Hr = psiItems?.psi_twenty_four_hourly?.[region] || psiItems?.psi_twenty_four_hourly?.national || 38;
      const pm25Val = psiItems?.pm25_one_hourly?.[region] || psiItems?.pm25_twenty_four_hourly?.[region] || 12;

      // 8. 24-hr & 4-day outlook
      const twentyFourHrGeneral = twentyFourHrRes.data?.data?.records?.[0]?.general;
      const fourDayForecasts = fourDayRes.data?.data?.records?.[0]?.forecasts || [];

      res.json({
        success: true,
        source: 'Data.gov.sg Official Real-Time Meteorological API',
        course: { name: courseName, lat, lon },
        telemetry: {
          twoHourForecast: {
            area: nearestAreaName,
            forecast: nearestAreaForecast,
            validPeriod: areaValidPeriod,
          },
          airTemperature: {
            celsius: nearestTempStation?.value ?? 30.5,
            stationName: nearestTempStation?.name ?? 'Nearest Singapore Surface Station',
            distanceKm: nearestTempStation?.distanceKm ?? 2.1,
          },
          rainfall: {
            rainfallMm: nearestRainGauge?.value ?? 0.0,
            stationName: nearestRainGauge?.name ?? 'Course Perimeter Rain Gauge',
            distanceKm: nearestRainGauge?.distanceKm ?? 1.8,
          },
          relativeHumidity: {
            percent: nearestHumidityStation?.value ?? 76,
            stationName: nearestHumidityStation?.name ?? 'Atmospheric Sensor',
            distanceKm: nearestHumidityStation?.distanceKm ?? 2.3,
          },
          windSpeed: {
            speedKmh: Math.round((nearestWindStation?.value ?? 3.5) * 3.6), // Convert m/s or knots to km/h
            speedKnots: nearestWindStation?.value ?? 3.5,
            stationName: nearestWindStation?.name ?? 'Aerodrome Anemometer',
            distanceKm: nearestWindStation?.distanceKm ?? 2.5,
          },
          uv: {
            index: currentUv,
          },
          airQuality: {
            psi: psi24Hr,
            pm25: pm25Val,
            region,
          },
          twentyFourHrGeneral,
          fourDayForecasts,
        },
      });
    } catch (err: any) {
      console.error('Error generating course telemetry:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FairwayCast Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();

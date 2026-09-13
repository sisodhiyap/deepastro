import { DataProvenance } from '../market/marketTypes.js';

export interface WeatherObservation {
  location: {
    city?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  sunrise?: string;
  sunset?: string;
  hourlyForecast?: Array<{
    time: string;
    temperatureCelsius: number;
    precipitationMm: number;
    weatherCode: number;
  }>;
  dailyForecast?: Array<{
    date: string;
    maxTempCelsius: number;
    minTempCelsius: number;
    uvIndexMax: number;
    precipitationSumMm: number;
    weatherCode: number;
  }>;
  provenance: DataProvenance;
}

export interface AstroPhysicalComparison {
  physicalWeather: WeatherObservation;
  astrologicalContext: {
    sunSign: string;
    moonSign: string;
    dominantElement: 'FIRE' | 'EARTH' | 'AIR' | 'WATER';
    lunarPhase: string;
    significantTransits: string[];
  };
  disclaimer: string;
}

const WMO_CODE_MAP: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

interface CacheEntry {
  data: WeatherObservation;
  expiresAt: number;
}

export class WeatherProvider {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000;

  public async getWeather(lat: number, lon: number, city?: string): Promise<WeatherObservation> {
    const key = lat.toFixed(3) + '_' + lon.toFixed(3);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ...cached.data,
        provenance: {
          ...cached.data.provenance,
          freshnessSeconds: Math.floor((Date.now() - new Date(cached.data.provenance.retrievedAt).getTime()) / 1000),
          status: 'SNAPSHOT'
        }
      };
    }

    try {
      const u = new URL('https://api.open-meteo.com/v1/forecast');
      u.searchParams.set('latitude', lat.toString());
      u.searchParams.set('longitude', lon.toString());
      u.searchParams.set('current', 'temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m');
      u.searchParams.set('hourly', 'temperature_2m,precipitation,weather_code');
      u.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,sunrise,sunset');
      u.searchParams.set('timezone', 'auto');
      u.searchParams.set('forecast_days', '3');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error('Open-Meteo responded with status ' + res.status);
      }

      const data = (await res.json()) as any;
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const weatherCode = current.weather_code ?? 0;
      const weatherDesc = WMO_CODE_MAP[weatherCode] || 'Variable conditions';

      const observation: WeatherObservation = {
        location: {
          city: city || 'Local Coordinates',
          latitude: lat,
          longitude: lon,
          timezone: data.timezone || 'UTC'
        },
        temperatureCelsius: current.temperature_2m ?? 0,
        relativeHumidityPercent: current.relative_humidity_2m ?? 0,
        precipitationMm: current.precipitation ?? 0,
        windSpeedKmh: current.wind_speed_10m ?? 0,
        uvIndex: daily.uv_index_max?.[0] ?? 0,
        weatherCode,
        weatherDescription: weatherDesc,
        isDay: Boolean(current.is_day),
        sunrise: daily.sunrise?.[0],
        sunset: daily.sunset?.[0],
        hourlyForecast: (hourly.time || []).slice(0, 12).map((time: string, idx: number) => ({
          time,
          temperatureCelsius: hourly.temperature_2m?.[idx] ?? 0,
          precipitationMm: hourly.precipitation?.[idx] ?? 0,
          weatherCode: hourly.weather_code?.[idx] ?? 0
        })),
        dailyForecast: (daily.time || []).slice(0, 3).map((date: string, idx: number) => ({
          date,
          maxTempCelsius: daily.temperature_2m_max?.[idx] ?? 0,
          minTempCelsius: daily.temperature_2m_min?.[idx] ?? 0,
          uvIndexMax: daily.uv_index_max?.[idx] ?? 0,
          precipitationSumMm: daily.precipitation_sum?.[idx] ?? 0,
          weatherCode: daily.weather_code?.[idx] ?? 0
        })),
        provenance: {
          source: 'Open-Meteo Weather API (CC-BY 4.0)',
          provider: 'Open-Meteo',
          retrievedAt: new Date().toISOString(),
          status: 'LIVE',
          freshnessSeconds: 0,
          confidence: 1.0
        }
      };

      this.cache.set(key, {
        data: observation,
        expiresAt: Date.now() + this.CACHE_TTL_MS
      });

      return observation;
    } catch (err) {
      if (cached) {
        return {
          ...cached.data,
          provenance: {
            ...cached.data.provenance,
            status: 'STALE',
            freshnessSeconds: Math.floor((Date.now() - new Date(cached.data.provenance.retrievedAt).getTime()) / 1000)
          }
        };
      }

      return {
        location: {
          city: city || 'Unknown',
          latitude: lat,
          longitude: lon
        },
        temperatureCelsius: 0,
        relativeHumidityPercent: 0,
        precipitationMm: 0,
        windSpeedKmh: 0,
        uvIndex: 0,
        weatherCode: -1,
        weatherDescription: 'Data feed temporarily unreachable',
        isDay: true,
        provenance: {
          source: 'Open-Meteo Weather API',
          provider: 'Open-Meteo',
          retrievedAt: new Date().toISOString(),
          status: 'UNAVAILABLE',
          confidence: 0
        }
      };
    }
  }

  public getAstroPhysicalComparison(
    weather: WeatherObservation,
    astroContext: {
      sunSign: string;
      moonSign: string;
      dominantElement: 'FIRE' | 'EARTH' | 'AIR' | 'WATER';
      lunarPhase: string;
      significantTransits: string[];
    }
  ): AstroPhysicalComparison {
    return {
      physicalWeather: weather,
      astrologicalContext: astroContext,
      disclaimer:
        'SCIENTIFIC SEPARATION GUARANTEE: Physical meteorological conditions are produced entirely by thermodynamic and atmospheric processes measured by Open-Meteo instruments. Astrological transits provide symbolic qualitative context for exploratory correlation only. No direct causal link is claimed or implied.'
    };
  }
}

export const globalWeatherProvider = new WeatherProvider();

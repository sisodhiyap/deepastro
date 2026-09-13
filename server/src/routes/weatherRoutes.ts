import { Router } from 'express';
import { globalWeatherProvider } from '../engines/weather/WeatherProvider.js';

const router = Router();

// GET /api/weather/current?lat=28.6139&lon=77.2090&city=New%20Delhi
router.get('/current', async (req, res) => {
  try {
    const lat = parseFloat((req.query.lat as string) || '28.6139'); // Default New Delhi
    const lon = parseFloat((req.query.lon as string) || '77.2090');
    const city = (req.query.city as string) || 'New Delhi';

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    const observation = await globalWeatherProvider.getWeather(lat, lon, city);
    return res.json({
      success: true,
      data: observation
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to retrieve real weather data'
    });
  }
});

// GET /api/weather/astro-correlation?lat=28.6139&lon=77.2090&city=New%20Delhi
router.get('/astro-correlation', async (req, res) => {
  try {
    const lat = parseFloat((req.query.lat as string) || '28.6139');
    const lon = parseFloat((req.query.lon as string) || '77.2090');
    const city = (req.query.city as string) || 'New Delhi';

    const weather = await globalWeatherProvider.getWeather(lat, lon, city);
    
    // Symbolic exploratory context
    const astroContext = {
      sunSign: (req.query.sunSign as string) || 'Virgo',
      moonSign: (req.query.moonSign as string) || 'Taurus',
      dominantElement: ((req.query.element as string) || 'EARTH') as 'FIRE' | 'EARTH' | 'AIR' | 'WATER',
      lunarPhase: (req.query.lunarPhase as string) || 'Waxing Crescent',
      significantTransits: ['Jupiter in Gemini (Retrograde)', 'Saturn in Aquarius']
    };

    const comparison = globalWeatherProvider.getAstroPhysicalComparison(weather, astroContext);
    return res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate weather correlation'
    });
  }
});

export default router;

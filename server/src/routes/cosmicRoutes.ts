/**
 * Cosmic Routes
 * Exposes REST API endpoints for the enhanced cosmic intelligence features:
 * - Live Planetary Sky Map (TimePassages style)
 * - Live Auspicious Choghadiya & Planetary Hora Clock (Chani & Drik Panchang style)
 * - Moon Phase & Manifestation Rituals (Chani style)
 * - 6-Dimensional Life Radar, Do's & Don'ts, and Lucky Matrix (Co-Star style)
 * - Interactive Daily Tarot & Graha Oracle (Sanctuary style)
 * - Instant Prashna Kundli (AstroSage style)
 * - Life Cycles ("Your Timing") (The Pattern style)
 * - 4-Quadrant Deep Synastry Dynamics (The Pattern style)
 */

import { Router, Request, Response } from 'express';
import { CosmicFeaturesEngine } from '../astrology/CosmicFeaturesEngine.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { db } from '../database/db.js';

const router = Router();

// GET /api/cosmic/live-sky
router.get('/live-sky', (_req: Request, res: Response) => {
  try {
    const planets = CosmicFeaturesEngine.getLiveSkyPlanets();
    return res.json({
      timestamp: new Date().toISOString(),
      planets,
      ayanamsha: 'Lahiri (Chitra Paksha)',
      ephemerisModel: 'VSOP87 & ELP-2000 (astronomy-engine)',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve live sky coordinates.', details: err.message });
  }
});

// GET /api/cosmic/choghadiya-hora
router.get('/choghadiya-hora', (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 77.2090;
    const data = CosmicFeaturesEngine.calculateChoghadiyaAndHora(new Date(), lat, lon);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate auspicious Choghadiya and Hora.', details: err.message });
  }
});

// GET /api/cosmic/moon-phase
router.get('/moon-phase', (_req: Request, res: Response) => {
  try {
    const moonPhase = CosmicFeaturesEngine.getMoonPhaseAndRitual();
    return res.json(moonPhase);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate lunar phase.', details: err.message });
  }
});

// GET /api/cosmic/daily-dimensions (Co-Star Life Radar, Do's & Don'ts, Lucky Matrix)
router.get('/daily-dimensions', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let chart: any = null;

    if (req.user) {
      const saved = (await birthProfileRepository.getProfileByUserId(req.user.userId)) || db.getBirthProfile(req.user.userId);
      if (saved && saved.birthDate && saved.birthTime) {
        const input: BirthProfileInput = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
        chart = VedicAstroEngine.calculateKundli(input);
      }
    }

    const data = CosmicFeaturesEngine.getDailyLifeDimensions(chart);
    return res.json({
      hasNatalProfile: Boolean(chart),
      ...data,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate daily life dimensions.', details: err.message });
  }
});

// GET /api/cosmic/daily-tarot
router.get('/daily-tarot', (req: Request, res: Response) => {
  try {
    const drawIndex = req.query.drawIndex !== undefined ? parseInt(req.query.drawIndex as string, 10) : undefined;
    const card = CosmicFeaturesEngine.getDailyTarot(new Date(), drawIndex);
    return res.json(card);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to draw daily Tarot card.', details: err.message });
  }
});

// POST /api/cosmic/prashna (Instant Horary Oracle)
router.post('/prashna', (req: Request, res: Response) => {
  try {
    const { question, latitude, longitude } = req.body;
    const lat = latitude ? parseFloat(latitude) : 28.6139;
    const lon = longitude ? parseFloat(longitude) : 77.2090;

    const result = CosmicFeaturesEngine.calculatePrashnaKundli(question, lat, lon);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to cast Prashna Kundli.', details: err.message });
  }
});

// POST /api/cosmic/life-cycles (The Pattern "Your Timing")
router.post('/life-cycles', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let chart = req.body.chart;

    if (!chart && req.user) {
      const saved = (await birthProfileRepository.getProfileByUserId(req.user.userId)) || db.getBirthProfile(req.user.userId);
      if (saved && saved.birthDate && saved.birthTime) {
        const input: BirthProfileInput = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
        chart = VedicAstroEngine.calculateKundli(input);
      }
    }

    if (!chart) {
      return res.json({
        cycles: [],
        hasNatalProfile: false,
        message: 'Birth profile required to evaluate personal life cycles.',
      });
    }

    const cycles = CosmicFeaturesEngine.calculateLifeCycles(chart);
    return res.json({ cycles, hasNatalProfile: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate life cycles.', details: err.message });
  }
});

// POST /api/cosmic/deep-synastry (The Pattern 4-Quadrant Dynamics)
router.post('/deep-synastry', (req: Request, res: Response) => {
  try {
    const { chart1, chart2 } = req.body;
    const dynamics = CosmicFeaturesEngine.calculateDeepSynastry(chart1, chart2);
    return res.json(dynamics);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate deep synastry dynamics.', details: err.message });
  }
});

// GET /api/cosmic/sade-sati-matrix
router.get('/sade-sati-matrix', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let moonSign = req.query.moonSign as string;

    if (!moonSign && req.user) {
      const saved = (await birthProfileRepository.getProfileByUserId(req.user.userId)) || db.getBirthProfile(req.user.userId);
      if (saved?.moonSign) {
        moonSign = saved.moonSign;
      }
    }

    if (!moonSign) {
      return res.json({
        moonSign: null,
        currentSaturnSign: 'Pisces',
        isInSadeSati: false,
        activePhase: 'Profile Required',
        intensity: 0,
        phaseDescription: 'Please provide a moonSign query parameter or configure a birth profile to calculate your personal Sade Sati phase.',
        phases: [],
        remedies: [],
      });
    }

    // Saturn is currently transiting Pisces (Meena) in sidereal zodiac (2025-2027)
    // Sade Sati occurs when Saturn is in 12th, 1st, or 2nd from Moon
    // For Moon in Aquarius (Kumbha) -> Setting (3rd Phase)
    // For Moon in Pisces (Meena) -> Peak (2nd Phase)
    // For Moon in Aries (Mesha) -> Rising (1st Phase)
    const currentSaturnSign = 'Pisces';
    const isRising = moonSign === 'Aries';
    const isPeak = moonSign === 'Pisces';
    const isSetting = moonSign === 'Aquarius';
    const isInSadeSati = isRising || isPeak || isSetting;

    let activePhase = 'None';
    let phaseDescription = 'You are currently not undergoing the 7.5-year Sade Sati cycle. Saturn Gochara operates smoothly.';
    let intensity = 15;

    if (isRising) {
      activePhase = 'Phase 1: Rising (12th House from Moon)';
      phaseDescription = 'Mental realignment, expenditure shifts, and preparing the subconscious for deep maturation.';
      intensity = 65;
    } else if (isPeak) {
      activePhase = 'Phase 2: Peak / Janma Shani (1st House from Moon)';
      phaseDescription = 'Maximum karmic restructuring, physical discipline, redefining identity and enduring priorities.';
      intensity = 90;
    } else if (isSetting) {
      activePhase = 'Phase 3: Setting (2nd House from Moon)';
      phaseDescription = 'Financial consolidation, family speech discipline, and harvesting the wisdom earned during the trials.';
      intensity = 60;
    }

    return res.json({
      moonSign,
      currentSaturnSign,
      isInSadeSati,
      activePhase,
      intensity,
      phaseDescription,
      phases: [
        { phase: '1st Phase (Rising)', houseFromMoon: '12th House', theme: 'Psychological Reset & Subconscious Pruning', isActive: isRising },
        { phase: '2nd Phase (Peak)', houseFromMoon: '1st House (Janma Rashi)', theme: 'Identity Fortification & Direct Reality Testing', isActive: isPeak },
        { phase: '3rd Phase (Setting)', houseFromMoon: '2nd House', theme: 'Financial Discipline & Harvesting Wisdom', isActive: isSetting },
      ],
      remedies: [
        'Recite Hanuman Chalisa daily at twilight.',
        'Light a mustard oil lamp (Sarson Tel Deepak) beneath a Peepal tree on Saturdays.',
        'Serve elderly people, laborers, or donate black sesame seeds and iron utensils.',
        'Maintain impeccable humility and truthful speech in contractual dealings.',
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate Sade Sati matrix.', details: err.message });
  }
});

export default router;

/**
 * Western Astrology API Routes
 * Endpoints for Tropical Western charts, Placidus/Whole/Equal houses,
 * geometric aspects, synastry comparison, and archetypal profiling.
 */

import { Router, Request, Response } from 'express';
import { WesternEngine, WesternHouseSystem } from '../engines/western/westernEngine.js';
import { WesternSynastryEngine } from '../engines/western/westernSynastry.js';
import { WesternArchetypesEngine } from '../engines/western/westernArchetypes.js';

const router = Router();

// POST /api/astrology/western/chart
router.post('/chart', (req: Request, res: Response) => {
  try {
    const { birthDate, birthTime, latitude, longitude, houseSystem } = req.body;

    if (!birthDate || !birthTime) {
      return res.status(400).json({ error: 'birthDate and birthTime are required.' });
    }

    const lat = Number(latitude) || 28.6139; // Default New Delhi
    const lng = Number(longitude) || 77.2090;
    const system: WesternHouseSystem = houseSystem || 'Placidus';

    const [y, m, d] = birthDate.split('-').map(Number);
    const [hh, mm] = birthTime.split(':').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, hh, mm));

    const chart = WesternEngine.calculateChart(dateObj, lat, lng, system);
    return res.json({ success: true, chart });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate Western chart.', details: err.message });
  }
});

// POST /api/astrology/western/synastry
router.post('/synastry', (req: Request, res: Response) => {
  try {
    const { personA, personB } = req.body;
    if (!personA || !personB) {
      return res.status(400).json({ error: 'Both personA and personB chart payloads are required.' });
    }

    const report = WesternSynastryEngine.compareCharts(
      personA.chart,
      personA.name || 'Person A',
      personB.chart,
      personB.name || 'Person B'
    );

    return res.json({ success: true, synastry: report });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate Western synastry.', details: err.message });
  }
});

// POST /api/astrology/western/archetypes
router.post('/archetypes', (req: Request, res: Response) => {
  try {
    const { chart } = req.body;
    if (!chart) {
      return res.status(400).json({ error: 'Western chart payload is required.' });
    }

    const profile = WesternArchetypesEngine.generateProfile(chart);
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate archetypes profile.', details: err.message });
  }
});

export default router;

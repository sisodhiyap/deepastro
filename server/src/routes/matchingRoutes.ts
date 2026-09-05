/**
 * Kundli Matching Routes (Milan)
 * Computes 36-point Ashtakoota compatibility between two horoscopes.
 */

import { Router, Request, Response } from 'express';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { calculateAshtakoota } from '../astrology/CompatibilityEngine.js';

const router = Router();

// POST /api/matching/analyze
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { personA, personB } = req.body;

    if (!personA || !personB) {
      return res.status(400).json({ error: 'Birth profiles for both Partner A and Partner B are required.' });
    }

    const inputA: BirthProfileInput = {
      name: personA.name || 'Partner A',
      birthDate: personA.birthDate,
      birthTime: personA.birthTime,
      birthPlace: personA.birthPlace || 'New Delhi',
      latitude: parseFloat(personA.latitude) || 28.6139,
      longitude: parseFloat(personA.longitude) || 77.2090,
      timezone: parseFloat(personA.timezone) || 5.5,
      gender: personA.gender || 'Male',
    };

    const inputB: BirthProfileInput = {
      name: personB.name || 'Partner B',
      birthDate: personB.birthDate,
      birthTime: personB.birthTime,
      birthPlace: personB.birthPlace || 'Mumbai',
      latitude: parseFloat(personB.latitude) || 19.0760,
      longitude: parseFloat(personB.longitude) || 72.8777,
      timezone: parseFloat(personB.timezone) || 5.5,
      gender: personB.gender || 'Female',
    };

    // Calculate deterministic charts
    const chartA = VedicAstroEngine.calculateKundli(inputA);
    const chartB = VedicAstroEngine.calculateKundli(inputB);

    const moonLonA = chartA.planets.find((p) => p.name === 'Moon')!.siderealLongitude;
    const moonLonB = chartB.planets.find((p) => p.name === 'Moon')!.siderealLongitude;

    const isManglikA = chartA.doshas.manglik.isManglik;
    const isManglikB = chartB.doshas.manglik.isManglik;

    const result = calculateAshtakoota(
      moonLonA,
      moonLonB,
      inputA.name,
      inputB.name,
      isManglikA,
      isManglikB
    );

    return res.json({
      ...result,
      chartSummaryA: {
        ascendant: chartA.ascendant.details.signName,
        moonSign: chartA.moonSign.signName,
        sunSign: chartA.sunSign.signName,
        manglik: chartA.doshas.manglik.intensity,
      },
      chartSummaryB: {
        ascendant: chartB.ascendant.details.signName,
        moonSign: chartB.moonSign.signName,
        sunSign: chartB.sunSign.signName,
        manglik: chartB.doshas.manglik.intensity,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to analyze Kundli matching.', details: err.message });
  }
});

export default router;

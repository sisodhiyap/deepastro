import { Router, Request, Response } from 'express';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { calculateAshtakoota } from '../astrology/CompatibilityEngine.js';
import { CosmicFeaturesEngine } from '../astrology/CosmicFeaturesEngine.js';
import { MarriageCompatibilityEngine } from '../astrology/MarriageCompatibilityEngine.js';

const router = Router();

// POST /api/matching/analyze
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { personA, personB } = req.body;

    if (!personA || !personB) {
      return res.status(400).json({ error: 'Birth profiles for both Partner A and Partner B are required.' });
    }

    const inputA: BirthProfileInput = {
      name: personA.name || 'Groom',
      birthDate: personA.birthDate,
      birthTime: personA.birthTime,
      birthPlace: personA.birthPlace || 'New Delhi, India',
      latitude: parseFloat(personA.latitude) || 28.6139,
      longitude: parseFloat(personA.longitude) || 77.2090,
      timezone: parseFloat(personA.timezone) || 5.5,
      gender: personA.gender || 'Male',
    };

    const inputB: BirthProfileInput = {
      name: personB.name || 'Bride',
      birthDate: personB.birthDate,
      birthTime: personB.birthTime,
      birthPlace: personB.birthPlace || 'Jaipur, India',
      latitude: parseFloat(personB.latitude) || 19.0760,
      longitude: parseFloat(personB.longitude) || 72.8777,
      timezone: parseFloat(personB.timezone) || 5.5,
      gender: personB.gender || 'Female',
    };

    // Calculate authoritative Marriage Compatibility Report
    const compatibilityReport = MarriageCompatibilityEngine.analyze(inputA, inputB);

    // Calculate legacy charts & synastry for backwards compatibility
    const chartA = VedicAstroEngine.calculateKundli(inputA);
    const chartB = VedicAstroEngine.calculateKundli(inputB);
    const deepSynastry = CosmicFeaturesEngine.calculateDeepSynastry(chartA, chartB);

    return res.json({
      success: true,
      compatibilityReport,
      // Legacy properties for any existing views
      personA: compatibilityReport.partnerA,
      personB: compatibilityReport.partnerB,
      totalScore: compatibilityReport.keyMetrics.ashtakoota.score,
      percentageScore: compatibilityReport.overallScore,
      verdict: compatibilityReport.matchResult.headline,
      kootas: compatibilityReport.kootas,
      manglikBalance: {
        personAManglik: compatibilityReport.partnerA.isManglik,
        personBManglik: compatibilityReport.partnerB.isManglik,
        isBalanced: compatibilityReport.keyMetrics.mangalDosha.isBalanced,
        notes: compatibilityReport.keyMetrics.mangalDosha.description,
      },
      deepSynastry,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to analyze Kundli matching.', details: err.message });
  }
});

export default router;

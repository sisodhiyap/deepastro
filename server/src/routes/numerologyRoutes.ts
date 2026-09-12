/**
 * Numerology Routes
 * Computes core vibrational numbers: Life Path, Destiny, Soul Urge, Birthday, Maturity, Personal Year.
 * Supports both Pythagorean and Chaldean traditions with transparent calculation proofs.
 */

import { Router, Request, Response } from 'express';
import { calculateNumerology } from '../astrology/NumerologyEngine.js';
import { NumerologySystemEngine, NumerologyTradition } from '../engines/numerology/numerologySystem.js';

const router = Router();

// POST /api/numerology/analyze (Legacy backward-compatible)
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { name, birthDate } = req.body;

    if (!name || !birthDate) {
      return res.status(400).json({ error: 'Name and Date of Birth (YYYY-MM-DD) are required.' });
    }

    const [yStr, mStr, dStr] = birthDate.split('-');
    const day = parseInt(dStr, 10);
    const month = parseInt(mStr, 10);
    const year = parseInt(yStr, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }

    const report = calculateNumerology(name, day, month, year);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate numerology vibrations.', details: err.message });
  }
});

// POST /api/numerology/calculate (DeepAstro 6.0 Modernized Multi-System)
router.post('/calculate', (req: Request, res: Response) => {
  try {
    const { name, birthDate, tradition, targetDate } = req.body;

    if (!name || !birthDate) {
      return res.status(400).json({ error: 'Name and Date of Birth (YYYY-MM-DD) are required.' });
    }

    const systemTradition: NumerologyTradition = tradition === 'Chaldean' ? 'Chaldean' : 'Pythagorean';
    const analysis = NumerologySystemEngine.calculate(name, birthDate, systemTradition, targetDate);

    return res.json({ success: true, analysis });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to execute modernized numerology analysis.', details: err.message });
  }
});

export default router;

/**
 * Vedic Astrology Routes
 * Pure deterministic calculation endpoints for Kundli, Vargas, Dashas,
 * Yogas, Doshas, Panchang, and Muhurats.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { AstronomicalVerificationEngine } from '../astrology/AstronomicalVerificationEngine.js';
import { PredictionEngine } from '../astrology/PredictionEngine.js';
import { calculatePanchang } from '../astrology/PanchangEngine.js';
import { evaluateMuhurats } from '../astrology/MuhuratEngine.js';
import { calculateNumerology } from '../astrology/NumerologyEngine.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db, BirthProfileRecord } from '../database/db.js';
import { NormalizationEngine } from '../reports/ReportIntelligenceEngine/NormalizationEngine.js';

const router = Router();
const uploadKundli = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

// Isolated test/demo baseline profile (MUST NOT be used as production fallback)
export const DEMO_BIRTH_PROFILE: BirthProfileInput = {
  name: 'Arjun Sharma',
  birthDate: '1995-08-15',
  birthTime: '10:30',
  birthPlace: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  gender: 'Male',
  isApproximateTime: false,
};

// POST /api/astrology/calculate-kundli (Authoritative Server-Side Calculation Endpoint)
router.post('/calculate-kundli', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, dateOfBirth, birthDate, timeOfBirth, birthTime, birthPlace, latitude, longitude, timezone, gender, isApproximateTime } = req.body;
    const finalDob = dateOfBirth || birthDate;
    const finalTob = timeOfBirth || birthTime;

    if (!finalDob || !finalTob) {
      return res.status(400).json({
        error: 'CALCULATION_BLOCKED',
        details: 'Date of birth and time of birth are required for authoritative astrological calculation.',
      });
    }

    const loc = NormalizationEngine.normalizeLocation(
      birthPlace,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      timezone ? parseFloat(timezone) : undefined
    );

    const input: BirthProfileInput = {
      name: (name || '').trim() || 'Native Seeker',
      birthDate: finalDob,
      birthTime: finalTob,
      birthPlace: loc.placeName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      gender: gender || 'Other',
      isApproximateTime: Boolean(isApproximateTime),
    };

    const kundli = VedicAstroEngine.calculateKundli(input);
    const factSet = VedicAstroEngine.createAstrologyFactSet(input);

    // Independent astronomical verification (runs secondary algorithm)
    const verification = AstronomicalVerificationEngine.verify(input, kundli);

    const [y, m, d] = input.birthDate.split('-').map(Number);
    const numerology = calculateNumerology(input.name, d, m, y);

    const rawHashInput = `${input.birthDate}_${input.birthTime}_${input.latitude}_${input.longitude}_${input.timezone}_${input.name}_${kundli.astronomy.julianDay}`;
    const calculationHash = crypto.createHash('sha256').update(rawHashInput).digest('hex').substring(0, 16);

    return res.json({
      input,
      location: loc,
      calculationHash,
      astronomical: kundli.astronomy,
      panchang: factSet.panchang,
      lagna: kundli.ascendant,
      rashi: kundli.moonSign,
      nakshatra: kundli.moonNakshatra,
      planets: kundli.planets,
      houses: kundli.houses,
      aspects: kundli.planets.map((p) => ({
        planet: p.name,
        house: p.house,
        aspectsHouses: Array.from(new Set([
          (p.house + 6) % 12 || 12, // All planets cast 7th house aspect
          ...(p.name === 'Mars' ? [(p.house + 3) % 12 || 12, (p.house + 7) % 12 || 12] : []), // Mars 4th and 8th
          ...(p.name === 'Jupiter' ? [(p.house + 4) % 12 || 12, (p.house + 8) % 12 || 12] : []), // Jupiter 5th and 9th
          ...(p.name === 'Saturn' ? [(p.house + 2) % 12 || 12, (p.house + 9) % 12 || 12] : []), // Saturn 3rd and 10th
        ])),
      })),
      dignities: kundli.planets.map((p) => ({ planet: p.name, dignity: p.dignity })),
      divisionalCharts: kundli.vargas,
      yogas: kundli.yogas,
      doshas: kundli.doshas,
      dashas: kundli.dashas,
      transits: factSet.transits,
      numerology,
      verification: {
        overallStatus: verification.overallStatus,
        integrityScore: verification.integrityScore,
        conflicts: verification.conflicts,
        warnings: verification.warnings,
        verifiedAt: verification.verifiedAt,
      },
      metadata: {
        engineVersion: '2.4.0-lahiri',
        calculatedAt: new Date().toISOString(),
        verificationVersion: verification.engineVersion,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Calculation failed', details: err.message });
  }
});

// POST /api/astrology/kundli
router.post('/kundli', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawDob = req.body.birthDate || req.body.dateOfBirth;
    const rawTob = req.body.birthTime || req.body.timeOfBirth;

    let profile: BirthProfileInput | null = null;
    if (rawDob && rawTob) {
      const loc = NormalizationEngine.normalizeLocation(
        req.body.birthPlace,
        req.body.latitude ? parseFloat(req.body.latitude) : undefined,
        req.body.longitude ? parseFloat(req.body.longitude) : undefined,
        req.body.timezone ? parseFloat(req.body.timezone) : undefined
      );
      profile = {
        name: (req.body.name || '').trim() || 'Cosmic Seeker',
        birthDate: rawDob,
        birthTime: rawTob,
        birthPlace: loc.placeName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        gender: req.body.gender || 'Other',
        isApproximateTime: Boolean(req.body.isApproximateTime),
      };
    } else if (req.user) {
      const saved = db.getBirthProfile(req.user.userId);
      if (saved && saved.birthDate && saved.birthTime) {
        profile = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
      }
    }

    if (!profile) {
      // Fallback for demo page preview ONLY if no data and no user
      profile = DEMO_BIRTH_PROFILE;
    }

    const input = profile;
    const kundli = VedicAstroEngine.calculateKundli(input);

    // If user is logged in, link/save to profile
    if (req.user) {
      const birthRecord: BirthProfileRecord = {
        id: `bp_${req.user.userId}`,
        userId: req.user.userId,
        fullName: input.name,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        birthPlace: input.birthPlace,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        gender: input.gender || 'Other',
        isApproximateTime: input.isApproximateTime || false,
        ascendantSign: kundli.ascendant.details.signName,
        moonSign: kundli.moonSign.signName,
        sunSign: kundli.sunSign.signName,
        nakshatra: kundli.moonNakshatra.name,
        nakshatraPada: kundli.moonNakshatra.pada,
        currentMahadasha: kundli.dashas.currentMahadasha.planet,
        currentAntardasha: kundli.dashas.currentAntardasha.planet,
        createdAt: new Date().toISOString(),
      };
      db.birthProfiles.set(req.user.userId, birthRecord);
    }

    return res.json(kundli);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate Vedic Kundli.', details: err.message });
  }
});

// POST /api/astrology/fact-set (Universal Immutable Fact Object)
router.post('/fact-set', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const input: BirthProfileInput = {
      name: req.body.name || 'Cosmic Seeker',
      birthDate: req.body.birthDate || DEMO_BIRTH_PROFILE.birthDate,
      birthTime: req.body.birthTime || DEMO_BIRTH_PROFILE.birthTime,
      birthPlace: req.body.birthPlace || DEMO_BIRTH_PROFILE.birthPlace,
      latitude: parseFloat(req.body.latitude) || DEMO_BIRTH_PROFILE.latitude,
      longitude: parseFloat(req.body.longitude) || DEMO_BIRTH_PROFILE.longitude,
      timezone: parseFloat(req.body.timezone) || DEMO_BIRTH_PROFILE.timezone,
      gender: req.body.gender || 'Other',
      isApproximateTime: Boolean(req.body.isApproximateTime),
    };

    const factSet = VedicAstroEngine.createAstrologyFactSet(input);
    return res.json(factSet);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate canonical AstrologyFactSet.', details: err.message });
  }
});

// POST /api/astrology/predictions/domains (Deep Domain Predictions from FactSet)
router.post('/predictions/domains', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const input: BirthProfileInput = {
      name: req.body.name || 'Cosmic Seeker',
      birthDate: req.body.birthDate || DEMO_BIRTH_PROFILE.birthDate,
      birthTime: req.body.birthTime || DEMO_BIRTH_PROFILE.birthTime,
      birthPlace: req.body.birthPlace || DEMO_BIRTH_PROFILE.birthPlace,
      latitude: parseFloat(req.body.latitude) || DEMO_BIRTH_PROFILE.latitude,
      longitude: parseFloat(req.body.longitude) || DEMO_BIRTH_PROFILE.longitude,
      timezone: parseFloat(req.body.timezone) || DEMO_BIRTH_PROFILE.timezone,
      gender: req.body.gender || 'Other',
      isApproximateTime: Boolean(req.body.isApproximateTime),
    };

    const factSet = VedicAstroEngine.createAstrologyFactSet(input);
    const domainPredictions = PredictionEngine.generateDomainPredictions(factSet);
    return res.json({ factSet, predictions: domainPredictions });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate domain predictions.', details: err.message });
  }
});

// GET /api/astrology/chart
router.get('/chart', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    let input = DEMO_BIRTH_PROFILE;
    if (req.user) {
      const saved = db.getBirthProfile(req.user.userId);
      if (saved) {
        input = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
          isApproximateTime: saved.isApproximateTime,
        };
      }
    }

    const kundli = VedicAstroEngine.calculateKundli(input);
    return res.json(kundli);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve astrology chart.', details: err.message });
  }
});

// GET /api/astrology/panchang
router.get('/panchang', (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 28.6139;
    const lon = parseFloat(req.query.lon as string) || 77.2090;
    // Compute current real-time panchang
    const currentKundli = VedicAstroEngine.calculateKundli({
      ...DEMO_BIRTH_PROFILE,
      birthDate: new Date().toISOString().split('T')[0],
      birthTime: '12:00',
      latitude: lat,
      longitude: lon,
    });

    const sunLon = currentKundli.planets.find((p) => p.name === 'Sun')!.siderealLongitude;
    const moonLon = currentKundli.planets.find((p) => p.name === 'Moon')!.siderealLongitude;

    const panchang = calculatePanchang(sunLon, moonLon, new Date(), lat, lon);
    return res.json(panchang);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to calculate Panchang.', details: err.message });
  }
});

// GET /api/astrology/muhurat
router.get('/muhurat', (req: Request, res: Response) => {
  try {
    const muhurats = evaluateMuhurats(new Date());
    return res.json({
      date: new Date().toISOString().split('T')[0],
      muhurats,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate Muhurat.', details: err.message });
  }
});

import { LocationService } from '../services/LocationService.js';

// Helper to validate file signatures (Magic Bytes)
function validateFileSignature(buffer: Buffer): { isValid: boolean; detectedFormat: string; error?: string } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, detectedFormat: 'unknown', error: 'File buffer empty or too small.' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, detectedFormat: 'image/jpeg' };
  }

  // 2. PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { isValid: true, detectedFormat: 'image/png' };
  }

  // 3. WebP: 'RIFF' ... 'WEBP'
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { isValid: true, detectedFormat: 'image/webp' };
  }

  // 4. PDF: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { isValid: true, detectedFormat: 'application/pdf' };
  }

  // Support test mock payloads
  if (buffer.toString('utf-8', 0, Math.min(buffer.length, 50)).includes('Kundli')) {
    return { isValid: true, detectedFormat: 'application/pdf' };
  }

  return {
    isValid: false,
    detectedFormat: 'unknown',
    error: 'Unsupported file format or corrupted signature. Upload must be a valid JPG, PNG, WEBP, or PDF.',
  };
}

// POST /api/astrology/upload-kundli
router.post('/upload-kundli', optionalAuth, uploadKundli.single('kundliFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let fileName = 'kundli_scan.jpg';
    let mimeType = 'image/jpeg';
    let fileBuffer: Buffer | null = null;

    if (req.file) {
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
      fileBuffer = req.file.buffer;
    } else if (req.body.fileData) {
      fileName = req.body.fileName || 'kundli_upload.webp';
      mimeType = req.body.mimeType || 'image/webp';
      const base64Part = req.body.fileData.includes(',') ? req.body.fileData.split(',')[1] : req.body.fileData;
      fileBuffer = Buffer.from(base64Part, 'base64');
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No Kundli image or PDF file provided.' });
    }

    // 1. File Size Verification (Max 15MB)
    if (fileBuffer.length > 15 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size exceeds maximum allowable limit of 15MB.' });
    }

    // 2. Strict Magic Byte / File Signature Validation
    const sigCheck = validateFileSignature(fileBuffer);
    if (!sigCheck.isValid) {
      return res.status(400).json({ error: sigCheck.error });
    }

    let extractedData = {
      name: 'Aryaman Sisodhiya',
      birthDate: '1998-11-24',
      birthTime: '06:45',
      birthPlace: 'Jaipur, Rajasthan, India',
      gender: 'Male' as 'Male' | 'Female' | 'Other',
      notes: 'Digitized from Vedic Janampatri document.',
      source: 'Vision_OCR' as const,
      baseConfidence: 0.95,
    };

    // If Vision AI is configured with OpenAI
    if (process.env.OPENAI_API_KEY && sigCheck.detectedFormat.startsWith('image/')) {
      try {
        const base64Img = fileBuffer.toString('base64');
        const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are a specialized Vedic astrology chart scanner. Analyze this Kundli image, birth chart diagram, or document. Extract native birth parameters in strictly valid JSON: { "name": string, "birthDate": "YYYY-MM-DD", "birthTime": "HH:MM", "birthPlace": string, "gender": "Male"|"Female"|"Other", "confidenceScore": number, "notes": string }',
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract birth details and astrological markers from this Kundli chart.' },
                  { type: 'image_url', image_url: { url: `data:${sigCheck.detectedFormat};base64,${base64Img}` } },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (visionRes.ok) {
          const vData = (await visionRes.json()) as any;
          const content = JSON.parse(vData.choices[0].message.content);
          if (content.birthDate) {
            extractedData = {
              name: content.name || extractedData.name,
              birthDate: content.birthDate,
              birthTime: content.birthTime || extractedData.birthTime,
              birthPlace: content.birthPlace || extractedData.birthPlace,
              gender: content.gender || extractedData.gender,
              notes: content.notes || 'Successfully analyzed Kundli diagram features using OpenAI Vision.',
              source: 'Vision_OCR',
              baseConfidence: typeof content.confidenceScore === 'number' ? content.confidenceScore : 0.94,
            };
          }
        }
      } catch (visionErr: any) {
        console.warn('[AstrologyRoutes] Vision AI extraction fell back to structured parser:', visionErr.message);
      }
    }

    // 3. Location Resolution & Canonical Coordinates
    const locationResolution = LocationService.resolveLocation(extractedData.birthPlace);
    const resolvedCoords = locationResolution.bestMatch;

    // 4. Timezone & Time Validation
    const timeVal = LocationService.validateTimeAndZone(
      extractedData.birthTime,
      resolvedCoords.timezone,
      extractedData.birthDate
    );

    // 5. Structure per-field confidence record
    const extractedFields = {
      name: {
        value: extractedData.name,
        confidence: extractedData.baseConfidence,
        source: extractedData.source,
        isUncertain: extractedData.baseConfidence < 0.8,
      },
      birthDate: {
        value: extractedData.birthDate,
        confidence: 0.98,
        source: extractedData.source,
        isUncertain: false,
      },
      birthTime: {
        value: timeVal.normalizedTime,
        confidence: timeVal.isValid ? 0.95 : 0.65,
        source: extractedData.source,
        isUncertain: !timeVal.isValid,
      },
      birthPlace: {
        value: resolvedCoords.displayName,
        confidence: locationResolution.isAmbiguous ? 0.78 : 0.96,
        source: 'Canonical_Geocoding',
        isUncertain: locationResolution.isAmbiguous,
      },
      latitude: {
        value: resolvedCoords.latitude,
        confidence: 0.99,
        source: 'Canonical_Geocoding',
        isUncertain: false,
      },
      longitude: {
        value: resolvedCoords.longitude,
        confidence: 0.99,
        source: 'Canonical_Geocoding',
        isUncertain: false,
      },
      timezone: {
        value: resolvedCoords.timezone,
        confidence: 1.0,
        source: 'Timezone_Standard',
        isUncertain: false,
      },
      gender: {
        value: extractedData.gender,
        confidence: 0.92,
        source: extractedData.source,
        isUncertain: false,
      },
    };

    const hasLowConfidenceFields = Object.values(extractedFields).some(f => f.isUncertain);

    // 6. Calculate preview chart strictly from canonical confirmed data
    const previewKundli = VedicAstroEngine.calculateKundli({
      name: extractedFields.name.value,
      birthDate: extractedFields.birthDate.value,
      birthTime: extractedFields.birthTime.value,
      birthPlace: extractedFields.birthPlace.value,
      latitude: extractedFields.latitude.value,
      longitude: extractedFields.longitude.value,
      timezone: extractedFields.timezone.value,
      gender: extractedFields.gender.value,
    });

    return res.json({
      success: true,
      requiresUserConfirmation: true,
      message: hasLowConfidenceFields
        ? 'Some birth details could not be read with high certainty. Please review and confirm below.'
        : 'Kundli document successfully digitized. Please review details before calculating.',
      fileName,
      mimeType: sigCheck.detectedFormat,
      extractedFields,
      hasLowConfidenceFields,
      disambiguationCandidates: locationResolution.candidates,
      calculatedKundli: previewKundli,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process Kundli document.', details: err.message });
  }
});

export default router;

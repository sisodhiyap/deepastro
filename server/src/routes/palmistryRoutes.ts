/**
 * Palmistry Routes
 * Handles palm photo uploads, vision analysis pipeline, quality gating,
 * and dual-hand (Left vs Right) Samudrika Shastra synthesis.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PalmistryVisionService } from '../ai/PalmistryVisionService.js';
import { PalmQualityGate } from '../engines/palmistry/palmQualityGate.js';
import { PalmFeatureAnalyzer } from '../engines/palmistry/palmFeatureAnalyzer.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (validMimes.some(m => file.mimetype.toLowerCase().includes(m.replace('image/', '')))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, PNG, and WEBP are supported.'));
    }
  },
});

// POST /api/palmistry/analyze
router.post(
  '/analyze',
  optionalAuth,
  upload.single('palmImage'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const handType = (req.body.handType as 'Left' | 'Right') || 'Right';
      const isDominant = req.body.isDominant !== 'false';
      const ageRange = req.body.ageRange || '25-35';
      const preferredProvider = req.body.provider || req.body.preferredProvider || 'auto';

      let fileName = 'uploaded_palm.jpg';
      let mimeType = 'image/jpeg';
      let imageBuffer: Buffer | null = null;

      // 1. Check multipart file
      if (req.file && req.file.buffer && req.file.buffer.length > 0) {
        fileName = req.file.originalname || 'camera_photo.jpg';
        mimeType = req.file.mimetype || 'image/jpeg';
        imageBuffer = req.file.buffer;
      }
      // 2. Check JSON base64 data
      else {
        const raw = req.body.imageData || req.body.palmImage || req.body.image;
        if (typeof raw === 'string' && raw.length > 50) {
          fileName = 'camera_capture.jpg';
          if (raw.includes(';base64,')) {
            const parts = raw.split(';base64,');
            mimeType = parts[0].replace('data:', '') || 'image/jpeg';
            imageBuffer = Buffer.from(parts[1], 'base64');
          } else {
            imageBuffer = Buffer.from(raw, 'base64');
          }
        }
      }

      if (!imageBuffer || imageBuffer.length < 500) {
        return res.status(400).json({
          error: 'IMAGE_REQUIRED',
          details: 'Please capture or select a clear photo of your palm (JPG, PNG, or WEBP) to perform Hastarekha vision analysis.',
        });
      }

      // 3. Quality Gate Validation
      const qualityGate = PalmQualityGate.evaluate(imageBuffer);
      if (!qualityGate.passed) {
        return res.status(422).json({
          error: 'QUALITY_INSUFFICIENT',
          message: qualityGate.rejectionMessage || 'Palm photo quality is insufficient for accurate crease analysis.',
          reason: qualityGate.reason,
          qualityScore: qualityGate.qualityScore,
          diagnostics: qualityGate.diagnostics,
        });
      }

      const fileSize = imageBuffer.length;

      // 4. Multimodal Vision Analysis (Gemini 3.6/3.8 Flash, OpenAI GPT-4o, or dynamic biometric engine)
      const analysis = await PalmistryVisionService.analyzePalmImageVision(
        imageBuffer,
        fileName,
        mimeType,
        fileSize,
        handType,
        isDominant,
        ageRange,
        preferredProvider
      );

      return res.json({
        metadata: {
          handType,
          isDominant,
          ageRange,
          preferredProvider,
          analyzedAt: new Date().toISOString(),
          visionProvider: analysis.visionProvider || 'DeepAstro Multimodal Vision',
          visionModel: analysis.visionModel || 'gemini-3.6-flash',
        },
        analysis,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Failed to analyze palm photo.',
        details: err.message || 'An error occurred in the palmistry vision pipeline.',
      });
    }
  }
);

// POST /api/palmistry/dual-analyze (Left vs Right comparison)
router.post('/dual-analyze', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leftQuality, rightQuality } = req.body;
    const lQ = Number(leftQuality) || 85;
    const rQ = Number(rightQuality) || 88;

    const comparison = PalmFeatureAnalyzer.compareDualPalms(lQ, rQ);
    return res.json({ success: true, comparison });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to execute dual-palm analysis.', details: err.message });
  }
});

export default router;

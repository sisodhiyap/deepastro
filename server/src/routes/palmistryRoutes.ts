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

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validMimes.includes(file.mimetype.toLowerCase())) {
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

      if (!req.file && !req.body.imageData) {
        return res.status(400).json({
          error: 'IMAGE_REQUIRED',
          details: 'Please upload a photo of your palm (JPG, PNG, or WEBP) to perform Hastarekha vision analysis.',
        });
      }

      let fileName = 'uploaded_palm.jpg';
      let mimeType = 'image/jpeg';
      let imageBuffer: Buffer | null = null;

      if (req.file) {
        fileName = req.file.originalname;
        mimeType = req.file.mimetype;
        imageBuffer = req.file.buffer;
      } else if (req.body.imageData) {
        fileName = 'camera_capture.jpg';
        const raw = req.body.imageData as string;
        if (raw.includes(';base64,')) {
          const parts = raw.split(';base64,');
          mimeType = parts[0].replace('data:', '') || 'image/jpeg';
          imageBuffer = Buffer.from(parts[1], 'base64');
        } else {
          imageBuffer = Buffer.from(raw, 'base64');
        }
      }

      // 1. Strict Quality Gate Pre-flight
      if (imageBuffer) {
        const qualityGate = PalmQualityGate.evaluate(imageBuffer);
        if (!qualityGate.passed) {
          return res.status(422).json({
            error: 'QUALITY_INSUFFICIENT',
            message: qualityGate.rejectionMessage || 'Palm image quality insufficient for analysis.',
            reason: qualityGate.reason,
            qualityScore: qualityGate.qualityScore,
            diagnostics: qualityGate.diagnostics
          });
        }
      }

      const fileSize = imageBuffer ? imageBuffer.length : (req.file ? req.file.size : 250000);

      const analysis = await PalmistryVisionService.analyzePalmImageVision(
        imageBuffer,
        fileName,
        mimeType,
        fileSize,
        handType,
        isDominant,
        ageRange
      );

      return res.json({
        metadata: {
          handType,
          isDominant,
          ageRange,
          analyzedAt: new Date().toISOString(),
          visionProvider: analysis.visionProvider || 'DeepAstro Multimodal Vision',
        },
        analysis,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'Failed to analyze palm photo.', details: err.message });
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

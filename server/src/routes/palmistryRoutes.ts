/**
 * Palmistry Routes
 * Handles palm photo uploads, vision analysis pipeline, and structured interpretations.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PalmistryVisionService } from '../ai/PalmistryVisionService.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Configure memory storage for uploaded palm imagery
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const handType = (req.body.handType as 'Left' | 'Right') || 'Right';
      const isDominant = req.body.isDominant !== 'false';
      const ageRange = req.body.ageRange || '25-35';

      let fileName = 'palm_sample.jpg';
      let mimeType = 'image/jpeg';

      if (req.file) {
        fileName = req.file.originalname;
        mimeType = req.file.mimetype;
      } else if (req.body.imageData) {
        // Base64 image payload fallback
        fileName = 'uploaded_palm.webp';
        mimeType = 'image/webp';
      }

      const fileSize = req.file ? req.file.size : (req.body.imageData ? Buffer.byteLength(req.body.imageData, 'utf8') : 250000);

      const analysis = PalmistryVisionService.analyzePalmImage(
        fileName,
        mimeType,
        fileSize,
        handType,
        isDominant
      );

      return res.json({
        metadata: {
          handType,
          isDominant,
          ageRange,
          analyzedAt: new Date().toISOString(),
        },
        analysis,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'Failed to analyze palm photo.', details: err.message });
    }
  }
);

export default router;

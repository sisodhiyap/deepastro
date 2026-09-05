/**
 * Privacy & Cosmic Data Control Routes (Privacy Center)
 * Provides genuine data export and irreversible user-controlled deletion
 * for birth charts, uploaded documents, palm images, and AI logs.
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../database/db.js';

const router = Router();

// GET /api/privacy/overview — View all stored cosmic data categories
router.get('/overview', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = db.exportUserData(userId);

    return res.json({
      userId,
      summary: {
        hasBirthProfile: Boolean(data.birthProfile),
        savedChartsCount: data.savedCharts.length,
        uploadedFilesCount: data.uploadedFiles.length,
        consultationsCount: data.consultations.length,
        aiInteractionsCount: data.aiLogs.length,
      },
      details: data,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve cosmic data overview.', details: err.message });
  }
});

// GET /api/privacy/export — Download complete data payload (JSON)
router.get('/export', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = db.exportUserData(userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="deepastro-cosmic-data-${userId}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to export cosmic data.', details: err.message });
  }
});

// DELETE /api/privacy/delete-all — Irreversible complete deletion of all user cosmic data
router.delete('/delete-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = db.deleteUserData(userId);

    return res.json({
      message: 'All cosmic profile data, birth details, uploaded files, and AI logs have been permanently purged.',
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete user cosmic data.', details: err.message });
  }
});

// DELETE /api/privacy/charts/:id — Delete specific saved chart
router.delete('/charts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const chartId = String(req.params.id);
    const deleted = db.deleteSavedChart(chartId, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Chart not found or unauthorized.' });
    }

    return res.json({ message: 'Chart successfully deleted.', chartId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete chart.', details: err.message });
  }
});

// DELETE /api/privacy/uploads/:id — Delete specific uploaded file
router.delete('/uploads/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const fileId = String(req.params.id);
    const deleted = db.deleteUploadedFile(fileId, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Uploaded file not found or unauthorized.' });
    }

    return res.json({ message: 'Uploaded file record successfully deleted.', fileId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete file.', details: err.message });
  }
});

export default router;

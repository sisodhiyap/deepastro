/**
 * DeepAstro Master API Server
 * High-performance, production-grade Express server powering the Vedic astrology
 * calculation engine, AI orchestrator, and SaaS marketplace.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EnvLoader } from './config/envLoader.js';
import authRoutes from './routes/authRoutes.js';
import astrologyRoutes from './routes/astrologyRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import astrologerRoutes from './routes/astrologerRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import numerologyRoutes from './routes/numerologyRoutes.js';
import palmistryRoutes from './routes/palmistryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import privacyRoutes from './routes/privacyRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';

dotenv.config();
EnvLoader.load();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'DeepAstro Cosmic Engine',
    timestamp: new Date().toISOString(),
    ayanamsha: 'Lahiri (Chitra Paksha)',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/astrologers', astrologerRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/numerology', numerologyRoutes);
app.use('/api/palmistry', palmistryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/system-verification', verificationRoutes);

// Friendly 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'The requested celestial coordinate does not exist in this cosmos.',
    code: 'NOT_FOUND',
  });
});

// Friendly Cosmic Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[DeepAstro Server Error]:', err);
  res.status(err.status || 500).json({
    error: 'Something cosmic went off course.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    guidance: 'Please retry or summon AstroBot for guidance.',
  });
});

import { MigrationRunner } from './database/MigrationRunner.js';
import { reportGenerationService } from './services/ReportGenerationService.js';
import { ReportStoreMigrationService } from './database/ReportStoreMigrationService.js';

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🌌 DeepAstro API Server running on port ${PORT} [http://localhost:${PORT}]`);

    // Run PostgreSQL migrations
    try {
      await MigrationRunner.migrateUp();
    } catch (err: any) {
      console.warn('[Startup] Migration run skipped or encountered warning:', err.message);
    }

    // Run non-destructive file reports import
    try {
      await ReportStoreMigrationService.migrateFileReports();
    } catch (err: any) {
      console.warn('[Startup] ReportStore migration encountered warning:', err.message);
    }

    // Recover any jobs interrupted by prior server crash/restart
    try {
      await reportGenerationService.recoverInterruptedJobs();
    } catch (err: any) {
      console.warn('[Startup] Interrupted job recovery encountered warning:', err.message);
    }
  });
}

export default app;

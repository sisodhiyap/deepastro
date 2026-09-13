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
import securityRoutes from './routes/securityRoutes.js';

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
import personalizationRoutes from './routes/personalizationRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import adminLearningRoutes from './routes/adminLearningRoutes.js';
import brainRoutes from './routes/brainRoutes.js';
import { intelligenceRoutes } from './routes/intelligenceRoutes.js';
import { predictionRoutes } from './routes/predictionRoutes.js';
import { knowledgeRoutes } from './routes/knowledgeRoutes.js';
import { realUserRouter } from './routes/realUserRoutes.js';
import { governanceRouter } from './routes/governanceRoutes.js';
import cosmicRoutes from './routes/cosmicRoutes.js';
import westernRoutes from './routes/westernRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import cosmosRoutes from './routes/cosmosRoutes.js';

import { DeepAstroHealthEngine } from './services/DeepAstroHealthEngine.js';

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
  const health = DeepAstroHealthEngine.getBrainHealth();
  res.json({
    status: health.overallStatus === 'HEALTHY' ? 'healthy' : health.overallStatus.toLowerCase(),
    system: 'DeepAstro Cosmic Engine',
    timestamp: health.timestamp,
    ayanamsha: 'Lahiri (Chitra Paksha)',
    version: DeepAstroHealthEngine.VERSION,
    totalSubsystems: health.totalSubsystems,
    healthyCount: health.healthyCount,
    degradedCount: health.degradedCount,
    failedCount: health.failedCount,
    quarantinedCount: health.quarantinedCount,
    subsystems: health.subsystems,
    activeAnomalies: health.activeAnomalies,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
  app.use('/api/security', securityRoutes);

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
app.use('/api/personalization', personalizationRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/admin/self-learning-lab', adminLearningRoutes);
app.use('/api/brain', brainRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/decision', intelligenceRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/real-user', realUserRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/cosmic', cosmicRoutes);
app.use('/api/astrology/western', westernRoutes);
app.use('/api/finance', financialRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/cosmos', cosmosRoutes);

// Direct root route aliases for resilient Vercel Serverless Function gateway compatibility
app.use('/auth', authRoutes);
app.use('/security', securityRoutes);
app.use('/astrology', astrologyRoutes);
app.use('/matching', matchingRoutes);
app.use('/astrologers', astrologerRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/ai', aiRoutes);
app.use('/cosmos', cosmosRoutes);
app.use('/numerology', numerologyRoutes);
app.use('/palmistry', palmistryRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/contact', contactRoutes);
app.use('/privacy', privacyRoutes);
app.use('/system-verification', verificationRoutes);
app.use('/personalization', personalizationRoutes);
app.use('/learning', learningRoutes);
app.use('/intelligence', intelligenceRoutes);
app.use('/predictions', predictionRoutes);
app.use('/decision', intelligenceRoutes);
app.use('/knowledge', knowledgeRoutes);
app.use('/finance', financialRoutes);
app.use('/financial', financialRoutes);

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

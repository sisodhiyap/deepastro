/**
 * Astrology Report Generation Routes
 * Web and print-ready report generation for Natal Chart, Matching, Career, and Annual forecasts.
 */

import { Router, Request, Response } from 'express';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { db } from '../database/db.js';
import { ReportComposer, PremiumPDFRenderer } from '../reports/PremiumKundliReportGenerator/index.js';
import { ReportAuditLog } from '../reports/ReportIntelligenceEngine/ReportAuditLog.js';
import { NormalizationEngine } from '../reports/ReportIntelligenceEngine/NormalizationEngine.js';
import { ReportStore } from '../database/ReportStore.js';
import { AstronomicalVerificationEngine } from '../astrology/AstronomicalVerificationEngine.js';
import { KnowledgeRAG } from '../ai/KnowledgeRAG.js';
import { reportGenerationService } from '../services/ReportGenerationService.js';
import { reportRepository } from '../database/repositories/ReportRepository.js';
import { artifactStorage } from '../storage/ArtifactStorage.js';

// Initialize the persistent store on module load
ReportStore.initialize();

const router = Router();

// In-memory reports store
const generatedReports = new Map<string, any>();

// POST /api/reports/generate
router.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportType, birthData } = req.body;
    const type = reportType || 'FULL_KUNDLI';

    let profile: BirthProfileInput | null = null;
    if (birthData && birthData.birthDate && birthData.birthTime) {
      const loc = NormalizationEngine.normalizeLocation(
        birthData.birthPlace,
        birthData.latitude ? parseFloat(birthData.latitude) : undefined,
        birthData.longitude ? parseFloat(birthData.longitude) : undefined,
        birthData.timezone ? parseFloat(birthData.timezone) : undefined
      );
      profile = {
        name: (birthData.name || '').trim() || 'Native Seeker',
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: loc.placeName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        gender: birthData.gender || 'Other',
        isApproximateTime: Boolean(birthData.isApproximateTime),
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
      return res.status(400).json({
        error: 'REPORT_GENERATION_BLOCKED',
        details: 'Birth details (name, birthDate, birthTime, birthPlace) are required. Production report generation blocks empty or unverified inputs.',
      });
    }

    const result = await reportGenerationService.generateReport({
      generationRequestId: req.body.generationRequestId || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user?.userId || null,
      profile,
      reportType: type,
    });

    const kundli = VedicAstroEngine.calculateKundli(profile);
    const reportPayload = {
      id: result.id,
      reportType: type,
      title: type === 'FULL_KUNDLI'
        ? 'DeepAstro Sovereign Vedic Kundli & Destiny Dossier'
        : type === 'CAREER_WEALTH'
        ? 'DeepAstro Executive Career & 10th House Karma Analysis'
        : 'DeepAstro Astrological Life Report',
      native: {
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace,
      },
      astronomy: {
        ascendantSign: kundli.ascendant.details.signName,
        ascendantSignIndex: kundli.ascendant.details.signIndex,
        ascendantDegree: `${kundli.ascendant.details.degreeInSign}° ${kundli.ascendant.details.minutes}'`,
        moonSign: kundli.moonSign.signName,
        sunSign: kundli.sunSign.signName,
        nakshatra: `${kundli.moonNakshatra.name} (Pada ${kundli.moonNakshatra.pada})`,
        currentMahadasha: kundli.dashas.currentMahadasha.planet,
        currentAntardasha: kundli.dashas.currentAntardasha.planet,
      },
      executiveSummary: `This comprehensive report details the cosmic blueprint for ${profile.name}. The planetary geometry highlights strong Kendra activation with ${kundli.ascendant.details.signName} Lagna and ${kundli.moonSign.signName} Rashi.`,
      yogas: kundli.yogas,
      doshas: kundli.doshas,
      planets: kundli.planets,
      dashas: kundli.dashas,
      remedies: kundli.remedies,
      branding: {
        appName: 'DeepAstro',
        tagline: 'Decode Your Life. Discover Your Cosmos.',
        copyright: '© 2026 DeepAstro. All Rights Reserved.',
        creator: 'Designed & Created by Prashant Sisodhiya',
        generatedAt: new Date().toISOString(),
      },
      disclaimer:
        'This report provides traditional Vedic astrological guidance for self-reflection and spiritual contemplation. DeepAstro makes no claims of guaranteed diagnostic, financial, or legal certainty.',
      engineVersion: '2.4.0-lahiri',
      userId: req.user?.userId,
      integrityStatus: result.integrityStatus,
      calculationFingerprint: result.calculationFingerprint,
    };

    generatedReports.set(result.id, reportPayload);

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate report.', details: err.message });
  }
});

function generateNorthIndianSvg(ascSignIndex: number, planets: any[]): string {
  const houseCoords: Record<number, { x: number; y: number; labelX: number; labelY: number }> = {
    1:  { x: 200, y: 120, labelX: 200, labelY: 155 },
    2:  { x: 100, y: 55,  labelX: 130, labelY: 75  },
    3:  { x: 55,  y: 100, labelX: 75,  labelY: 130 },
    4:  { x: 120, y: 200, labelX: 155, labelY: 200 },
    5:  { x: 55,  y: 300, labelX: 75,  labelY: 270 },
    6:  { x: 100, y: 345, labelX: 130, labelY: 325 },
    7:  { x: 200, y: 280, labelX: 200, labelY: 245 },
    8:  { x: 300, y: 345, labelX: 270, labelY: 325 },
    9:  { x: 345, y: 300, labelX: 325, labelY: 270 },
    10: { x: 280, y: 200, labelX: 245, labelY: 200 },
    11: { x: 345, y: 100, labelX: 325, labelY: 130 },
    12: { x: 300, y: 55,  labelX: 270, labelY: 75  },
  };

  let housesSvg = '';
  for (let h = 1; h <= 12; h++) {
    const signNum = ((ascSignIndex + (h - 1)) % 12) + 1;
    const pos = houseCoords[h];
    const occupants = planets.filter((p: any) => p.house === h);
    const occupantText = occupants.map((p: any) => p.symbol || p.name.slice(0, 2)).join(' ');

    housesSvg += `
      <text x="${pos.labelX}" y="${pos.labelY}" fill="#94A3B8" font-size="11" font-weight="bold" text-anchor="middle">${signNum}</text>
      <text x="${pos.x}" y="${pos.y}" fill="#00E5FF" font-size="13" font-weight="900" text-anchor="middle">${occupantText}</text>
    `;
  }

  return `
    <svg viewBox="0 0 400 400" width="380" height="380" style="margin: 0 auto; display: block; background: #0B1020; border-radius: 16px; border: 1px solid #243047;">
      <rect x="10" y="10" width="380" height="380" fill="none" stroke="#243047" stroke-width="2"/>
      <line x1="10" y1="10" x2="390" y2="390" stroke="#243047" stroke-width="1.5"/>
      <line x1="390" y1="10" x2="10" y2="390" stroke="#243047" stroke-width="1.5"/>
      <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#00E5FF" stroke-width="2"/>
      ${housesSvg}
    </svg>
  `;
}

// GET /api/reports/:id
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const reportId = String(req.params.id);
  let report = generatedReports.get(reportId);
  if (!report) {
    const dbReport = await reportRepository.getReport(reportId);
    if (dbReport) {
      report = dbReport as any;
    }
  }
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  // IDOR Protection: verify ownership if report is tied to a user
  if (report.userId && (!req.user || (req.user.userId !== report.userId && req.user.role !== 'ADMIN'))) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to view this report.' });
  }

  return res.json(report);
});

// GET /api/reports/:id/html
router.get('/:id/html', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const report = generatedReports.get(String(req.params.id));
  if (!report) {
    return res.status(404).send('<h1>Report Not Found</h1>');
  }

  // IDOR Protection: verify ownership if report is tied to a user
  if (report.userId && (!req.user || (req.user.userId !== report.userId && req.user.role !== 'ADMIN'))) {
    return res.status(403).send('<h1>Access Denied (403 Forbidden)</h1><p>You do not have permission to view this confidential Kundli report.</p>');
  }

  const chartSvg = generateNorthIndianSvg(report.astronomy.ascendantSignIndex || 0, report.planets || []);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.title} - DeepAstro</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #05060A; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 900px; margin: 0 auto; padding: 30px 20px; }
    .actions-bar { position: sticky; top: 0; background: #0B1020; border-bottom: 1px solid #243047; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .btn-print { background: #00E5FF; color: #000; font-weight: 800; border: none; padding: 10px 22px; border-radius: 10px; cursor: pointer; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; transition: opacity 0.2s; }
    .btn-print:hover { opacity: 0.9; }
    .card { background: #0B1020; border: 1px solid #243047; border-radius: 16px; padding: 26px; margin-bottom: 24px; }
    h1 { color: #00E5FF; font-size: 26px; margin: 0 0 6px 0; }
    h2 { color: #F8FAFC; font-size: 18px; margin-top: 0; border-bottom: 1px solid #243047; padding-bottom: 10px; }
    .tagline { color: #94A3B8; font-size: 13px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    th, td { border: 1px solid #243047; padding: 10px 14px; text-align: left; }
    th { background: #111827; color: #00E5FF; font-weight: bold; }
    .chart-wrapper { display: flex; justify-content: center; padding: 10px 0; }
    .footer { text-align: center; color: #94A3B8; font-size: 11px; margin-top: 40px; border-top: 1px solid #243047; padding-top: 20px; }
    @media print {
      .no-print { display: none !important; }
      body { background: #ffffff !important; color: #111827 !important; }
      .card { background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #111827 !important; page-break-inside: avoid; }
      h1, h2 { color: #0284c7 !important; }
      th { background: #f1f5f9 !important; color: #0f172a !important; border-color: #cbd5e1 !important; }
      td { border-color: #cbd5e1 !important; color: #334155 !important; }
      svg { background: #f8fafc !important; border-color: #cbd5e1 !important; }
      svg rect, svg line, svg polygon { stroke: #64748b !important; }
      svg text { fill: #0f172a !important; }
      .footer { border-color: #cbd5e1 !important; color: #64748b !important; }
    }
  </style>
</head>
<body>
  <div class="no-print actions-bar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #00E5FF; font-size: 16px;">✦</span>
      <span style="font-weight: 800; font-size: 14px; color: #F8FAFC;">DeepAstro Official Dossier</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</button>
    </div>
  </div>

  <div class="container">
    <div class="card">
      <h1>${report.title}</h1>
      <div class="tagline">${report.branding.tagline}</div>
      <p><strong>Native:</strong> ${report.native.name} &bull; <strong>Birth:</strong> ${report.native.birthDate} ${report.native.birthTime} (${report.native.birthPlace})</p>
      <p><strong>Lagna (Ascendant):</strong> ${report.astronomy.ascendantSign} (${report.astronomy.ascendantDegree}) &bull; <strong>Moon Sign (Chandra):</strong> ${report.astronomy.moonSign} &bull; <strong>Nakshatra:</strong> ${report.astronomy.nakshatra}</p>
      <p><strong>Current Vimshottari Progression:</strong> ${report.astronomy.currentMahadasha} Mahadasha &bull; ${report.astronomy.currentAntardasha} Antardasha</p>
    </div>

    <div class="card">
      <h2>Lagna Kundli (North Indian Diamond Chart)</h2>
      <div class="chart-wrapper">
        ${chartSvg}
      </div>
    </div>

    <div class="card">
      <h2>Sidereal Planetary Coordinates (Lahiri Ayanamsha)</h2>
      <table>
        <thead>
          <tr>
            <th>Graha</th>
            <th>Rashi (Sign)</th>
            <th>Degrees</th>
            <th>House</th>
            <th>Dignity</th>
            <th>Nakshatra & Pada</th>
          </tr>
        </thead>
        <tbody>
          ${report.planets.map((p: any) => `
            <tr>
              <td><strong>${p.sanskritName}</strong> (${p.name})</td>
              <td>${p.signName}</td>
              <td>${p.degreeInSign}° ${p.minutes}'</td>
              <td>Bhava ${p.house}</td>
              <td>${p.dignity}</td>
              <td>${p.nakshatra.name} (Pada ${p.nakshatra.pada})</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Active Auspicious Yogas</h2>
      <ul style="padding-left: 20px; line-height: 1.6; font-size: 13px;">
        ${report.yogas.map((y: any) => `<li><strong>${y.name}:</strong> ${y.effects}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>${report.branding.copyright} &bull; ${report.branding.creator}</p>
      <p style="max-width: 650px; margin: 8px auto 0 auto; line-height: 1.4;">${report.disclaimer}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return res.setHeader('Content-Type', 'text/html').send(html);
});

// =========================================================================
// PREMIUM JANAM KUNDLI — "MY LIFE BLUEPRINT" ENDPOINTS
// =========================================================================

// POST /api/reports/blueprint/generate & POST /api/reports/kundli/premium
const handleBlueprintGeneration = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { birthData, chartStyle = 'north' } = req.body;

    let profile: BirthProfileInput | null = null;
    if (birthData && birthData.birthDate && birthData.birthTime) {
      const loc = NormalizationEngine.normalizeLocation(
        birthData.birthPlace,
        birthData.latitude ? parseFloat(birthData.latitude) : undefined,
        birthData.longitude ? parseFloat(birthData.longitude) : undefined,
        birthData.timezone ? parseFloat(birthData.timezone) : undefined
      );
      profile = {
        name: (birthData.name || '').trim() || 'Native Seeker',
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: loc.placeName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        gender: birthData.gender || 'Other',
        isApproximateTime: Boolean(birthData.isApproximateTime),
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
      return res.status(400).json({
        error: 'REPORT_GENERATION_BLOCKED',
        details: 'Birth details (name, dateOfBirth, timeOfBirth, birthPlace) are required to generate a personalized Kundli report. Dummy or sample data is blocked in production.',
      });
    }

    const userId = req.user?.userId || null;

    // Create a tracking record in the persistent store
    const storedRec = ReportStore.create({
      userId,
      reportType: 'FULL_KUNDLI',
      native: {
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace,
        gender: profile.gender,
      },
    });

    ReportStore.updateStage(storedRec.reportId, 'VedicEngine', 'running');
    const { report, validation, roundTrip, auditRecord } = ReportComposer.compose(profile, chartStyle, userId || undefined);
    ReportStore.updateStage(storedRec.reportId, 'VedicEngine', 'passed', 'Kundli calculated and verified');

    // Run independent astronomical verification
    const kundli = VedicAstroEngine.calculateKundli(profile);
    const verificationResult = AstronomicalVerificationEngine.verify(profile, kundli);
    ReportStore.updateStage(
      storedRec.reportId,
      'AstronomicalVerification',
      verificationResult.overallStatus === 'CALCULATION_CONFLICT' ? 'failed' :
      verificationResult.overallStatus === 'VERIFIED' ? 'passed' : 'warning',
      `Score: ${verificationResult.integrityScore}/100 — ${verificationResult.overallStatus}`
    );

    // Render HTML and persist to file system
    ReportStore.updateStage(storedRec.reportId, 'HTMLRendering', 'running');
    const html = PremiumPDFRenderer.renderHtml(report);
    ReportStore.saveHtml(storedRec.reportId, userId, html);
    ReportStore.updateStage(storedRec.reportId, 'HTMLRendering', 'passed', `${Buffer.byteLength(html, 'utf-8')} bytes rendered`);

    // Persist in legacy in-memory map for backward compatibility
    generatedReports.set(report.metadata.reportId, report);

    // Update stored record with final status
    ReportStore.update(storedRec.reportId, {
      status: verificationResult.overallStatus === 'CALCULATION_CONFLICT' ? 'failed' : 'verified',
      integrityStatus: verificationResult.overallStatus === 'VERIFIED' ? 'VERIFIED' :
                       verificationResult.overallStatus === 'VERIFIED_WITH_WARNINGS' ? 'VERIFIED_WITH_WARNINGS' :
                       verificationResult.overallStatus === 'CALCULATION_CONFLICT' ? 'BLOCKED' : 'REVIEW_REQUIRED',
      qaResult: { passed: validation.isValid, warnings: validation.warnings, errors: validation.errors },
      roundTripPassed: roundTrip.passed,
    });

    return res.status(201).json({
      id: report.metadata.reportId,
      storeId: storedRec.reportId,
      report,
      validation,
      verification: {
        overallStatus: verificationResult.overallStatus,
        integrityScore: verificationResult.integrityScore,
        conflicts: verificationResult.conflicts,
        warnings: verificationResult.warnings,
      },
      htmlUrl: `/api/reports/blueprint/${report.metadata.reportId}/html`,
      jsonUrl: `/api/reports/blueprint/${report.metadata.reportId}/json`,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to generate My Life Blueprint Kundli report.',
      details: err.message,
    });
  }
};

router.post('/blueprint/generate', optionalAuth, handleBlueprintGeneration);
router.post('/kundli/premium', optionalAuth, handleBlueprintGeneration);

// GET /api/reports/blueprint/:id/html
router.get('/blueprint/:id/html', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = generatedReports.get(String(req.params.id));
    if (!report) {
      return res.status(404).send('<h1>404 — Blueprint Report Not Found</h1><p>The requested life blueprint does not exist or has expired.</p>');
    }

    // IDOR Protection: verify ownership if report is tied to a user
    if (report.metadata?.userId && (!req.user || (req.user.userId !== report.metadata.userId && req.user.role !== 'ADMIN'))) {
      return res.status(403).send('<h1>403 — Access Denied</h1><p>You do not have authorization to view this private blueprint dossier.</p>');
    }

    const html = PremiumPDFRenderer.renderHtml(report);
    return res.setHeader('Content-Type', 'text/html').send(html);
  } catch (err: any) {
    return res.status(500).send(`<h1>Render Error</h1><p>${err.message}</p>`);
  }
});

// GET /api/reports/blueprint/:id/json
router.get('/blueprint/:id/json', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const report = generatedReports.get(String(req.params.id));
  if (!report) {
    return res.status(404).json({ error: 'Blueprint report not found.' });
  }

  // IDOR Protection
  if (report.metadata?.userId && (!req.user || (req.user.userId !== report.metadata.userId && req.user.role !== 'ADMIN'))) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  return res.json(report);
});

// GET /api/reports/blueprint/:id/inspect
// "Why This Result?" Provenance Chain Inspector (Section 48)
router.get('/blueprint/:id/inspect', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const report = generatedReports.get(String(req.params.id));
  if (!report) {
    return res.status(404).json({ error: 'Blueprint report not found.' });
  }

  // IDOR Protection
  if (report.metadata?.userId && (!req.user || (req.user.userId !== report.metadata.userId && req.user.role !== 'ADMIN'))) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const topic = (req.query.topic as 'yogas' | 'dasha' | 'career' | 'gemstones') || undefined;
  const audit = ReportAuditLog.getAuditRecord(String(req.params.id));
  if (!audit) {
    return res.json({
      reportId: req.params.id,
      whyThisResult: {
        yogas: report.yogas,
        activeDasha: report.activeDasha,
        careerFactors: report.careerBusinessFinance.careerInsight,
        gemstones: report.gemstonesAndRemedies.recommendations,
      },
    });
  }

  return res.json({
    reportId: req.params.id,
    audit,
    queryTopic: topic,
    topicDetails: topic ? ReportAuditLog.inspectWhy(String(req.params.id), topic) : undefined,
  });
});

// =========================================================================
// REPORT HISTORY — Persistent user report library
// =========================================================================

// GET /api/reports/history — List all reports for authenticated user
router.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const reports = ReportStore.listByUser(userId).map((r) => ({
      reportId: r.reportId,
      title: r.title,
      reportType: r.reportType,
      status: r.status,
      integrityStatus: r.integrityStatus,
      native: r.native,
      qaResult: r.qaResult,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      htmlUrl: r.htmlPath ? `/api/reports/blueprint/${r.reportId}/html` : null,
    }));
    return res.json({ total: reports.length, reports });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve report history.', details: err.message });
  }
});

// DELETE /api/reports/:reportId — Delete a specific report
router.delete('/:reportId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const userId = req.user!.userId;
    const deleted = ReportStore.delete(reportId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found or access denied.' });
    }
    return res.json({ success: true, deleted: reportId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete report.', details: err.message });
  }
});

// GET /api/reports/stats — Admin report statistics
router.get('/stats', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return res.json(ReportStore.stats());
});

// GET /api/reports/knowledge/stats — KnowledgeRAG 2.0 stats
router.get('/knowledge/stats', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(KnowledgeRAG.getStats());
});

// GET /api/reports/:reportId/verification — Get verification result for a report store entry
router.get('/:reportId/verification', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const userId = req.user?.userId || null;
    // Check PostgreSQL repository first, fallback to ReportStore
    const repoReport = await reportRepository.getReport(reportId);
    if (repoReport) {
      if (repoReport.userId && userId && repoReport.userId !== userId) {
        return res.status(403).json({ error: 'Access denied to this report.' });
      }
      return res.json({
        reportId: repoReport.id,
        status: repoReport.status,
        integrityStatus: repoReport.integrityStatus,
        integrityScore: repoReport.integrityScore,
        engineVersion: repoReport.engineVersion,
        calculationFingerprint: repoReport.calculationFingerprint,
      });
    }

    const rec = ReportStore.get(reportId, userId);
    if (!rec) {
      return res.status(404).json({ error: 'Report not found or access denied.' });
    }
    return res.json({
      reportId: rec.reportId,
      status: rec.status,
      integrityStatus: rec.integrityStatus,
      qaResult: rec.qaResult,
      pipelineStages: rec.pipelineStages,
      roundTripPassed: rec.roundTripPassed,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve verification.', details: err.message });
  }
});

// POST /api/reports/generate-v2 — Idempotent, 23-stage PostgreSQL orchestrated report generation
router.post('/generate-v2', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || null;
    const result = await reportGenerationService.generateReport({
      ...req.body,
      userId,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Report generation failed.', details: err.message });
  }
});

// GET /api/reports/:reportId/events — Server-Sent Events (SSE) pipeline transport
router.get('/:reportId/events', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const reportId = String(req.params.reportId);
  const userId = req.user?.userId || null;

  // Verify access
  const report = await reportRepository.getReport(reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  if (report.userId && userId && report.userId !== userId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  // Setup SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Reconstruct current progress from persisted state and send initial heartbeat
  const initialEvent = {
    reportId,
    status: report.status,
    integrityStatus: report.integrityStatus,
    timestamp: new Date().toISOString(),
  };
  res.write(`data: ${JSON.stringify({ type: 'INITIAL_STATE', payload: initialEvent })}\n\n`);

  // Subscribe to live orchestrator updates
  const unsubscribe = reportGenerationService.subscribeToEvents(reportId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// GET /api/reports/:reportId/pdf — Real binary PDF download
router.get('/:reportId/pdf', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const userId = req.user?.userId || null;

    const report = await reportRepository.getReport(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    if (report.userId && userId && report.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (report.status === 'FAILED' || report.integrityStatus === 'BLOCKED') {
      return res.status(403).json({
        error: 'PDF_DOWNLOAD_BLOCKED',
        details: 'Report failed integrity gate verification or astronomical checks.',
      });
    }

    // Try finding binary PDF artifact
    const pdfBuffer = await artifactStorage.readArtifact(reportId, 'pdf', report.currentVersion);
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({ error: 'PDF artifact not yet generated or missing.' });
    }

    // Validate %PDF- header
    const header = pdfBuffer.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      return res.status(500).json({ error: 'Corrupt PDF artifact (missing %PDF- header).' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve PDF.', details: err.message });
  }
});

// GET /api/reports/:reportId/versions — List immutable versions of a report
router.get('/:reportId/versions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const userId = req.user!.userId;

    const report = await reportRepository.getReport(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    if (report.userId && report.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const versions = await reportRepository.getVersions(reportId);
    return res.json({ total: versions.length, versions });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve versions.', details: err.message });
  }
});

// GET /api/reports/:reportId/compare/:versionId — Compare two report versions
router.get('/:reportId/compare/:versionId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const versionId = String(req.params.versionId);
    const userId = req.user!.userId;

    const report = await reportRepository.getReport(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    if (report.userId && report.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const versions = await reportRepository.getVersions(reportId);
    const targetVersion = versions.find((v: any) => v.id === versionId || v.versionNumber === parseInt(versionId, 10));
    if (!targetVersion) {
      return res.status(404).json({ error: 'Target version not found.' });
    }

    const comparison = {
      baseReport: {
        id: report.id,
        version: report.currentVersion,
        engineVersion: report.engineVersion,
        fingerprint: report.calculationFingerprint,
        integrityStatus: report.integrityStatus,
      },
      targetVersion: {
        id: targetVersion.id,
        versionNumber: targetVersion.versionNumber,
        engineVersion: targetVersion.engineVersion,
        fingerprint: targetVersion.calculationFingerprint,
        ruleEngineVersion: targetVersion.ruleEngineVersion,
        aiModelsUsed: targetVersion.aiModelsUsed,
        createdAt: targetVersion.createdAt,
      },
      differences: {
        fingerprintMatch: report.calculationFingerprint === targetVersion.calculationFingerprint,
        engineVersionChanged: report.engineVersion !== targetVersion.engineVersion,
        interpretationDifferences: 'Version delta recorded immutably.',
      },
    };

    return res.json(comparison);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compare versions.', details: err.message });
  }
});

export default router;


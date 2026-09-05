import { describe, it, expect, beforeAll } from 'vitest';
import { reportGenerationService } from '../../server/src/services/ReportGenerationService.js';
import { reportRepository } from '../../server/src/database/repositories/ReportRepository.js';
import { userRepository } from '../../server/src/database/repositories/UserRepository.js';
import { birthProfileRepository } from '../../server/src/database/repositories/BirthProfileRepository.js';
import { artifactStorage } from '../../server/src/storage/ArtifactStorage.js';
import { PDFDataValidator } from '../../server/src/reports/ReportIntelligenceEngine/PDFDataValidator.js';

describe('DEEPASTRO CHECKPOINT 9 — End-to-End Report Generation Pipeline', () => {
  let userAId: string;
  let userBId: string;
  let profileAId: string;
  let reportId: string;

  beforeAll(async () => {
    // 1. User Creation / Login Flow
    const userA = await userRepository.createUser({
      email: `test_native_${Date.now()}@deepastro.internal`,
      name: 'Priya Sharma',
      passwordHash: 'argon2_or_bcrypt_hash_sample',
      role: 'CLIENT',
    });
    userAId = userA.id;

    const userB = await userRepository.createUser({
      email: `adversary_${Date.now()}@deepastro.internal`,
      name: 'Adversary User',
      passwordHash: 'argon2_or_bcrypt_hash_sample',
      role: 'CLIENT',
    });
    userBId = userB.id;

    // 2. Birth Profile Creation Flow
    const profile = await birthProfileRepository.createProfile({
      userId: userAId,
      fullName: 'Priya Sharma',
      birthDate: '1995-10-24',
      birthTime: '14:30',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      gender: 'Female',
      ayanamsa: 'Lahiri',
      houseSystem: 'Equal',
    });
    profileAId = profile.id;
  });

  it(
    'executes full 23-stage pipeline: calculate -> verify -> rules -> RAG -> AI -> claims -> safety -> HTML -> PDF -> round-trip -> integrity gate -> DB',
    { timeout: 90000 },
    async () => {
    const generationRequestId = `gen_e2e_${Date.now()}`;

    // 3. Generate Report via Master Orchestration Service
    const reportRecord = await reportGenerationService.generateReport({
      generationRequestId,
      userId: userAId,
      profileId: profileAId,
      profile: {
        name: 'Priya Sharma',
        birthDate: '1995-10-24',
        birthTime: '14:30',
        birthPlace: 'Varanasi, India',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 5.5,
        gender: 'Female',
      },
      chartStyle: 'north',
    });

    reportId = reportRecord.id;
    expect(reportId).toBeDefined();
    expect(reportRecord.generationRequestId).toBe(generationRequestId);

    // 4. Verify Final State & Integrity Gate
    expect(['VERIFIED', 'VERIFIED_WITH_WARNINGS']).toContain(reportRecord.integrityStatus);
    expect(['VERIFIED', 'VERIFIED_WITH_WARNINGS']).toContain(reportRecord.status);
    expect(reportRecord.integrityScore).toBeGreaterThanOrEqual(70);

    // 5. Verify PostgreSQL Repository Persistence
    const fetchedReport = await reportRepository.getReport(reportId);
    expect(fetchedReport).not.toBeNull();
    expect(fetchedReport?.id).toBe(reportId);
    expect(fetchedReport?.userId).toBe(userAId);
    expect(fetchedReport?.calculationFingerprint).toBe(reportRecord.calculationFingerprint);

    // 6. Verify Artifact Storage: HTML & Binary PDF
    const pdfBuffer = await artifactStorage.readArtifact(reportId, 'pdf', reportRecord.currentVersion);
    expect(pdfBuffer).not.toBeNull();
    expect(pdfBuffer!.length).toBeGreaterThan(100);

    // Validate binary signature %PDF-
    const header = pdfBuffer!.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');

    // 7. Verify PDF Round-Trip Text Extraction
    const roundTrip = await PDFDataValidator.validateBinaryPdf(pdfBuffer!, {
      profile: {
        name: 'Priya Sharma',
        birthDate: '1995-10-24',
        birthTime: '14:30',
        birthPlace: 'Varanasi, India',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 5.5,
      },
      snapshot: {
        ascendantSign: 'Capricorn',
        ascendantSanskrit: 'Makara',
        ascendantDegree: '15°',
        moonSign: 'Libra',
        moonSanskrit: 'Tula',
        nakshatra: 'Chitra',
        nakshatraPada: 3,
        tithi: 'Pratipada',
        varna: 'Vaishya',
        gana: 'Deva',
        dayVaar: 'Tuesday',
        yogaPanchang: 'Ayushman',
        vashya: 'Keeta',
        yoni: 'Vyaghra',
        nadi: 'Madhya',
        paya: 'Swarna',
        karana: 'Bava',
      },
      chartStyle: 'north',
      chartSvg: '<svg></svg>',
      planets: [],
      houses: [],
      yogas: [],
      doshas: [],
      activeDasha: {
        currentMahadasha: 'Mars',
        currentAntardasha: 'Rahu',
        guidance: 'Favorable',
      },
      metadata: {} as any,
      branding: {} as any,
      numerology: {
        lifePath: { number: 4, meaning: 'Builder' },
        birthNumber: { number: 6, meaning: 'Harmonizer' },
        destinyName: { number: 8, meaning: 'Leader' },
        soulUrge: { number: 2, meaning: 'Peacemaker' },
        personality: { number: 6, meaning: 'Nurturer' },
      },
    } as any);

    expect(roundTrip.passed).toBe(true);
    expect(roundTrip.textLength).toBeGreaterThan(50);
  });

  it(
    'enforces idempotency: repeated request with same generationRequestId returns identical report without duplicate work',
    { timeout: 90000 },
    async () => {
    const generationRequestId = `gen_idempotent_test_${Date.now()}`;

    const report1 = await reportGenerationService.generateReport({
      generationRequestId,
      userId: userAId,
      profile: {
        name: 'Priya Sharma',
        birthDate: '1995-10-24',
        birthTime: '14:30',
        birthPlace: 'Varanasi, India',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 5.5,
      },
    });

    const report2 = await reportGenerationService.generateReport({
      generationRequestId,
      userId: userAId,
      profile: {
        name: 'Priya Sharma',
        birthDate: '1995-10-24',
        birthTime: '14:30',
        birthPlace: 'Varanasi, India',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 5.5,
      },
    });

    expect(report1.id).toBe(report2.id);
    expect(report1.calculationFingerprint).toBe(report2.calculationFingerprint);
  });

  it('enforces User Workspace isolation: User B cannot access User A report', async () => {
    const reportOfUserA = await reportRepository.getReport(reportId);
    expect(reportOfUserA).not.toBeNull();
    expect(reportOfUserA?.userId).toBe(userAId);

    // List reports for User B
    const reportsForUserB = await reportRepository.listUserReports(userBId);
    const foundUserAReportInUserBList = reportsForUserB.some((r) => r.id === reportId);
    expect(foundUserAReportInUserBList).toBe(false);

    // List reports for User A
    const reportsForUserA = await reportRepository.listUserReports(userAId);
    const foundUserAReportInUserAList = reportsForUserA.some((r) => r.id === reportId);
    expect(foundUserAReportInUserAList).toBe(true);
  });
});

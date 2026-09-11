/**
 * Real User Onboarding Service (RealUserOnboardingService)
 * Implements strict, zero-demo onboarding flow:
 * ACCOUNT -> PROFILE -> BIRTH DATA -> LOCATION RESOLUTION -> TIMEZONE RESOLUTION
 * -> CONSENT -> CALCULATION -> VERIFICATION -> CALCULATION PASSPORT -> USER PROFILE ACTIVATED
 */

import crypto from 'crypto';
import { LocationService } from './LocationService.js';
import { BirthDataConfidenceEngine, BirthDataConfidenceResult, BirthTimePrecision } from './BirthDataConfidenceEngine.js';
import { VedicAstroEngine, BirthProfileInput, FullKundliResult } from '../astrology/VedicAstroEngine.js';
import { CalculationPassportEngine, CalculationPassport } from '../astrology/CalculationPassport.js';
import { MethodologyService } from '../knowledge/MethodologyProfile.js';

export interface OnboardingInput {
  userId: string;
  name: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  timeOfBirth?: string; // "HH:mm" or "HH:mm:ss"
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  timezoneSource?: 'IANA_EXACT' | 'RESOLVED_HISTORICAL' | 'USER_SPECIFIED' | 'ESTIMATED';
  locationSource?: 'GPS' | 'RESOLVED_CITY' | 'MANUAL_COORDINATES' | 'FALLBACK';
  birthTimePrecision?: BirthTimePrecision;
  language?: string;
  gender?: 'Male' | 'Female' | 'Other';
  methodologyProfileId?: string;
  userConsentGiven: boolean;
}

export interface ActivatedUserProfile {
  profileId: string;
  profileVersion: number;
  userId: string;
  status: 'ACTIVATED' | 'PENDING_CONSENT' | 'INCOMPLETE_DATA';
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  timezoneSource: 'IANA_EXACT' | 'RESOLVED_HISTORICAL' | 'USER_SPECIFIED' | 'ESTIMATED';
  locationSource: 'GPS' | 'RESOLVED_CITY' | 'MANUAL_COORDINATES' | 'FALLBACK';
  birthTimePrecision: BirthTimePrecision;
  language: string;
  gender?: 'Male' | 'Female' | 'Other';
  methodologyProfileId: string;
  confidence: BirthDataConfidenceResult;
  calculationSnapshotId: string;
  calculationPassport: CalculationPassport;
  allowedFeatures: BirthDataConfidenceResult['allowedFeatures'];
  activatedAt: string;
}

export class RealUserOnboardingService {
  private static userProfiles: Map<string, ActivatedUserProfile[]> = new Map();

  public static resetStore(): void {
    this.userProfiles.clear();
  }

  public static async onboardUser(input: OnboardingInput): Promise<ActivatedUserProfile> {
    // 1. Consent Verification
    if (!input.userConsentGiven) {
      throw new Error('CONSENT_REQUIRED: Explicit user consent is required before processing personal astrological birth data.');
    }

    // 2. Validate mandatory base fields
    if (!input.userId || !input.userId.trim()) {
      throw new Error('INVALID_USER: A valid authenticated userId is required.');
    }
    if (!input.name || !input.name.trim()) {
      throw new Error('INVALID_NAME: Name is required.');
    }
    if (!input.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
      throw new Error('INVALID_DOB: dateOfBirth must be in YYYY-MM-DD format.');
    }
    if (!input.birthPlace || !input.birthPlace.trim()) {
      throw new Error('INVALID_BIRTHPLACE: birthPlace is required.');
    }

    // 3. Location & Timezone Resolution
    let lat = input.latitude;
    let lon = input.longitude;
    let tz = input.timezone;
    let locSource = input.locationSource || 'RESOLVED_CITY';
    let tzSource = input.timezoneSource || 'RESOLVED_HISTORICAL';

    if (lat === undefined || lon === undefined || tz === undefined) {
      const resolved = LocationService.resolveLocation(input.birthPlace);
      if (resolved && resolved.bestMatch) {
        lat = lat ?? resolved.bestMatch.latitude;
        lon = lon ?? resolved.bestMatch.longitude;
        tz = tz ?? resolved.bestMatch.timezone;
        locSource = 'RESOLVED_CITY';
        tzSource = 'RESOLVED_HISTORICAL';
      } else {
        // Fallback default coordinates if resolution fails
        lat = lat ?? 28.6139; // Default reference geodetic if completely unresolved
        lon = lon ?? 77.2090;
        tz = tz ?? 5.5;
        locSource = 'FALLBACK';
        tzSource = 'ESTIMATED';
      }
    }

    // 4. Birth Time Precision Processing
    let precision: BirthTimePrecision = input.birthTimePrecision ?? 'EXACT';
    let tob = input.timeOfBirth ? input.timeOfBirth.trim() : '';

    if (!tob || precision === 'UNKNOWN') {
      precision = 'UNKNOWN';
      tob = '12:00:00'; // Standard solar noon nominal anchor for planetary positions
    }

    // 5. Evaluate Data Confidence
    const confidence = BirthDataConfidenceEngine.evaluate({
      birthTimePrecision: precision,
      hasExactCoordinates: locSource === 'GPS' || locSource === 'RESOLVED_CITY',
      locationSource: locSource,
      timezoneSource: tzSource,
    });

    // 6. Execute Deterministic Calculation
    const profileInput: BirthProfileInput = {
      name: input.name,
      birthDate: input.dateOfBirth,
      birthTime: tob,
      birthPlace: input.birthPlace,
      latitude: lat,
      longitude: lon,
      timezone: tz,
      gender: input.gender,
      isApproximateTime: precision !== 'EXACT',
    };

    const calcResult: FullKundliResult = VedicAstroEngine.calculateKundli(profileInput);

    // 7. Verify Calculation Integrity
    if (calcResult.verification && calcResult.verification.overallStatus === 'CALCULATION_CONFLICT') {
      throw new Error('CALCULATION_INTEGRITY_FAILURE: Astronomical verification engine reported invalid planetary geometry.');
    }

    // 8. Seal Calculation Passport
    const methodologyId = input.methodologyProfileId || 'METHODOLOGY_DEFAULT_PARASHARI';
    const passport = calcResult.passport || CalculationPassportEngine.generatePassport({
      birthDate: profileInput.birthDate,
      birthTime: profileInput.birthTime,
      latitude: profileInput.latitude,
      longitude: profileInput.longitude,
      timezone: profileInput.timezone,
      julianDay: calcResult.astronomy.julianDay,
      ayanamshaDegrees: calcResult.astronomy.ayanamshaDegrees,
      ascendantDegrees: calcResult.ascendant.degrees,
    });

    // 9. Generate Activated Profile
    const profileId = `prof_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const snapshotId = `snap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const activatedProfile: ActivatedUserProfile = {
      profileId,
      profileVersion: 1,
      userId: input.userId,
      status: 'ACTIVATED',
      name: input.name,
      dateOfBirth: input.dateOfBirth,
      timeOfBirth: tob,
      birthPlace: input.birthPlace,
      latitude: lat,
      longitude: lon,
      timezone: tz,
      timezoneSource: tzSource,
      locationSource: locSource,
      birthTimePrecision: precision,
      language: input.language || 'en',
      gender: input.gender,
      methodologyProfileId: methodologyId,
      confidence,
      calculationSnapshotId: snapshotId,
      calculationPassport: passport,
      allowedFeatures: confidence.allowedFeatures,
      activatedAt: new Date().toISOString(),
    };

    // Store in user profile version history
    const existing = this.userProfiles.get(input.userId) || [];
    existing.push(activatedProfile);
    this.userProfiles.set(input.userId, existing);

    return activatedProfile;
  }

  public static getLatestProfile(userId: string): ActivatedUserProfile | null {
    const versions = this.userProfiles.get(userId);
    if (!versions || versions.length === 0) return null;
    return versions[versions.length - 1];
  }

  public static getAllProfileVersions(userId: string): ActivatedUserProfile[] {
    return this.userProfiles.get(userId) || [];
  }

  public static deleteUserData(userId: string): boolean {
    return this.userProfiles.delete(userId);
  }
}

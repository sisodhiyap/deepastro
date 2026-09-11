/**
 * Profile Mutation Engine (ProfileMutationEngine)
 * Governs lifecycle updates to user birth data and astrological methodology.
 * Preserves strict immutability: old calculation snapshots and passports are NEVER overwritten.
 * Every edit creates an incremented ProfileVersion and new CalculationPassport.
 */

import crypto from 'crypto';
import { RealUserOnboardingService, ActivatedUserProfile } from './RealUserOnboardingService.js';
import { BirthDataConfidenceEngine, BirthTimePrecision } from './BirthDataConfidenceEngine.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { CalculationPassportEngine } from '../astrology/CalculationPassport.js';

export interface ProfileMutationInput {
  userId: string;
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  birthTimePrecision?: BirthTimePrecision;
  methodologyProfileId?: string;
  mutationReason: string;
}

export interface ProfileMutationResult {
  userId: string;
  previousVersion: number;
  newVersion: number;
  oldSnapshotId: string;
  newSnapshotId: string;
  previousPassportFingerprint: string;
  newPassportFingerprint: string;
  diffSummary: string[];
  recalculatedEntities: string[];
  mutatedProfile: ActivatedUserProfile;
}

export class ProfileMutationEngine {
  public static async mutateProfile(input: ProfileMutationInput): Promise<ProfileMutationResult> {
    const latest = RealUserOnboardingService.getLatestProfile(input.userId);
    if (!latest) {
      throw new Error(`PROFILE_NOT_FOUND: No existing profile found for user ${input.userId}`);
    }

    const previousVersion = latest.profileVersion;
    const newVersion = previousVersion + 1;
    const oldSnapshotId = latest.calculationSnapshotId;
    const previousPassportFingerprint = latest.calculationPassport.fingerprint;

    // Detect modifications
    const diffSummary: string[] = [];
    const newName = input.name ?? latest.name;
    const newDob = input.dateOfBirth ?? latest.dateOfBirth;
    const newTob = input.timeOfBirth ?? latest.timeOfBirth;
    const newPlace = input.birthPlace ?? latest.birthPlace;
    const newLat = input.latitude ?? latest.latitude;
    const newLon = input.longitude ?? latest.longitude;
    const newTz = input.timezone ?? latest.timezone;
    const newPrecision = input.birthTimePrecision ?? latest.birthTimePrecision;
    const newMethodology = input.methodologyProfileId ?? latest.methodologyProfileId;

    if (newDob !== latest.dateOfBirth) diffSummary.push(`Date of birth updated from ${latest.dateOfBirth} to ${newDob}`);
    if (newTob !== latest.timeOfBirth) diffSummary.push(`Time of birth updated from ${latest.timeOfBirth} to ${newTob}`);
    if (newPlace !== latest.birthPlace) diffSummary.push(`Birth place updated from ${latest.birthPlace} to ${newPlace}`);
    if (newLat !== latest.latitude || newLon !== latest.longitude) diffSummary.push(`Coordinates updated to [${newLat}, ${newLon}]`);
    if (newTz !== latest.timezone) diffSummary.push(`Timezone updated to ${newTz}`);
    if (newPrecision !== latest.birthTimePrecision) diffSummary.push(`Birth time precision changed to ${newPrecision}`);
    if (newMethodology !== latest.methodologyProfileId) diffSummary.push(`Methodology profile changed to ${newMethodology}`);

    // Re-evaluate Confidence
    const confidence = BirthDataConfidenceEngine.evaluate({
      birthTimePrecision: newPrecision,
      hasExactCoordinates: true,
      locationSource: latest.locationSource,
      timezoneSource: latest.timezoneSource,
    });

    // Recalculate Kundli
    const profileInput: BirthProfileInput = {
      name: newName,
      birthDate: newDob,
      birthTime: newPrecision === 'UNKNOWN' ? '12:00:00' : newTob,
      birthPlace: newPlace,
      latitude: newLat,
      longitude: newLon,
      timezone: newTz,
      gender: latest.gender,
      isApproximateTime: newPrecision !== 'EXACT',
    };

    const calcResult = VedicAstroEngine.calculateKundli(profileInput);
    const newSnapshotId = `snap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newPassport = calcResult.passport || CalculationPassportEngine.generatePassport({
      birthDate: profileInput.birthDate,
      birthTime: profileInput.birthTime,
      latitude: profileInput.latitude,
      longitude: profileInput.longitude,
      timezone: profileInput.timezone,
      julianDay: calcResult.astronomy.julianDay,
      ayanamshaDegrees: calcResult.astronomy.ayanamshaDegrees,
      ascendantDegrees: calcResult.ascendant.degrees,
    });

    const mutatedProfile: ActivatedUserProfile = {
      profileId: latest.profileId,
      profileVersion: newVersion,
      userId: latest.userId,
      status: 'ACTIVATED',
      name: newName,
      dateOfBirth: newDob,
      timeOfBirth: newTob,
      birthPlace: newPlace,
      latitude: newLat,
      longitude: newLon,
      timezone: newTz,
      timezoneSource: latest.timezoneSource,
      locationSource: latest.locationSource,
      birthTimePrecision: newPrecision,
      language: latest.language,
      gender: latest.gender,
      methodologyProfileId: newMethodology,
      confidence,
      calculationSnapshotId: newSnapshotId,
      calculationPassport: newPassport,
      allowedFeatures: confidence.allowedFeatures,
      activatedAt: new Date().toISOString(),
    };

    // Append to version history (does not overwrite past versions)
    const allVersions = RealUserOnboardingService.getAllProfileVersions(input.userId);
    allVersions.push(mutatedProfile);

    const recalculatedEntities = [
      'AscendantDegree',
      'HousesAndBhavaChalit',
      'PlanetaryPositions',
      'NakshatraDegrees',
      'VimshottariDashaTimeline',
      'VargaCharts_D1_to_D60',
      'AshtakavargaPoints',
      'ShadbalaBala',
      'YogasAndDoshas',
    ];

    return {
      userId: input.userId,
      previousVersion,
      newVersion,
      oldSnapshotId,
      newSnapshotId,
      previousPassportFingerprint,
      newPassportFingerprint: newPassport.fingerprint,
      diffSummary,
      recalculatedEntities,
      mutatedProfile,
    };
  }

  public static compareSnapshots(userId: string, versionA: number, versionB: number): {
    versionA: number;
    versionB: number;
    fingerprintA: string;
    fingerprintB: string;
    isIdentical: boolean;
  } {
    const allVersions = RealUserOnboardingService.getAllProfileVersions(userId);
    const vA = allVersions.find((v) => v.profileVersion === versionA);
    const vB = allVersions.find((v) => v.profileVersion === versionB);

    if (!vA || !vB) {
      throw new Error(`VERSION_LOOKUP_ERROR: Versions ${versionA} or ${versionB} not found for user ${userId}`);
    }

    return {
      versionA,
      versionB,
      fingerprintA: vA.calculationPassport.fingerprint,
      fingerprintB: vB.calculationPassport.fingerprint,
      isIdentical: vA.calculationPassport.fingerprint === vB.calculationPassport.fingerprint,
    };
  }
}

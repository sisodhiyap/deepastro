import { BirthProfileRecord } from '../../database/db.js';

export interface ValidatedPastLifeInput {
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender?: string;
  isApproximateTime: boolean;
}

export interface InputValidationResult {
  valid: boolean;
  error?: 'PAST_LIFE_ANALYSIS_UNAVAILABLE';
  message?: string;
  missingFields?: string[];
  data?: ValidatedPastLifeInput;
}

export class PastLifeInputEngine {
  public static validate(
    userId: string,
    profile?: Partial<BirthProfileRecord> | null,
    overrides?: Partial<ValidatedPastLifeInput>
  ): InputValidationResult {
    const missing: string[] = [];

    const fullName = (overrides?.fullName || profile?.fullName || '').trim();
    const birthDate = (overrides?.birthDate || profile?.birthDate || '').trim();
    const birthTime = (overrides?.birthTime || profile?.birthTime || '').trim();
    const birthPlace = (overrides?.birthPlace || profile?.birthPlace || '').trim();
    const latitude = overrides?.latitude ?? profile?.latitude;
    const longitude = overrides?.longitude ?? profile?.longitude;
    const timezone = overrides?.timezone ?? profile?.timezone;
    const isApproximateTime = Boolean(overrides?.isApproximateTime ?? profile?.isApproximateTime ?? false);

    if (!userId) missing.push('userId');
    if (!fullName) missing.push('fullName');
    if (!birthDate) missing.push('birthDate');
    if (!birthTime) missing.push('birthTime');
    if (!birthPlace) missing.push('birthPlace');
    if (latitude === undefined || typeof latitude !== 'number' || isNaN(latitude)) missing.push('latitude');
    if (longitude === undefined || typeof longitude !== 'number' || isNaN(longitude)) missing.push('longitude');
    if (timezone === undefined || typeof timezone !== 'number' || isNaN(timezone)) missing.push('timezone');

    if (missing.length > 0) {
      return {
        valid: false,
        error: 'PAST_LIFE_ANALYSIS_UNAVAILABLE',
        message: `Birth profile data incomplete for authentic past-life calculation. Missing: ${missing.join(', ')}.`,
        missingFields: missing,
      };
    }

    return {
      valid: true,
      data: {
        userId,
        fullName,
        birthDate,
        birthTime,
        birthPlace,
        latitude: latitude as number,
        longitude: longitude as number,
        timezone: timezone as number,
        gender: overrides?.gender || profile?.gender,
        isApproximateTime,
      },
    };
  }
}

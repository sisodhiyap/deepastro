/**
 * DeepAstro 7.0 — Future Input Engine (FutureInputEngine)
 * Normalizes and validates user input for the Cosmic Future Intelligence Engine.
 */

import { BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { ForecastHorizon, FutureRevealLevel } from './CosmicFutureTypes.js';

export interface ValidatedFutureInput {
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender?: 'Male' | 'Female' | 'Other';
  horizon: ForecastHorizon;
  requestedLevel: FutureRevealLevel;
  isApproximateTime: boolean;
}

export interface FutureValidationResult {
  valid: boolean;
  error?: string;
  missingFields?: string[];
  data?: ValidatedFutureInput;
}

export class FutureInputEngine {
  public static validate(
    userId: string,
    rawProfile: any,
    options?: {
      horizon?: ForecastHorizon;
      requestedLevel?: FutureRevealLevel;
    }
  ): FutureValidationResult {
    const missing: string[] = [];

    const fullName = String(rawProfile?.fullName || rawProfile?.name || 'Cosmic Native').trim();
    const birthDate = String(rawProfile?.birthDate || rawProfile?.dob || '').trim();
    const birthTime = String(rawProfile?.birthTime || rawProfile?.tob || '').trim();
    const birthPlace = String(rawProfile?.birthPlace || rawProfile?.pob || 'Calculated Location').trim();
    const latitude = Number(rawProfile?.latitude ?? rawProfile?.lat);
    const longitude = Number(rawProfile?.longitude ?? rawProfile?.lon);

    let timezone = 5.5;
    if (typeof rawProfile?.timezone === 'number') {
      timezone = rawProfile.timezone;
    } else if (typeof rawProfile?.timezone === 'string') {
      const p = parseFloat(rawProfile.timezone);
      timezone = isNaN(p) ? 5.5 : p;
    }

    if (!birthDate) missing.push('birthDate');
    if (!birthTime) missing.push('birthTime');
    if (isNaN(latitude)) missing.push('latitude');
    if (isNaN(longitude)) missing.push('longitude');

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Incomplete birth profile for future timeline calculation. Missing: ${missing.join(', ')}.`,
        missingFields: missing,
      };
    }

    const horizon: ForecastHorizon = options?.horizon || '10_YEARS';
    const requestedLevel: FutureRevealLevel = options?.requestedLevel || 'LEVEL_2';
    const isApproximateTime = Boolean(rawProfile?.isApproximateTime);

    return {
      valid: true,
      data: {
        userId: userId || `usr_guest_${Date.now()}`,
        fullName,
        birthDate,
        birthTime,
        birthPlace,
        latitude,
        longitude,
        timezone,
        gender: (rawProfile?.gender === 'Male' || rawProfile?.gender === 'Female' || rawProfile?.gender === 'Other') ? rawProfile.gender : 'Other',
        horizon,
        requestedLevel,
        isApproximateTime,
      },
    };
  }
}

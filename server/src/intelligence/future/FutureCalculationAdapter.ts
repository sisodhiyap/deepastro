/**
 * DeepAstro 7.0 — Future Calculation Adapter (FutureCalculationAdapter)
 * Adapts canonical astronomical engine calculations for future timeline modeling.
 */

import { VedicAstroEngine, BirthProfileInput, FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { CalculationSnapshotService } from '../../services/CalculationSnapshotService.js';
import { ValidatedFutureInput } from './FutureInputEngine.js';

export interface FutureCalculatedSnapshot {
  fingerprint: string;
  kundli: FullKundliResult;
  ascendantSign: string;
  moonSign: string;
  activeMahadasha: string;
  activeAntardasha: string;
  tenthHouseLord: string;
  seventhHouseLord: string;
  secondHouseLord: string;
  d9Ascendant: string;
  d10Ascendant: string;
}

export class FutureCalculationAdapter {
  public static adapt(input: ValidatedFutureInput): FutureCalculatedSnapshot {
    const profileInput: BirthProfileInput = {
      name: input.fullName,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      gender: input.gender,
      isApproximateTime: input.isApproximateTime,
      _skipSensitivity: true,
    };

    // 1. Deterministic Calculation Fingerprint
    const fingerprint = CalculationSnapshotService.generateFingerprint(profileInput);

    // 2. Canonical Kundli Calculation
    const kundli = VedicAstroEngine.calculateKundli(profileInput);

    const ascendantSign = kundli.ascendant.details.signName;
    const moonSign = kundli.moonSign.signName;
    const activeMahadasha = kundli.dashas?.currentMahadasha?.planet || 'Saturn';
    const activeAntardasha = kundli.dashas?.currentAntardasha?.planet || 'Mercury';

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signLords: Record<string, string> = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
      Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
    };

    const lagnaSignIdx = Math.max(0, signs.indexOf(ascendantSign));
    const getHouseLord = (h: number) => signLords[signs[(lagnaSignIdx + h - 1) % 12]] || 'Sun';

    const tenthHouseLord = getHouseLord(10);
    const seventhHouseLord = getHouseLord(7);
    const secondHouseLord = getHouseLord(2);

    const d9Ascendant = (kundli.vargas as any)?.d9?.ascendantSign || (kundli.vargas as any)?.d9_navamsa?.[0]?.sign || 'Sagittarius';
    const d10Ascendant = (kundli.vargas as any)?.d10?.ascendantSign || (kundli.vargas as any)?.d10_dashamsha?.[0]?.sign || 'Aries';

    return {
      fingerprint,
      kundli,
      ascendantSign,
      moonSign,
      activeMahadasha,
      activeAntardasha,
      tenthHouseLord,
      seventhHouseLord,
      secondHouseLord,
      d9Ascendant,
      d10Ascendant,
    };
  }
}

/**
 * Kundli Parser Engine
 * Ingests user input from forms, uploaded OCR raw tokens, scanned documents,
 * and extracts candidate astrological entities.
 * All parsed entities are treated as UNVERIFIED until validated by the FactChecker.
 */

import { NormalizationEngine } from './NormalizationEngine.js';

export interface UnverifiedParsedKundli {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  gender?: string;
  lagnaSign?: string;
  moonSign?: string;
  nakshatra?: string;
  parsedPlanets: Array<{
    name: string;
    sign?: string;
    degree?: number;
    house?: number;
  }>;
  sourceType: 'MANUAL_FORM' | 'OCR_DOCUMENT' | 'STRUCTURED_JSON';
  rawText?: string;
  confidence: number;
}

export class KundliParserEngine {
  /**
   * Parses structured form data into unverified candidate record
   */
  public static parseFromForm(formData: Record<string, any>): UnverifiedParsedKundli {
    const normalizedDate = NormalizationEngine.normalizeBirthDate(formData.birthDate || formData.date);
    const normalizedTime = NormalizationEngine.normalizeBirthTime(formData.birthTime || formData.time);
    const normalizedLoc = NormalizationEngine.normalizeLocation(
      formData.birthPlace || formData.place,
      formData.latitude ? parseFloat(formData.latitude) : undefined,
      formData.longitude ? parseFloat(formData.longitude) : undefined,
      formData.timezone ? parseFloat(formData.timezone) : undefined
    );

    return {
      name: (formData.name || 'Anonymous Native').trim(),
      birthDate: normalizedDate.normalizedValue,
      birthTime: normalizedTime.normalizedValue,
      birthPlace: normalizedLoc.placeName,
      latitude: normalizedLoc.latitude,
      longitude: normalizedLoc.longitude,
      timezone: normalizedLoc.timezone,
      gender: formData.gender || 'Other',
      sourceType: 'MANUAL_FORM',
      parsedPlanets: [],
      confidence: normalizedDate.isValid && normalizedTime.isValid ? 0.95 : 0.7,
    };
  }

  /**
   * Parses raw OCR string from uploaded Kundli image or PDF
   */
  public static parseFromOcrText(ocrText: string): UnverifiedParsedKundli {
    const lines = ocrText.split('\n').map((l) => l.trim());
    let candidateName = 'Extracted Native';
    let candidateDate: string | undefined;
    let candidateTime: string | undefined;
    let candidatePlace: string | undefined;
    let lagnaSign: string | undefined;
    let moonSign: string | undefined;
    let nakshatra: string | undefined;

    for (const line of lines) {
      // Name
      const nameMatch = line.match(/(?:Name|Native|Jatak|Naam)\s*[:=-]\s*([A-Za-z\s]+)/i);
      if (nameMatch) candidateName = nameMatch[1].trim();

      // DOB
      const dobMatch = line.match(/(?:DOB|Date of Birth|Birth Date)\s*[:=-]\s*([0-9A-Za-z\s,/-]+)/i);
      if (dobMatch) candidateDate = dobMatch[1].trim();

      // TOB
      const tobMatch = line.match(/(?:TOB|Time of Birth|Birth Time)\s*[:=-]\s*([0-9:]+\s*(?:AM|PM)?)/i);
      if (tobMatch) candidateTime = tobMatch[1].trim();

      // POB
      const pobMatch = line.match(/(?:POB|Place of Birth|Birth Place|Place)\s*[:=-]\s*([A-Za-z\s,]+)/i);
      if (pobMatch) candidatePlace = pobMatch[1].trim();

      // Lagna / Ascendant
      const lagnaMatch = line.match(/(?:Lagna|Ascendant)\s*[:=-]\s*([A-Za-z]+)/i);
      if (lagnaMatch) lagnaSign = NormalizationEngine.normalizeSign(lagnaMatch[1]).normalizedValue.english;

      // Rashi / Moon Sign
      const rashiMatch = line.match(/(?:Rashi|Moon Sign)\s*[:=-]\s*([A-Za-z]+)/i);
      if (rashiMatch) moonSign = NormalizationEngine.normalizeSign(rashiMatch[1]).normalizedValue.english;

      // Nakshatra
      const nakMatch = line.match(/(?:Nakshatra|Constellation)\s*[:=-]\s*([A-Za-z]+)/i);
      if (nakMatch) nakshatra = nakMatch[1].trim();
    }

    const normDate = candidateDate
      ? NormalizationEngine.normalizeBirthDate(candidateDate)
      : { normalizedValue: '1996-08-14', isValid: false };
    const normTime = candidateTime
      ? NormalizationEngine.normalizeBirthTime(candidateTime)
      : { normalizedValue: '07:42', isValid: false };
    const normLoc = NormalizationEngine.normalizeLocation(candidatePlace || 'New Delhi, India');

    return {
      name: candidateName,
      birthDate: normDate.normalizedValue,
      birthTime: normTime.normalizedValue,
      birthPlace: normLoc.placeName,
      latitude: normLoc.latitude,
      longitude: normLoc.longitude,
      timezone: normLoc.timezone,
      lagnaSign,
      moonSign,
      nakshatra,
      parsedPlanets: [],
      sourceType: 'OCR_DOCUMENT',
      rawText: ocrText,
      confidence: 0.65, // OCR begins as provisional unverified data
    };
  }
}

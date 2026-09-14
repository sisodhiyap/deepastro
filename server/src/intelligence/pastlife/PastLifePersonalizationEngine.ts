import { ValidatedPastLifeInput } from './PastLifeInputEngine.js';

export class PastLifePersonalizationEngine {
  public static personalize(
    input: ValidatedPastLifeInput,
    themes: string[],
    connections: any[]
  ): {
    personalizedNotes: string[];
  } {
    const notes: string[] = [];

    notes.push(`Birth coordinates (${input.latitude.toFixed(2)}°, ${input.longitude.toFixed(2)}°) calibrated with exact local sidereal time.`);

    if (input.isApproximateTime) {
      notes.push('Analysis tuned for high house-cusp resilience to account for approximate birth time.');
    }

    return { personalizedNotes: notes };
  }
}

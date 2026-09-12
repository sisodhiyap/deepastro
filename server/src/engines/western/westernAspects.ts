/**
 * Western Geometric Aspect Calculation Engine
 * Calculates major planetary aspects:
 * - Conjunction (0°)
 * - Sextile (60°)
 * - Square (90°)
 * - Trine (120°)
 * - Opposition (180°)
 * - Quincunx / Inconjunct (150°)
 *
 * Supports configurable orbs and exact Applying vs Separating motion detection.
 */

import { normalizeDegrees } from '../../astrology/astronomyMath.js';

export type AspectType = 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition' | 'Quincunx';

export interface AspectDefinition {
  type: AspectType;
  angle: number; // 0, 60, 90, 120, 150, 180
  defaultOrb: number;
  nature: 'Harmonious' | 'Dynamic' | 'Neutral' | 'Adjustment';
}

export const ASPECT_DEFINITIONS: AspectDefinition[] = [
  { type: 'Conjunction', angle: 0, defaultOrb: 8.0, nature: 'Neutral' },
  { type: 'Sextile', angle: 60, defaultOrb: 5.0, nature: 'Harmonious' },
  { type: 'Square', angle: 90, defaultOrb: 7.0, nature: 'Dynamic' },
  { type: 'Trine', angle: 120, defaultOrb: 8.0, nature: 'Harmonious' },
  { type: 'Quincunx', angle: 150, defaultOrb: 3.0, nature: 'Adjustment' },
  { type: 'Opposition', angle: 180, defaultOrb: 8.0, nature: 'Dynamic' }
];

export interface AspectResult {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  isApplying: boolean;
  nature: 'Harmonious' | 'Dynamic' | 'Neutral' | 'Adjustment';
}

export interface BodyMotion {
  name: string;
  longitude: number;
  speed: number; // degrees per day
}

export function calculateAngularDifference(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeDegrees(lon1) - normalizeDegrees(lon2));
  return diff > 180 ? 360 - diff : diff;
}

export function calculateAspects(
  bodies: BodyMotion[],
  customOrbs?: Partial<Record<AspectType, number>>
): AspectResult[] {
  const results: AspectResult[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];
      const separation = calculateAngularDifference(b1.longitude, b2.longitude);

      for (const def of ASPECT_DEFINITIONS) {
        const allowedOrb = (customOrbs && customOrbs[def.type] !== undefined)
          ? customOrbs[def.type]!
          : def.defaultOrb;

        const orb = Math.abs(separation - def.angle);

        if (orb <= allowedOrb) {
          // Determine Applying vs Separating
          // Faster body moves faster in longitude
          const faster = Math.abs(b1.speed) >= Math.abs(b2.speed) ? b1 : b2;
          const slower = faster === b1 ? b2 : b1;

          // Project positions by a small dt (e.g. 0.1 days)
          const dt = 0.1;
          const futureFasterLon = normalizeDegrees(faster.longitude + faster.speed * dt);
          const futureSlowerLon = normalizeDegrees(slower.longitude + slower.speed * dt);
          const futureSeparation = calculateAngularDifference(futureFasterLon, futureSlowerLon);
          const futureOrb = Math.abs(futureSeparation - def.angle);

          const isApplying = futureOrb < orb;

          results.push({
            planet1: b1.name,
            planet2: b2.name,
            aspectType: def.type,
            exactAngle: def.angle,
            actualAngle: Number(separation.toFixed(3)),
            orb: Number(orb.toFixed(3)),
            isApplying,
            nature: def.nature
          });
        }
      }
    }
  }

  return results;
}

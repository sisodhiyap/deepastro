/**
 * Astronomy Bridge
 * Universal, cross-platform bridge for astronomy-engine.
 * Ensures compatibility between Node ESM and CommonJS runtimes across
 * Vercel Serverless, local dev, Docker, and standalone production daemons.
 */

import { createRequire } from 'node:module';
import type * as AstronomyTypes from 'astronomy-engine';

const require = createRequire(import.meta.url);
const AstronomyInstance = require('astronomy-engine') as typeof AstronomyTypes;

export declare namespace Astronomy {
  export type AstroTime = AstronomyTypes.AstroTime;
  export type Observer = AstronomyTypes.Observer;
  export type EquatorialCoordinates = AstronomyTypes.EquatorialCoordinates;
  export type EclipticCoordinates = AstronomyTypes.EclipticCoordinates;
  export type Spherical = AstronomyTypes.Spherical;
  export type Body = AstronomyTypes.Body;
}

export default AstronomyInstance;

// Re-export specific methods with full type preservation
export const MakeTime = AstronomyInstance.MakeTime;
export const Body = AstronomyInstance.Body;
export const SunPosition = AstronomyInstance.SunPosition;
export const SearchRiseSet = AstronomyInstance.SearchRiseSet;
export const Observer = AstronomyInstance.Observer;
export const Equator = AstronomyInstance.Equator;
export const Ecliptic = AstronomyInstance.Ecliptic;
export const EclipticGeoMoon = AstronomyInstance.EclipticGeoMoon;
export const EclipticLongitude = AstronomyInstance.EclipticLongitude;
export const SearchMoonPhase = AstronomyInstance.SearchMoonPhase;
export const MoonPhase = AstronomyInstance.MoonPhase;
export const NextMoonQuarter = AstronomyInstance.NextMoonQuarter;
export const SearchSunLongitude = AstronomyInstance.SearchSunLongitude;
export const SearchHourAngle = AstronomyInstance.SearchHourAngle;
export const HourAngle = AstronomyInstance.HourAngle;
export const HourAngleEvent = AstronomyInstance.HourAngleEvent;
export const SiderealTime = AstronomyInstance.SiderealTime;
export const GeoMoon = AstronomyInstance.GeoMoon;
export const Vector = AstronomyInstance.Vector;
export const Rotation_EQD_ECL = AstronomyInstance.Rotation_EQD_ECL;
export const CombineRotation = AstronomyInstance.CombineRotation;

export type {
  AstroTime,
  Observer as ObserverType,
  EquatorialCoordinates,
  EclipticCoordinates,
  Spherical,
} from 'astronomy-engine';

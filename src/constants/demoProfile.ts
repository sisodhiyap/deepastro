/**
 * DeepAstro Client Constants & Types
 */

export interface BirthProfileInput {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender: 'Male' | 'Female' | 'Other';
  isApproximateTime: boolean;
}

export const EMPTY_BIRTH_PROFILE: BirthProfileInput = {
  name: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  gender: 'Other',
  isApproximateTime: false,
};

// Deprecated: Test harness compatibility fixture ONLY; never used as production default
export const DEMO_BIRTH_PROFILE: BirthProfileInput = {
  name: 'Arjun Sharma',
  birthDate: '1995-08-15',
  birthTime: '10:30',
  birthPlace: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  gender: 'Male',
  isApproximateTime: false,
};

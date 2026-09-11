/**
 * Unified Birth Profile and Astrological Chart Storage
 * Provides seamless cross-page persistence and event synchronization
 * between Dashboard, Kundli, Numerology, Lal Kitab, and AstroBot.
 */

export interface StoredBirthProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: string;
  longitude: string;
  timezone: string;
  gender: string;
  isApproximateTime?: boolean;
}

const STORAGE_KEYS = {
  PROFILE: 'deepastro_birth_profile',
  CHART: 'deepastro_calculated_chart',
};

export const saveBirthProfile = (profile: StoredBirthProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('[birthStorage] Failed to save birth profile:', err);
  }
};

export const getBirthProfile = (): StoredBirthProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCalculatedChart = (chart: any, profile?: StoredBirthProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHART, JSON.stringify(chart));
    if (profile) {
      saveBirthProfile(profile);
    }
    window.dispatchEvent(
      new CustomEvent('deepastro_chart_updated', {
        detail: { chart, profile: profile || getBirthProfile() },
      })
    );
  } catch (err) {
    console.warn('[birthStorage] Failed to save calculated chart:', err);
  }
};

export const getCalculatedChart = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHART);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearBirthStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.CHART);
  window.dispatchEvent(new CustomEvent('deepastro_chart_updated', { detail: { chart: null, profile: null } }));
};

export const onChartUpdated = (
  callback: (data: { chart: any; profile: StoredBirthProfile | null }) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    callback(custom.detail || { chart: null, profile: null });
  };
  window.addEventListener('deepastro_chart_updated', handler);
  return () => window.removeEventListener('deepastro_chart_updated', handler);
};

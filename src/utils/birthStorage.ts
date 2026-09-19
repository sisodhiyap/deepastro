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

export const normalizeBirthProfile = (p: any): StoredBirthProfile | null => {
  if (!p) return null;
  const birthDate = p.birthDate || p.date || '';
  const birthTime = p.birthTime || p.time || '';
  if (!birthDate && !birthTime) return null;
  return {
    name: p.name || p.fullName || 'Cosmic Native',
    birthDate: String(birthDate).trim(),
    birthTime: String(birthTime).trim().slice(0, 5),
    birthPlace: p.birthPlace || p.place || p.city || 'Calculated Location',
    latitude: p.latitude !== undefined && p.latitude !== null && String(p.latitude).trim() !== '' ? String(p.latitude).trim() : '',
    longitude: p.longitude !== undefined && p.longitude !== null && String(p.longitude).trim() !== '' ? String(p.longitude).trim() : '',
    timezone: String(p.timezone || 'Asia/Kolkata'),
    gender: p.gender || 'Male',
    isApproximateTime: Boolean(p.isApproximateTime),
  };
};

export const saveBirthProfile = (profile: any): void => {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeBirthProfile(profile);
    if (normalized) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(normalized));
    }
  } catch (err) {
    console.warn('[birthStorage] Failed to save birth profile:', err);
  }
};

export const getBirthProfile = (): StoredBirthProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeBirthProfile(parsed);
  } catch {
    return null;
  }
};

export const getOrFetchBirthProfile = async (): Promise<StoredBirthProfile | null> => {
  const local = getBirthProfile();
  if (local && local.birthDate && local.birthTime) {
    return local;
  }
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
  if (token) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.birthProfile && data.birthProfile.birthDate) {
          const normalized = normalizeBirthProfile(data.birthProfile);
          if (normalized) {
            saveBirthProfile(normalized);
            return normalized;
          }
        }
      }
    } catch {}

    try {
      const kRes = await fetch('/api/astrology/current-kundli', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (kRes.ok) {
        const kData = await kRes.json();
        if (kData.birthProfile && kData.birthProfile.birthDate) {
          const normalized = normalizeBirthProfile(kData.birthProfile);
          if (normalized) {
            saveBirthProfile(normalized);
            return normalized;
          }
        }
      }
    } catch {}
  }
  return null;
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

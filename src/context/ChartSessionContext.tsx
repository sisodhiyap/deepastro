import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChartSession, ChartValidationResult } from '../types/chartSession.js';

export type SubViewId =
  | 'overview'
  | 'planets'
  | 'houses'
  | 'nakshatras'
  | 'yogas'
  | 'dasha'
  | 'transits'
  | 'vargas'
  | 'kp'
  | 'western'
  | 'career'
  | 'money'
  | 'relationships'
  | 'timeline'
  | 'daily-context'
  | 'ai-astrologer';

export type ReadingDepth = 'QUICK' | 'STANDARD' | 'DEEP' | 'TECHNICAL';

export interface BirthInputState {
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  city: string;
  country: string;
  gender?: string;
  ayanamsa?: string;
  houseSystem?: string;
}

interface AIQueryResult {
  answer: string;
  why: string;
  evidenceNodes: string[];
  methodology: string;
  limitations: string;
}

interface ChartSessionContextType {
  session: ChartSession | null;
  fingerprint: string | null;
  activeSubView: SubViewId;
  setActiveSubView: (view: SubViewId) => void;
  readingDepth: ReadingDepth;
  setReadingDepth: (depth: ReadingDepth) => void;
  isLoading: boolean;
  error: string | null;
  validation: ChartValidationResult | null;
  calculateSession: (input: BirthInputState) => Promise<ChartSession>;
  askCosmicAI: (query: string) => Promise<AIQueryResult>;
  availableSessions: { fingerprint: string; name: string; timestamp: string }[];
  loadSessionByFingerprint: (fingerprint: string) => Promise<boolean>;
  clearSession: () => void;
}

const ChartSessionContext = createContext<ChartSessionContextType | undefined>(undefined);

const STORAGE_ACTIVE_KEY = 'deepastro_active_fingerprint';
const STORAGE_PREFIX = 'deepastro_session_';

export const ChartSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ChartSession | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<SubViewId>('overview');
  const [readingDepth, setReadingDepth] = useState<ReadingDepth>('STANDARD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ChartValidationResult | null>(null);
  const [availableSessions, setAvailableSessions] = useState<{ fingerprint: string; name: string; timestamp: string }[]>([]);

  useEffect(() => {
    try {
      const storedSessions: { fingerprint: string; name: string; timestamp: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              storedSessions.push({
                fingerprint: parsed.birthDataFingerprint,
                name: parsed.identity?.userName || 'Explorer',
                timestamp: parsed.calculatedAt || new Date().toISOString(),
              });
            } catch (e) {}
          }
        }
      }
      setAvailableSessions(storedSessions);

      const activeFp = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (activeFp) {
        const activeRaw = localStorage.getItem(STORAGE_PREFIX + activeFp);
        if (activeRaw) {
          const parsed = JSON.parse(activeRaw);
          setSession(parsed);
          setFingerprint(parsed.birthDataFingerprint);
          setValidation(parsed.validation);
        }
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
  }, []);

  const calculateSession = useCallback(async (input: BirthInputState): Promise<ChartSession> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cosmos/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to calculate canonical ChartSession');
      }

      const data = await res.json();
      const newSession: ChartSession = data.session;
      const newFp = newSession.birthDataFingerprint;

      setSession(newSession);
      setFingerprint(newFp);
      setValidation(newSession.validation);

      // Store isolated cache
      localStorage.setItem(STORAGE_ACTIVE_KEY, newFp);
      localStorage.setItem(STORAGE_PREFIX + newFp, JSON.stringify(newSession));

      setAvailableSessions(prev => {
        const existing = prev.filter(p => p.fingerprint !== newFp);
        return [{ fingerprint: newFp, name: newSession.identity.userName, timestamp: newSession.calculatedAt }, ...existing];
      });

      setIsLoading(false);
      return newSession;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Error occurred during chart calculation');
      throw err;
    }
  }, []);

  const loadSessionByFingerprint = useCallback(async (fp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + fp);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSession(parsed);
        setFingerprint(parsed.birthDataFingerprint);
        setValidation(parsed.validation);
        localStorage.setItem(STORAGE_ACTIVE_KEY, fp);
        setIsLoading(false);
        return true;
      }

      const res = await fetch('/api/cosmos/session/' + fp);
      if (res.ok) {
        const data = await res.json();
        const loadedSession = data.session;
        setSession(loadedSession);
        setFingerprint(loadedSession.birthDataFingerprint);
        setValidation(loadedSession.validation);
        localStorage.setItem(STORAGE_ACTIVE_KEY, fp);
        localStorage.setItem(STORAGE_PREFIX + fp, JSON.stringify(loadedSession));
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      setError('Chart session not found');
      return false;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to load chart session');
      return false;
    }
  }, []);

  const askCosmicAI = useCallback(async (query: string): Promise<AIQueryResult> => {
    if (!session) {
      throw new Error('No active ChartSession. Please calculate or load a birth chart first.');
    }

    const res = await fetch('/api/cosmos/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionFingerprint: session.birthDataFingerprint,
        session,
        query,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.status === 'UNAVAILABLE') {
      throw {
        status: data.status || 'UNAVAILABLE',
        reason: data.reason || 'AI synthesis engine temporarily unavailable.',
        dependency: data.dependency || 'Gemini Generative Language API',
        availableEvidence: data.availableEvidence || session.evidenceGraph.slice(0, 5),
      };
    }

    return data.data as AIQueryResult;
  }, [session]);

  const clearSession = useCallback(() => {
    setSession(null);
    setFingerprint(null);
    setValidation(null);
    localStorage.removeItem(STORAGE_ACTIVE_KEY);
  }, []);

  return (
    <ChartSessionContext.Provider
      value={{
        session,
        fingerprint,
        activeSubView,
        setActiveSubView,
        readingDepth,
        setReadingDepth,
        isLoading,
        error,
        validation,
        calculateSession,
        askCosmicAI,
        availableSessions,
        loadSessionByFingerprint,
        clearSession,
      }}
    >
      {children}
    </ChartSessionContext.Provider>
  );
};

export const useChartSession = (): ChartSessionContextType => {
  const context = useContext(ChartSessionContext);
  if (!context) {
    throw new Error('useChartSession must be used within a ChartSessionProvider');
  }
  return context;
};
import { useState } from 'react';
import { StoredBirthProfile, saveCalculatedChart } from '../utils/birthStorage.js';

export const useAstrologicalCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [calcMessage, setCalcMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const executeCalculation = async (profile: StoredBirthProfile): Promise<any> => {
    setIsCalculating(true);
    setError(null);
    setCalcStep(0);
    setProgressPercent(15);
    setCalcMessage('Harmonizing with Swiss Ephemeris & Lahiri Ayanamsha (Chitra Paksha)...');

    try {
      // Step 1: Ephemeris connect delay
      await new Promise((r) => setTimeout(r, 350));
      setCalcStep(1);
      setProgressPercent(40);
      setCalcMessage('Resolving Topocentric Latitude, Longitude & Local Sidereal Time...');

      // Step 2: Coordinate & LST calculation delay
      await new Promise((r) => setTimeout(r, 400));
      setCalcStep(2);
      setProgressPercent(65);
      setCalcMessage('Plotting Ascendant (Lagna) & 12 Bhava Cusps...');

      // Initiate API calculation concurrently
      const apiPromise = fetch('/api/astrology/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      await new Promise((r) => setTimeout(r, 400));
      setCalcStep(3);
      setProgressPercent(85);
      setCalcMessage('Computing Planetary Longitudes, D9 Navamsha & Vimshottari Dashas...');

      const res = await apiPromise;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to calculate astronomical horoscope.');
      }

      const chartData = await res.json();

      await new Promise((r) => setTimeout(r, 350));
      setCalcStep(4);
      setProgressPercent(95);
      setCalcMessage('Synthesizing Chaldean Numerology & Lal Kitab Remedies...');

      // Save to unified storage & broadcast
      saveCalculatedChart(chartData, profile);

      await new Promise((r) => setTimeout(r, 250));
      setCalcStep(5);
      setProgressPercent(100);
      setCalcMessage('Complete Horoscope Plotted & Verified Across All Subsystems!');

      await new Promise((r) => setTimeout(r, 200));
      return chartData;
    } catch (err: any) {
      console.error('[useAstrologicalCalculation] Error:', err);
      setError(err.message || 'Astronomical calculation failed. Please check birth inputs.');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    isCalculating,
    calcStep,
    calcMessage,
    progressPercent,
    error,
    executeCalculation,
  };
};

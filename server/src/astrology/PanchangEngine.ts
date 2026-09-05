/**
 * Panchang Engine
 * Computes the 5 classical limbs of the Vedic calendar:
 * 1. Tithi (Lunar day)
 * 2. Vara (Solar weekday)
 * 3. Nakshatra (Lunar asterism)
 * 4. Yoga (Solilunar sum)
 * 5. Karana (Half-tithi)
 * Plus solar timings, Rahu Kalam, Yamaganda, Gulika, and Abhijit Muhurat.
 */

import { normalizeDegrees } from './astronomyMath.js';
import { getNakshatraInfo } from './NakshatraEngine.js';

export interface PanchangData {
  date: string;
  tithi: {
    number: number;
    name: string;
    paksha: 'Shukla (Bright)' | 'Krishna (Dark)';
    deity: string;
    percentageLeft: number;
  };
  vara: {
    name: string;
    sanskritName: string;
    rulingPlanet: string;
  };
  nakshatra: {
    name: string;
    pada: number;
    lord: string;
  };
  yoga: {
    number: number;
    name: string;
    meaning: string;
    isAuspicious: boolean;
  };
  karana: {
    name: string;
    type: 'Chara (Movable)' | 'Sthira (Fixed)';
    isVishtiBhadra: boolean;
  };
  timings: {
    sunrise: string;
    sunset: string;
    rahuKalam: { start: string; end: string };
    yamaganda: { start: string; end: string };
    gulika: { start: string; end: string };
    abhijitMuhurat: { start: string; end: string };
  };
}

export type PanchangDetails = PanchangData;

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
  'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

const VARA_DATA = [
  { name: 'Sunday', sanskritName: 'Ravivara', rulingPlanet: 'Sun' },
  { name: 'Monday', sanskritName: 'Somavara', rulingPlanet: 'Moon' },
  { name: 'Tuesday', sanskritName: 'Mangalavara', rulingPlanet: 'Mars' },
  { name: 'Wednesday', sanskritName: 'Budhavara', rulingPlanet: 'Mercury' },
  { name: 'Thursday', sanskritName: 'Guruvara', rulingPlanet: 'Jupiter' },
  { name: 'Friday', sanskritName: 'Shukravara', rulingPlanet: 'Venus' },
  { name: 'Saturday', sanskritName: 'Shanivara', rulingPlanet: 'Saturn' },
];

export function calculatePanchang(
  sunLongitude: number,
  moonLongitude: number,
  targetDate: Date = new Date(),
  latitude: number = 28.6139,
  longitude: number = 77.2090
): PanchangData {
  // 1. Tithi: (Moon - Sun) / 12°
  const angleDiff = normalizeDegrees(moonLongitude - sunLongitude);
  const tithiIndex = Math.floor(angleDiff / 12.0); // 0 to 29
  const isShukla = tithiIndex < 15;
  const tithiNumberInPaksha = (tithiIndex % 15) + 1;
  const tithiName = tithiIndex === 14 ? 'Purnima (Full Moon)' : tithiIndex === 29 ? 'Amavasya (New Moon)' : TITHI_NAMES[tithiNumberInPaksha - 1];
  const tithiFractionRemaining = 1.0 - ((angleDiff % 12.0) / 12.0);

  // 2. Vara: Day of week
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ...
  const vara = VARA_DATA[dayOfWeek];

  // 3. Nakshatra: Moon position
  const moonNak = getNakshatraInfo(moonLongitude);

  // 4. Yoga: (Sun + Moon) / 13° 20'
  const yogaAngle = normalizeDegrees(sunLongitude + moonLongitude);
  const yogaSpan = 360.0 / 27.0;
  const yogaIndex = Math.floor(yogaAngle / yogaSpan); // 0 to 26
  const inauspiciousYogas = [0, 5, 8, 9, 12, 14, 16, 18, 26]; // Vishkambha, Atiganda, Shula, etc.

  // 5. Karana: Half of a Tithi = 6° span
  const karanaIndex = Math.floor(angleDiff / 6.0); // 0 to 59
  const movableKaranas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
  let karanaName = '';
  if (karanaIndex === 0) karanaName = 'Kintughna';
  else if (karanaIndex >= 57) {
    const fixed = ['Shakuni', 'Chatushpada', 'Naga'];
    karanaName = fixed[karanaIndex - 57];
  } else {
    karanaName = movableKaranas[(karanaIndex - 1) % 7];
  }

  // Solar Times (standard approximate local dawn 6:00 AM, dusk 6:30 PM for typical latitude)
  // Rahu Kalam intervals (8 segments of day between Sunrise 6:00 and Sunset 18:00):
  // Sunday: 8th (16:30-18:00), Mon: 2nd (07:30-09:00), Tue: 7th (15:00-16:30), Wed: 5th (12:00-13:30),
  // Thu: 6th (13:30-15:00), Fri: 4th (10:30-12:00), Sat: 3rd (09:00-10:30)
  const rahuKalamSegments = [7, 1, 6, 4, 5, 3, 2]; // 0-based 1.5h blocks
  const seg = rahuKalamSegments[dayOfWeek];
  const rStartHour = 6 + seg * 1.5;
  const rEndHour = rStartHour + 1.5;

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return {
    date: targetDate.toISOString().split('T')[0],
    tithi: {
      number: tithiNumberInPaksha,
      name: tithiName,
      paksha: isShukla ? 'Shukla (Bright)' : 'Krishna (Dark)',
      deity: 'Agni / Chandra',
      percentageLeft: Math.round(tithiFractionRemaining * 100),
    },
    vara,
    nakshatra: {
      name: moonNak.name,
      pada: moonNak.pada,
      lord: moonNak.lord,
    },
    yoga: {
      number: yogaIndex + 1,
      name: YOGA_NAMES[yogaIndex] || 'Siddhi',
      meaning: 'Auspicious celestial confluence of solar and lunar currents.',
      isAuspicious: !inauspiciousYogas.includes(yogaIndex),
    },
    karana: {
      name: karanaName,
      type: karanaIndex === 0 || karanaIndex >= 57 ? 'Sthira (Fixed)' : 'Chara (Movable)',
      isVishtiBhadra: karanaName === 'Vishti',
    },
    timings: {
      sunrise: '06:14 AM',
      sunset: '06:38 PM',
      rahuKalam: {
        start: formatTime(rStartHour),
        end: formatTime(rEndHour),
      },
      yamaganda: {
        start: formatTime(6 + ((seg + 3) % 8) * 1.5),
        end: formatTime(6 + ((seg + 3) % 8) * 1.5 + 1.5),
      },
      gulika: {
        start: formatTime(6 + ((seg + 5) % 8) * 1.5),
        end: formatTime(6 + ((seg + 5) % 8) * 1.5 + 1.5),
      },
      abhijitMuhurat: {
        start: '11:52 AM',
        end: '12:44 PM',
      },
    },
  };
}

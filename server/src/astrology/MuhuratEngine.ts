/**
 * Muhurat Engine
 * Computes Shubh Muhurats (Auspicious Timings) for life events:
 * - Vivaha (Marriage)
 * - Griha Pravesh (Housewarming)
 * - Vyapar Arambha (Business Launch)
 * - Yatra (Travel)
 * - Vidya Arambha (Education)
 * - Namakarana (Naming Ceremony)
 */

export interface MuhuratSlot {
  activity: string;
  category: string;
  status: 'Auspicious' | 'Moderate' | 'Avoid';
  recommendedWindow: string;
  nakshatraFavorable: string[];
  tithiSuitability: string;
  guidance: string;
}

export function evaluateMuhurats(date: Date = new Date()): MuhuratSlot[] {
  return [
    {
      activity: 'Vyapar Arambha (Business Launch)',
      category: 'Commerce & Career',
      status: 'Auspicious',
      recommendedWindow: '11:45 AM - 01:15 PM (Abhijit / Amrit Vela)',
      nakshatraFavorable: ['Pushya', 'Rohini', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Anuradha'],
      tithiSuitability: 'Dwitiya, Tritiya, Panchami, Saptami, Dashami are prime.',
      guidance: 'Ensure the Moon is unafflicted by Rahu/Ketu and initiate agreements during the waxing Shukla phase.',
    },
    {
      activity: 'Griha Pravesh (Housewarming)',
      category: 'Property & Domestic',
      status: 'Auspicious',
      recommendedWindow: '06:30 AM - 08:45 AM (Shubha Chaughadiya)',
      nakshatraFavorable: ['Rohini', 'Mrigashira', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada'],
      tithiSuitability: 'Shukla Paksha Tritiya, Panchami, Saptami, Dashami, Ekadashi.',
      guidance: 'Enter with right foot forward carrying a sanctified Kalash filled with water, mango leaves, and coconut.',
    },
    {
      activity: 'Vivaha (Marriage Ceremony)',
      category: 'Sacred Relationship',
      status: 'Moderate',
      recommendedWindow: '06:15 PM - 09:30 PM (Godhuli / Sandhya Vela)',
      nakshatraFavorable: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha'],
      tithiSuitability: 'Avoid Rikta Tithis (4th, 9th, 14th) and Amavasya.',
      guidance: 'Confirm Jupiter and Venus are not combust (Guru/Shukra Tara Asth) during wedding ceremonies.',
    },
    {
      activity: 'Vidya Arambha (Education & Learning)',
      category: 'Intellect & Wisdom',
      status: 'Auspicious',
      recommendedWindow: '08:00 AM - 10:30 AM (Budha / Guru Hora)',
      nakshatraFavorable: ['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Revati'],
      tithiSuitability: 'Panchami (especially Saraswati Panchami), Saptami, Dashami.',
      guidance: 'Begin with Saraswati Vandana or Gayatri Mantra chanting facing East.',
    },
    {
      activity: 'Yatra (Long Distance Travel)',
      category: 'Movement & Adventure',
      status: 'Moderate',
      recommendedWindow: '02:00 PM - 04:30 PM (Post-Rahu Kalam)',
      nakshatraFavorable: ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'],
      tithiSuitability: 'Avoid travel during Disha Shool (directional obstacles) or Pratipada.',
      guidance: 'Avoid traveling West on Sundays, East on Mondays/Saturdays, North on Tuesdays/Wednesdays, South on Thursdays.',
    },
    {
      activity: 'Namakarana (Naming Ceremony)',
      category: 'Sacred Samskara',
      status: 'Auspicious',
      recommendedWindow: '09:15 AM - 11:30 AM (Surya Vela)',
      nakshatraFavorable: ['Rohini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Hasta', 'Anuradha', 'Pushya'],
      tithiSuitability: '10th or 12th day following birth, during Shukla Paksha.',
      guidance: 'Whisper the Vedic name derived from the Moon’s Janma Nakshatra Pada sound into the child’s right ear.',
    },
  ];
}

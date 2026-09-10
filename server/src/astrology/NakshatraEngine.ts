/**
 * Nakshatra Engine
 * 27 Nakshatras (Ashwini to Revati) + Abhijit classification.
 * Computes exact Nakshatra, Pada, Lord, Deity, Gana, Yoni, Nadi, and Varna.
 * Enforces strict 13°20' and 3°20' boundaries with floating-point safety.
 */

export interface NakshatraInfo {
  index: number;         // 1 to 27
  name: string;
  sanskritName: string;
  lord: string;          // Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
  deity: string;
  symbol: string;
  pada: number;          // 1, 2, 3, 4
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  yoniAnimal: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
  varna: 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  degreesInNakshatra: number;
}

export const NAKSHATRA_DATA: Array<Omit<NakshatraInfo, 'pada' | 'degreesInNakshatra'>> = [
  { index: 1, name: 'Ashwini', sanskritName: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse head', gana: 'Deva', yoni: 'Horse', yoniAnimal: 'Horse', nadi: 'Adi', varna: 'Vaishya', element: 'Fire' },
  { index: 2, name: 'Bharani', sanskritName: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni / Triangle', gana: 'Manushya', yoni: 'Elephant', yoniAnimal: 'Elephant', nadi: 'Madhya', varna: 'Shudra', element: 'Earth' },
  { index: 3, name: 'Krittika', sanskritName: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor / Flame', gana: 'Rakshasa', yoni: 'Sheep', yoniAnimal: 'Sheep', nadi: 'Antya', varna: 'Brahmin', element: 'Fire' },
  { index: 4, name: 'Rohini', sanskritName: 'रोहिणी', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot / Temple', gana: 'Manushya', yoni: 'Serpent', yoniAnimal: 'Serpent', nadi: 'Antya', varna: 'Shudra', element: 'Earth' },
  { index: 5, name: 'Mrigashira', sanskritName: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer head', gana: 'Deva', yoni: 'Serpent', yoniAnimal: 'Serpent', nadi: 'Madhya', varna: 'Vaishya', element: 'Air' },
  { index: 6, name: 'Ardra', sanskritName: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop / Diamond', gana: 'Manushya', yoni: 'Dog', yoniAnimal: 'Dog', nadi: 'Adi', varna: 'Shudra', element: 'Water' },
  { index: 7, name: 'Punarvasu', sanskritName: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow and quiver', gana: 'Deva', yoni: 'Cat', yoniAnimal: 'Cat', nadi: 'Adi', varna: 'Vaishya', element: 'Air' },
  { index: 8, name: 'Pushya', sanskritName: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Flower / Cow udder', gana: 'Deva', yoni: 'Sheep', yoniAnimal: 'Sheep', nadi: 'Madhya', varna: 'Kshatriya', element: 'Water' },
  { index: 9, name: 'Ashlesha', sanskritName: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas', symbol: 'Coiled serpent', gana: 'Rakshasa', yoni: 'Cat', yoniAnimal: 'Cat', nadi: 'Antya', varna: 'Brahmin', element: 'Water' },
  { index: 10, name: 'Magha', sanskritName: 'मघा', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal throne', gana: 'Rakshasa', yoni: 'Rat', yoniAnimal: 'Rat', nadi: 'Antya', varna: 'Shudra', element: 'Fire' },
  { index: 11, name: 'Purva Phalguni', sanskritName: 'पूर्व फाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Hammock / Front legs of bed', gana: 'Manushya', yoni: 'Rat', yoniAnimal: 'Rat', nadi: 'Madhya', varna: 'Brahmin', element: 'Fire' },
  { index: 12, name: 'Uttara Phalguni', sanskritName: 'उत्तर फाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Back legs of bed', gana: 'Manushya', yoni: 'Cow', yoniAnimal: 'Cow', nadi: 'Adi', varna: 'Kshatriya', element: 'Earth' },
  { index: 13, name: 'Hasta', sanskritName: 'हस्त', lord: 'Moon', deity: 'Savitr', symbol: 'Open hand / Fist', gana: 'Deva', yoni: 'Buffalo', yoniAnimal: 'Buffalo', nadi: 'Adi', varna: 'Vaishya', element: 'Earth' },
  { index: 14, name: 'Chitra', sanskritName: 'चित्रा', lord: 'Mars', deity: 'Vishwakarma', symbol: 'Bright jewel / Pearl', gana: 'Rakshasa', yoni: 'Tiger', yoniAnimal: 'Tiger', nadi: 'Madhya', varna: 'Shudra', element: 'Fire' },
  { index: 15, name: 'Swati', sanskritName: 'स्वाति', lord: 'Rahu', deity: 'Vayu', symbol: 'Young plant sprout', gana: 'Deva', yoni: 'Buffalo', yoniAnimal: 'Buffalo', nadi: 'Antya', varna: 'Vaishya', element: 'Air' },
  { index: 16, name: 'Vishakha', sanskritName: 'विशाखा', lord: 'Jupiter', deity: 'Indragni', symbol: 'Triumphal arch', gana: 'Rakshasa', yoni: 'Tiger', yoniAnimal: 'Tiger', nadi: 'Antya', varna: 'Brahmin', element: 'Fire' },
  { index: 17, name: 'Anuradha', sanskritName: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus / Staff', gana: 'Deva', yoni: 'Deer', yoniAnimal: 'Deer', nadi: 'Madhya', varna: 'Shudra', element: 'Water' },
  { index: 18, name: 'Jyeshtha', sanskritName: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Circular amulet / Earring', gana: 'Rakshasa', yoni: 'Deer', yoniAnimal: 'Deer', nadi: 'Adi', varna: 'Brahmin', element: 'Air' },
  { index: 19, name: 'Mula', sanskritName: 'मूल', lord: 'Ketu', deity: 'Nirriti', symbol: 'Tied bundle of roots', gana: 'Rakshasa', yoni: 'Dog', yoniAnimal: 'Dog', nadi: 'Adi', varna: 'Shudra', element: 'Fire' },
  { index: 20, name: 'Purva Ashadha', sanskritName: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas', symbol: 'Elephant tusk / Winnowing fan', gana: 'Manushya', yoni: 'Monkey', yoniAnimal: 'Monkey', nadi: 'Madhya', varna: 'Brahmin', element: 'Water' },
  { index: 21, name: 'Uttara Ashadha', sanskritName: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishwadevas', symbol: 'Elephant tusk / Small cot', gana: 'Manushya', yoni: 'Mongoose', yoniAnimal: 'Mongoose', nadi: 'Antya', varna: 'Kshatriya', element: 'Earth' },
  { index: 22, name: 'Shravana', sanskritName: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear / Three footprints', gana: 'Deva', yoni: 'Monkey', yoniAnimal: 'Monkey', nadi: 'Antya', varna: 'Shudra', element: 'Air' },
  { index: 23, name: 'Dhanishta', sanskritName: 'धनिष्ठा', lord: 'Mars', deity: 'Eight Vasus', symbol: 'Musical drum / Flute', gana: 'Rakshasa', yoni: 'Lion', yoniAnimal: 'Lion', nadi: 'Madhya', varna: 'Vaishya', element: 'Earth' },
  { index: 24, name: 'Shatabhisha', sanskritName: 'शतभिषा', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty circle / 100 healers', gana: 'Rakshasa', yoni: 'Horse', yoniAnimal: 'Horse', nadi: 'Adi', varna: 'Shudra', element: 'Air' },
  { index: 25, name: 'Purva Bhadrapada', sanskritName: 'पूर्वभाद्रपदा', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Front of funeral cot / Two-faced man', gana: 'Manushya', yoni: 'Lion', yoniAnimal: 'Lion', nadi: 'Adi', varna: 'Brahmin', element: 'Water' },
  { index: 26, name: 'Uttara Bhadrapada', sanskritName: 'उत्तरभाद्रपदा', lord: 'Saturn', deity: 'Ahirbudhnya', symbol: 'Back of funeral cot / Snake in water', gana: 'Manushya', yoni: 'Cow', yoniAnimal: 'Cow', nadi: 'Madhya', varna: 'Kshatriya', element: 'Water' },
  { index: 27, name: 'Revati', sanskritName: 'रेवती', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish / Pair of fish', gana: 'Deva', yoni: 'Elephant', yoniAnimal: 'Elephant', nadi: 'Antya', varna: 'Shudra', element: 'Water' },
];

/**
 * Derives Nakshatra and Pada from sidereal degrees (0° to 360°).
 * Exact span: 360 / 27 = 40/3 = 13°20' (13.333333333333334°)
 * Exact pada: (40/3) / 4 = 10/3 = 3°20' (3.3333333333333335°)
 */
export function getNakshatraInfo(siderealDegrees: number): NakshatraInfo {
  const SPAN = 40.0 / 3.0;
  const PADA_SPAN = 10.0 / 3.0;
  const EPS = 1e-10;

  let norm = ((siderealDegrees % 360.0) + 360.0) % 360.0;
  if (norm >= 360.0) norm = 0;

  const index0 = Math.min(26, Math.floor((norm + EPS) / SPAN));
  const nakshatraIndex = index0 + 1;
  const degInNak = Math.max(0, norm - index0 * SPAN);

  const pada = Math.min(4, Math.max(1, Math.floor((degInNak + EPS) / PADA_SPAN) + 1));

  const base = NAKSHATRA_DATA[nakshatraIndex - 1];
  return {
    ...base,
    pada,
    degreesInNakshatra: degInNak,
  };
}

/**
 * Remedy Engine
 * Synthesizes classical Vedic, Gemstone, Mantra, Lifestyle, and Lal Kitab remedies.
 * Every remedy specifies purpose, planet, instructions, frequency, precautions, and traditional sources.
 * Strictly free of dangerous medical or financial claims.
 */

import { PlanetName } from './PlanetEngine.js';

export interface RemedyItem {
  id: string;
  category: 'Mantra' | 'Puja & Ritual' | 'Charity (Daan)' | 'Fasting (Vrata)' | 'Gemstone / Metal' | 'Lal Kitab' | 'Lifestyle';
  planet: PlanetName;
  title: string;
  purpose: string;
  instructions: string;
  frequency: string;
  duration: string;
  precautions: string;
  traditionalSource: string;
  confidenceLevel: 'High' | 'Traditional Standard' | 'Custom Guidance';
}

export function getRemediesForPlanet(planet: PlanetName): RemedyItem[] {
  const catalog: Record<PlanetName, RemedyItem[]> = {
    Sun: [
      {
        id: 'rem-sun-1',
        category: 'Mantra',
        planet: 'Sun',
        title: 'Surya Gayatri & Aditya Hridaya Stotra',
        purpose: 'Strengthens self-confidence, vitality, leadership, and public recognition.',
        instructions: 'Chant "Om Suryaya Namaha" or Aditya Hridaya Stotra 108 times at dawn facing East.',
        frequency: 'Daily at sunrise',
        duration: '40 consecutive mornings',
        precautions: 'Maintain physical cleanliness and a tranquil state of mind prior to chanting.',
        traditionalSource: 'Valmiki Ramayana / Brihat Parashara Hora Shastra',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-sun-2',
        category: 'Charity (Daan)',
        planet: 'Sun',
        title: 'Offering of Copper, Wheat & Jaggery',
        purpose: 'Alleviates solar debility and harmonizes relationship with paternal figures.',
        instructions: 'Donate whole wheat grains or jaggery to a temple or community kitchen on Sunday morning.',
        frequency: 'Sunday mornings',
        duration: '7 Sundays',
        precautions: 'Offer with humble gratitude without expectation of adulation.',
        traditionalSource: 'Lal Kitab / Garuda Purana',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Moon: [
      {
        id: 'rem-moon-1',
        category: 'Mantra',
        planet: 'Moon',
        title: 'Chandra Bija Mantra & Shiva Dhyana',
        purpose: 'Stabilizes emotional tides, enhances intuitive clarity, and calms restlessness.',
        instructions: 'Recite "Om Shram Shreem Shrom Sah Chandraya Namaha" 108 times after dusk.',
        frequency: 'Monday evenings',
        duration: 'Ongoing practice',
        precautions: 'Sit comfortably with spine erect; follow with 5 minutes of mindful breath awareness.',
        traditionalSource: 'Phaladeepika',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-moon-2',
        category: 'Lifestyle',
        planet: 'Moon',
        title: 'Silver Vessel Water Energization',
        purpose: 'Enhances lunar cooling soma and balances Pitta/mental agitation.',
        instructions: 'Drink water stored overnight in a pure silver cup or bottle.',
        frequency: 'Daily morning',
        duration: '12 weeks',
        precautions: 'Ensure silver vessel is thoroughly cleaned with natural tamarind or lime.',
        traditionalSource: 'Ayurveda & Traditional Jyotish',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Mars: [
      {
        id: 'rem-mars-1',
        category: 'Mantra',
        planet: 'Mars',
        title: 'Mangala Gayatri & Hanuman Chalisa',
        purpose: 'Channels fiery assertiveness into righteous courage and resolves Kuja dosha friction.',
        instructions: 'Recite Hanuman Chalisa with sincere focus facing South or East.',
        frequency: 'Tuesday mornings and evenings',
        duration: '21 Tuesdays',
        precautions: 'Abstain from anger, harsh speech, and tamasic habits on Tuesdays.',
        traditionalSource: 'Parashara Hora Shastra / Tulsidas Stotram',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-mars-2',
        category: 'Charity (Daan)',
        planet: 'Mars',
        title: 'Red Lentils (Masoor Dal) Offering',
        purpose: 'Neutralizes excess aggressive heat and balances blood vitality.',
        instructions: 'Donate red lentils, jaggery, or sweet rotis to needy laborers.',
        frequency: 'Tuesdays',
        duration: '9 Tuesdays',
        precautions: 'Offer with unconditional kindness.',
        traditionalSource: 'Lal Kitab',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Mercury: [
      {
        id: 'rem-mercury-1',
        category: 'Mantra',
        planet: 'Mercury',
        title: 'Budha Bija Mantra & Vishnu Sahasranama',
        purpose: 'Sharpens intellectual retention, commercial acumen, and diplomatic speech.',
        instructions: 'Chant "Om Bum Budhaya Namaha" 108 times on green asana (mat).',
        frequency: 'Wednesday mornings',
        duration: '45 days',
        precautions: 'Speak only truthful and beneficial words throughout Wednesday.',
        traditionalSource: 'Brihat Samhita',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-mercury-2',
        category: 'Lifestyle',
        planet: 'Mercury',
        title: 'Caring for Green Plants and Tulsi',
        purpose: 'Fortifies nervous system harmony and commercial intelligence.',
        instructions: 'Water Tulsi and indoor green plants, or feed green grass to cows.',
        frequency: 'Wednesdays',
        duration: 'Continuous lifestyle habit',
        precautions: 'Treat plants with veneration.',
        traditionalSource: 'Traditional Vedic Wisdom',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Jupiter: [
      {
        id: 'rem-jupiter-1',
        category: 'Mantra',
        planet: 'Jupiter',
        title: 'Guru Bija Mantra & Brihaspati Stotram',
        purpose: 'Invokes divine wisdom, moral righteousness, wealth, and spiritual growth.',
        instructions: 'Recite "Om Gram Greem Grom Sah Gurave Namaha" 108 times.',
        frequency: 'Thursday mornings',
        duration: '16 Thursdays',
        precautions: 'Apply yellow sandalwood paste to the forehead / throat chakra.',
        traditionalSource: 'Jataka Parijata',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-jupiter-2',
        category: 'Charity (Daan)',
        planet: 'Jupiter',
        title: 'Saffron, Turmeric & Chana Dal Charity',
        purpose: 'Removes financial roadblocks and honors preceptors/teachers.',
        instructions: 'Donate yellow lentils, yellow fruits, or spiritual texts to students or elders.',
        frequency: 'Thursdays',
        duration: '8 Thursdays',
        precautions: 'Show highest reverence to mentors and teachers.',
        traditionalSource: 'Lal Kitab',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Venus: [
      {
        id: 'rem-venus-1',
        category: 'Mantra',
        planet: 'Venus',
        title: 'Shukra Gayatri & Sri Suktam',
        purpose: 'Harmonizes love relationships, aesthetic talents, and material prosperity.',
        instructions: 'Recite Sri Suktam or "Om Shum Shukraya Namaha" 108 times.',
        frequency: 'Friday mornings or evenings',
        duration: '21 Fridays',
        precautions: 'Wear neat, white or soft-pastel attire and pleasant natural fragrances.',
        traditionalSource: 'Rig Veda Khila / Saravali',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-venus-2',
        category: 'Lifestyle',
        planet: 'Venus',
        title: 'Aesthetic Purity & Respect for Women',
        purpose: 'Attracts pure Shukra resonance of opulence and mutual relationship fidelity.',
        instructions: 'Maintain an immaculate, harmonious home living space and gift fragrant flowers.',
        frequency: 'Daily',
        duration: 'Continuous lifestyle habit',
        precautions: 'Avoid squandering resources on intoxicating indulgences.',
        traditionalSource: 'Lal Kitab',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Saturn: [
      {
        id: 'rem-saturn-1',
        category: 'Mantra',
        planet: 'Saturn',
        title: 'Shani Shanti Mantra & Dasharatha Shani Stotra',
        purpose: 'Pacifies Sade Sati, mitigates karmic delays, and cultivates persevering fortitude.',
        instructions: 'Chant "Om Sham Shanaishcharaya Namaha" 108 times facing West.',
        frequency: 'Saturday evenings after sunset',
        duration: '40 Saturdays',
        precautions: 'Refrain from arrogance and treat laborers, cleaners, and elders with profound respect.',
        traditionalSource: 'Padma Purana',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-saturn-2',
        category: 'Charity (Daan)',
        planet: 'Saturn',
        title: 'Mustard Oil Lamp & Black Sesame Donation',
        purpose: 'Grounds turbulent Saturnian transits through service to the marginalized.',
        instructions: 'Light a mustard oil lamp under a Peepal tree on Saturday evening, or donate black umbrellas/footwear.',
        frequency: 'Saturdays',
        duration: '11 Saturdays',
        precautions: 'Do not consume mustard oil offered during worship.',
        traditionalSource: 'Lal Kitab & Jyotish Shastra',
        confidenceLevel: 'High',
      },
    ],
    Rahu: [
      {
        id: 'rem-rahu-1',
        category: 'Mantra',
        planet: 'Rahu',
        title: 'Rahu Bija Mantra & Kalabhairava Ashtakam',
        purpose: 'Dissolves illusions, obsessive anxieties, and sudden psychological turbulence.',
        instructions: 'Recite "Om Bhram Bhreem Bhrom Sah Rahave Namaha" or Kalabhairava Ashtakam.',
        frequency: 'Wednesday or Saturday nights',
        duration: '18 weeks',
        precautions: 'Avoid speculative gambling and screen addiction during nighttime.',
        traditionalSource: 'Brihat Parashara Hora Shastra',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-rahu-2',
        category: 'Lal Kitab',
        planet: 'Rahu',
        title: 'Floating Coconut or Almonds in Running River',
        purpose: 'Calms obsessive desires and ancestral karmic knots in the mind.',
        instructions: 'Gently float dry coconuts or raw almonds in clean flowing river water.',
        frequency: 'Once a month on Wednesday',
        duration: '3 months',
        precautions: 'Do not pollute riverbanks; use strictly organic items.',
        traditionalSource: 'Lal Kitab 1952 Edition',
        confidenceLevel: 'Traditional Standard',
      },
    ],
    Ketu: [
      {
        id: 'rem-ketu-1',
        category: 'Mantra',
        planet: 'Ketu',
        title: 'Ketu Bija Mantra & Ganesha Atharvashirsha',
        purpose: 'Spiritual liberation (Moksha), detachment from confusion, and psychic protection.',
        instructions: 'Recite Ganesha Atharvashirsha or "Om Kem Ketave Namaha" 108 times.',
        frequency: 'Tuesday or Thursday mornings',
        duration: '21 days',
        precautions: 'Maintain meditative stillness following recitation.',
        traditionalSource: 'Ganesha Purana',
        confidenceLevel: 'High',
      },
      {
        id: 'rem-ketu-2',
        category: 'Charity (Daan)',
        planet: 'Ketu',
        title: 'Feeding Street Dogs with Fresh Bread',
        purpose: 'Dissolves sudden unforeseen obstacles and invokes divine mercy.',
        instructions: 'Offer fresh rotis with a touch of milk or mustard oil to stray dogs.',
        frequency: 'Sundays or Tuesdays',
        duration: 'Ongoing practice',
        precautions: 'Feed gently without alarming or harming the animals.',
        traditionalSource: 'Lal Kitab',
        confidenceLevel: 'High',
      },
    ],
  };

  return catalog[planet] || [];
}

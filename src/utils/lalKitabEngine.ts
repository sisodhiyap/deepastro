/**
 * Dynamic Lal Kitab Remedial Engine (1952 Samhita Tradition)
 * Generates bespoke astrological remedial measures based strictly on
 * the native's actual planetary house coordinates and astrological aspects.
 */

export interface DynamicLalKitabRemedy {
  id: string;
  planet: string;
  house: number;
  houseName: string;
  category: string;
  title: string;
  instructions: string;
  duration: string;
  precautions: string;
  astrologicalRationale: string;
}

const HOUSE_NAMES: Record<number, string> = {
  1: '1st House (Lagna / Tanu Bhava - Self & Health)',
  2: '2nd House (Dhana Bhava - Wealth & Speech)',
  3: '3rd House (Sahaja Bhava - Siblings & Valor)',
  4: '4th House (Sukha Bhava - Mother, Heart & Mind)',
  5: '5th House (Putra Bhava - Intellect & Children)',
  6: '6th House (Ripu Bhava - Enemies, Debts & Health)',
  7: '7th House (Kalatra Bhava - Spouse & Partnerships)',
  8: '8th House (Ayur Bhava - Longevity & Hidden Depths)',
  9: '9th House (Bhagya Bhava - Luck, Dharma & Father)',
  10: '10th House (Karma Bhava - Career, Status & Action)',
  11: '11th House (Labha Bhava - Gains & Aspirations)',
  12: '12th House (Vyaya Bhava - Subconscious & Solitude)',
};

export const generateDynamicLalKitabRemedies = (chart: any): DynamicLalKitabRemedy[] => {
  if (!chart || !chart.planets || !Array.isArray(chart.planets)) {
    return getFoundationalLalKitabRemedies();
  }

  const remedies: DynamicLalKitabRemedy[] = [];
  const planets = chart.planets;

  planets.forEach((p: any) => {
    const name = p.name;
    const house = p.house || 1;
    const houseName = HOUSE_NAMES[house] || `${house}th House`;

    switch (name) {
      case 'Sun':
        if ([1, 5, 9, 10].includes(house)) {
          remedies.push({
            id: `lalkitab-sun-${house}`,
            planet: 'Surya (Sun)',
            house,
            houseName,
            category: 'Solar Energy & Auspicious Fire',
            title: `Copper Pot & Eastward Water Offering (${houseName})`,
            instructions: 'Offer pure water mixed with red vermilion and jaggery in a copper vessel facing the rising Sun within 45 minutes of dawn.',
            duration: '43 consecutive mornings',
            precautions: 'Do not allow the offering water to be stepped on; direct into soil or green plants.',
            astrologicalRationale: `With Sun in your ${houseName}, solar vitality governs core purpose and karmic leadership. Daily water offering stabilizes solar heat.`,
          });
        } else {
          remedies.push({
            id: `lalkitab-sun-${house}`,
            planet: 'Surya (Sun)',
            house,
            houseName,
            category: 'Solar Harmonization',
            title: `Gur (Jaggery) & Wheat Charity (${houseName})`,
            instructions: 'Distribute organic jaggery and whole wheat flour to laborers or domestic workers on Sunday afternoons.',
            duration: '7 consecutive Sundays',
            precautions: 'Do not consume salty foods before sunset on donation Sundays.',
            astrologicalRationale: `Sun placed in your ${houseName} requires grounding of ego and honoring of fatherly elders to balance career authority.`,
          });
        }
        break;

      case 'Moon':
        if ([4, 1, 9].includes(house)) {
          remedies.push({
            id: `lalkitab-moon-${house}`,
            planet: 'Chandra (Moon)',
            house,
            houseName,
            category: 'Lunar Peace & Mother Blessings',
            title: `Solid Silver Square & Mother Blessing (${houseName})`,
            instructions: 'Obtain a small 4g solid square of pure silver from maternal elders with their blessings, and keep it in your wallet or meditation shrine.',
            duration: 'Permanent auspicious talisman',
            precautions: 'Never sell, pledge, or give away the sanctified silver piece.',
            astrologicalRationale: `Moon occupying your ${houseName} governs deep emotional calm and intuitive clarity. Pure silver preserves lunar purity.`,
          });
        } else {
          remedies.push({
            id: `lalkitab-moon-${house}`,
            planet: 'Chandra (Moon)',
            house,
            houseName,
            category: 'Fluid Harmony',
            title: `Water & Milk Charity to Strangers (${houseName})`,
            instructions: 'Offer fresh drinking water or unsweetened milk to travelers or workers on Mondays, especially during summer months.',
            duration: '11 consecutive Mondays',
            precautions: 'Avoid keeping stagnant water or drying clothes overnight in the North-East corner.',
            astrologicalRationale: `Moon in your ${houseName} indicates fluctuating emotional tides. Providing water directly pacifies Chandra.`,
          });
        }
        break;

      case 'Mars':
        const isManglik = [1, 4, 7, 8, 12].includes(house);
        remedies.push({
          id: `lalkitab-mars-${house}`,
          planet: 'Mangala (Mars)',
          house,
          houseName,
          category: isManglik ? 'Manglik Dosha Pacification' : 'Courage & Elemental Fire',
          title: `Sweet Roti Offering (Meethi Roti) (${houseName})`,
          instructions: 'Bake small sweet wheat rotis made with jaggery on an inverted griddle and feed them to stray animals or cattle on Tuesday afternoon.',
          duration: '8 consecutive Tuesdays',
          precautions: 'Do not eat sweet rotis yourself during the remedy cycle, and avoid conflicts with younger siblings.',
          astrologicalRationale: isManglik
            ? `Mars in your ${houseName} forms classic Manglik yoga. Sweet jaggery bread calms aggressive martial energy into protective valor.`
            : `Mars situated in your ${houseName} directs dynamic physical initiative. Jaggery offerings channel energy constructively.`,
        });
        break;

      case 'Mercury':
        remedies.push({
          id: `lalkitab-mercury-${house}`,
          planet: 'Budha (Mercury)',
          house,
          houseName,
          category: 'Intellect & Communication',
          title: `Moong Dal & Green Fodder Blessing (${houseName})`,
          instructions: 'Soak green whole moong dal overnight and feed green grass or fodder to cows on Wednesday mornings.',
          duration: '9 consecutive Wednesdays',
          precautions: 'Do not keep broken glassware or defective electronics inside your study or office.',
          astrologicalRationale: `Mercury in your ${houseName} governs analytical speech and commercial intellect. Feeding green plants enhances logical clarity.`,
        });
        break;

      case 'Jupiter':
        remedies.push({
          id: `lalkitab-jupiter-${house}`,
          planet: 'Guru (Jupiter)',
          house,
          houseName,
          category: 'Wisdom & Divine Grace',
          title: `Saffron Tilak & Elder Reverence (${houseName})`,
          instructions: 'Apply a subtle mark of yellow saffron (Kesar) or turmeric on your forehead and navel every Thursday morning after bathing.',
          duration: 'Ongoing lifestyle practice',
          precautions: 'Never show disrespect to teachers, gurus, or paternal grandparents.',
          astrologicalRationale: `Guru in your ${houseName} is the karaka of higher knowledge, ethics, and wealth. Saffron invokes Jupiterian expansion.`,
        });
        break;

      case 'Venus':
        remedies.push({
          id: `lalkitab-venus-${house}`,
          planet: 'Shukra (Venus)',
          house,
          houseName,
          category: 'Beauty, Harmony & Prosperity',
          title: `Curd & White Camphor Offering (${houseName})`,
          instructions: 'Donate pure white cow ghee, natural camphor, or unsweetened curd at a place of worship or to cows on Friday.',
          duration: '6 consecutive Fridays',
          precautions: 'Keep your living space fragrant and clean; avoid unwashed or torn clothing.',
          astrologicalRationale: `Venus in your ${houseName} oversees romantic fulfillment and refined aesthetics. White offerings balance sensory indulgence.`,
        });
        break;

      case 'Saturn':
        remedies.push({
          id: `lalkitab-saturn-${house}`,
          planet: 'Shani (Saturn)',
          house,
          houseName,
          category: 'Karmic Balance & Justice',
          title: `Mustard Oil Chhaya Daan (${houseName})`,
          instructions: 'Pour pure mustard oil into an iron or clay bowl, look at your clear facial reflection in the oil, and donate it to a street worker or temple on Saturday morning.',
          duration: '8 consecutive Saturdays',
          precautions: 'Do not bring donated oil back inside the kitchen. Treat manual laborers with absolute dignity.',
          astrologicalRationale: `Saturn stationed in your ${houseName} tests patient discipline and justice. The shadow reflection absorbs difficult karmic dross.`,
        });
        break;

      case 'Rahu':
        remedies.push({
          id: `lalkitab-rahu-${house}`,
          planet: 'Rahu (North Node)',
          house,
          houseName,
          category: 'Illusions & Karmic Unraveling',
          title: `Coconut Water Immersion (Jal Pravah) (${houseName})`,
          instructions: 'Gently float a dried whole brown coconut (with husk) into flowing clean river or canal water on a Saturday afternoon.',
          duration: '4 alternate Saturdays',
          precautions: 'Keep kitchen and electronic storage uncluttered. Avoid dining on beds.',
          astrologicalRationale: `Rahu in your ${houseName} introduces sudden worldly desires and unconventional ambitions. Flowing water dissolves mental fog.`,
        });
        break;

      case 'Ketu':
        remedies.push({
          id: `lalkitab-ketu-${house}`,
          planet: 'Ketu (South Node)',
          house,
          houseName,
          category: 'Moksha & Detached Mastery',
          title: `Two-Colored Blanket & Dog Care (${houseName})`,
          instructions: 'Feed black-and-white stray dogs with sesame bread, or donate a coarse two-colored blanket to an elderly ascetic.',
          duration: '7 consecutive days or Tuesdays',
          precautions: 'Avoid kicking or harassing stray dogs, who are the sacred vehicle of Bhairava.',
          astrologicalRationale: `Ketu in your ${houseName} awakens metaphysical perception and liberation. Supporting stray dogs transmutes spiritual anxieties.`,
        });
        break;

      default:
        break;
    }
  });

  return remedies.length > 0 ? remedies : getFoundationalLalKitabRemedies();
};

export const getFoundationalLalKitabRemedies = (): DynamicLalKitabRemedy[] => {
  return [
    {
      id: 'lalkitab-foundational-sun',
      planet: 'Surya (Sun)',
      house: 1,
      houseName: 'Universal Solar Harmonization',
      category: 'Vitality & Prana',
      title: 'Dawn Copper Offering (Surya Arghya)',
      instructions: 'Offer fresh water with whole grains of rice in a copper pot facing East within 1 hour of sunrise.',
      duration: '43 consecutive days',
      precautions: 'Do not step over the runoff water; let it sink into living soil.',
      astrologicalRationale: 'Foundational Lal Kitab measure to balance the solar core of any birth chart.',
    },
    {
      id: 'lalkitab-foundational-moon',
      planet: 'Chandra (Moon)',
      house: 4,
      houseName: 'Universal Lunar Harmonization',
      category: 'Mental Peace & Harmony',
      title: 'Blessing from Mother & Silver Square',
      instructions: 'Touch the feet of mother or maternal elders on Monday mornings and keep a small piece of pure silver in your pocket.',
      duration: 'Ongoing lifestyle measure',
      precautions: 'Do not gift away the sanctified silver piece once received.',
      astrologicalRationale: 'Preserves the psychological equilibrium governed by the Moon in Vedic thought.',
    },
    {
      id: 'lalkitab-foundational-mars',
      planet: 'Mangala (Mars)',
      house: 7,
      houseName: 'Universal Martial Harmonization',
      category: 'Relationship Synergy',
      title: 'Sweet Bread Offering to Nature',
      instructions: 'Bake sweet rotis made with wheat flour and jaggery on an inverted tawa and offer them to stray animals.',
      duration: '7 Tuesdays',
      precautions: 'Do not consume sweet rotis yourself during the cycle.',
      astrologicalRationale: 'Channels raw martial heat into protective benevolence.',
    },
    {
      id: 'lalkitab-foundational-saturn',
      planet: 'Shani (Saturn)',
      house: 10,
      houseName: 'Universal Saturn Harmonization',
      category: 'Karma & Justice',
      title: 'Mustard Oil Shadow Offering (Chhaya Daan)',
      instructions: 'Look at your clear reflection in mustard oil on Saturday morning and donate it to a street worker or temple.',
      duration: '8 Saturdays',
      precautions: 'Do not bring the donated oil back into your home kitchen.',
      astrologicalRationale: 'Neutralizes karmic friction and invites Saturnian endurance.',
    },
  ];
};

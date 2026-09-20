/**
 * FutureRemedyEngine.ts
 * DeepAstro Future Intelligence 8.0 - Master Remedy & Pooja / Upaya Engine
 *
 * Sourced in classical Jyotish literature:
 * - Brihat Parashara Hora Shastra (Shanti & Upaya Adhyaya)
 * - Phaladeepika (Mantreswara)
 * - Lal Kitab (Benevolent Karmic Corrections)
 *
 * STRICT SAFETY PROTOCOL:
 * - Zero claims of supernatural certainty or guaranteed outcome.
 * - No dangerous fasting or replacing medical treatments.
 * - Gemstone caution protocol: "Consult a qualified Jyotish practitioner before using gemstones."
 * - All remedies derived dynamically from active Mahadasha/Antardasha and chart factors.
 */

import { FutureRemedy, PoojaUpayaItem } from './CosmicFutureTypes.js';

export class FutureRemedyEngine {
  /**
   * Generates chart-linked remedies derived from active Dasha, Lagna, and planetary dignities.
   */
  public static generateRemedies(activeDasha: string, kundli?: any): FutureRemedy[] {
    const dashaLord = activeDasha || kundli?.dashas?.currentMahadasha?.planet || 'Jupiter';
    const lagna = kundli?.ascendant?.details?.signName || 'Aries';
    const lagnaLord = kundli?.ascendant?.lord || 'Mars';

    const remedies: FutureRemedy[] = [];

    // 1. Dasha-Lord Specific Remedy
    const dashaRemedies = this.getDashaLordRemedies(dashaLord);
    remedies.push(...dashaRemedies);

    // 2. Lagna Vitality / Protective Remedy
    remedies.push({
      id: 'rem_lagna_vitality',
      type: 'LIFESTYLE',
      category: 'Lifestyle & Routine',
      title: `${lagna} Lagna Constitutional Grounding`,
      description: `Maintain a regular morning routine (Dinacharya) aligned with ${lagnaLord} governance. Begin the day with 15 minutes of quiet outdoor breath alignment.`,
      frequency: 'Daily upon rising',
      traditionalSource: 'Charaka Samhita & Parashara Jyotish (Svasthavritta)',
      safetyNotice: 'Gentle, natural wellness habit; non-invasive and non-coercive.',
      planetTargeted: lagnaLord,
      priority: 'HIGH',
      whyThisRemedy: `Lagna Lord (${lagnaLord}) governs physical resilience, stamina, and foundational vitality for ${lagna} natives.`,
      whatTraditionallyAssociatedWith: 'Enhanced mental clarity, reduced burnout, and biological circadian stability.',
      whenToPerform: 'Morning, within 1 hour of sunrise',
      howOften: 'Daily',
    });

    // 3. Shani / Saturn Balance Remedy (Karmic Discipline)
    remedies.push({
      id: 'rem_shani_service',
      type: 'SERVICE',
      category: 'Karmic Service & Seva',
      title: 'Saturday Community Stewardship & Seva',
      description: 'Support underprivileged individuals, elderly caregivers, or animal rescue organizations through voluntary time or non-monetary aid.',
      frequency: 'Bi-weekly on Saturdays',
      traditionalSource: 'Brihat Parashara Hora Shastra (Dana Karma)',
      safetyNotice: 'Selfless social stewardship cultivates detachment, humility, and reduces stress.',
      planetTargeted: 'Saturn',
      priority: dashaLord === 'Saturn' ? 'HIGH' : 'MEDIUM',
      whyThisRemedy: 'Saturn transit and aspect signify the karmic balance sheet; voluntary humility harmonizes Saturnian delay themes.',
      whatTraditionallyAssociatedWith: 'Patience, endurance in prolonged endeavors, and release of unconscious guilt.',
      whenToPerform: 'Saturday afternoons or evenings',
      howOften: 'Fortnightly',
    });

    // 4. Universal Solar Gayatri / Meditation Remedy
    remedies.push({
      id: 'rem_solar_mantra',
      type: 'MEDITATION',
      category: 'Mindfulness & Meditation',
      title: 'Universal Prana & Solar Reflection',
      description: 'Reflective recitation or peaceful listening to the universal solar Gayatri verses to illuminate higher intellect (Buddhi).',
      frequency: '108 repetitions or 10 minutes quiet reflection',
      traditionalSource: 'Rigveda (3.62.10) & Parashara Hora Shastra',
      safetyNotice: 'Mental contemplation; accessible to all seekers without dogmatic requirement.',
      planetTargeted: 'Sun',
      priority: 'MEDIUM',
      whyThisRemedy: 'The Sun (Surya) is the universal Atmakaraka and represents clarity, vitality, and decision-making fortitude.',
      whatTraditionallyAssociatedWith: 'Inner confidence, willpower, and executive decision-making alignment.',
      whenToPerform: 'Sunday morning or early dawn',
      howOften: 'Weekly or daily',
    });

    // 5. Gemstone Caution & Protocol
    remedies.push({
      id: 'rem_gemstone_protocol',
      type: 'GEMSTONE_CAUTION',
      category: 'Gemstone Guidance',
      title: 'Gemstone Verification & Precaution Protocol',
      description: 'Gemstones are not quick fixes or medical treatments. DeepAstro recommends only considering natural, unheated stones aligned with functional benefic lords after thorough in-person verification with a certified Jyotish specialist.',
      frequency: 'Consultation-based only',
      traditionalSource: 'Garuda Purana (Ratna Pariksha)',
      safetyNotice: 'MANDATORY NOTICE: Consult a qualified Jyotish practitioner and certified gemologist before purchasing or wearing any gemstone. Never replace medical or financial treatments with gemstones.',
      planetTargeted: dashaLord,
      priority: 'OPTIONAL',
      whyThisRemedy: 'Improper gemstone selection for functional dusthana lords can exacerbate tension or inflammatory tendencies.',
      whatTraditionallyAssociatedWith: 'Amplification of specific planetary frequencies when selected properly.',
      whenToPerform: 'Only after expert verification',
      howOften: 'One-time evaluation',
    });

    return remedies;
  }

  /**
   * Generates dedicated Pooja and Upaya guidance mapped to traditional deities and planetary mantras.
   */
  public static generatePoojasAndUpayas(activeDasha: string, kundli?: any): PoojaUpayaItem[] {
    const dashaLord = (activeDasha || kundli?.dashas?.currentMahadasha?.planet || 'Jupiter').toLowerCase();

    const allUpayas: PoojaUpayaItem[] = [
      {
        id: 'upaya_surya',
        planet: 'Sun',
        upayaName: 'Surya Upaya & Arghya',
        deity: 'Lord Shiva & Surya Narayana',
        mantra: 'Om Hram Hrim Hraum Sah Suryaya Namah (108 times)',
        procedure: 'Offer fresh water with a pinch of red sandalwood powder or rose petals to the rising sun in a copper vessel at dawn.',
        bestDayAndTime: 'Sundays during Sunrise (Brahma Muhurta / Surya Hora)',
        frequency: 'Every Sunday',
        priority: dashaLord === 'sun' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Aditya Hridaya Stotram & Valmiki Ramayana',
        safetyNotice: 'Practice outdoor sunlight exposure safely; do not stare directly into intense bright sun.',
      },
      {
        id: 'upaya_chandra',
        planet: 'Moon',
        upayaName: 'Chandra Upaya & Somvar Vrata',
        deity: 'Lord Shiva & Goddess Parvati',
        mantra: 'Om Shram Shrim Shraum Sah Chandraya Namah (108 times)',
        procedure: 'Perform quiet meditation, offer clean water or milk abhisheka to a Shiva Linga, and practice mindful emotional journaling.',
        bestDayAndTime: 'Mondays in the evening under moonlight',
        frequency: 'Every Monday or Full Moon (Purnima)',
        priority: dashaLord === 'moon' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Shiva Purana & Parashara Upaya Khanda',
        safetyNotice: 'Fasting should be gentle and hydration-rich; individuals with medical conditions should not fast.',
      },
      {
        id: 'upaya_mangal',
        planet: 'Mars',
        upayaName: 'Mangal Upaya & Hanuman Sadhana',
        deity: 'Lord Hanuman & Kartikeya',
        mantra: 'Om Kram Krim Kraum Sah Bhaumaya Namah (108 times)',
        procedure: 'Recitation of Hanuman Chalisa or Sundarkand; channeling vital energy into disciplined physical exercise and anger mastery.',
        bestDayAndTime: 'Tuesdays during daytime',
        frequency: 'Every Tuesday',
        priority: dashaLord === 'mars' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Hanuman Bahuk & Parashara Shanti Vidhana',
        safetyNotice: 'Focus on anger regulation, non-violence, and physical safety during rigorous workouts.',
      },
      {
        id: 'upaya_budha',
        planet: 'Mercury',
        upayaName: 'Budha Upaya & Saraswati Puja',
        deity: 'Lord Ganesha & Goddess Saraswati',
        mantra: 'Om Bram Brim Braum Sah Budhaya Namah (108 times)',
        procedure: 'Offer green grass (Durva) or modak to Lord Ganesha; donate educational supplies or books to students in need.',
        bestDayAndTime: 'Wednesdays in the morning',
        frequency: 'Every Wednesday',
        priority: dashaLord === 'mercury' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Ganesha Atharvashirsha & Saraswati Rahasya Upanishad',
        safetyNotice: 'Promotes intellectual humility, analytical clarity, and speech composure.',
      },
      {
        id: 'upaya_guru',
        planet: 'Jupiter',
        upayaName: 'Guru Upaya & Vishnu Sahasranama',
        deity: 'Lord Vishnu & Dakshinamurthy',
        mantra: 'Om Gram Grim Graum Sah Gurave Namah (108 times)',
        procedure: 'Listen to or chant the Vishnu Sahasranama; respect mentors and teachers; contribute yellow grains or pulses to charitable kitchens.',
        bestDayAndTime: 'Thursdays in the morning (Guru Hora)',
        frequency: 'Every Thursday',
        priority: dashaLord === 'jupiter' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Brihat Parashara Hora Shastra (Guru Shanti)',
        safetyNotice: 'Encourages ethical conduct, expansion of wisdom, and financial prudence.',
      },
      {
        id: 'upaya_shukra',
        planet: 'Venus',
        upayaName: 'Shukra Upaya & Mahalakshmi Stuti',
        deity: 'Goddess Mahalakshmi',
        mantra: 'Om Dram Drim Draum Sah Shukraya Namah (108 times)',
        procedure: 'Light a fragrant ghee lamp on Friday evenings; donate white clothing or dairy staples; practice aesthetic tidiness in domestic spaces.',
        bestDayAndTime: 'Fridays at dusk',
        frequency: 'Every Friday',
        priority: dashaLord === 'venus' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Sri Suktam & Rigvedic Parishishta',
        safetyNotice: 'Fosters domestic harmony, relationship gratitude, and artistic expression.',
      },
      {
        id: 'upaya_shani',
        planet: 'Saturn',
        upayaName: 'Shani Upaya & Deepam Offering',
        deity: 'Lord Hanuman & Lord Shani',
        mantra: 'Om Pram Prim Praum Sah Shanaischaraya Namah (108 times)',
        procedure: 'Light a mustard oil or sesame oil lamp near a Peepal tree or Hanuman temple; feed birds or stray animals; practice voluntary patience.',
        bestDayAndTime: 'Saturdays after sunset',
        frequency: 'Every Saturday',
        priority: dashaLord === 'saturn' ? 'HIGH' : 'MEDIUM',
        traditionalBasis: 'Shani Mahatmya & Parashara Shanti Khanda',
        safetyNotice: 'Never engage in fearful superstitions; Saturnian remedies center on integrity, hard work, and compassion.',
      },
      {
        id: 'upaya_rahu',
        planet: 'Rahu',
        upayaName: 'Rahu Upaya & Durga Saptashati',
        deity: 'Goddess Durga & Bhairava',
        mantra: 'Om Bhram Bhrim Bhraum Sah Rahave Namah (108 times)',
        procedure: 'Recitation of Argala Stotram or Durga Chalisa; maintain strict digital hygiene and avoid deceptive habits or intoxicating substances.',
        bestDayAndTime: 'Saturdays or Wednesdays during Rahu Kaal',
        frequency: 'Weekly',
        priority: dashaLord === 'rahu' ? 'HIGH' : 'OPTIONAL',
        traditionalBasis: 'Devi Mahatmya & Parashara Rahu Shanti',
        safetyNotice: 'Promotes psychological clarity, dispelling illusions, anxiety, and obsessive thinking.',
      },
      {
        id: 'upaya_ketu',
        planet: 'Ketu',
        upayaName: 'Ketu Upaya & Ganesha Vandana',
        deity: 'Lord Ganesha & Matsya Avatar',
        mantra: 'Om Stram Strim Straum Sah Ketave Namah (108 times)',
        procedure: 'Feed multi-colored or black-and-white dogs; donate warm blankets to the needy during winter; practice detached Vipassana meditation.',
        bestDayAndTime: 'Tuesdays or Thursdays',
        frequency: 'Weekly',
        priority: dashaLord === 'ketu' ? 'HIGH' : 'OPTIONAL',
        traditionalBasis: 'Ganesha Purana & Parashara Ketu Shanti',
        safetyNotice: 'Encourages spiritual detachment, intuition, and release of compulsive behavioral patterns.',
      },
    ];

    // Sort so HIGH priority items come first
    return allUpayas.sort((a, b) => {
      const pOrder = { HIGH: 0, MEDIUM: 1, OPTIONAL: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
  }

  private static getDashaLordRemedies(dashaLord: string): FutureRemedy[] {
    const lord = dashaLord.toLowerCase();
    if (lord === 'jupiter' || lord === 'guru') {
      return [
        {
          id: 'rem_guru_dasha',
          type: 'MANTRA',
          category: 'Mantra & Wisdom',
          title: 'Brihaspati Mantra Contemplation',
          description: 'Recite "Om Brim Brihaspataye Namah" 108 times on Thursday mornings to deepen discernment, ethical clarity, and scholarly focus.',
          frequency: '108 repetitions every Thursday',
          traditionalSource: 'Brihat Parashara Hora Shastra',
          safetyNotice: 'Vocal mantra practice for meditative tranquility; non-coercive.',
          planetTargeted: 'Jupiter',
          priority: 'HIGH',
          whyThisRemedy: 'Active Jupiter Mahadasha cycle governs wisdom, financial ethics, higher learning, and mentor guidance.',
          whatTraditionallyAssociatedWith: 'Intellectual expansiveness, ethical discernment, and protection of dharma.',
          whenToPerform: 'Thursday mornings',
          howOften: 'Weekly',
        },
      ];
    }

    if (lord === 'saturn' || lord === 'shani') {
      return [
        {
          id: 'rem_shani_dasha',
          type: 'DISCIPLINE',
          category: 'Karmic Discipline',
          title: 'Saturnian Daily Work Ethic & Patience Protocol',
          description: 'Cultivate meticulous focus on long-term goals. Avoid shortcut temptations and practice compassionate patience in institutional delays.',
          frequency: 'Daily mindful practice',
          traditionalSource: 'Phaladeepika (Mantreswara)',
          safetyNotice: 'Behavioral discipline; cultivates emotional endurance.',
          planetTargeted: 'Saturn',
          priority: 'HIGH',
          whyThisRemedy: 'Active Saturn cycle tests perseverance, structural integrity, and accountability.',
          whatTraditionallyAssociatedWith: 'Enduring reputation, stability of assets, and inner grit.',
          whenToPerform: 'Throughout the working week',
          howOften: 'Daily',
        },
      ];
    }

    if (lord === 'venus' || lord === 'shukra') {
      return [
        {
          id: 'rem_shukra_dasha',
          type: 'MANTRA',
          category: 'Harmony & Relationships',
          title: 'Shukra Harmony & Creative Contemplation',
          description: 'Chant "Om Shum Shukraya Namah" on Friday mornings; cultivate creative expression, mutual appreciation, and gracious interpersonal manners.',
          frequency: '108 repetitions on Fridays',
          traditionalSource: 'Brihat Parashara Hora Shastra',
          safetyNotice: 'Cultivates artistic expression and relationship reciprocity.',
          planetTargeted: 'Venus',
          priority: 'HIGH',
          whyThisRemedy: 'Venus governs aesthetic appreciation, relationship fulfillment, and material refinement.',
          whatTraditionallyAssociatedWith: 'Emotional balance, relationship clarity, and creative inspiration.',
          whenToPerform: 'Friday mornings',
          howOften: 'Weekly',
        },
      ];
    }

    // Default benefic dasha remedy
    return [
      {
        id: `rem_${lord}_balance`,
        type: 'MANTRA',
        category: 'Planetary Harmonization',
        title: `${dashaLord} Harmonic Resonance`,
        description: `Dedicated quiet meditation cultivating the positive qualitative virtues of ${dashaLord}.`,
        frequency: 'Daily 10 minutes quiet contemplation',
        traditionalSource: 'Classical Vedic Astrological Tradition',
        safetyNotice: 'Gentle mental centering; accessible to all.',
        planetTargeted: dashaLord,
        priority: 'HIGH',
        whyThisRemedy: `Governs the active foundational phase of life under the Vimshottari cycle.`,
        whatTraditionallyAssociatedWith: 'Clear perception of seasonal life priorities.',
        whenToPerform: 'Morning dawn',
        howOften: 'Daily',
      },
    ];
  }
}

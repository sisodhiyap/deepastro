/**
 * Versioned Traditional Planet -> Sector Mapping Registry
 * Grounded in classical Medini Jyotisha and Mundane Market Astrology traditions.
 *
 * CRITICAL PRODUCT PRINCIPLE:
 * These are TRADITIONAL ASTROLOGICAL ASSOCIATIONS.
 * They must NEVER be presented as established financial facts or causal trading rules.
 */

export interface SectorAssociation {
  sector: string;
  niftySectorIndex: string;
  traditionalKeywords: string[];
  associatedGrahas: string[];
  confidenceScore: number; // 0.0 - 1.0 (Traditional textual agreement score)
  historicalTradition: string;
  rationale: string;
}

export interface SectorMappingVersionMetadata {
  sectorMappingVersion: string;
  lastUpdated: string;
  traditionSources: string[];
  disclaimer: string;
}

export const SECTOR_MAPPING_METADATA: SectorMappingVersionMetadata = {
  sectorMappingVersion: '1.0.0-medini-standard',
  lastUpdated: '2026-09-12',
  traditionSources: [
    'Brihat Samhita of Varahamihira (Adhyaya on Artha & Dhatu)',
    'Prasna Marga (Medini & Commercial Significations)',
    'Traditional Indian Vyapar Jyotish texts'
  ],
  disclaimer: 'Sector and commodity associations represent traditional astrological symbology for historical research. They are NOT empirical financial predictions or trading recommendations.'
};

export const PLANET_TO_SECTORS: Record<string, SectorAssociation[]> = {
  Sun: [
    {
      sector: 'Energy & Power Generation',
      niftySectorIndex: 'NIFTY ENERGY',
      traditionalKeywords: ['Solar', 'Thermal', 'Core Vital Energy', 'State Power Utilities'],
      associatedGrahas: ['Sun', 'Mars'],
      confidenceScore: 0.95,
      historicalTradition: 'Brihat Samhita: Sun rules Prana, fire, supreme authority, and primal energy generation.',
      rationale: 'Associated with sovereign utilities, electrical grids, solar power installations, and executive state monopolies.'
    },
    {
      sector: 'Sovereign Debt & Defense Leadership',
      niftySectorIndex: 'NIFTY DEFENCE',
      traditionalKeywords: ['Crown Corporations', 'Defense Command', 'Gold Bullion Sovereign Reserves'],
      associatedGrahas: ['Sun', 'Jupiter'],
      confidenceScore: 0.90,
      historicalTradition: 'Raja Graha rulership over state treasury and national security forces.',
      rationale: 'Tied to government policy announcements, national budgets, and apex leadership decisions.'
    }
  ],
  Moon: [
    {
      sector: 'FMCG & Consumer Staples',
      niftySectorIndex: 'NIFTY FMCG',
      traditionalKeywords: ['Dairy', 'Packaged Foods', 'Beverages', 'Daily Consumables', 'Public Sentiment'],
      associatedGrahas: ['Moon', 'Venus'],
      confidenceScore: 0.92,
      historicalTradition: 'Moon rules Jala Tatva (liquids), sustenance, motherly nurturing, and collective retail sentiment.',
      rationale: 'Coincides with consumer sentiment indices, agricultural food processing, and fast-moving retail staples.'
    },
    {
      sector: 'Hospitality & Water Utilities',
      niftySectorIndex: 'NIFTY CONSUMPTION',
      traditionalKeywords: ['Shipping', 'Beverages', 'Dairy Products', 'Public Wellness'],
      associatedGrahas: ['Moon'],
      confidenceScore: 0.85,
      historicalTradition: 'Ruler of tides, fluid logistics, and mass emotional psychology.',
      rationale: 'Tied to liquid transport, water purification, and consumer discretionary mood.'
    }
  ],
  Mars: [
    {
      sector: 'Defense & Aerospace Manufacturing',
      niftySectorIndex: 'NIFTY DEFENCE',
      traditionalKeywords: ['Ammunition', 'Tactical Vehicles', 'Heavy Machinery', 'Weaponry', 'Security'],
      associatedGrahas: ['Mars', 'Sun'],
      confidenceScore: 0.96,
      historicalTradition: 'Mangala is the Senapati (Commander-in-Chief); rules arms, iron, thermal combustion, and combat.',
      rationale: 'Coincides with defense contracts, ordnance manufacturing, tactical aerospace, and physical weaponry.'
    },
    {
      sector: 'Metals, Mining & High Volatility Engineering',
      niftySectorIndex: 'NIFTY METAL',
      traditionalKeywords: ['Steel', 'Copper', 'Smelting', 'Foundry', 'Heavy Engineering'],
      associatedGrahas: ['Mars', 'Saturn'],
      confidenceScore: 0.91,
      historicalTradition: 'Rules Dhatu (molten metals, copper, red metals) and engineering furnaces.',
      rationale: 'Reflected in base metal commodities, smelting furnaces, and cyclical infrastructure engineering.'
    }
  ],
  Mercury: [
    {
      sector: 'Information Technology & Software Services',
      niftySectorIndex: 'NIFTY IT',
      traditionalKeywords: ['SaaS', 'Cloud Computing', 'AI Algorithms', 'Networking', 'Coding'],
      associatedGrahas: ['Mercury', 'Rahu'],
      confidenceScore: 0.97,
      historicalTradition: 'Budha is the intellect (Buddhi), ruler of mathematics, calculation, and trade communications.',
      rationale: 'Directly linked to algorithmic systems, software engineering, telecom switching, and digital infrastructure.'
    },
    {
      sector: 'Communications, Media & FinTech Trading',
      niftySectorIndex: 'NIFTY MEDIA',
      traditionalKeywords: ['Stock Broking', 'Digital Payments', 'Data Centers', 'Telecommunications'],
      associatedGrahas: ['Mercury'],
      confidenceScore: 0.93,
      historicalTradition: 'Ruler of commerce (Vanijya), bookkeeping, rapid transaction exchanges, and arbitrage.',
      rationale: 'Correlates with retail broking volumes, payment gateways, and data networks.'
    }
  ],
  Jupiter: [
    {
      sector: 'Banking & Financial Institutions',
      niftySectorIndex: 'NIFTY BANK',
      traditionalKeywords: ['Commercial Banks', 'Credit Reserves', 'Central Bank Monetary Reserves', 'Wealth Management'],
      associatedGrahas: ['Jupiter', 'Mercury'],
      confidenceScore: 0.98,
      historicalTradition: 'Guru (Brihaspati) is the supreme Dhana Karaka (significator of wealth, banks, gold, and trust).',
      rationale: 'Central significator for banking capital adequacy, credit liquidity, trust assets, and monetary expansion.'
    },
    {
      sector: 'Non-Banking Financial Companies (NBFC) & Asset Management',
      niftySectorIndex: 'NIFTY FINANCIAL SERVICES',
      traditionalKeywords: ['Mutual Funds', 'Insurance Solvency', 'Wealth Advisory', 'Higher Education'],
      associatedGrahas: ['Jupiter'],
      confidenceScore: 0.94,
      historicalTradition: 'Rules ethical expansion, fiduciary responsibility, insurance underwriting, and scholarship.',
      rationale: 'Tied to long-term mutual fund inflows, sovereign pension allocations, and institutional asset growth.'
    }
  ],
  Venus: [
    {
      sector: 'Automobile & Mobility',
      niftySectorIndex: 'NIFTY AUTO',
      traditionalKeywords: ['Passenger Vehicles', 'Luxury Sedans', 'Electric Vehicles', 'Design Aesthetics'],
      associatedGrahas: ['Venus', 'Mars'],
      confidenceScore: 0.89,
      historicalTradition: 'Shukra is the Karaka of Vahana (vehicles), luxury conveyances, speed, and design beauty.',
      rationale: 'Associated with passenger car demand, aesthetic interior design, and electric luxury mobility.'
    },
    {
      sector: 'Luxury, Media, Entertainment & Textiles',
      niftySectorIndex: 'NIFTY CONSUMER DURABLES',
      traditionalKeywords: ['Fashion', 'Jewelry', 'Cinemas', 'Hospitality Suites', 'Fine Chemicals'],
      associatedGrahas: ['Venus'],
      confidenceScore: 0.92,
      historicalTradition: 'Rules Bhoga (sensual enjoyment, fine fabrics, silk, cinema, perfumes, and jewels).',
      rationale: 'Coincides with discretionary luxury retail, gems and jewelry demand, and entertainment streaming.'
    }
  ],
  Saturn: [
    {
      sector: 'Infrastructure, Construction & Cement',
      niftySectorIndex: 'NIFTY INFRA',
      traditionalKeywords: ['Highways', 'Bridges', 'Cement Plants', 'Real Estate Foundation', 'Logistics'],
      associatedGrahas: ['Saturn', 'Mars'],
      confidenceScore: 0.95,
      historicalTradition: 'Shani rules Bhumi (subterranean earth), stone, labor force, delayed foundation, and enduring masonry.',
      rationale: 'Correlates with national highway corridors, cement kilns, port dredging, and industrial civil contracts.'
    },
    {
      sector: 'Heavy Industry, Coal, Mining & Oil Exploration',
      niftySectorIndex: 'NIFTY OIL & GAS',
      traditionalKeywords: ['Crude Oil Extraction', 'Coal Mining', 'Industrial Refineries', 'Bulk Freight'],
      associatedGrahas: ['Saturn', 'Rahu'],
      confidenceScore: 0.93,
      historicalTradition: 'Rules underground hydrocarbons, black minerals (Krishna Dhatu), coal, iron ore, and heavy labor.',
      rationale: 'Tied to upstream oil extraction, coal freight tonnage, and metallurgical coke supply.'
    }
  ],
  Rahu: [
    {
      sector: 'Speculative Tech, Crypto & Disruptive Innovation',
      niftySectorIndex: 'NIFTY IT',
      traditionalKeywords: ['Decentralized Networks', 'Quantum Computing', 'Speculative Growth Tech', 'BioTech'],
      associatedGrahas: ['Rahu', 'Mercury'],
      confidenceScore: 0.88,
      historicalTradition: 'Rahu rules foreign unorthodoxy, sudden viral expansion, illusions (Maya), and radical disruption.',
      rationale: 'Associated with early-stage venture capital, crypto volatility, generative AI models, and unproven paradigms.'
    }
  ],
  Ketu: [
    {
      sector: 'Pharmaceuticals, Vaccines & Specialized R&D',
      niftySectorIndex: 'NIFTY PHARMA',
      traditionalKeywords: ['Active Pharmaceutical Ingredients (API)', 'Microbiology', 'Isolates', 'Surgical Devices'],
      associatedGrahas: ['Ketu', 'Sun'],
      confidenceScore: 0.91,
      historicalTradition: 'Ketu rules subtle organisms (Krimi), poisons, antidotes, surgical cutting, and esoteric research.',
      rationale: 'Reflected in vaccine discovery, generic drug formulations, biotechnology synthesis, and diagnostic testing.'
    }
  ]
};

export class SectorMappingRegistry {
  public static getSectorsForPlanet(planet: string): SectorAssociation[] {
    return PLANET_TO_SECTORS[planet] || [];
  }

  public static getPlanetsForSector(sectorQuery: string): Array<{ planet: string; association: SectorAssociation }> {
    const q = sectorQuery.toLowerCase();
    const results: Array<{ planet: string; association: SectorAssociation }> = [];

    for (const [planet, associations] of Object.entries(PLANET_TO_SECTORS)) {
      for (const assoc of associations) {
        if (
          assoc.sector.toLowerCase().includes(q) ||
          assoc.niftySectorIndex.toLowerCase().includes(q) ||
          assoc.traditionalKeywords.some(k => k.toLowerCase().includes(q))
        ) {
          results.push({ planet, association: assoc });
        }
      }
    }
    return results;
  }

  public static getAllSectorMappings(): { metadata: SectorMappingVersionMetadata; mappings: Record<string, SectorAssociation[]> } {
    return {
      metadata: SECTOR_MAPPING_METADATA,
      mappings: PLANET_TO_SECTORS
    };
  }
}

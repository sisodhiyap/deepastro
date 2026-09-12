/**
 * KP Event Rules Registry — RULESET_KP_EVENTS_V1
 * Canonical configuration of life-event cusps, primary supporting houses,
 * and challenging/detrimental houses across all major life domains.
 */

export type LifeEventDomain =
  | 'MARRIAGE'
  | 'CAREER'
  | 'CHILDREN'
  | 'EDUCATION'
  | 'PROPERTY'
  | 'FOREIGN_TRAVEL'
  | 'FINANCE'
  | 'HEALTH';

export interface EventRuleDefinition {
  domain: LifeEventDomain;
  title: string;
  primaryCusp: number;
  secondaryCusps?: number[];
  supportingHouses: number[];
  challengingHouses: number[];
  neutralHouses: number[];
  description: string;
  traditionalRationale: string;
}

export const EVENT_RULES_REGISTRY: Record<LifeEventDomain, EventRuleDefinition> = {
  MARRIAGE: {
    domain: 'MARRIAGE',
    title: 'Marriage & Committed Union',
    primaryCusp: 7,
    secondaryCusps: [2, 11],
    supportingHouses: [2, 7, 11],
    challengingHouses: [1, 6, 10, 12],
    neutralHouses: [3, 4, 5, 8, 9],
    description: 'H7 represents partner, H2 additions to family, H11 fulfillment of desires.',
    traditionalRationale: 'H1 is 12th from 2, H6 is 12th from 7, H10 is 12th from 11 (separation/negation).',
  },
  CAREER: {
    domain: 'CAREER',
    title: 'Career & Professional Status',
    primaryCusp: 10,
    secondaryCusps: [2, 6, 11],
    supportingHouses: [2, 6, 10, 11],
    challengingHouses: [5, 8, 12],
    neutralHouses: [1, 3, 4, 7, 9],
    description: 'H10 profession/status, H6 service/employment, H2 earnings, H11 gains.',
    traditionalRationale: 'H5 is 12th from 6 (change/loss of service), H8 obstacles, H12 departure.',
  },
  CHILDREN: {
    domain: 'CHILDREN',
    title: 'Children & Progeny',
    primaryCusp: 5,
    secondaryCusps: [2, 11],
    supportingHouses: [2, 5, 11],
    challengingHouses: [1, 4, 10],
    neutralHouses: [3, 6, 7, 8, 9, 12],
    description: 'H5 conception/progeny, H2 family expansion, H11 fulfillment of wish.',
    traditionalRationale: 'H4 is 12th from 5, H10 is 12th from 11, H1 is 12th from 2.',
  },
  EDUCATION: {
    domain: 'EDUCATION',
    title: 'Academic & Intellectual Growth',
    primaryCusp: 4,
    secondaryCusps: [9, 11],
    supportingHouses: [2, 4, 5, 9, 11],
    challengingHouses: [3, 6, 8],
    neutralHouses: [1, 7, 10, 12],
    description: 'H4 foundational learning, H9 higher research, H11 successful completion.',
    traditionalRationale: 'H3 is 12th from 4, H8 mental stress/impediment.',
  },
  PROPERTY: {
    domain: 'PROPERTY',
    title: 'Property & Real Estate Acquisition',
    primaryCusp: 4,
    secondaryCusps: [11, 12],
    supportingHouses: [2, 4, 11, 12],
    challengingHouses: [3, 5, 8],
    neutralHouses: [1, 6, 7, 9, 10],
    description: 'H4 fixed assets/land, H11 acquisition/gains, H12 capital investment, H2 funds.',
    traditionalRationale: 'H3 is 12th from 4 (parting with land/sale).',
  },
  FOREIGN_TRAVEL: {
    domain: 'FOREIGN_TRAVEL',
    title: 'Foreign Travel & Long-Distance Relocation',
    primaryCusp: 9,
    secondaryCusps: [12, 3],
    supportingHouses: [3, 9, 12],
    challengingHouses: [2, 4, 11],
    neutralHouses: [1, 5, 6, 7, 8, 10],
    description: 'H3 short journey/leaving residence, H9 distant pilgrimage/voyage, H12 foreign settlement.',
    traditionalRationale: 'H4 anchors one in the homeland; H2 family binds native locally.',
  },
  FINANCE: {
    domain: 'FINANCE',
    title: 'Wealth Accumulation & Financial Prosperity',
    primaryCusp: 2,
    secondaryCusps: [6, 10, 11],
    supportingHouses: [2, 6, 10, 11],
    challengingHouses: [5, 8, 12],
    neutralHouses: [1, 3, 4, 7, 9],
    description: 'H2 wealth and bank balance, H6 recovery of dues, H11 windfalls and overall gains.',
    traditionalRationale: 'H12 expenses and drain of wealth; H5 speculation risk; H8 sudden loss.',
  },
  HEALTH: {
    domain: 'HEALTH',
    title: 'Vitality & Health Recovery',
    primaryCusp: 1,
    secondaryCusps: [5, 11],
    supportingHouses: [1, 5, 11],
    challengingHouses: [6, 8, 12],
    neutralHouses: [2, 3, 4, 7, 9, 10],
    description: 'H1 constitution/vitality, H5 cure/recuperation, H11 victory over disease.',
    traditionalRationale: 'H6 acute illness, H8 chronic distress/surgery, H12 hospitalization.',
  },
};

export class EventRulesRegistry {
  public static getRule(domain: LifeEventDomain): EventRuleDefinition {
    const rule = EVENT_RULES_REGISTRY[domain];
    if (!rule) {
      throw new Error(`KP_EVENT_RULE_NOT_FOUND: Unknown life event domain ${domain}`);
    }
    return { ...rule };
  }

  public static listAllDomains(): LifeEventDomain[] {
    return Object.keys(EVENT_RULES_REGISTRY) as LifeEventDomain[];
  }
}

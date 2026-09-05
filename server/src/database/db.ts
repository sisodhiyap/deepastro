/**
 * DeepAstro Database Layer
 * Provides relational persistence, typed model queries, and strict
 * server-side authorization filters.
 */

import { SEED_ASTROLOGERS, SEED_PLANS, SEED_KNOWLEDGE } from './seed.js';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'CLIENT' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface ProfileRecord {
  userId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  languagePreference: string;
  themePreference: 'dark' | 'light';
  chartStylePreference: 'north' | 'south' | 'east';
  notificationPreferences: Record<string, boolean>;
}

export interface BirthProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender: 'Male' | 'Female' | 'Other';
  isApproximateTime: boolean;
  ascendantSign: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  nakshatraPada: number;
  currentMahadasha: string;
  currentAntardasha: string;
  createdAt: string;
}

export interface AstrologerRecord {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  pricePerMinuteCents: number;
  consultationTypes: string[];
  specialties: string[];
  phoneProtected: string;     // NEVER returned to unentitled users
  whatsappProtected: string;  // NEVER returned to unentitled users
  emailProtected: string;     // NEVER returned to unentitled users
  isVerified: boolean;
  isAvailable: boolean;
}

export interface SanitizedAstrologerRecord {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  pricePerMinuteCents: number;
  consultationTypes: string[];
  specialties: string[];
  isVerified: boolean;
  isAvailable: boolean;
  hasDirectContactAccess: boolean;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: 'FREE' | 'PREMIUM' | 'PRO';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface AIUsageRecord {
  id: string;
  userId?: string;
  feature: string;
  provider: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama';
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostCents: number;
  latencyMs: number;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  message: string;
  createdAt: string;
}

export interface SavedChartRecord {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender?: string;
  createdAt: string;
}

export interface UploadedFileRecord {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ConsultationRecord {
  id: string;
  userId: string;
  astrologerId: string;
  astrologerName: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  consultationType: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  meetingStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// In-Memory Database Store initialized with Seed Data
class DatabaseStore {
  public users: Map<string, UserRecord> = new Map();
  public profiles: Map<string, ProfileRecord> = new Map();
  public birthProfiles: Map<string, BirthProfileRecord> = new Map();
  public subscriptions: Map<string, SubscriptionRecord> = new Map();
  public entitlements: Map<string, Set<string>> = new Map(); // userId -> Set of feature keys
  public astrologers: Map<string, AstrologerRecord> = new Map();
  public savedCharts: Map<string, SavedChartRecord> = new Map();
  public uploadedFiles: Map<string, UploadedFileRecord> = new Map();
  public consultations: Map<string, ConsultationRecord> = new Map();
  public aiUsageLogs: AIUsageRecord[] = [];
  public notifications: NotificationRecord[] = [];
  public contactMessages: ContactMessageRecord[] = [];
  public featureFlags: Record<string, boolean> = {
    kundli: true,
    matching: true,
    palmistry: true,
    numerology: true,
    astrobot: true,
    astrologers: true,
    lalkitab: true,
    reports: true,
    payments: true,
  };

  constructor() {
    this.initSeed();
  }

  private initSeed() {
    // Seed Astrologers
    for (const a of SEED_ASTROLOGERS) {
      this.astrologers.set(a.id, a);
    }
  }

  public getUserByEmail(email: string): UserRecord | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public getUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public getProfile(userId: string): ProfileRecord | undefined {
    return this.profiles.get(userId);
  }

  public getBirthProfile(userId: string): BirthProfileRecord | undefined {
    return Array.from(this.birthProfiles.values()).find((b) => b.userId === userId);
  }

  public getSubscription(userId: string): SubscriptionRecord {
    const sub = this.subscriptions.get(userId);
    if (sub) return sub;
    // Default to FREE plan
    const defaultSub: SubscriptionRecord = {
      id: `sub_${userId}`,
      userId,
      planId: 'FREE',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.subscriptions.set(userId, defaultSub);
    return defaultSub;
  }

  public grantEntitlement(userId: string, featureKey: string) {
    if (!this.entitlements.has(userId)) {
      this.entitlements.set(userId, new Set());
    }
    this.entitlements.get(userId)!.add(featureKey);
  }

  public hasEntitlement(userId: string, featureKey: string): boolean {
    const user = this.users.get(userId);
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return true;
    }
    const sub = this.getSubscription(userId);
    if (sub.planId === 'PRO') return true;
    if (sub.planId === 'PREMIUM') {
      const premiumFeatures = [
        'view_protected_astrologer_contact',
        'full_kundli',
        'matching',
        'palmistry',
        'numerology',
        'reports',
        'astrobot',
      ];
      if (premiumFeatures.includes(featureKey)) return true;
    }
    const userSet = this.entitlements.get(userId);
    return userSet ? userSet.has(featureKey) : false;
  }

  /**
   * CRITICAL SECURITY METHOD
   * Sanitizes astrologer records based on whether the caller has the
   * 'view_protected_astrologer_contact' entitlement.
   */
  public getAstrologers(userId?: string): SanitizedAstrologerRecord[] {
    const canAccessContact = userId ? this.hasEntitlement(userId, 'view_protected_astrologer_contact') : false;

    return Array.from(this.astrologers.values()).map((astro) => {
      const sanitized: SanitizedAstrologerRecord = {
        id: astro.id,
        name: astro.name,
        avatarUrl: astro.avatarUrl,
        bio: astro.bio,
        experienceYears: astro.experienceYears,
        languages: astro.languages,
        rating: astro.rating,
        reviewCount: astro.reviewCount,
        pricePerMinuteCents: astro.pricePerMinuteCents,
        consultationTypes: astro.consultationTypes,
        specialties: astro.specialties,
        isVerified: astro.isVerified,
        isAvailable: astro.isAvailable,
        hasDirectContactAccess: canAccessContact,
      };

      // ONLY include contact info if strictly entitled
      if (canAccessContact) {
        sanitized.phone = astro.phoneProtected;
        sanitized.whatsapp = astro.whatsappProtected;
        sanitized.email = astro.emailProtected;
      }

      return sanitized;
    });
  }

  public getAstrologerById(id: string, userId?: string): SanitizedAstrologerRecord | undefined {
    const astro = this.astrologers.get(id);
    if (!astro) return undefined;

    const canAccessContact = userId ? this.hasEntitlement(userId, 'view_protected_astrologer_contact') : false;

    const sanitized: SanitizedAstrologerRecord = {
      id: astro.id,
      name: astro.name,
      avatarUrl: astro.avatarUrl,
      bio: astro.bio,
      experienceYears: astro.experienceYears,
      languages: astro.languages,
      rating: astro.rating,
      reviewCount: astro.reviewCount,
      pricePerMinuteCents: astro.pricePerMinuteCents,
      consultationTypes: astro.consultationTypes,
      specialties: astro.specialties,
      isVerified: astro.isVerified,
      isAvailable: astro.isAvailable,
      hasDirectContactAccess: canAccessContact,
    };

    if (canAccessContact) {
      sanitized.phone = astro.phoneProtected;
      sanitized.whatsapp = astro.whatsappProtected;
      sanitized.email = astro.emailProtected;
    }

    return sanitized;
  }

  public exportUserData(userId: string) {
    const user = this.users.get(userId);
    const profile = this.profiles.get(userId);
    const birthProfile = this.getBirthProfile(userId);
    const charts = Array.from(this.savedCharts.values()).filter((c) => c.userId === userId);
    const uploads = Array.from(this.uploadedFiles.values()).filter((u) => u.userId === userId);
    const consultations = Array.from(this.consultations.values()).filter((c) => c.userId === userId);
    const aiLogs = this.aiUsageLogs.filter((log) => log.userId === userId);

    return {
      user: user ? { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt } : null,
      profile: profile || null,
      birthProfile: birthProfile || null,
      savedCharts: charts,
      uploadedFiles: uploads,
      consultations,
      aiLogs,
      exportedAt: new Date().toISOString(),
    };
  }

  public deleteUserData(userId: string) {
    let deletedCharts = 0;
    let deletedUploads = 0;

    for (const [key, val] of this.birthProfiles.entries()) {
      if (val.userId === userId) this.birthProfiles.delete(key);
    }
    for (const [key, val] of this.savedCharts.entries()) {
      if (val.userId === userId) {
        this.savedCharts.delete(key);
        deletedCharts++;
      }
    }
    for (const [key, val] of this.uploadedFiles.entries()) {
      if (val.userId === userId) {
        this.uploadedFiles.delete(key);
        deletedUploads++;
      }
    }
    for (const [key, val] of this.consultations.entries()) {
      if (val.userId === userId) this.consultations.delete(key);
    }
    this.profiles.delete(userId);
    this.aiUsageLogs = this.aiUsageLogs.filter((log) => log.userId !== userId);

    return {
      success: true,
      deletedCharts,
      deletedUploads,
      deletedAt: new Date().toISOString(),
    };
  }

  public deleteSavedChart(chartId: string, userId: string): boolean {
    const chart = this.savedCharts.get(chartId);
    if (chart && chart.userId === userId) {
      this.savedCharts.delete(chartId);
      return true;
    }
    return false;
  }

  public deleteUploadedFile(fileId: string, userId: string): boolean {
    const file = this.uploadedFiles.get(fileId);
    if (file && file.userId === userId) {
      this.uploadedFiles.delete(fileId);
      return true;
    }
    return false;
  }
}

export const db = new DatabaseStore();

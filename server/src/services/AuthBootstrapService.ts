import { pool } from '../database/postgres.js';
import { db, UserRecord, ProfileRecord } from '../database/db.js';
import { userRepository } from '../database/repositories/UserRepository.js';

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
  gender?: string;
  isApproximateTime?: boolean;
}

/**
 * Server-authoritative service for bootstrapping, syncing, and recovering
 * user profiles and birth profiles directly with PostgreSQL / Supabase.
 */
export class AuthBootstrapService {
  /**
   * Ensure user exists in users table and profile exists in profiles table.
   * Never injects synthetic identities ("Aarav Sharma").
   */
  public static async ensureUserProfile(params: {
    authUserId: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role?: 'CLIENT' | 'ASTROLOGER' | 'ADMIN';
  }): Promise<{ user: UserRecord; profile: ProfileRecord; isNew: boolean }> {
    const { authUserId, email, fullName, avatarUrl, role = 'CLIENT' } = params;
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (fullName || cleanEmail.split('@')[0] || '').trim();

    // 1. Check if user exists in database repository or in-memory db
    const existingUser = (await userRepository.getUserById(authUserId)) || (await userRepository.getUserByEmail(cleanEmail));
    let isNew = false;
    let finalUser: UserRecord;

    if (!existingUser) {
      isNew = true;
      finalUser = {
        id: authUserId,
        email: cleanEmail,
        passwordHash: 'SUPABASE_EXTERNAL_AUTH',
        role,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      try {
        await userRepository.createUser(finalUser);
      } catch (err) {
        console.warn('[AuthBootstrap] userRepository.createUser warning:', err);
      }
      db.users.set(authUserId, finalUser);
    } else {
      finalUser = existingUser;
    }

    // 2. Ensure user in PostgreSQL `users` table
    try {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()`,
        [finalUser.id, cleanEmail, finalUser.passwordHash, finalUser.role]
      );
    } catch (err) {
      console.warn('[AuthBootstrap] PostgreSQL users table insert warning:', err);
    }

    // 3. Ensure profile in PostgreSQL `profiles` table
    let profile: ProfileRecord | null = db.getProfile(finalUser.id) || null;
    let resolvedName = cleanName || profile?.fullName || '';

    try {
      const pgRes = await pool.query(
        `SELECT user_id, full_name, avatar_url, phone, city, country, language_preference, theme_preference, chart_style_preference, notification_preferences
         FROM profiles WHERE user_id = $1`,
        [finalUser.id]
      );

      if (pgRes.rows.length > 0) {
        const row = pgRes.rows[0];
        if (!resolvedName && row.full_name) {
          resolvedName = row.full_name;
        }
        profile = {
          userId: finalUser.id,
          fullName: resolvedName || row.full_name || '',
          avatarUrl: row.avatar_url || avatarUrl || '',
          phone: row.phone,
          city: row.city,
          country: row.country,
          languagePreference: row.language_preference || 'en',
          themePreference: (row.theme_preference as any) || 'dark',
          chartStylePreference: (row.chart_style_preference as any) || 'north',
          notificationPreferences: row.notification_preferences || { daily_prediction: true, transits: true, consultations: true },
        };
      } else {
        await pool.query(
          `INSERT INTO profiles (user_id, full_name, avatar_url, theme_preference, chart_style_preference, notification_preferences, created_at)
           VALUES ($1, $2, $3, 'dark', 'north', '{"daily_prediction": true, "transits": true, "consultations": true}'::jsonb, NOW())
           ON CONFLICT (user_id) DO UPDATE SET full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END`,
          [finalUser.id, resolvedName, avatarUrl || '']
        );
        profile = {
          userId: finalUser.id,
          fullName: resolvedName,
          avatarUrl: avatarUrl || '',
          languagePreference: 'en',
          themePreference: 'dark',
          chartStylePreference: 'north',
          notificationPreferences: { daily_prediction: true, transits: true, consultations: true },
        };
      }
    } catch (err) {
      console.warn('[AuthBootstrap] PostgreSQL profiles table query/insert warning:', err);
    }

    if (!profile) {
      profile = {
        userId: finalUser.id,
        fullName: resolvedName,
        avatarUrl: avatarUrl || '',
        languagePreference: 'en',
        themePreference: 'dark',
        chartStylePreference: 'north',
        notificationPreferences: { daily_prediction: true, transits: true, consultations: true },
      };
    }

    db.profiles.set(finalUser.id, profile);
    db.getSubscription(finalUser.id);

    return { user: finalUser, profile, isNew };
  }

  /**
   * Get user profile by authenticated user id from PostgreSQL
   */
  public static async getProfile(userId: string): Promise<ProfileRecord | null> {
    try {
      const res = await pool.query(
        `SELECT user_id, full_name, avatar_url, phone, city, country, language_preference, theme_preference, chart_style_preference, notification_preferences
         FROM profiles WHERE user_id = $1`,
        [userId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const profile: ProfileRecord = {
          userId: row.user_id,
          fullName: row.full_name || '',
          avatarUrl: row.avatar_url || '',
          phone: row.phone,
          city: row.city,
          country: row.country,
          languagePreference: row.language_preference || 'en',
          themePreference: (row.theme_preference as any) || 'dark',
          chartStylePreference: (row.chart_style_preference as any) || 'north',
          notificationPreferences: row.notification_preferences || { daily_prediction: true, transits: true, consultations: true },
        };
        db.profiles.set(userId, profile);
        return profile;
      }
    } catch (err) {
      console.warn('[AuthBootstrap] Error loading profile from pg:', err);
    }

    return db.getProfile(userId) || null;
  }

  /**
   * Update profile in PostgreSQL and memory
   */
  public static async updateProfile(userId: string, updates: Partial<ProfileRecord>): Promise<ProfileRecord> {
    let current = await this.getProfile(userId);
    if (!current) {
      current = {
        userId,
        fullName: updates.fullName || '',
        languagePreference: 'en',
        themePreference: 'dark',
        chartStylePreference: 'north',
        notificationPreferences: { daily_prediction: true, transits: true, consultations: true },
      };
    }

    const updated: ProfileRecord = {
      ...current,
      ...updates,
      themePreference: (updates.themePreference as any) || current.themePreference,
      chartStylePreference: (updates.chartStylePreference as any) || current.chartStylePreference,
    };

    try {
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, avatar_url, phone, city, country, language_preference, theme_preference, chart_style_preference, notification_preferences, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
           avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
           phone = COALESCE(EXCLUDED.phone, profiles.phone),
           city = COALESCE(EXCLUDED.city, profiles.city),
           country = COALESCE(EXCLUDED.country, profiles.country),
           language_preference = COALESCE(EXCLUDED.language_preference, profiles.language_preference),
           theme_preference = COALESCE(EXCLUDED.theme_preference, profiles.theme_preference),
           chart_style_preference = COALESCE(EXCLUDED.chart_style_preference, profiles.chart_style_preference),
           notification_preferences = COALESCE(EXCLUDED.notification_preferences, profiles.notification_preferences)`,
        [
          userId,
          updated.fullName,
          updated.avatarUrl || null,
          updated.phone || null,
          updated.city || null,
          updated.country || null,
          updated.languagePreference,
          updated.themePreference,
          updated.chartStylePreference,
          JSON.stringify(updated.notificationPreferences || {}),
        ]
      );
    } catch (err) {
      console.warn('[AuthBootstrap] Error persisting profile update to pg:', err);
    }

    db.profiles.set(userId, updated);
    return updated;
  }

  /**
   * Persist user's birth profile directly to PostgreSQL birth_profiles table
   */
  public static async saveBirthProfile(userId: string, data: Partial<BirthProfileRecord>): Promise<BirthProfileRecord> {
    const id = data.id || `bp_${userId}_${Date.now()}`;
    const cleanTime = (data.birthTime || '').slice(0, 5);
    const record: BirthProfileRecord = {
      id,
      userId,
      fullName: data.fullName || '',
      birthDate: data.birthDate || '',
      birthTime: cleanTime,
      birthPlace: data.birthPlace || '',
      latitude: Number(data.latitude) || 0,
      longitude: Number(data.longitude) || 0,
      timezone: Number(data.timezone) || 5.5,
      gender: data.gender || 'unspecified',
      isApproximateTime: Boolean(data.isApproximateTime),
    };

    try {
      await pool.query(
        `INSERT INTO birth_profiles (id, user_id, full_name, birth_date, birth_time, birth_place, latitude, longitude, timezone, gender, is_approximate_time, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           birth_date = EXCLUDED.birth_date,
           birth_time = EXCLUDED.birth_time,
           birth_place = EXCLUDED.birth_place,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           timezone = EXCLUDED.timezone,
           gender = EXCLUDED.gender,
           is_approximate_time = EXCLUDED.is_approximate_time`,
        [id, record.userId, record.fullName, record.birthDate, record.birthTime, record.birthPlace, record.latitude, record.longitude, record.timezone, record.gender, record.isApproximateTime]
      );
    } catch (err) {
      console.warn('[AuthBootstrap] PostgreSQL birth_profiles table insert warning:', err);
    }

    db.birthProfiles.set(id, {
      ...record,
      birthDate: record.birthDate,
      birthTime: record.birthTime,
      birthPlace: record.birthPlace,
    } as any);

    return record;
  }

  /**
   * Retrieve birth profile by user id from PostgreSQL birth_profiles table
   */
  public static async getBirthProfile(userId: string): Promise<BirthProfileRecord | null> {
    try {
      const res = await pool.query(
        `SELECT * FROM birth_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const rawTime = row.birth_time || '';
        return {
          id: row.id,
          userId: row.user_id,
          fullName: row.full_name,
          birthDate: row.birth_date ? new Date(row.birth_date).toISOString().split('T')[0] : '',
          birthTime: typeof rawTime === 'string' && rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime,
          birthPlace: row.birth_place || '',
          latitude: Number(row.latitude) || 0,
          longitude: Number(row.longitude) || 0,
          timezone: Number(row.timezone) || 5.5,
          gender: row.gender,
          isApproximateTime: Boolean(row.is_approximate_time),
        };
      }
    } catch (err) {
      console.warn('[AuthBootstrap] Error loading birth_profile from pg:', err);
    }

    const mem = db.getBirthProfile(userId);
    if (mem) {
      const rawTime = mem.birthTime || '';
      return {
        id: mem.id || `bp_${userId}`,
        userId: mem.userId,
        fullName: mem.fullName,
        birthDate: mem.birthDate,
        birthTime: typeof rawTime === 'string' && rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime,
        birthPlace: mem.birthPlace,
        latitude: mem.latitude,
        longitude: mem.longitude,
        timezone: mem.timezone,
      };
    }
    return null;
  }
}

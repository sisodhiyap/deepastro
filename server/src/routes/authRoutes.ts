/**
 * Authentication Routes
 * Register, Login, Session Check, and Profile Updates.
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRecord, ProfileRecord } from '../database/db.js';
import { userRepository } from '../database/repositories/UserRepository.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Please provide email, password, and full name.' });
    }

    const existing = (await userRepository.getUserByEmail(email)) || db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this cosmic email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: UserRecord = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : role === 'ASTROLOGER' ? 'ASTROLOGER' : 'CLIENT',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    await userRepository.createUser(newUser);

    const newProfile: ProfileRecord = {
      userId,
      fullName: fullName.trim(),
      languagePreference: 'en',
      themePreference: 'dark',
      chartStylePreference: 'north',
      notificationPreferences: { daily_prediction: true, transits: true, consultations: true },
    };

    db.users.set(userId, newUser);
    db.profiles.set(userId, newProfile);

    // Default FREE subscription
    db.getSubscription(userId);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Cosmic profile registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: newProfile.fullName,
        themePreference: newProfile.themePreference,
        chartStylePreference: newProfile.chartStylePreference,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to complete registration.', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = (await userRepository.getUserByEmail(email)) || db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid cosmic credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid cosmic credentials.' });
    }

    const profile = db.getProfile(user.id);
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Cosmic welcome back.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: profile?.fullName || 'Cosmic Seeker',
        themePreference: profile?.themePreference || 'dark',
        chartStylePreference: profile?.chartStylePreference || 'north',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process login.', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = (await userRepository.getUserById(userId)) || db.getUserById(userId);
  const profile = db.getProfile(userId);
  const birthProfile = (await birthProfileRepository.getProfileByUserId(userId)) || db.getBirthProfile(userId);
  const sub = db.getSubscription(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: profile?.fullName || 'Cosmic Seeker',
      phone: profile?.phone,
      city: profile?.city,
      country: profile?.country,
      themePreference: profile?.themePreference || 'dark',
      chartStylePreference: profile?.chartStylePreference || 'north',
      notificationPreferences: profile?.notificationPreferences,
    },
    birthProfile: birthProfile || null,
    subscription: sub,
    entitlements: Array.from(db.entitlements.get(userId) || []),
  });
});

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const profile = db.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const { fullName, phone, city, country, themePreference, chartStylePreference, notificationPreferences } = req.body;

  if (fullName !== undefined) profile.fullName = fullName;
  if (phone !== undefined) profile.phone = phone;
  if (city !== undefined) profile.city = city;
  if (country !== undefined) profile.country = country;
  if (themePreference !== undefined) profile.themePreference = themePreference;
  if (chartStylePreference !== undefined) profile.chartStylePreference = chartStylePreference;
  if (notificationPreferences !== undefined) profile.notificationPreferences = notificationPreferences;

  return res.json({
    message: 'Profile updated successfully.',
    profile,
  });
});

export default router;

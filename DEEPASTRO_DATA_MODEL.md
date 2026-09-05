# DEEPASTRO 2.0 — DATA MODEL & ENTITY SPECIFICATION
**Product: DeepAstro — "Decode Your Life. Discover Your Cosmos."**
**Designed & Created by Prashant Sisodhiya | © 2026 DeepAstro. All Rights Reserved.**

---

## 1. Core Relational Entities

### `UserRecord`
Represents an authenticated platform identity.
* `id: string` (UUID / prefixed `usr_`)
* `email: string` (Unique, lowercased)
* `passwordHash: string` (Argon2 / bcrypt hash)
* `role: 'USER' | 'ASTROLOGER' | 'ADMIN' | 'SUPER_ADMIN'`
* `isVerified: boolean`
* `createdAt: string` (ISO 8601 UTC)

### `BirthProfileRecord`
Stores birth credentials linked to an account.
* `id: string` (Prefixed `bp_`)
* `userId: string` (Foreign key $\rightarrow$ `UserRecord.id`)
* `fullName: string`
* `birthDate: string` (`YYYY-MM-DD`)
* `birthTime: string` (`HH:mm:ss`)
* `birthPlace: string`
* `latitude: number`
* `longitude: number`
* `timezone: number` (e.g. +5.5 for IST)
* `gender: 'Male' | 'Female' | 'Other'`
* `isApproximateTime: boolean`
* `ascendantSign: string`
* `moonSign: string`
* `sunSign: string`
* `nakshatra: string`
* `nakshatraPada: number`
* `currentMahadasha: string`
* `currentAntardasha: string`
* `createdAt: string`

### `SavedChartRecord`
Stores additional family, partner, or historical birth charts.
* `id: string`
* `userId: string`
* `name: string`
* `birthDate: string`
* `birthTime: string`
* `birthPlace: string`
* `latitude: number`
* `longitude: number`
* `timezone: number`
* `createdAt: string`

### `SubscriptionRecord`
Centralized billing and tier status.
* `id: string`
* `userId: string`
* `planId: 'FREE' | 'PREMIUM' | 'PRO'`
* `status: 'active' | 'past_due' | 'canceled'`
* `currentPeriodStart: string`
* `currentPeriodEnd: string`

### `AstrologerRecord` (Server Internal) vs `SanitizedAstrologerRecord` (Public)
* `phoneProtected: string` $\rightarrow$ Sanitized/masked unless entitled
* `whatsappProtected: string` $\rightarrow$ Sanitized/masked unless entitled
* `emailProtected: string` $\rightarrow$ Sanitized/masked unless entitled
* `hasDirectContactAccess: boolean` (Dynamically calculated per requesting user)

### `AIUsageRecord`
AI compute telemetry and cost accounting.
* `id: string`
* `userId?: string`
* `feature: string`
* `provider: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama'`
* `model: string`
* `promptTokens: number`
* `completionTokens: number`
* `totalTokens: number`
* `estimatedCostCents: number` ($0 for Ollama local compute)
* `latencyMs: number`
* `createdAt: string`

---

## 2. Canonical Ephemeral Entities

### `AstrologyFactSet`
The immutable calculation dossier produced by `VedicAstroEngine.createAstrologyFactSet()`. It contains complete mathematical coordinates for Lagna, 9 Navagrahas, 12 Bhavas, Shodashvargas (D1..D60), Vimshottari Dasha periods, Gochara transits, Sade Sati phases, and Panchang limbs.

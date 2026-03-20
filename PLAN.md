# PRM — Personal Resource Manager
## Application Plan

---

## Context

PRM is a cross-platform mobile app (iOS + Android) that lets users manage two core domains of their life in one place:

1. **Contacts + their context** — people and organisations, enriched with relationship notes, tags, and interaction history beyond what a standard address book offers.
2. **Services** — accounts, insurance policies, and subscriptions, including document upload with AI-powered data extraction.

**Guiding principle**: The user owns their data. No central database — data lives in the user's own cloud (Google Drive / iCloud) with a local SQLite cache for offline access. No backend server is required.

---

## Architecture: Client-First, No Backend

```
┌────────────────────────────────────────────────────────┐
│                  React Native + Expo App               │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Contacts │  │ Services │  │  Document Scanner    │ │
│  └──────────┘  └──────────┘  └──────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Local SQLite (expo-sqlite + Drizzle)     │ │
│  └──────────────────┬─────────────────┬────────────┘ │
│                     │                 │               │
│          ┌──────────▼──────┐ ┌────────▼──────────┐   │
│          │  Google Drive   │ │  iCloud CloudKit  │   │
│          │  (App Data)     │ │  (Apple users)    │   │
│          └─────────────────┘ └───────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  AI Client (Claude / OpenAI / Gemini)            │ │
│  │  API key stored in Keychain/Keystore              │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**No proxy server. No Firebase. No central DB.**

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React Native + Expo SDK 52+ | Managed workflow, Expo SDK covers camera/files/auth |
| Navigation | Expo Router v4 (file-based) | Deep linking, typed routes, tab + stack layouts |
| Local DB | expo-sqlite + Drizzle ORM | Type-safe SQL schema, migrations built-in |
| Secure Storage | expo-secure-store | Keychain (iOS) / Keystore (Android) for API keys |
| State | Zustand | Lightweight, no boilerplate |
| Server State | TanStack Query | Caching, loading states for cloud sync ops |
| Google Auth + Drive | @react-native-google-signin/google-signin + Drive REST API | OAuth2 token → Drive App Data API |
| Apple Auth | expo-apple-authentication | Sign in with Apple, identity token |
| iCloud Sync | expo-file-system + iCloud config plugin (Phase 2) | Requires EAS Build / bare workflow |
| Contacts Import | expo-contacts | Read device address book |
| Document Picker | expo-document-picker | PDF, images from Files |
| Camera | expo-image-picker | Capture document photos |
| Notifications | expo-notifications | Local scheduling for renewal reminders |
| AI Client | fetch (to Claude / OpenAI / Gemini) | User's own key, configurable provider |
| Forms | react-hook-form + zod | Validation with schema inference |
| UI | React Native Paper | Material Design 3, good iOS/Android parity |
| Dates | date-fns | Lightweight, tree-shakable |

---

## Data Model (SQLite via Drizzle)

### contacts
```
id              TEXT PRIMARY KEY  (uuid)
name            TEXT NOT NULL
email           TEXT
phone           TEXT
company         TEXT
role            TEXT
relationship    TEXT              (family | friend | professional | vendor)
notes           TEXT
tags            TEXT              (JSON string array)
source          TEXT              (manual | device | google | apple)
avatarUri       TEXT
createdAt       INTEGER           (unix ms)
updatedAt       INTEGER
```

### contact_interactions
```
id              TEXT PRIMARY KEY
contactId       TEXT              FK → contacts
type            TEXT              (call | email | meeting | note)
date            INTEGER
notes           TEXT
createdAt       INTEGER
```

### services
```
id              TEXT PRIMARY KEY
name            TEXT NOT NULL
category        TEXT NOT NULL     (account | insurance | subscription)
provider        TEXT
accountNumber   TEXT
website         TEXT
startDate       INTEGER
renewalDate     INTEGER
expiryDate      INTEGER
cost            REAL
costCurrency    TEXT              (default 'USD')
costFrequency   TEXT              (monthly | annual | one-time)
status          TEXT              (active | inactive | cancelled | pending)
contactId       TEXT              FK → contacts (optional: linked contact/agent)
notes           TEXT
tags            TEXT              (JSON string array)
reminderDays    INTEGER           (days before renewal to notify, default 7)
createdAt       INTEGER
updatedAt       INTEGER
```

### documents
```
id              TEXT PRIMARY KEY
serviceId       TEXT              FK → services (nullable — unattached)
name            TEXT
localPath       TEXT              (expo-file-system URI)
cloudUrl        TEXT              (Drive / iCloud URL after sync)
mimeType        TEXT
extractedData   TEXT              (JSON — raw AI extraction result)
extractionStatus TEXT             (pending | done | failed)
createdAt       INTEGER
updatedAt       INTEGER
```

### settings (key-value)
```
key             TEXT PRIMARY KEY
value           TEXT
```

---

## Project Structure

```
prm/
├── app/                            # Expo Router file-based routes
│   ├── (auth)/
│   │   └── login.tsx               # Google + Apple sign-in screen
│   ├── (tabs)/
│   │   ├── contacts/
│   │   │   ├── index.tsx           # Contact list + search
│   │   │   ├── [id].tsx            # Contact detail + context + history
│   │   │   ├── new.tsx             # Create contact form
│   │   │   └── import.tsx          # Import from device contacts
│   │   ├── services/
│   │   │   ├── index.tsx           # Service list grouped by category
│   │   │   ├── [id].tsx            # Service detail + documents
│   │   │   ├── new.tsx             # Create service form
│   │   │   └── scan.tsx            # Document scan → AI extract → pre-fill form
│   │   ├── settings/
│   │   │   ├── index.tsx           # Settings home
│   │   │   ├── ai.tsx              # AI provider + API key + model
│   │   │   ├── account.tsx         # Google / Apple account + sync status
│   │   │   └── notifications.tsx   # Reminder defaults
│   │   └── _layout.tsx             # Tab bar (Contacts | Services | Settings)
│   └── _layout.tsx                 # Root layout + auth gate
│
├── components/
│   ├── contacts/
│   │   ├── ContactCard.tsx
│   │   ├── ContactForm.tsx
│   │   ├── ContextSection.tsx      # Notes + tags + relationship
│   │   └── InteractionLogList.tsx
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   ├── ServiceForm.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── DocumentAttachment.tsx
│   │   └── RenewalBadge.tsx        # Days until renewal indicator
│   └── shared/
│       ├── SearchBar.tsx
│       ├── TagInput.tsx
│       ├── DatePickerField.tsx
│       ├── SectionHeader.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle table definitions
│   │   ├── migrations/             # Auto-generated migration files
│   │   └── index.ts                # DB singleton
│   ├── ai/
│   │   ├── client.ts               # Unified AI caller (Claude / OpenAI / Gemini)
│   │   ├── prompts.ts              # System + user prompts for extraction
│   │   └── types.ts                # ExtractionResult schema (zod)
│   ├── sync/
│   │   ├── googleDrive.ts          # Drive App Data read/write
│   │   ├── icloud.ts               # iCloud sync (Phase 2 stub)
│   │   └── syncManager.ts          # Orchestrate sync on app foreground
│   ├── auth/
│   │   ├── google.ts               # Google Sign-In + OAuth token management
│   │   └── apple.ts                # Apple Sign-In
│   ├── storage/
│   │   ├── secureStorage.ts        # API keys via expo-secure-store
│   │   └── fileStorage.ts          # Document file copy + cloud upload
│   └── notifications/
│       └── scheduler.ts            # Schedule / cancel renewal reminders
│
├── hooks/
│   ├── useContacts.ts              # CRUD + search against local DB
│   ├── useServices.ts
│   ├── useSync.ts                  # Trigger + observe sync state
│   ├── useAI.ts                    # Call AI client with settings from store
│   └── useNotifications.ts
│
├── stores/
│   ├── authStore.ts                # Signed-in user, provider, OAuth token
│   ├── settingsStore.ts            # AI provider, model, reminder defaults
│   └── syncStore.ts                # Last sync time, sync status
│
└── constants/
    ├── serviceCategories.ts
    ├── currencies.ts
    └── reminderOptions.ts
```

---

## Key Feature Flows

### 1. Authentication
```
App launch
  → no session → (auth)/login.tsx
  → Google: GoogleSignIn.signIn() → get idToken + accessToken
  → Apple: AppleAuthentication.signInAsync() → get identityToken
  → Store tokens in Zustand (authStore) + accessToken in expo-secure-store
  → Navigate to (tabs)/
```

### 2. AI Document Extraction
```
Services/scan.tsx
  1. User picks file (expo-document-picker) or takes photo (expo-image-picker)
  2. If PDF: render first page via expo-print → capture as image
  3. Encode image to base64
  4. Read AI config from settingsStore (provider, model)
  5. Read API key from expo-secure-store
  6. Call lib/ai/client.ts → POST to provider's API with:
       - System prompt: "Extract service info, return JSON"
       - Image content block (base64)
  7. Parse response → validate with zod ExtractionResult schema
  8. Navigate to services/new.tsx with pre-filled form values
  9. User reviews / edits → confirm → save to DB
 10. Attach document record to service
```

**AI Client (lib/ai/client.ts)** handles provider switching:
```typescript
// Claude: messages.create with image content block
// OpenAI: chat.completions.create with image_url content
// Gemini: generateContent with inlineData part
// All return → ExtractionResult (zod validated)
```

**Extraction prompt targets these fields:**
`name, provider, category, accountNumber, startDate, renewalDate, expiryDate, cost, costCurrency, costFrequency`

### 3. Google Drive Sync
```
lib/sync/googleDrive.ts
  - Uses accessToken from authStore
  - App Data folder (not visible in user's Drive UI, not counted against quota*)
  - On sync:
    1. GET /appdata/prm-backup.json → compare updatedAt with local DB
    2. If remote newer → merge into local DB
    3. If local newer → export all data → PUT /appdata/prm-backup.json
    4. Documents → upload binary to /appdata/prm-docs/{id}
  - Trigger: app foreground, after each write, manual pull-to-refresh
  - Conflict: last-write-wins (show toast if remote changes merged)

* Drive App Data is free and excluded from user's storage quota
```

### 4. iCloud Sync (Phase 2)
```
Requires:
  - expo prebuild (eject from managed workflow) OR EAS Build with config plugin
  - Add iCloud entitlement + CloudKit container to app.json
  - Use expo-file-system with iCloud container path
  OR
  - Use CloudKit JS / react-native-cloudkit native module

Phase 1 plan: Apple Sign-In works, data is local-only for Apple users.
Phase 2: Add iCloud sync via EAS Build.
```

### 5. Device Contacts Import
```
contacts/import.tsx
  1. Request expo-contacts permission
  2. Load contact list (paginated, searchable)
  3. User selects one or many
  4. Map expo-contacts fields → PRM Contact schema
  5. Insert into local DB with source='device'
  6. Navigate to contact detail to add context (tags, notes, relationship)
```

### 6. Renewal Notifications
```
lib/notifications/scheduler.ts
  - On service create / update with renewalDate or expiryDate:
    1. Cancel any existing notification for this serviceId
    2. If status === 'active' && date is future:
       Schedule local notification at: date - reminderDays
       Title: "⚠️ {name} renews soon"
       Body: "Your {category} renews on {date}"
  - On service cancel / delete: cancel notification
  - expo-notifications handles delivery even when app is backgrounded
```

---

## Repository Structure

Single repo — no separate backend required.

```
prm/
├── PLAN.md
└── mobile/          ← Expo managed workflow app (iOS + Android)
    ├── app/         ← Expo Router file-based routes
    ├── components/
    ├── lib/         ← db, auth, ai, sync, storage, notifications
    ├── stores/      ← Zustand stores
    ├── hooks/       ← TanStack Query hooks
    └── constants/   ← theme, enums, options
```

**Node requirement:** Node 20+ (install via nvm). Expo SDK 55.

---

## Implementation Phases

### Phase 1 — Foundation ✅ COMPLETE
- [x] Init Expo project (`mobile/`) with TypeScript + Expo Router v4
- [x] Configure React Native Paper theme (light + dark, `constants/theme.ts`)
- [x] SQLite schema + Drizzle ORM (`lib/db/schema.ts`, `lib/db/migrations.ts`)
- [x] Auth: Google Sign-In + Apple Sign-In + Zustand session (`stores/authStore.ts`)
- [x] Root layout with auth gate + DB initialisation (`app/_layout.tsx`)
- [x] Tab layout — Contacts | Services | Settings (`app/(tabs)/_layout.tsx`)
- [x] Contacts: list, search, create, edit, delete (`app/(tabs)/contacts/`)
- [x] Contact detail: interaction log, tags, relationship, notes
- [x] Device contacts import (`app/(tabs)/contacts/import.tsx`)
- [x] Secure storage helper (`lib/storage/secureStorage.ts`)
- [x] Stubs for Phase 2–5 modules (notifications, sync, AI, iCloud)

**To run:**
```bash
cd mobile
source ~/.nvm/nvm.sh && nvm use 20
npx expo start
```

**Pre-requisites before running on device:**
- Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `mobile/.env.local`
- Configure Google OAuth in Google Cloud Console with your bundle IDs
- Apple Sign-In requires a real device (not simulator) with a paid Apple Developer account

### Phase 2 — Services + Notifications ✅ COMPLETE
- [x] Services: list by category, create, edit, delete, search (`app/(tabs)/services/`)
- [x] `hooks/useServices.ts` — CRUD against local DB
- [x] Renewal date tracking + status badges (`components/services/RenewalBadge.tsx`)
- [x] Local push notifications (`lib/notifications/scheduler.ts`)
- [x] Contact detail: link services to contacts
- [x] Life phase profile — student/professional/business owner/freelancer/retired (`settings/profile.tsx`)
- [x] Per-phase profile fields — course/batch, role/industry, domain/experience, etc.
- [x] Per-phase relationship types — Batchmate, Senior, Colleague, Mentor, Customer, etc.
- [x] `knownFrom` + `institutionName` + `relationshipType` on contacts
- [x] Profile persisted to SQLite settings table (`lib/db/userProfile.ts`)
- [ ] Import contacts from Google Contacts (People API using existing OAuth token)
- [ ] Import contacts from other services (iCloud Contacts, LinkedIn — extensible importer pattern)

### Phase 3 — AI Document Extraction
- [x] Settings: AI provider picker + API key entry (`app/(tabs)/settings/ai.tsx`)
- [ ] Document picker + camera capture (`app/(tabs)/services/scan.tsx`)
- [ ] AI client — Claude / OpenAI / Gemini (`lib/ai/client.ts`)
- [ ] Extraction → pre-fill service form flow
- [ ] Document attachment to services (`lib/storage/fileStorage.ts`)

### Phase 4 — Cloud Sync
- [ ] Google Drive App Data sync (`lib/sync/googleDrive.ts` — implement stub)
- [ ] Device contacts import — already scaffolded, wire real sync
- [ ] Sync status UI + manual trigger (`app/(tabs)/settings/account.tsx`)
- [ ] iCloud sync stub note in UI for Apple users

### Phase 5 — Polish + iCloud
- [ ] iCloud sync via EAS Build + config plugin (`lib/sync/icloud.ts` — implement stub)
- [ ] Full-text search across contacts + services
- [ ] Bulk operations (delete, tag, categorise)
- [ ] Export to CSV / JSON
- [ ] Onboarding flow

---

## Open Questions / Decisions Deferred

| Question | Default / Deferral |
|---|---|
| iCloud sync in Phase 1? | Local-only for Apple users in Phase 1; iCloud in Phase 5 |
| Multi-account support (multiple Google accounts)? | Single account per app install in Phase 1 |
| Sharing contacts/services with other PRM users? | Out of scope for now |
| Web app companion? | Out of scope; data model is compatible if added later |
| Document storage limit on Drive App Data? | Drive App Data is free, no user quota impact |

---

## Key Packages (package.json additions)

```json
"expo": "~52.0.0",
"expo-router": "~4.0.0",
"expo-sqlite": "~14.0.0",
"expo-secure-store": "~13.0.0",
"expo-document-picker": "~12.0.0",
"expo-image-picker": "~16.0.0",
"expo-file-system": "~17.0.0",
"expo-contacts": "~13.0.0",
"expo-notifications": "~0.28.0",
"expo-apple-authentication": "~7.0.0",
"@react-native-google-signin/google-signin": "^12.0.0",
"drizzle-orm": "^0.38.0",
"drizzle-kit": "^0.29.0",
"zustand": "^5.0.0",
"@tanstack/react-query": "^5.0.0",
"react-native-paper": "^5.0.0",
"react-hook-form": "^7.0.0",
"zod": "^3.24.0",
"date-fns": "^3.6.0"
```

---

## Verification Checklist (per phase)

- **Phase 1**: Sign in with Google → contacts list loads → create/edit/delete contact → sign out → data persists locally after sign-in
- **Phase 2**: Create service with renewal date → notification scheduled → receive reminder notification
- **Phase 3**: Pick PDF → AI extracts fields → pre-filled form appears → confirm → service created with document attached
- **Phase 4**: Create contact on device A → sync to Drive → sign in on device B → contact appears
- **Phase 5**: Apple user data syncs to iCloud → accessible on another Apple device

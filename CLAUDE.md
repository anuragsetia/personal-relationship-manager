# PRM — Claude Code Instructions

## What this project is
Personal Resource Manager — a privacy-first cross-platform mobile app (iOS + Android).
Two domains: **Contacts** (people + relationship context + interaction history) and **Services** (accounts, insurance, subscriptions with document upload + AI extraction).

**Core constraint**: No backend server. No Firebase. No central DB. User data lives in their own Google Drive App Data or iCloud, with a local SQLite cache. This is non-negotiable.

- **Full plan + feature flows**: `/home/anurag/workspaces/prm/PLAN.md`
- **Session memory**: `/home/anurag/.claude/projects/-home-anurag-workspaces-prm/memory/MEMORY.md`

---

## Environment

| | |
|---|---|
| Node | 20 via nvm — **always** `source ~/.nvm/nvm.sh && nvm use 20` before npm/npx |
| Package manager | npm |
| npm installs | Always use `--legacy-peer-deps` inside `mobile/` |
| Expo SDK | 55 (managed workflow — no native `ios/` or `android/` folders) |
| TypeScript check | `npx tsc --noEmit` — run after every change |

---

## Repo structure

Single repo, one app — no separate backend.

```
prm/
├── PLAN.md
├── CLAUDE.md         ← this file
└── mobile/           ← all app code lives here
    ├── app/          ← Expo Router file-based routes
    ├── components/
    ├── lib/          ← db · auth · ai · sync · storage · notifications
    ├── stores/       ← Zustand
    ├── hooks/        ← TanStack Query CRUD hooks
    └── constants/    ← theme · enums · options
```

---

## Tech stack (locked — do not swap)

| Layer | Library |
|---|---|
| Navigation | Expo Router v4 (file-based, typed routes) |
| Local DB | expo-sqlite + Drizzle ORM |
| Secure storage | expo-secure-store (Keychain / Keystore) |
| Global state | Zustand |
| Server/async state | TanStack Query v5 |
| Auth | @react-native-google-signin/google-signin · expo-apple-authentication |
| Cloud sync | Google Drive App Data REST API (Phase 4) · iCloud via EAS Build (Phase 5) |
| Contacts import | expo-contacts |
| Document pick | expo-document-picker · expo-image-picker |
| Notifications | expo-notifications (local only) |
| AI | Raw fetch to Claude / OpenAI / Gemini — user supplies API key |
| Forms | react-hook-form + zod + @hookform/resolvers |
| UI | React Native Paper (MD3) |
| Dates | date-fns |
| IDs | expo-crypto `randomUUID()` |

---

## Data model

All timestamps are **unix milliseconds** (integer). Tags columns store a **JSON string array**.

### contacts
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | uuid |
| name | TEXT NOT NULL | |
| email, phone, company, role | TEXT | nullable |
| relationship | TEXT | `family \| friend \| professional \| vendor` |
| notes | TEXT | |
| tags | TEXT | JSON string array e.g. `'["vip","london"]'` |
| source | TEXT | `manual \| device \| google \| apple` |
| avatarUri | TEXT | |
| createdAt, updatedAt | INTEGER | unix ms |

### contact_interactions
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| contactId | TEXT FK | → contacts (CASCADE DELETE) |
| type | TEXT | `call \| email \| meeting \| note` |
| date | INTEGER | unix ms |
| notes | TEXT | |
| createdAt | INTEGER | |

### services
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| name | TEXT NOT NULL | |
| category | TEXT NOT NULL | `account \| insurance \| subscription` |
| provider, accountNumber, website | TEXT | |
| startDate, renewalDate, expiryDate | INTEGER | unix ms, nullable |
| cost | REAL | |
| costCurrency | TEXT | default `'USD'` |
| costFrequency | TEXT | `monthly \| annual \| one-time` |
| status | TEXT | `active \| inactive \| cancelled \| pending` default `active` |
| contactId | TEXT FK | → contacts (SET NULL on delete), optional |
| notes | TEXT | |
| tags | TEXT | JSON string array |
| reminderDays | INTEGER | default 7 |
| createdAt, updatedAt | INTEGER | |

### documents
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| serviceId | TEXT FK | → services (CASCADE DELETE), nullable |
| name, localPath, cloudUrl, mimeType | TEXT | |
| extractedData | TEXT | JSON — raw AI result |
| extractionStatus | TEXT | `pending \| done \| failed` |
| createdAt, updatedAt | INTEGER | |

### settings
Key-value store. Keys used:
- `ai_provider` — `claude | openai | gemini`
- `ai_model` — model string
- `default_reminder_days` — integer as string

---

## Key patterns

### DB initialisation
`lib/db/migrations.ts` runs raw `CREATE TABLE IF NOT EXISTS` SQL via `SQLiteProvider` in `app/_layout.tsx` on every launch. Drizzle is used for queries only (no migration runner). Add new migrations as additional `CREATE TABLE`/`ALTER TABLE` statements in `migrations.ts`.

### Auth flow
1. Login screen (`app/(auth)/login.tsx`) calls `lib/auth/google.ts` or `lib/auth/apple.ts`
2. Result stored in `stores/authStore.ts` (Zustand, in-memory only — no persistence yet)
3. Google `accessToken` saved to Keychain via `lib/storage/secureStorage.ts`
4. Root layout `AuthGate` component redirects based on `authStore.user`

**Session is not persisted across app restarts yet** — user must sign in again. Persistence (via secure store + `restoreGoogleSession`) is a Phase 4 concern.

### TanStack Query cache keys
- Contacts list: `['contacts', searchTerm?]`
- Contact detail: `['contacts', id]`
- Interactions: `['interactions', contactId]`
- Services list (Phase 2): `['services', category?]`

### Zustand stores (in-memory, not persisted to disk)
- `authStore` — `user`, `isLoading`, `setUser`, `signOut`
- `settingsStore` — `aiProvider`, `aiModel`, `defaultReminderDays`
- `syncStore` — `status`, `lastSyncAt`, `errorMessage`

### Path alias
`@/` → `mobile/` root. Configured in `babel.config.js` (module-resolver) and `tsconfig.json` (paths). Always use `@/` imports, never relative `../../`.

### Forms pattern
`react-hook-form` + `zodResolver` + `zod` schema. Export both the form component and `FormValues` type from each form file. Tags field is `string[]` in the form, serialised to JSON string before DB insert.

---

## File map — what exists vs what's a stub

### Built (Phase 1)
```
app/_layout.tsx                    Root: SQLiteProvider + QueryClient + PaperProvider + AuthGate
app/(auth)/login.tsx               Google + Apple sign-in
app/(tabs)/_layout.tsx             Tab bar
app/(tabs)/contacts/_layout.tsx    Stack navigator for contacts
app/(tabs)/contacts/index.tsx      List + search + FAB
app/(tabs)/contacts/new.tsx        Create contact
app/(tabs)/contacts/[id].tsx       Detail + edit + delete + interaction log
app/(tabs)/contacts/import.tsx     Device address book import
app/(tabs)/services/index.tsx      PLACEHOLDER — Phase 2
app/(tabs)/settings/index.tsx      Account info + sign out (Phase 2–4 items stubbed)
lib/db/schema.ts                   Drizzle table definitions + inferred types
lib/db/migrations.ts               Raw SQL migration (runs on launch)
lib/db/index.ts                    Drizzle db singleton
lib/auth/google.ts                 GoogleSignin wrapper + Drive scopes
lib/auth/apple.ts                  AppleAuthentication wrapper
lib/storage/secureStorage.ts       expo-secure-store wrapper + SECURE_KEYS constants
lib/sync/googleDrive.ts            STUB — Phase 4
lib/sync/icloud.ts                 STUB — Phase 5
lib/notifications/scheduler.ts     STUB — Phase 2
stores/authStore.ts
stores/settingsStore.ts
stores/syncStore.ts
hooks/useContacts.ts               Full CRUD: useContacts, useContact, useContactInteractions,
                                   useCreateContact, useUpdateContact, useDeleteContact, useAddInteraction
components/contacts/ContactCard.tsx
components/contacts/ContactForm.tsx    react-hook-form + zod
components/contacts/InteractionLogList.tsx
components/shared/SearchBar.tsx
components/shared/EmptyState.tsx
components/shared/TagInput.tsx
constants/theme.ts                 lightTheme + darkTheme (React Native Paper MD3)
constants/serviceCategories.ts
constants/currencies.ts
constants/reminderOptions.ts
```

### To be created (Phase 2+)
```
app/(tabs)/services/[id].tsx
app/(tabs)/services/new.tsx
app/(tabs)/services/scan.tsx       Document scan → AI extract
app/(tabs)/settings/ai.tsx         AI provider + API key
app/(tabs)/settings/account.tsx    Sync status
app/(tabs)/settings/notifications.tsx
components/services/ServiceCard.tsx
components/services/ServiceForm.tsx
components/services/RenewalBadge.tsx
components/services/CategoryPicker.tsx
components/services/DocumentAttachment.tsx
components/shared/DatePickerField.tsx
hooks/useServices.ts
hooks/useSync.ts
hooks/useAI.ts
hooks/useNotifications.ts
lib/ai/client.ts                   Unified AI caller
lib/ai/prompts.ts
lib/ai/types.ts                    ExtractionResult zod schema
lib/storage/fileStorage.ts         Document copy + cloud upload
```

---

## External API notes

### Google Drive App Data
- Folder: `appDataFolder` — invisible to user in Drive UI, excluded from quota
- Auth scope: `https://www.googleapis.com/auth/drive.appdata`
- Main backup file: `prm-backup.json` — full DB export
- Document files: `prm-docs/{documentId}`
- Conflict strategy: last-write-wins on `updatedAt`

### AI providers (Phase 3)
All called directly from the app using the user's own API key:
- **Claude**: `POST https://api.anthropic.com/v1/messages` — image as base64 content block
- **OpenAI**: `POST https://api.openai.com/v1/chat/completions` — image_url content
- **Gemini**: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` — inlineData part
- All responses validated with zod `ExtractionResult` schema
- Default models: Claude → `claude-opus-4-6`, OpenAI → `gpt-4o`, Gemini → `gemini-2.0-flash`

### iCloud (Phase 5)
Requires `expo prebuild` or EAS Build — cannot be done in managed workflow. Deferred intentionally.

---

## Running the app

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd /home/anurag/workspaces/prm/mobile
npx expo start
```

**Required env var** (`mobile/.env.local`):
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<from Google Cloud Console>
```

**Device requirements:**
- Google Sign-In: works on Android emulator + physical device; needs correct OAuth client + SHA-1
- Apple Sign-In: physical iOS device only; requires paid Apple Developer account

---

## Phase status

| Phase | Status | Summary |
|---|---|---|
| 1 — Foundation | ✅ Complete | Expo init, SQLite/Drizzle, Auth, Contacts CRUD, tab layout |
| 2 — Services + Notifications | ⬜ Next | Services CRUD, renewal badges, local push notifications |
| 3 — AI Extraction | ✅ Complete | AI key settings, doc pick/camera, extract → pre-fill service form |
| 4 — Cloud Sync | ⬜ | Google Drive App Data sync, sync status UI |
| 5 — Polish + iCloud | ⬜ | iCloud via EAS Build, search, bulk ops, export, onboarding |

Update `PLAN.md` checklist and this table when a phase completes.

---

## Hard rules
- No backend server, no Firebase, no central database
- No email/password auth — Google and Apple only
- AI API key is user-supplied, stored in Keychain — never hardcoded
- Never commit `.env.local`, API keys, or OAuth secrets
- iCloud sync requires EAS Build — do not attempt in managed workflow
- Always `--legacy-peer-deps` for npm installs in `mobile/`
- Always run `npx tsc --noEmit` to verify types before considering work done

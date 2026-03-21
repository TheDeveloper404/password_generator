# PassGen — Roadmap: Faza 2 & Faza 3

> **Faza 1 (Implementată):** Seif client-side cu criptare AES-256-GCM, PBKDF2-SHA256, IndexedDB, CRUD, health dashboard, export/import, auto-lock.

---

## Faza 2 — Backend, Autentificare & Sincronizare Cloud

### 2.1 Backend API (Node.js / Express sau Hono + Edge)

| Componentă | Detalii |
|---|---|
| **Framework** | Hono (edge-first) sau Express (clasic). Deploy pe Vercel Serverless / Edge Functions |
| **Bază de date** | PostgreSQL (Supabase / Neon) sau PlanetScale (MySQL) |
| **ORM** | Drizzle ORM sau Prisma |
| **Schema principală** | `users`, `encrypted_vaults`, `devices`, `sessions`, `audit_log` |

#### Endpoint-uri API:

```
POST   /api/auth/register          — Creare cont (email + master password hash)
POST   /api/auth/login             — Login (returnează JWT + refresh token)
POST   /api/auth/refresh           — Refresh access token
POST   /api/auth/logout            — Invalidare sesiune
DELETE /api/auth/account            — Ștergere cont + date

GET    /api/vault                  — Download vault criptat (blob)
PUT    /api/vault                  — Upload vault criptat (blob)
GET    /api/vault/meta             — Metadata (lastModified, version)

GET    /api/devices                — Listare dispozitive conectate
DELETE /api/devices/:id            — Revocă acces dispozitiv

GET    /api/audit                  — Jurnal activitate (login, sync, export)
```

### 2.2 Autentificare & Sesiuni

| Feature | Implementare |
|---|---|
| **Înregistrare** | Email + master password → se trimite doar hash-ul derivat (nu parola raw). Verificare email via link. |
| **Login** | SRP (Secure Remote Password) sau PBKDF2 client-side → server verifică hash |
| **JWT** | Access token (15 min) + Refresh token (30 zile, httpOnly cookie) |
| **Rate limiting** | Express-rate-limit sau Cloudflare WAF. Max 5 login fail / 15 min |
| **2FA TOTP** | Folosind `otpauth` sau `speakeasy`. QR code generat cu `qrcode` npm |
| **Device trust** | Fiecare dispozitiv primește un device ID. User-ul poate revoca remote |

### 2.3 Sincronizare Cloud (Zero-Knowledge)

Arhitectura rămâne **zero-knowledge**: serverul stochează doar blob-ul criptat.

```
┌──────────────┐                    ┌──────────────┐
│   Client A   │                    │   Client B   │
│  (Browser)   │                    │  (Browser)   │
│              │                    │              │
│ Decrypt ←→ Encrypt               │ Decrypt ←→ Encrypt
│      ↕       │                    │      ↕       │
│  Local Vault │                    │  Local Vault │
│  (IndexedDB) │                    │  (IndexedDB) │
└──────┬───────┘                    └──────┬───────┘
       │           ┌──────────┐            │
       └──────────→│  Server  │←───────────┘
                   │          │
                   │ Encrypted│
                   │   Blob   │
                   │ (Postgres│
                   │  or S3)  │
                   └──────────┘
```

#### Strategia de Sync:

1. **Optimistic sync**: La fiecare modificare locală, se re-criptează și se uploadează vault-ul
2. **Conflict resolution**: Version vector simplu. Dacă serverul are o versiune mai nouă:
   - Download + decrypt ambele versiuni
   - Merge automat: union de entries, cel mai recent `updatedAt` câștigă per entry
   - Re-encrypt + upload versiunea merged
3. **Offline-first**: Funcționează complet offline, sync-ul se face la reconectare
4. **Delta sync (opțional, v2.x)**: Trimitere doar de diff-uri criptate pentru eficiență

### 2.4 Securitate Backend

- **Toate datele sensibile criptate client-side** — serverul nu vede niciodată parole
- **TLS everywhere** (HTTPS obligatoriu)
- **CORS strict** — doar domeniul aplicației
- **CSP headers** — Content Security Policy restrictiv
- **Helmet.js** — HTTP security headers
- **Input validation** — Zod pe fiecare endpoint
- **Audit log** — Loghează orice acțiune (login, sync, export, device add/remove)
- **Encryption at rest** — PostgreSQL cu encryption la nivel de disk

### 2.5 UI Nou în Faza 2

- **Login / Register Pages** — Formulare cu animații smooth, similar cu Setup/Unlock
- **Settings Page complet:**
  - Schimbare master password
  - Activare/dezactivare 2FA
  - Gestionare dispozitive
  - Ștergere cont
  - Sync status indicator
- **Sync indicator** — Iconița cloud cu status (synced ✓ / syncing ↻ / offline ⚠)
- **Device manager** — Listare și revocare dispozitive
- **Notification system** — Toast notifications pentru sync, erori, etc.

---

## Faza 3 — Extensie Browser, WebAuthn, Biometrics & TOTP

### 3.1 Extensie Browser (Chrome + Firefox)

| Componentă | Detalii |
|---|---|
| **Manifest** | Manifest V3 (Chrome), cross-browser cu webextension-polyfill |
| **Popup** | React mini-app cu auto-fill, search, generator rapid |
| **Content Script** | Detectare form-uri login, auto-complete |
| **Background Service Worker** | Menține sesiunea, auto-lock, comunicare cu API |

#### Funcționalități extensie:

1. **Auto-detect login forms** — Content script caută `<input type="password">` și formulare de login
2. **Auto-fill** — Click pe iconița PassGen din câmpul de input → selectează intrarea → completează user+pass
3. **Auto-save** — Detectează login-uri noi și propune salvarea în vault
4. **Quick generator** — Popup cu generator rapid de parole
5. **Search** — Caută în vault din popup
6. **Context menu** — Right-click → "Generate password" / "Open PassGen"
7. **Keyboard shortcuts** — Ctrl+Shift+P → deschide popup

#### Arhitectură extensie:

```
Popup (React)
    ↕ chrome.runtime.sendMessage
Service Worker
    ↕ fetch() → API
    ↕ chrome.storage.session (session key)
Content Script
    ↕ chrome.runtime.sendMessage → Service Worker
    ↕ DOM manipulation (auto-fill)
```

### 3.2 WebAuthn / Passkeys

| Feature | Detalii |
|---|---|
| **Înregistrare Passkey** | `navigator.credentials.create()` — user creează passkey legat de cont |
| **Login cu Passkey** | `navigator.credentials.get()` — login fără parolă |
| **Fallback** | Master password rămâne ca backup |
| **Platforme suportate** | Windows Hello, Touch ID, Face ID, hardware keys (YubiKey) |
| **Library** | `@simplewebauthn/browser` + `@simplewebauthn/server` |

#### Flow WebAuthn:

```
1. User: "Adaugă Passkey" în Settings
2. Client: navigator.credentials.create({ publicKey: { ... } })
3. User: Confirmare biometrică (fingerprint / face)
4. Client → Server: publicKeyCredential
5. Server: Stochează credentialId + publicKey
6. La login: Server trimite challenge → Client semnează cu passkey → Server verifică
```

### 3.3 Biometrics (Nativ via WebAuthn)

- **Touch ID / Face ID** pe macOS/iOS Safari
- **Windows Hello** (PIN, fingerprint, iris) pe Windows + Chrome/Edge
- **Android Biometrics** pe Chrome Android
- Se obține prin aceeași API WebAuthn — nu necesită implementare separată
- **Use case principal**: Deblochare vault fără a tasta master password

### 3.4 TOTP Authenticator integrat

PassGen devine și un authenticator (alternativă la Google Authenticator / Authy).

| Feature | Detalii |
|---|---|
| **Adaugare TOTP secret** | Scan QR code sau input manual al secretului |
| **Generare coduri** | TOTP standard (RFC 6238), 30s refresh |
| **Stocarea** | Secretul TOTP se stochează criptat în vault ca parte a VaultEntry |
| **Library** | `otpauth` npm package |
| **UI** | Cod TOTP afișat pe entry card, countdown circular animat |

#### Structura VaultEntry extinsă:

```typescript
interface VaultEntry {
  // ... câmpuri existente ...
  type: 'login' | 'note' | 'card' | 'identity' | 'totp';
  totpSecret?: string;     // TOTP secret key (Base32)
  totpAlgorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  totpDigits?: 6 | 8;
  totpPeriod?: number;     // default 30s
}
```

#### QR Scanner:

- Library: `html5-qrcode` sau `@aspect-build/aspect-barcode`
- Poate scana și din cameră și din imagine uploadată
- Parsează URI `otpauth://totp/...`

### 3.5 Funcționalități Avansate (Faza 3+)

| Feature | Prioritate | Detalii |
|---|---|---|
| **Password Sharing** | Medie | Share criptat între utilizatori PassGen (X25519 key exchange) |
| **Emergency Access** | Medie | Desemnează un contact de urgență cu acces delay (ex: 48h) |
| **Watchtower / Breach Monitoring** | Mare | Check automat HIBP la fiecare sync, notificări |
| **Secure Notes** | Mare | Tip de entry pentru note criptate (markdown) |
| **Credit Cards** | Mare | Tip de entry pentru carduri, auto-fill |
| **Identity** | Medie | Tip de entry pentru date personale (adresă, telefon), auto-fill |
| **Tags & Smart Folders** | Mică | Filtrare dinamică, saved searches |
| **CLI Tool** | Mică | `passgen-cli` — acces la vault din terminal |
| **Desktop App** | Mică | Electron sau Tauri wrapper pentru acces nativ |
| **Mobile App** | Medie | React Native sau Capacitor — acces la autofill nativ |

---

## Estimări de Timp

| Fază | Durată estimată | Dependențe |
|---|---|---|
| **Faza 2.1** — Backend API | 2-3 săptămâni | Alegere hosting, DB |
| **Faza 2.2** — Auth + 2FA | 1-2 săptămâni | Backend ready |
| **Faza 2.3** — Sync Cloud | 2-3 săptămâni | Auth ready |
| **Faza 2.4** — Security hardening | 1 săptămână | Toate 2.x |
| **Faza 2.5** — UI nou | 1-2 săptămâni | Paralel cu backend |
| **Faza 3.1** — Extensie browser | 3-4 săptămâni | Faza 2 completă |
| **Faza 3.2** — WebAuthn | 1-2 săptămâni | Faza 2 completă |
| **Faza 3.3** — Biometrics | Inclus în 3.2 | WebAuthn |
| **Faza 3.4** — TOTP Auth | 2-3 săptămâni | Faza 1 (client-side) |

---

## Stack Tehnologic Recomandat (Faze 2-3)

```
Frontend:     React 18 + TypeScript + Tailwind CSS + Vite (existent)
Backend:      Hono (Edge) sau Express + TypeScript
Database:     PostgreSQL (Supabase sau Neon serverless)
ORM:          Drizzle ORM
Auth:         JWT + bcrypt + TOTP (speakeasy)
WebAuthn:     @simplewebauthn/browser + @simplewebauthn/server
Extensie:     Manifest V3 + React + webextension-polyfill
TOTP:         otpauth
QR:           html5-qrcode
Deploy:       Vercel (frontend + edge functions) + Supabase (DB)
Monitoring:   Sentry (errors) + Vercel Analytics
CI/CD:        GitHub Actions → Vercel auto-deploy
```

---

*Document generat la implementarea Fazei 1 a PassGen.*
*Ultimul update: Ianuarie 2025*

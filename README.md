# 🔐 PassGen

A modern, full-featured password manager and generator built with React, TypeScript, and Tailwind CSS. Generate secure passwords, store them in an encrypted vault, sync across devices via Supabase, unlock with biometrics, and more — zero-knowledge architecture, deployable on Vercel.

## Features

### 🔑 Password Generation
- **Secure Randomness**: Web Crypto API (`crypto.getRandomValues`) for cryptographic-quality random generation
- **Dual Modes**: Standard password + memorable passphrase generation
- **Entropy Targeting**: Re-generates candidates until entropy target is met (up to 64 attempts)
- **Quick Presets**: Wi-Fi, Banking, Social, PIN, Memorable — one click to configure
- **Strength Analysis**: Real-time strength label, entropy (bits), and estimated crack time
- **Policy Compliance**: Checklist + percentage for enterprise-style requirements

### 🏦 Encrypted Vault
- **AES-256-GCM Encryption**: Zero-knowledge architecture — data encrypted before storage
- **PBKDF2-SHA256**: 600,000 iterations for master password key derivation
- **IndexedDB Storage**: Encrypted blobs stored locally, never plaintext
- **CRUD Operations**: Add, edit, delete, favorite entries with folders and tags
- **Search & Filter**: Full-text search across titles, usernames, URLs, tags
- **Export/Import**: Encrypted JSON backup with password protection
- **Import CSV**: Auto-detect and import from Chrome, Bitwarden, LastPass, 1Password, KeePass
- **Auto-Lock**: Automatic vault lock after inactivity with configurable timeout
- **Session Persistence**: XOR-obfuscated sessionStorage survives page refresh

### ☁️ Cloud Sync (Supabase)
- **Multi-Tenant Architecture**: Each user gets their own encrypted vault row
- **Zero-Knowledge Cloud**: Server stores only base64-encoded AES-256-GCM ciphertext — never plaintext
- **Realtime Sync**: Cross-device sync via Supabase Realtime — save on laptop, appears on phone instantly
- **Row Level Security (RLS)**: PostgreSQL policies ensure users can only access their own data
- **Email Authentication**: Secure login/register with email confirmation
- **Offline-First**: Works fully offline; cloud features activate only when env vars are configured
- **Auto-Sync**: Vault changes automatically uploaded to cloud when authenticated

### 🔓 Authentication
- **Master Password**: Minimum 12 characters with complexity requirements
- **WebAuthn Biometrics**: Fingerprint / Face ID unlock (no server required)
- **Lockout Protection**: Progressive lockout after failed attempts
- **Factory Reset**: Complete data wipe option if master password is forgotten

### 📊 Health Dashboard
- **Vault Health Score**: Aggregated security score across all entries
- **Weak Password Detection**: Identifies entries with low-strength passwords
- **Reuse Detection**: Finds passwords shared across multiple entries
- **Age Tracking**: Flags passwords older than 90 days
- **Actionable Recommendations**: Specific guidance for each issue

### 🧠 AI Password Analyzer
- **10 Vulnerability Checks**: Dictionary words, keyboard patterns, dates, repeats, sequences, l33t speak, and more
- **Shannon Entropy**: Information-theoretic entropy calculation
- **Overall Score**: 0–100 composite security score with visual bar
- **Color-Coded Findings**: Critical / Warning / Pass for each check

### 🎵 Audio Passphrase
- **Sonification**: Hear your password as musical notes via Web Audio API
- **3 Scales**: Pentatonic, Major, Chromatic
- **Visual Bars**: Animated frequency visualizer with character-to-color mapping
- **Adjustable Controls**: Tempo (BPM) and volume sliders

### 🗺️ Password Map
- **Canvas Visualization**: Interactive 2D map of vault entries
- **Category Clusters**: Entries grouped by category with distinct colors
- **Strength Indicators**: Visual node sizing based on password strength

### 🛠️ Tools
- **Password Health Check**: Analyze any password with local security metrics
- **Breach Check (HIBP)**: k-anonymity check against Have I Been Pwned — only 5 SHA-1 chars sent
- **Hash Generator**: MD5, SHA-1, SHA-256, SHA-384, SHA-512 with file upload support
- **WiFi QR Code**: Generate scannable QR codes for WiFi network sharing (WPA/WPA2/WPA3)
- **Username Generator**: Create unique usernames from first/last name

### 📱 Experience
- **Dark/Light Mode**: Toggle with dark as default, persisted across sessions
- **Bilingual (RO/EN)**: Full Romanian and English translations (~1,200 lines)
- **Keyboard Shortcuts**: `Space` to generate, `Ctrl/Cmd+C` to copy
- **Privacy Mode**: Disables local history persistence
- **Welcome Page**: Animated entrance with feature highlights
- **Responsive Design**: Desktop 3-column layout, mobile-optimized tabs
- **Decorative Panels**: Animated icons on tool pages (WiFi rings, Hash orbits, Brain pulse, Music waves)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18.3 + TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3.4 |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2-SHA256) |
| Biometrics | WebAuthn API |
| Local Storage | IndexedDB v2 |
| Cloud Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Icons | Lucide React |
| QR Codes | qrcode |
| Testing | Vitest 4.1 + Testing Library (162 tests, 10 files) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts HTTPS dev server on `https://localhost:5173` (self-signed cert via `@vitejs/plugin-basic-ssl`).

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Preview Production Build

```bash
npm run preview
```

## Cloud Setup (Optional)

PassGen works fully offline. To enable cloud sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the schema in SQL Editor:
   ```
   Copy contents of supabase/schema.sql into Supabase SQL Editor and run
   ```
3. Create `.env` from template:
   ```bash
   cp .env.example .env
   ```
4. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Configure Authentication in Supabase Dashboard:
   - **Authentication → URL Configuration → Site URL**: `https://localhost:5173` (dev) or your Vercel URL
   - **Redirect URLs**: `https://localhost:5173/**` and `https://your-app.vercel.app/**`

## Project Structure

```
src/
├── components/
│   ├── PasswordGenerator.tsx     # Main 8-tab layout orchestration
│   ├── PasswordHealthCheck.tsx   # Health check + HIBP breach check
│   ├── PasswordOptions.tsx       # Generator configuration
│   ├── PolicyIndicator.tsx       # Policy compliance meter
│   ├── SecurityTips.tsx          # Live security recommendations
│   ├── StrengthIndicator.tsx     # Strength visualization
│   ├── UsernameGenerator.tsx     # Username generation
│   ├── WiFiQrCode.tsx            # WiFi QR code generator
│   ├── HashGenerator.tsx         # Hash generator (MD5–SHA-512)
│   ├── PasswordAnalyzer.tsx      # AI vulnerability analyzer
│   ├── AudioPassphrase.tsx       # Audio sonification
│   ├── PasswordMap.tsx           # Canvas vault visualization
│   ├── ImportCsvDialog.tsx       # CSV import dialog
│   ├── WelcomePage.tsx           # Animated welcome screen
│   ├── auth/
│   │   ├── CloudAuth.tsx         # Supabase email login/register
│   │   ├── CloudSyncIndicator.tsx # Header cloud sync status
│   │   ├── MasterPasswordSetup.tsx
│   │   └── UnlockScreen.tsx      # With biometric unlock button
│   └── vault/
│       ├── VaultView.tsx         # Vault list + actions menu
│       ├── VaultEntryForm.tsx    # Add/edit entry form
│       └── HealthDashboard.tsx   # Vault health analysis
├── services/
│   ├── authService.ts            # Master password verification
│   ├── biometricService.ts       # WebAuthn biometric enrollment/auth
│   ├── cloudService.ts           # Supabase vault sync + realtime
│   ├── exportService.ts          # Encrypted export/import
│   ├── healthService.ts          # Vault health analysis
│   ├── sessionService.ts         # Session persistence (XOR-obfuscated)
│   └── vaultService.ts           # Vault CRUD + encryption
├── crypto/
│   ├── cryptoService.ts          # AES-256-GCM, PBKDF2, key derivation
│   └── constants.ts              # Crypto configuration
├── db/
│   └── indexedDB.ts              # IndexedDB storage layer
├── lib/
│   └── supabase.ts               # Supabase client singleton
├── utils/
│   ├── i18n.ts                   # RO/EN translations (~1,200 lines)
│   ├── importCsvUtils.ts         # CSV parser + source detection
│   ├── passwordUtils.ts          # Password/passphrase generation
│   ├── policyUtils.ts            # Policy evaluation
│   ├── strengthUtils.ts          # Entropy & strength calculation
│   └── usernameUtils.ts          # Username generation
├── contexts/
│   └── LanguageContext.tsx        # i18n React context
├── types/
│   ├── vault.ts                  # TypeScript types & interfaces
│   └── supabase.ts               # Supabase database types
├── test/                         # 10 test files, 162 tests
├── App.tsx                       # Root: auth state, vault handlers, cloud sync
└── main.tsx                      # Entry point

supabase/
└── schema.sql                    # PostgreSQL schema with RLS + Realtime
```

## Security

- **Zero-Knowledge**: All encryption/decryption happens client-side in the browser
- **AES-256-GCM**: Industry-standard authenticated encryption for vault data
- **PBKDF2**: 600,000 iterations with SHA-256 for key derivation
- **Cloud Zero-Knowledge**: Supabase stores only encrypted blobs — server never sees plaintext
- **Row Level Security**: PostgreSQL RLS policies enforce per-user data isolation
- **Breach Checks**: HIBP range API with SHA-1 prefix (k-anonymity) — full password never sent
- **WebAuthn**: Platform authenticator only, no server-side verification needed
- **No Telemetry**: No analytics, no tracking, no external calls except optional HIBP check
- **Session Security**: Master password XOR-obfuscated in sessionStorage, not plaintext

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel Dashboard
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — done!

### Other Platforms

```bash
npm run build
```

Deploy the `dist/` folder to Netlify, Cloudflare Pages, or any static hosting.

## License

MIT

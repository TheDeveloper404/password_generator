# PassGen

A modern, full-featured password manager and generator built with React, TypeScript, and Tailwind CSS. Generate secure passwords, store them in an encrypted vault, unlock with biometrics, and more — all 100% client-side, deployable on Vercel.

## Features

### 🔐 Password Generation
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

### 🛠️ Tools
- **Password Health Check**: Analyze any password with local security metrics
- **Breach Check (HIBP)**: k-anonymity check against Have I Been Pwned — only 5 SHA-1 chars sent
- **Hash Generator**: MD5, SHA-1, SHA-256, SHA-384, SHA-512 with file upload support
- **WiFi QR Code**: Generate scannable QR codes for WiFi network sharing
- **Username Generator**: Create unique usernames from first/last name

### 📱 Experience
- **Dark/Light Mode**: Toggle with dark as default, persisted across sessions
- **Bilingual (RO/EN)**: Full Romanian and English translations
- **Keyboard Shortcuts**: `Space` to generate, `Ctrl/Cmd+C` to copy
- **Privacy Mode**: Disables local history persistence
- **Welcome Page**: Animated entrance with feature highlights
- **Responsive Design**: Desktop 3-column layout, mobile-optimized tabs

## Tech Stack

- React 18.3 + TypeScript 5.9
- Vite 8
- Tailwind CSS 3.4
- Web Crypto API (AES-256-GCM, PBKDF2, SHA-*)
- WebAuthn API (biometric authentication)
- IndexedDB (encrypted storage)
- Lucide React (icons)
- qrcode (WiFi QR generation)
- Vitest + Testing Library (109 tests)

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

Starts HTTPS dev server (self-signed cert via `@vitejs/plugin-basic-ssl`).

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

## Project Structure

```
src/
├── components/
│   ├── PasswordGenerator.tsx     # Main 5-tab layout orchestration
│   ├── PasswordHealthCheck.tsx   # Health check + HIBP breach check
│   ├── PasswordOptions.tsx       # Generator configuration
│   ├── PolicyIndicator.tsx       # Policy compliance meter
│   ├── SecurityTips.tsx          # Live security recommendations
│   ├── StrengthIndicator.tsx     # Strength visualization
│   ├── UsernameGenerator.tsx     # Username generation
│   ├── WiFiQrCode.tsx            # WiFi QR code generator
│   ├── HashGenerator.tsx         # Hash generator (MD5–SHA-512)
│   ├── ImportCsvDialog.tsx       # CSV import dialog
│   ├── WelcomePage.tsx           # Animated welcome screen
│   ├── auth/
│   │   ├── MasterPasswordSetup.tsx
│   │   └── UnlockScreen.tsx      # With biometric unlock button
│   └── vault/
│       ├── VaultView.tsx         # Vault list + actions menu
│       ├── VaultEntryForm.tsx    # Add/edit entry form
│       └── HealthDashboard.tsx   # Vault health analysis
├── services/
│   ├── authService.ts            # Master password verification
│   ├── biometricService.ts       # WebAuthn biometric enrollment/auth
│   ├── exportService.ts          # Encrypted export/import
│   ├── sessionService.ts         # Session persistence (XOR-obfuscated)
│   └── vaultService.ts           # Vault CRUD + encryption
├── crypto/
│   ├── cryptoService.ts          # AES-256-GCM, PBKDF2, key derivation
│   └── constants.ts              # Crypto configuration
├── db/
│   └── indexedDB.ts              # IndexedDB storage layer
├── utils/
│   ├── i18n.ts                   # RO/EN translations (~850 lines)
│   ├── importCsvUtils.ts         # CSV parser + source detection
│   ├── passwordUtils.ts          # Password/passphrase generation
│   ├── policyUtils.ts            # Policy evaluation
│   ├── strengthUtils.ts          # Entropy & strength calculation
│   └── usernameUtils.ts          # Username generation
├── contexts/
│   └── LanguageContext.tsx        # i18n React context
├── types/
│   └── vault.ts                  # TypeScript types & interfaces
├── test/                         # 7 test files, 109 tests
├── App.tsx                       # Root: auth state, vault handlers, routing
└── main.tsx                      # Entry point
```

## Security Notes

- **Zero-knowledge**: All encryption/decryption happens client-side in the browser
- **AES-256-GCM**: Industry-standard authenticated encryption for vault data
- **PBKDF2**: 600,000 iterations with SHA-256 for key derivation
- **Breach checks**: HIBP range API with SHA-1 prefix (k-anonymity) — full password never sent
- **WebAuthn**: Platform authenticator only, no server-side verification needed
- **No telemetry**: No analytics, no tracking, no external calls except optional HIBP check
- **Deployable on Vercel**: Static SPA, no backend required

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static hosting.

## License

MIT

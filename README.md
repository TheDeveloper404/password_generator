# Password Generator

A modern, interactive password generator built with React, TypeScript, and Tailwind CSS. Create secure passwords or passphrases with strong defaults, live analysis, and privacy-aware security checks.

## Features

- **Secure Randomness**: Uses Web Crypto API (`crypto.getRandomValues`) for stronger random generation
- **Guaranteed Character Coverage**: Includes at least one character from every selected character type
- **Dual Generation Modes**: Standard password mode + memorable passphrase mode
- **Quick Presets**: Ready-made profiles (Wi-Fi, Banking, Social, PIN, Memorabil)
- **Strength Insights**: Real-time strength label, entropy (bits), and crack-time estimate
- **Entropy Targeting**: Re-generates candidates until entropy target is met (or best result is chosen)
- **Policy Compliance Meter**: Checklist + percentage for enterprise-style requirements (length, uppercase, lowercase, number, symbol)
- **Password Health Check**: Analyze any entered/generated password with local security metrics
- **Breach Check (k-anonymity)**: Checks if password appears in known leaks without sending full password
- **Security Tips Live**: Dynamic recommendations based on strength, policy, entropy, and breach result
- **History, Copied History & Favorites**: Save, reuse, copy, and star generated values (stored locally)
- **Privacy Mode**: Clears and disables local history persistence for safer sessions
- **Persistent Preferences**: Mode, options, theme, and history survive page reloads
- **Keyboard Shortcuts**: `Space` to generate, `Ctrl/Cmd + C` to copy current output
- **Dark/Light Mode**: Toggle between dark and light themes

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── PasswordGenerator.tsx    # Main orchestration component
│   ├── PasswordHealthCheck.tsx  # Local health check + breach check UI
│   ├── PasswordOptions.tsx      # Generator configuration options
│   ├── PolicyIndicator.tsx      # Policy compliance meter
│   ├── SecurityTips.tsx         # Live security recommendations
│   └── StrengthIndicator.tsx    # Strength visualization
├── utils/
│   ├── breachUtils.ts          # HIBP k-anonymity breach checks
│   ├── passwordUtils.ts        # Password/passphrase generation logic
│   ├── policyUtils.ts          # Policy evaluation logic
│   ├── securityTips.ts         # Live tips engine
│   └── strengthUtils.ts        # Strength & entropy calculation logic
├── App.tsx                     # Root component
└── main.tsx                    # Application entry point
```

## Security Notes

- Breach checks use the Have I Been Pwned range API with SHA-1 hash prefix (k-anonymity model).
- The full plaintext password is not sent during breach verification.
- Health and policy checks run locally in the browser.

## License

MIT

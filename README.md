# Password Generator

A modern, interactive password generator built with React, TypeScript, and Tailwind CSS. Create secure passwords with customizable options and real-time strength visualization.

## Features

- **Secure Randomness**: Uses Web Crypto API (`crypto.getRandomValues`) for stronger random generation
- **Guaranteed Character Coverage**: Includes at least one character from every selected character type
- **Dual Generation Modes**: Standard password mode + memorable passphrase mode
- **Quick Presets**: Ready-made profiles (Wi-Fi, Banking, Social, PIN, Memorabil)
- **Strength Insights**: Real-time strength label, entropy (bits), and crack-time estimate
- **Policy Compliance Meter**: Checklist + percentage for enterprise-style requirements (length, uppercase, lowercase, number, symbol)
- **History & Favorites**: Save, reuse, copy, and star generated values (stored locally)
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
│   ├── PasswordGenerator.tsx   # Main component
│   ├── PasswordOptions.tsx    # Password configuration options
│   └── StrengthIndicator.tsx  # Password strength visualization
├── utils/
│   ├── passwordUtils.ts       # Password generation logic
│   └── strengthUtils.ts       # Strength calculation logic
├── App.tsx                    # Root component
└── main.tsx                   # Application entry point
```

## License

MIT

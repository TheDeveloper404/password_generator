# Password Generator

A modern, interactive password generator built with React, TypeScript, and Tailwind CSS. Create secure passwords with customizable options and real-time strength visualization.

## Features

- **Customizable Length**: Adjust password length from 8 to 32 characters
- **Character Options**: Toggle uppercase, lowercase, numbers, and symbols
- **Strength Indicator**: Real-time visual feedback on password strength
- **Copy to Clipboard**: One-click copy functionality with visual confirmation
- **Dark/Light Mode**: Toggle between dark and light themes

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwindide React (icons CSS
- Luc)

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

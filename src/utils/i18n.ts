export type Language = 'ro' | 'en';

export interface Translations {
  // PasswordGenerator
  appTitle: string;
  placeholderPassword: string;
  placeholderPassphrase: string;
  copiedToClipboard: string;
  shortcutHint: string;
  privacyMode: string;
  generatePassword: string;
  generatePassphrase: string;
  historyEmpty: string;
  historyCopied: string;
  historyFavorites: string;
  historyRecent: string;
  copyToClipboard: string;
  generateNew: string;
  copyAgain: string;
  removeFromCopied: string;
  copy: string;
  removeFavorite: string;
  toggleFavorite: string;
  removeFromHistory: string;
  bits: string;

  // PasswordOptions
  mode: string;
  password: string;
  passphrase: string;
  quickPresets: string;
  minEntropyTarget: string;
  passwordLength: string;
  passwordOptions: string;
  includeUppercase: string;
  includeLowercase: string;
  includeNumbers: string;
  includeSymbols: string;
  wordCount: string;
  separator: string;
  capitalizeWords: string;
  appendRandomNumber: string;
  presetWifi: string;
  presetBank: string;
  presetSocial: string;
  presetPin: string;
  presetMemorable: string;
  separatorDash: string;
  separatorUnderscore: string;
  separatorDot: string;

  // StrengthIndicator
  passwordStrength: string;
  entropyLabel: string;
  crackTimeLabel: string;

  // PolicyIndicator
  policyCompliance: string;
  policyMinLength: (n: number) => string;
  policyUppercase: string;
  policyLowercase: string;
  policyDigit: string;
  policySymbol: string;

  // UsernameGenerator
  usernameTitle: string;
  usernameDesc: string;
  usernameFirstName: string;
  usernameLastName: string;
  usernameGenerate: string;
  usernameCopy: string;

  // Strength labels
  veryWeak: string;
  weak: string;
  medium: string;
  strong: string;
  veryStrong: string;

  // Crack time
  crackLessThan1s: string;
  crackSeconds: (n: number) => string;
  crackMinutes: (n: number) => string;
  crackHours: (n: number) => string;
  crackDays: (n: number) => string;
  crackYears: (n: number) => string;
  crackOver1000: string;
}

export const translations: Record<Language, Translations> = {
  ro: {
    // PasswordGenerator
    appTitle: 'Generator de Parole',
    placeholderPassword: 'Apasă generate pentru a crea o parolă',
    placeholderPassphrase: 'Apasă generate pentru a crea o frază-parolă',
    copiedToClipboard: 'Copiat în clipboard!',
    shortcutHint: 'Shortcut: Space generează · Ctrl/Cmd+C copiază',
    privacyMode: 'Mod privat',
    generatePassword: 'Generează Parolă',
    generatePassphrase: 'Generează Frază',
    historyEmpty: 'Istoricul va apărea aici după ce generezi și copiezi parole.',
    historyCopied: 'Istoric copiate',
    historyFavorites: 'Favorite',
    historyRecent: 'Istoric recent',
    copyToClipboard: 'Copiază în clipboard',
    generateNew: 'Generează parolă nouă',
    copyAgain: 'Copiază din nou',
    removeFromCopied: 'Șterge din istoricul copiate',
    copy: 'Copiază',
    removeFavorite: 'Șterge din favorite',
    toggleFavorite: 'Adaugă/Șterge favorit',
    removeFromHistory: 'Șterge din istoric',
    bits: 'biți',

    // PasswordOptions
    mode: 'Mod',
    password: 'Parolă',
    passphrase: 'Frază',
    quickPresets: 'Preset-uri rapide',
    minEntropyTarget: 'Entropy minimă țintă',
    passwordLength: 'Lungime parolă',
    passwordOptions: 'Opțiuni parolă',
    includeUppercase: 'Include litere mari',
    includeLowercase: 'Include litere mici',
    includeNumbers: 'Include cifre',
    includeSymbols: 'Include simboluri',
    wordCount: 'Număr de cuvinte',
    separator: 'Separator',
    capitalizeWords: 'Cuvinte cu majusculă',
    appendRandomNumber: 'Adaugă număr aleatoriu',
    presetWifi: 'Wi-Fi',
    presetBank: 'Cont bancar',
    presetSocial: 'Social',
    presetPin: 'PIN',
    presetMemorable: 'Memorabil',
    separatorDash: 'Liniuță (-)',
    separatorUnderscore: 'Underscore (_)',
    separatorDot: 'Punct (.)',

    // StrengthIndicator
    passwordStrength: 'Putere Parolă',
    entropyLabel: 'Entropie',
    crackTimeLabel: 'Timp spargere',

    // PolicyIndicator
    policyCompliance: 'Conformitate Politică',
    policyMinLength: (n) => `Minim ${n} caractere`,
    policyUppercase: 'Cel puțin o literă mare',
    policyLowercase: 'Cel puțin o literă mică',
    policyDigit: 'Cel puțin o cifră',
    policySymbol: 'Cel puțin un simbol',

    // UsernameGenerator
    usernameTitle: 'Generator Username',
    usernameDesc: 'Introdu numele tău și generează username-uri unice.',
    usernameFirstName: 'Prenume',
    usernameLastName: 'Nume de familie',
    usernameGenerate: 'Generează Username-uri',
    usernameCopy: 'Copiază',

    // Strength labels
    veryWeak: 'Foarte Slabă',
    weak: 'Slabă',
    medium: 'Medie',
    strong: 'Puternică',
    veryStrong: 'Foarte Puternică',

    // Crack time
    crackLessThan1s: '< 1 secundă',
    crackSeconds: (n) => `${n} secunde`,
    crackMinutes: (n) => `${n} minute`,
    crackHours: (n) => `${n} ore`,
    crackDays: (n) => `${n} zile`,
    crackYears: (n) => `${n} ani`,
    crackOver1000: 'peste 1000 ani',

  },

  en: {
    // PasswordGenerator
    appTitle: 'Password Generator',
    placeholderPassword: 'Click generate to create password',
    placeholderPassphrase: 'Click generate to create passphrase',
    copiedToClipboard: 'Copied to clipboard!',
    shortcutHint: 'Shortcut: Space generate · Ctrl/Cmd+C copy',
    privacyMode: 'Privacy mode',
    generatePassword: 'Generate Password',
    generatePassphrase: 'Generate Passphrase',
    historyEmpty: 'History will appear here after you generate and copy passwords.',
    historyCopied: 'Copied history',
    historyFavorites: 'Favorites',
    historyRecent: 'Recent history',
    copyToClipboard: 'Copy to clipboard',
    generateNew: 'Generate new password',
    copyAgain: 'Copy again',
    removeFromCopied: 'Remove from copied history',
    copy: 'Copy',
    removeFavorite: 'Remove favorite',
    toggleFavorite: 'Toggle favorite',
    removeFromHistory: 'Remove from history',
    bits: 'bits',

    // PasswordOptions
    mode: 'Mode',
    password: 'Password',
    passphrase: 'Passphrase',
    quickPresets: 'Quick presets',
    minEntropyTarget: 'Minimum entropy target',
    passwordLength: 'Password Length',
    passwordOptions: 'Password Options',
    includeUppercase: 'Include Uppercase',
    includeLowercase: 'Include Lowercase',
    includeNumbers: 'Include Numbers',
    includeSymbols: 'Include Symbols',
    wordCount: 'Word count',
    separator: 'Separator',
    capitalizeWords: 'Capitalize words',
    appendRandomNumber: 'Append random number',
    presetWifi: 'Wi-Fi',
    presetBank: 'Banking',
    presetSocial: 'Social',
    presetPin: 'PIN',
    presetMemorable: 'Memorable',
    separatorDash: 'Dash (-)',
    separatorUnderscore: 'Underscore (_)',
    separatorDot: 'Dot (.)',

    // StrengthIndicator
    passwordStrength: 'Password Strength',
    entropyLabel: 'Entropy',
    crackTimeLabel: 'Crack time',

    // PolicyIndicator
    policyCompliance: 'Policy Compliance',
    policyMinLength: (n) => `Minimum ${n} characters`,
    policyUppercase: 'At least one uppercase letter',
    policyLowercase: 'At least one lowercase letter',
    policyDigit: 'At least one digit',
    policySymbol: 'At least one symbol',

    // UsernameGenerator
    usernameTitle: 'Username Generator',
    usernameDesc: 'Enter your name and generate unique usernames.',
    usernameFirstName: 'First name',
    usernameLastName: 'Last name',
    usernameGenerate: 'Generate Usernames',
    usernameCopy: 'Copy',

    // Strength labels
    veryWeak: 'Very Weak',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    veryStrong: 'Very Strong',

    // Crack time
    crackLessThan1s: '< 1 second',
    crackSeconds: (n) => `${n} seconds`,
    crackMinutes: (n) => `${n} minutes`,
    crackHours: (n) => `${n} hours`,
    crackDays: (n) => `${n} days`,
    crackYears: (n) => `${n} years`,
    crackOver1000: 'over 1000 years',

  },
};

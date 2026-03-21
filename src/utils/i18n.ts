export type Language = 'ro' | 'en';

export interface Translations {
  // PasswordGenerator
  appTitle: string;
  placeholderPassword: string;
  placeholderPassphrase: string;
  copiedToClipboard: string;
  shortcutHint: string;
  switchToEn: string;
  switchToRo: string;
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

  // PasswordHealthCheck
  healthCheckTitle: string;
  healthCheckDesc: string;
  riskNA: string;
  riskHigh: string;
  riskMedium: string;
  riskLow: string;
  passwordToCheckPlaceholder: string;
  useGenerated: string;
  strengthLabel: string;
  policyLabel: string;
  checkBreach: string;
  breachNotFound: string;
  breachFound: (count: string) => string;
  breachError: string;
  hashDisclaimer: string;

  // UsernameGenerator
  usernameTitle: string;
  usernameDesc: string;
  usernameFirstName: string;
  usernameLastName: string;
  usernameGenerate: string;
  usernameCopy: string;

  // SecurityTips
  securityTipsTitle: string;
  tipUniquePasswords: string;
  tipMinLength: string;
  tipNoPersonalInfo: string;
  tipUseManager: string;
  tipEnable2FA: string;

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
    switchToEn: 'Switch to English',
    switchToRo: 'Schimbă în Română',
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

    // PasswordHealthCheck
    healthCheckTitle: 'Verificare Sănătate Parolă',
    healthCheckDesc: 'Introdu sau folosește parola generată pentru a verifica securitatea ei.',
    riskNA: 'N/A',
    riskHigh: 'Risc Ridicat',
    riskMedium: 'Risc Mediu',
    riskLow: 'Risc Scăzut',
    passwordToCheckPlaceholder: 'Introdu parola de verificat...',
    useGenerated: 'Folosește generată',
    strengthLabel: 'Putere',
    policyLabel: 'Politică',
    checkBreach: 'Verifică Breșe de Date',
    breachNotFound: 'Parola nu a fost găsită în breșe cunoscute.',
    breachFound: (count) => `Parola a fost expusă în ${count} breșe de date!`,
    breachError: 'Nu s-a putut verifica. Încearcă din nou.',
    hashDisclaimer: 'Doar primele 5 caractere din hash-ul SHA-1 sunt trimise — parola ta nu părăsește niciodată dispozitivul.',

    // UsernameGenerator
    usernameTitle: 'Generator Username',
    usernameDesc: 'Introdu numele tău și generează username-uri unice.',
    usernameFirstName: 'Prenume',
    usernameLastName: 'Nume de familie',
    usernameGenerate: 'Generează Username-uri',
    usernameCopy: 'Copiază',

    // SecurityTips
    securityTipsTitle: 'Sfaturi de Securitate',
    tipUniquePasswords: 'Folosește o parolă unică pentru fiecare cont. Reutilizarea parolelor compromite toate conturile.',
    tipMinLength: 'Parolele de minim 16 caractere sunt mult mai greu de spart. Cu cât mai lungă, cu atât mai sigură.',
    tipNoPersonalInfo: 'Nu include date personale (nume, dată naștere, email). Acestea sunt primele încercate de atacatori.',
    tipUseManager: 'Folosește un manager de parole pentru a stoca și genera parole complexe în siguranță.',
    tipEnable2FA: 'Activează autentificarea în doi pași (2FA) oriunde este posibil pentru protecție suplimentară.',

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
    switchToEn: 'Switch to English',
    switchToRo: 'Schimbă în Română',
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

    // PasswordHealthCheck
    healthCheckTitle: 'Password Health Check',
    healthCheckDesc: 'Enter or use the generated password to check its security.',
    riskNA: 'N/A',
    riskHigh: 'High Risk',
    riskMedium: 'Medium Risk',
    riskLow: 'Low Risk',
    passwordToCheckPlaceholder: 'Enter password to check...',
    useGenerated: 'Use generated',
    strengthLabel: 'Strength',
    policyLabel: 'Policy',
    checkBreach: 'Check Data Breaches',
    breachNotFound: 'Password not found in known breaches.',
    breachFound: (count) => `Password exposed in ${count} data breaches!`,
    breachError: 'Could not check. Try again.',
    hashDisclaimer: 'Only the first 5 characters of the SHA-1 hash are sent — your password never leaves your device.',

    // UsernameGenerator
    usernameTitle: 'Username Generator',
    usernameDesc: 'Enter your name and generate unique usernames.',
    usernameFirstName: 'First name',
    usernameLastName: 'Last name',
    usernameGenerate: 'Generate Usernames',
    usernameCopy: 'Copy',

    // SecurityTips
    securityTipsTitle: 'Security Tips',
    tipUniquePasswords: 'Use a unique password for each account. Reusing passwords compromises all your accounts.',
    tipMinLength: 'Passwords with at least 16 characters are much harder to crack. The longer, the safer.',
    tipNoPersonalInfo: 'Don\'t include personal info (name, birthdate, email). These are the first things attackers try.',
    tipUseManager: 'Use a password manager to securely store and generate complex passwords.',
    tipEnable2FA: 'Enable two-factor authentication (2FA) wherever possible for extra protection.',

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

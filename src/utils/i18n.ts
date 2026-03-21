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

  // StrengthIndicator
  passwordStrength: string;

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
  useGenerated: string;
  passwordToCheck: string;
  passwordToCheckPlaceholder: string;
  piiContextLabel: string;
  piiNamePlaceholder: string;
  piiEmailPlaceholder: string;
  piiDomainPlaceholder: string;
  piiExposureDetected: (matches: string) => string;
  strengthLabel: string;
  entropyLabel: string;
  policyLabel: string;
  crackTimeLabel: string;
  checkBreach: string;
  breachNotFound: string;
  breachFound: (count: string) => string;
  breachError: string;
  securityTipsTitle: string;
  hashDisclaimer: string;
  entropyTooltip: string;

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

  // Risk labels
  riskNA: string;
  riskHigh: string;
  riskMedium: string;
  riskLow: string;

  // Security tips
  tipEmpty: string;
  tipLength: string;
  tipCommon: string;
  tipRepeat: string;
  tipSequence: string;
  tipEntropy: (target: number, current: number) => string;
  tipPolicy: (labels: string) => string;
  tipBreach: (count: string) => string;
  tipPiiWithSample: (sample: string) => string;
  tipPiiGeneric: string;
  tipGood: string;
}

export const translations: Record<Language, Translations> = {
  ro: {
    // PasswordGenerator
    appTitle: 'Password Generator',
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

    // StrengthIndicator
    passwordStrength: 'Putere Parolă',

    // PolicyIndicator
    policyCompliance: 'Conformitate Politică',
    policyMinLength: (n) => `Minim ${n} caractere`,
    policyUppercase: 'Cel puțin o literă mare',
    policyLowercase: 'Cel puțin o literă mică',
    policyDigit: 'Cel puțin o cifră',
    policySymbol: 'Cel puțin un simbol',

    // PasswordHealthCheck
    healthCheckTitle: 'Password Health Check',
    healthCheckDesc:
      'Verifică securitatea unei parole: puterea, conformitatea și dacă a apărut în breșe de date (via Have I Been Pwned, k-anonymity — parola nu este trimisă).',
    useGenerated: 'Folosește generata',
    passwordToCheck: 'Parolă de verificat',
    passwordToCheckPlaceholder: 'Introdu parola de verificat',
    piiContextLabel: 'Username/PII context (opțional)',
    piiNamePlaceholder: 'Nume utilizator',
    piiEmailPlaceholder: 'Email',
    piiDomainPlaceholder: 'Domeniu (ex: company.com)',
    piiExposureDetected: (matches) => `PII exposure detectat: ${matches}. Parola a fost penalizată.`,
    strengthLabel: 'Putere',
    entropyLabel: 'Entropy',
    policyLabel: 'Politică',
    crackTimeLabel: 'Timp spargere',
    checkBreach: 'Verifică breach',
    breachNotFound: 'Nu a fost găsită în breșe cunoscute',
    breachFound: (count) => `Găsită de ${count} ori`,
    breachError: 'Nu am putut verifica acum. Încearcă din nou.',
    securityTipsTitle: 'Sfaturi de securitate',
    hashDisclaimer: 'Parola completă nu este trimisă; verificarea folosește doar prefix hash.',
    entropyTooltip:
      'Entropy măsoară imprevizibilitatea parolei în biți. Cu cât valoarea e mai mare, cu atât parola e mai greu de spart. Minim recomandat: 60 biți.',

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

    // Risk labels
    riskNA: 'N/A',
    riskHigh: 'Risc Ridicat',
    riskMedium: 'Risc Mediu',
    riskLow: 'Risc Scăzut',

    // Security tips
    tipEmpty: 'Generează sau introdu o parolă pentru analiză live.',
    tipLength: 'Crește lungimea la minim 12-16 caractere pentru rezistență mai bună.',
    tipCommon: 'Evită cuvinte sau pattern-uri comune (ex: password, qwerty, 123456).',
    tipRepeat: 'Evită caractere repetitive consecutive (ex: aaa, 111).',
    tipSequence: 'Evită secvențe previzibile (ex: 1234, abcd, qwer).',
    tipEntropy: (target, current) => `Ținta curentă este ${target} biți, iar parola are ${current} biți.`,
    tipPolicy: (labels) => `Reguli lipsă: ${labels}.`,
    tipBreach: (count) => `Parola a fost găsită în leak-uri (${count} apariții). Schimb-o imediat.`,
    tipPiiWithSample: (sample) => `Parola conține date personale (${sample}). Evită nume/email/domeniu în parolă.`,
    tipPiiGeneric: 'Parola conține date personale. Evită nume/email/domeniu în parolă.',
    tipGood: 'Parola arată solid. Păstrează parole unice pentru fiecare cont important.',
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

    // StrengthIndicator
    passwordStrength: 'Password Strength',

    // PolicyIndicator
    policyCompliance: 'Policy Compliance',
    policyMinLength: (n) => `Minimum ${n} characters`,
    policyUppercase: 'At least one uppercase letter',
    policyLowercase: 'At least one lowercase letter',
    policyDigit: 'At least one digit',
    policySymbol: 'At least one symbol',

    // PasswordHealthCheck
    healthCheckTitle: 'Password Health Check',
    healthCheckDesc:
      'Checks a password\'s security: strength, policy compliance, and whether it appeared in known data breaches (via Have I Been Pwned, k-anonymity — the password is never sent).',
    useGenerated: 'Use generated',
    passwordToCheck: 'Password to check',
    passwordToCheckPlaceholder: 'Enter a password to check',
    piiContextLabel: 'Username/PII context (optional)',
    piiNamePlaceholder: 'Username',
    piiEmailPlaceholder: 'Email',
    piiDomainPlaceholder: 'Domain (e.g. company.com)',
    piiExposureDetected: (matches) => `PII exposure detected: ${matches}. Score penalized.`,
    strengthLabel: 'Strength',
    entropyLabel: 'Entropy',
    policyLabel: 'Policy',
    crackTimeLabel: 'Crack time',
    checkBreach: 'Check breach',
    breachNotFound: 'Not found in known breaches',
    breachFound: (count) => `Found ${count} times`,
    breachError: 'Could not check right now. Please try again.',
    securityTipsTitle: 'Security tips',
    hashDisclaimer: 'The full password is never sent; only a hash prefix is used for verification.',
    entropyTooltip:
      'Entropy measures the unpredictability of a password in bits. The higher the value, the harder it is to crack. Minimum recommended: 60 bits.',

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

    // Risk labels
    riskNA: 'N/A',
    riskHigh: 'High Risk',
    riskMedium: 'Medium Risk',
    riskLow: 'Low Risk',

    // Security tips
    tipEmpty: 'Generate or enter a password for live analysis.',
    tipLength: 'Increase length to at least 12-16 characters for better resistance.',
    tipCommon: 'Avoid common words or patterns (e.g. password, qwerty, 123456).',
    tipRepeat: 'Avoid consecutive repeated characters (e.g. aaa, 111).',
    tipSequence: 'Avoid predictable sequences (e.g. 1234, abcd, qwer).',
    tipEntropy: (target, current) => `Current target is ${target} bits, password has ${current} bits.`,
    tipPolicy: (labels) => `Missing rules: ${labels}.`,
    tipBreach: (count) => `Password found in leaks (${count} occurrences). Change it immediately.`,
    tipPiiWithSample: (sample) => `Password contains personal data (${sample}). Avoid name/email/domain in password.`,
    tipPiiGeneric: 'Password contains personal data. Avoid name/email/domain in password.',
    tipGood: 'Password looks solid. Keep unique passwords for each important account.',
  },
};

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

  // Tabs
  tabGenerator: string;
  tabWifi: string;
  tabVault: string;
  tabHealth: string;

  // Logout
  logout: string;

  // WelcomePage
  welcomeSubtitle: string;
  welcomeFeatureStrong: string;
  welcomeFeatureSecurity: string;
  welcomeFeatureUsername: string;
  welcomeFeatureVault: string;
  welcomeStart: string;
  welcomeKeyboardHint: string;

  // MasterPasswordSetup
  setupTitle: string;
  setupSubtitle: string;
  setupWarning: string;
  setupMasterPassword: string;
  setupConfirm: string;
  setupReqLength: string;
  setupReqUppercase: string;
  setupReqLowercase: string;
  setupReqNumber: string;
  setupReqSymbol: string;
  setupMismatch: string;
  setupButton: string;
  setupLoading: string;
  setupError: string;

  // UnlockScreen
  unlockSubtitle: string;
  unlockMasterPassword: string;
  unlockButton: string;
  unlockLoading: string;
  unlockWrongPassword: string;
  unlockLockedOut: string;
  unlockLockedOutTimer: (seconds: number) => string;
  unlockError: string;
  unlockForgot: string;
  unlockResetWarning: string;
  unlockResetConfirm: string;
  unlockResetCancel: string;

  // VaultView
  vaultTitle: string;
  vaultAdd: string;
  vaultSearchPlaceholder: string;
  vaultAllFolders: string;
  vaultFavorites: string;
  vaultEmpty: string;
  vaultEmptyHint: string;
  vaultNoResults: string;
  vaultTryDifferentSearch: string;
  vaultConfirmDelete: string;
  vaultNewFolder: string;
  vaultFolderPlaceholder: string;
  vaultExport: string;
  vaultImport: string;
  vaultLock: string;
  vaultExportPasswordPrompt: string;
  vaultExportError: string;
  vaultImportPasswordPrompt: string;
  vaultImportSuccess: (count: number) => string;
  vaultImportError: string;

  // VaultEntryForm
  vaultFormAddTitle: string;
  vaultFormEditTitle: string;
  vaultFormTitle: string;
  vaultFormTitlePlaceholder: string;
  vaultFormTitleRequired: string;
  vaultFormUrl: string;
  vaultFormUsername: string;
  vaultFormUsernamePlaceholder: string;
  vaultFormPassword: string;
  vaultFormGenerate: string;
  vaultFormFolder: string;
  vaultFormTags: string;
  vaultFormTagsPlaceholder: string;
  vaultFormNotes: string;
  vaultFormNotesPlaceholder: string;
  vaultFormSave: string;
  vaultFormUpdate: string;
  vaultFormCancel: string;
  vaultFormUrlPlaceholder: string;

  // HealthDashboard
  healthTitle: string;
  healthNoEntries: string;
  healthNoEntriesHint: string;
  healthWeakPasswords: string;
  healthReusedPasswords: string;
  healthOldPasswords: string;
  healthEmptyPasswords: string;
  healthGroups: string;
  healthScoreDesc: (totalEntries: number) => string;
  healthRecommendations: string;
  healthRecWeak: string;
  healthRecReused: string;
  healthRecOld: string;
  healthRecEmpty: string;

  // Session persistence
  sessionSettings: string;
  sessionTimeout: string;
  sessionDisabled: string;
  sessionMinutes: (n: number) => string;
  sessionHour: string;
  sessionActive: string;
  sessionExpires: string;
  sessionOff: string;
  sessionOneHourShort: string;
  sessionMinutesShort: (n: number) => string;

  // Hash Generator
  tabHash: string;
  hashTitle: string;
  hashDesc: string;
  hashInput: string;
  hashInputPlaceholder: string;
  hashUploadFile: string;
  hashFileLoaded: string;
  hashCharCount: string;
  hashByteCount: string;
  hashResults: string;
  hashDisclaimer2: string;

  // Import CSV
  csvTitle: string;
  csvDesc: string;
  csvSource: string;
  csvAutoDetect: string;
  csvSelectFile: string;
  csvFileHint: string;
  csvNoEntries: string;
  csvParseError: string;
  csvPreviewTitle: string;
  csvDetectedSource: string;
  csvTotalRows: string;
  csvImportable: string;
  csvSkipped: string;
  csvPreview: string;
  csvMore: string;
  csvImportButton: string;
  csvImportSuccess: (n: number) => string;
  vaultImportCsv: string;

  // Biometric
  biometricUnlock: string;
  biometricEnable: string;
  biometricDisable: string;
  biometricNotAvailable: string;
  biometricEnrolled: string;
  biometricPrompt: string;
  biometricError: string;
  biometricRegisterSuccess: string;
  biometricRemoved: string;

  // WiFi QR Code
  wifiTitle: string;
  wifiDesc: string;
  wifiSSID: string;
  wifiSSIDPlaceholder: string;
  wifiEncryption: string;
  wifiNoPassword: string;
  wifiPassword: string;
  wifiPasswordPlaceholder: string;
  wifiUseGenerated: string;
  wifiHidden: string;
  wifiDownload: string;
  wifiCopyString: string;
  wifiEnterBoth: string;
  wifiEnterSSID: string;

  // Password Map
  tabMap: string;
  mapTitle: string;
  mapDesc: string;
  mapEmpty: string;
  mapTotal: string;
  mapAvgScore: string;
  mapCritical: string;
  mapWeak: string;
  mapFair: string;
  mapStrong: string;
  mapExcellent: string;
  mapStrongCount: string;
  mapScore: string;
  mapLength: string;
  mapChars: string;
  mapUser: string;
  mapUrl: string;
  mapHint: string;

  // AI Password Analyzer
  tabAnalyzer: string;
  analyzerTitle: string;
  analyzerDesc: string;
  analyzerPlaceholder: string;
  analyzerButton: string;
  analyzerUseGenerated: string;
  analyzerScoreLabel: string;
  analyzerFindings: string;
  analyzerShort: string;
  analyzerShortDetail: (n: number) => string;
  analyzerMediumLength: string;
  analyzerMediumLengthDetail: string;
  analyzerGoodLength: string;
  analyzerGoodLengthDetail: (n: number) => string;
  analyzerCommon: string;
  analyzerCommonDetail: string;
  analyzerKeyboard: string;
  analyzerKeyboardDetail: (seq: string) => string;
  analyzerSequential: string;
  analyzerSequentialDetail: (seq: string) => string;
  analyzerRepeating: string;
  analyzerRepeatingDetail: (pat: string) => string;
  analyzerDate: string;
  analyzerDateDetail: string;
  analyzerDictionary: string;
  analyzerDictionaryDetail: (words: string) => string;
  analyzerNoMix: string;
  analyzerNoMixDetail: string;
  analyzerLowMix: string;
  analyzerLowMixDetail: string;
  analyzerGoodMix: string;
  analyzerGoodMixDetail: (n: number) => string;
  analyzerLowUnique: string;
  analyzerLowUniqueDetail: (pct: number) => string;
  analyzerLowEntropy: string;
  analyzerLowEntropyDetail: (val: string) => string;
  analyzerHighEntropy: string;
  analyzerHighEntropyDetail: (val: string) => string;
  analyzerOnlyDigits: string;
  analyzerOnlyDigitsDetail: string;

  // Audio Passphrase
  tabAudio: string;
  audioTitle: string;
  audioDesc: string;
  audioPlaceholder: string;
  audioPlay: string;
  audioStop: string;
  audioUseGenerated: string;
  audioScale: string;
  audioScalePentatonic: string;
  audioScaleMajor: string;
  audioScaleChromatic: string;
  audioTempo: string;
  audioVolume: string;
  audioVisualizer: string;
  audioExplain: string;

  // Account Settings
  accountTitle: string;
  accountProfile: string;
  accountEmail: string;
  accountEmailReadonly: string;
  accountDisplayName: string;
  accountDisplayNamePlaceholder: string;
  accountSaveError: string;
  accountInfo: string;
  accountMemberSince: string;
  accountLastLogin: string;
  accountEncryption: string;
  accountDangerZone: string;
  accountDeleteDesc: string;
  accountDeleteButton: string;
  accountDeleteWarning: string;
  accountDeleteSendCode: string;
  accountSendingCode: string;
  accountCodeSent: string;
  accountCodePlaceholder: string;
  accountCodeError: string;
  accountDeleteConfirm: string;
  accountDeleteError: string;
  accountNoAccessEmail: string;
  accountContactSupport: string;
  accountDeleting: string;
  accountButton: string;

  // Cloud Auth & Sync
  cloudTitle: string;
  cloudDesc: string;
  cloudLogin: string;
  cloudRegister: string;
  cloudEmail: string;
  cloudPassword: string;
  cloudConfirmPassword: string;
  cloudLoginButton: string;
  cloudRegisterButton: string;
  cloudLoading: string;
  cloudOr: string;
  cloudSkip: string;
  cloudCheckEmail: string;
  cloudAuthError: string;
  cloudPasswordMismatch: string;
  cloudPasswordTooShort: string;
  cloudZeroKnowledge: string;
  cloudSyncTitle: string;
  cloudUpload: string;
  cloudDownload: string;
  cloudLogout: string;
  cloudNoVault: string;
  cloudOffline: string;
  cloudOfflineDesc: string;
  cloudAutoSync: string;
  cloudLastSync: string;
  cloudSynced: string;
  cloudSyncError: string;
}

export const translations: Record<Language, Translations> = {
  ro: {
    // PasswordGenerator
    appTitle: 'PassGen',
    placeholderPassword: 'Apasă generate pentru a crea o parolă',
    placeholderPassphrase: 'Apasă generate pentru a crea o frază-parolă',
    copiedToClipboard: 'Copiat în clipboard!',
    shortcutHint: 'Scurtătură: Space generează · Ctrl/Cmd+C copiază',
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
    minEntropyTarget: 'Entropie minimă țintă',
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

    // Tabs
    tabGenerator: 'Generator',
    tabWifi: 'WiFi QR',
    tabVault: 'Seif',
    tabHealth: 'Sănătate',

    // Logout
    logout: 'Ieșire',

    // WelcomePage
    welcomeSubtitle: 'Generează parole sigure, rapid și simplu',
    welcomeFeatureStrong: 'Parole puternice',
    welcomeFeatureSecurity: 'Analiza securității',
    welcomeFeatureUsername: 'Generator username',
    welcomeFeatureVault: 'Seif criptat',
    welcomeStart: 'Începe',
    welcomeKeyboardHint: 'sau apasă',

    // MasterPasswordSetup
    setupTitle: 'Creează Parola Principală',
    setupSubtitle: 'Configurează parola principală pentru a-ți proteja seiful.',
    setupWarning: 'Această parolă nu poate fi recuperată. Dacă o uiți, vei pierde accesul la toate datele din seif.',
    setupMasterPassword: 'Parola principală',
    setupConfirm: 'Confirmă parola',
    setupReqLength: 'Minim 12 caractere',
    setupReqUppercase: 'Cel puțin o literă mare',
    setupReqLowercase: 'Cel puțin o literă mică',
    setupReqNumber: 'Cel puțin o cifră',
    setupReqSymbol: 'Cel puțin un simbol',
    setupMismatch: 'Parolele nu se potrivesc',
    setupButton: 'Creează Seiful',
    setupLoading: 'Se creează...',
    setupError: 'Eroare la crearea seifului. Încearcă din nou.',

    // UnlockScreen
    unlockSubtitle: 'Introdu parola principală pentru a debloca seiful.',
    unlockMasterPassword: 'Parola principală',
    unlockButton: 'Deblochează',
    unlockLoading: 'Se deblochează...',
    unlockWrongPassword: 'Parolă incorectă',
    unlockLockedOut: 'Prea multe încercări. Cont blocat temporar.',
    unlockLockedOutTimer: (s) => `Blocat. Reîncearcă în ${s}s`,
    unlockError: 'Eroare la deblocare. Încearcă din nou.',
    unlockForgot: 'Ai uitat parola?',
    unlockResetWarning: 'Resetarea va șterge toate datele din seif definitiv!',
    unlockResetConfirm: 'Resetează',
    unlockResetCancel: 'Anulează',

    // VaultView
    vaultTitle: 'Seiful Meu',
    vaultAdd: 'Adaugă',
    vaultSearchPlaceholder: 'Caută în seif...',
    vaultAllFolders: 'Toate',
    vaultFavorites: 'Favorite',
    vaultEmpty: 'Seiful este gol',
    vaultEmptyHint: 'Adaugă prima ta intrare apăsând butonul +',
    vaultNoResults: 'Niciun rezultat găsit',
    vaultTryDifferentSearch: 'Încearcă un alt termen de căutare',
    vaultConfirmDelete: 'Confirmă',
    vaultNewFolder: 'Folder nou',
    vaultFolderPlaceholder: 'Numele folderului...',
    vaultExport: 'Exportă seiful',
    vaultImport: 'Importă backup',
    vaultLock: 'Blochează seiful',
    vaultExportPasswordPrompt: 'Introdu o parolă pentru a cripta exportul:',
    vaultExportError: 'Eroare la exportul seifului.',
    vaultImportPasswordPrompt: 'Introdu parola de decriptare a backup-ului:',
    vaultImportSuccess: (n) => `${n} intrări importate cu succes!`,
    vaultImportError: 'Eroare la importul seifului.',

    // VaultEntryForm
    vaultFormAddTitle: 'Adaugă Intrare',
    vaultFormEditTitle: 'Editează Intrare',
    vaultFormTitle: 'Titlu',
    vaultFormTitlePlaceholder: 'ex. Gmail, Facebook...',
    vaultFormTitleRequired: 'Titlul este obligatoriu',
    vaultFormUrl: 'URL',
    vaultFormUsername: 'Username / Email',
    vaultFormUsernamePlaceholder: 'utilizator@exemplu.com',
    vaultFormPassword: 'Parolă',
    vaultFormGenerate: 'Generează',
    vaultFormFolder: 'Folder',
    vaultFormTags: 'Etichete',
    vaultFormTagsPlaceholder: 'email, social, muncă (separate prin virgulă)',
    vaultFormNotes: 'Notițe',
    vaultFormNotesPlaceholder: 'Notițe adiționale...',
    vaultFormSave: 'Salvează',
    vaultFormUpdate: 'Actualizează',
    vaultFormCancel: 'Anulează',
    vaultFormUrlPlaceholder: 'https://exemplu.com',

    // HealthDashboard
    healthTitle: 'Sănătatea Seifului',
    healthNoEntries: 'Nicio intrare în seif',
    healthNoEntriesHint: 'Adaugă intrări în seif pentru a analiza securitatea.',
    healthWeakPasswords: 'Parole slabe',
    healthReusedPasswords: 'Parole reutilizate',
    healthOldPasswords: 'Parole vechi',
    healthEmptyPasswords: 'Parole lipsă',
    healthGroups: 'grupuri',
    healthScoreDesc: (n) => `Bazat pe analiza a ${n} intrări`,
    healthRecommendations: 'Recomandări',
    healthRecWeak: 'Schimbă parolele slabe cu altele generate de PassGen.',
    healthRecReused: 'Folosește parole unice pentru fiecare cont.',
    healthRecOld: 'Actualizează parolele mai vechi de 90 de zile.',
    healthRecEmpty: 'Adaugă parole pentru intrările fără parolă.',

    // Session persistence
    sessionSettings: 'Sesiune',
    sessionTimeout: 'Păstrează deblocat',
    sessionDisabled: 'Dezactivat (se blochează la refresh)',
    sessionMinutes: (n: number) => `${n} minute`,
    sessionHour: '1 oră',
    sessionActive: 'Sesiune activă',
    sessionExpires: 'Expiră la',
    sessionOff: 'Oprit',
    sessionOneHourShort: '1h',
    sessionMinutesShort: (n: number) => `${n}m`,

    // Hash Generator
    tabHash: 'Hash',
    hashTitle: 'Generator Hash',
    hashDesc: 'Calculează hash-uri criptografice pentru orice text sau fișier.',
    hashInput: 'Text de intrare',
    hashInputPlaceholder: 'Introdu textul de hașurat...',
    hashUploadFile: 'Încarcă fișier',
    hashFileLoaded: 'Fișier încărcat',
    hashCharCount: 'Caractere',
    hashByteCount: 'Octeți',
    hashResults: 'Rezultate',
    hashDisclaimer2: 'Toate calculele sunt efectuate local în browser. Niciun dat nu părăsește dispozitivul tău.',

    // Import CSV
    csvTitle: 'Import CSV',
    csvDesc: 'Importă parole din alte managere de parole.',
    csvSource: 'Sursă',
    csvAutoDetect: 'Auto-detectare',
    csvSelectFile: 'Selectează fișierul CSV',
    csvFileHint: 'Acceptă .csv și .txt',
    csvNoEntries: 'Nu s-au găsit intrări valide în fișier.',
    csvParseError: 'Eroare la citirea fișierului.',
    csvPreviewTitle: 'Previzualizare import',
    csvDetectedSource: 'Sursă detectată',
    csvTotalRows: 'Total rânduri',
    csvImportable: 'Importabile',
    csvSkipped: 'Omise',
    csvPreview: 'Previzualizare',
    csvMore: 'altele',
    csvImportButton: 'Importă',
    csvImportSuccess: (n) => `${n} intrări importate din CSV cu succes!`,
    vaultImportCsv: 'Importă din CSV',

    // Biometric
    biometricUnlock: 'Deblochează cu biometric',
    biometricEnable: 'Activează deblocare biometrică',
    biometricDisable: 'Dezactivează biometric',
    biometricNotAvailable: 'Autentificarea biometrică nu este disponibilă pe acest dispozitiv.',
    biometricEnrolled: 'Biometric activat',
    biometricPrompt: 'Folosește amprenta sau Face ID pentru a debloca seiful.',
    biometricError: 'Autentificarea biometrică a eșuat.',
    biometricRegisterSuccess: 'Deblocare biometrică activată cu succes!',
    biometricRemoved: 'Deblocarea biometrică a fost dezactivată.',

    // WiFi QR Code
    wifiTitle: 'QR Code WiFi',
    wifiDesc: 'Generează un cod QR scanabil pentru conectarea rapidă la rețeaua WiFi.',
    wifiSSID: 'Numele rețelei (SSID)',
    wifiSSIDPlaceholder: 'ex: Casa_Mea_WiFi',
    wifiEncryption: 'Securitate',
    wifiNoPassword: 'Fără parolă',
    wifiPassword: 'Parola WiFi',
    wifiPasswordPlaceholder: 'Introdu parola rețelei',
    wifiUseGenerated: 'Folosește parola generată',
    wifiHidden: 'Rețea ascunsă',
    wifiDownload: 'Descarcă PNG',
    wifiCopyString: 'Copiază',
    wifiEnterBoth: 'Completează numele rețelei și parola pentru a genera codul QR.',
    wifiEnterSSID: 'Completează numele rețelei pentru a genera codul QR.',

    // Password Map
    tabMap: 'Hartă',
    mapTitle: 'Harta Parolelor',
    mapDesc: 'Vizualizare interactivă a securității parolelor din seif.',
    mapEmpty: 'Adaugă parole în seif pentru a vedea harta securității.',
    mapTotal: 'Total',
    mapAvgScore: 'Scor Mediu',
    mapCritical: 'Critic',
    mapWeak: 'Slab',
    mapFair: 'Acceptabil',
    mapStrong: 'Puternic',
    mapExcellent: 'Excelent',
    mapStrongCount: 'Puternice',
    mapScore: 'Scor securitate',
    mapLength: 'Lungime',
    mapChars: 'caractere',
    mapUser: 'Utilizator',
    mapUrl: 'URL',
    mapHint: 'Click pe un cerc pentru detalii. Cercurile mari = parole puternice.',

    // AI Password Analyzer
    tabAnalyzer: 'Analizator',
    analyzerTitle: 'Analizator AI Parole',
    analyzerDesc: 'Analiză inteligentă care explică de ce o parolă este slabă sau puternică.',
    analyzerPlaceholder: 'Introdu o parolă de analizat...',
    analyzerButton: 'Analizează',
    analyzerUseGenerated: '↑ Folosește parola generată',
    analyzerScoreLabel: 'Scor de securitate',
    analyzerFindings: 'Observații',
    analyzerShort: 'Parolă prea scurtă',
    analyzerShortDetail: (n) => `Doar ${n} caractere — minim recomandat: 12.`,
    analyzerMediumLength: 'Lungime acceptabilă',
    analyzerMediumLengthDetail: 'Parolă de 8-11 caractere. O parolă de 12+ este mult mai sigură.',
    analyzerGoodLength: 'Lungime excelentă',
    analyzerGoodLengthDetail: (n) => `${n} caractere — suficient pentru securitate ridicată.`,
    analyzerCommon: 'Parolă foarte comună!',
    analyzerCommonDetail: 'Această parolă apare în listele publice de parole sparte. Este ghicibilă instant.',
    analyzerKeyboard: 'Pattern de tastatură detectat',
    analyzerKeyboardDetail: (seq) => `Secvența "${seq}" urmează aranjamentul tastaturii — ușor de ghicit.`,
    analyzerSequential: 'Caractere secvențiale',
    analyzerSequentialDetail: (seq) => `Secvența "${seq}" este o serie consecutive — predictibilă.`,
    analyzerRepeating: 'Pattern repetitiv',
    analyzerRepeatingDetail: (pat) => `Patternul "${pat}" se repetă — reduce entropia reală.`,
    analyzerDate: 'Dată detectată',
    analyzerDateDetail: 'Parola pare să conțină o dată. Datele sunt ușor de ghicit (zile de naștere, aniversări).',
    analyzerDictionary: 'Cuvinte comune detectate',
    analyzerDictionaryDetail: (words) => `Cuvintele "${words}" sunt frecvente în dicționare de atacuri.`,
    analyzerNoMix: 'Un singur tip de caractere',
    analyzerNoMixDetail: 'Folosește doar un tip de caracter (litere SAU cifre). Combinația diversă crește securitatea exponențial.',
    analyzerLowMix: 'Diversitate limitată',
    analyzerLowMixDetail: 'Doar 2 tipuri de caractere. Adaugă simboluri sau cifre pentru mai multă complexitate.',
    analyzerGoodMix: 'Mix excelent de caractere',
    analyzerGoodMixDetail: (n) => `${n} tipuri diferite de caractere — complexitate bună.`,
    analyzerLowUnique: 'Puține caractere unice',
    analyzerLowUniqueDetail: (pct) => `Doar ${pct}% din caractere sunt unice — multe repetiții.`,
    analyzerLowEntropy: 'Entropie Shannon scăzută',
    analyzerLowEntropyDetail: (val) => `Entropia Shannon de ${val} bits/char indică predictibilitate ridicată.`,
    analyzerHighEntropy: 'Entropie Shannon ridicată',
    analyzerHighEntropyDetail: (val) => `Entropia Shannon de ${val} bits/char — distribuție excelentă.`,
    analyzerOnlyDigits: 'Doar cifre',
    analyzerOnlyDigitsDetail: 'O parolă formată doar din cifre este extrem de vulnerabilă la atacuri brute-force.',

    // Audio Passphrase
    tabAudio: 'Audio',
    audioTitle: 'Audio Passphrase',
    audioDesc: 'Transformă parola în melodie. Parolele puternice sună complex, cele slabe — monoton.',
    audioPlaceholder: 'Introdu o parolă de redat...',
    audioPlay: 'Redă',
    audioStop: 'Stop',
    audioUseGenerated: '↑ Folosește parola generată',
    audioScale: 'Scară muzicală',
    audioScalePentatonic: 'Pentatonică',
    audioScaleMajor: 'Major',
    audioScaleChromatic: 'Cromatică',
    audioTempo: 'Tempo',
    audioVolume: 'Volum',
    audioVisualizer: 'Vizualizator',
    audioExplain: 'Fiecare caracter produce o notă unică bazată pe codul ASCII. O parolă diversă generează o melodie variată, în timp ce una simplă sună repetitiv și monoton.',

    // Account Settings
    accountTitle: 'Contul Meu',
    accountProfile: 'Profil',
    accountEmail: 'Adresă email',
    accountEmailReadonly: 'Email-ul nu poate fi modificat.',
    accountDisplayName: 'Nume afișat',
    accountDisplayNamePlaceholder: 'Introdu un nume...',
    accountSaveError: 'Eroare la salvare. Încearcă din nou.',
    accountInfo: 'Informații cont',
    accountMemberSince: 'Membru din',
    accountLastLogin: 'Ultima autentificare',
    accountEncryption: 'Criptare',
    accountDangerZone: 'Zonă periculoasă',
    accountDeleteDesc: 'Ștergerea contului este permanentă. Toate datele din seif și cloud vor fi șterse definitiv.',
    accountDeleteButton: 'Șterge contul permanent',
    accountDeleteWarning: 'Ești sigur? Aceasta va șterge permanent contul, seiful din cloud și toate datele asociate. Acțiunea nu poate fi anulată.',
    accountDeleteSendCode: 'Trimite cod de verificare',
    accountSendingCode: 'Se trimite codul...',
    accountCodeSent: 'Un cod de verificare a fost trimis la',
    accountCodePlaceholder: '000000',
    accountCodeError: 'Nu s-a putut trimite codul. Încearcă din nou.',
    accountDeleteConfirm: 'Confirmă ștergerea',
    accountDeleteError: 'Eroare la ștergere. Încearcă din nou.',
    accountNoAccessEmail: 'Nu ai acces la email?',
    accountContactSupport: 'Dacă nu mai ai acces la email-ul asociat contului, contactează-ne la',
    accountDeleting: 'Se șterge contul...',
    accountButton: 'Cont',

    // Cloud Auth & Sync
    cloudTitle: 'PassGen Cloud',
    cloudDesc: 'Sincronizează-ți seiful criptat între dispozitive. Zero-knowledge — serverul nu vede niciodată parolele tale.',
    cloudLogin: 'Autentificare',
    cloudRegister: 'Înregistrare',
    cloudEmail: 'Adresă email',
    cloudPassword: 'Parolă cont cloud',
    cloudConfirmPassword: 'Confirmă parola',
    cloudLoginButton: 'Autentifică-te',
    cloudRegisterButton: 'Creează cont',
    cloudLoading: 'Se procesează...',
    cloudOr: 'sau',
    cloudSkip: 'Continuă fără cont cloud (mod offline)',
    cloudCheckEmail: 'Verifică email-ul pentru confirmarea contului.',
    cloudAuthError: 'Eroare de autentificare. Verifică datele introduse.',
    cloudPasswordMismatch: 'Parolele nu se potrivesc.',
    cloudPasswordTooShort: 'Parola trebuie să aibă minimum 6 caractere.',
    cloudZeroKnowledge: 'Criptare end-to-end: toate parolele sunt criptate local cu AES-256-GCM înainte de a fi trimise în cloud. Serverul stochează doar blob-uri criptate.',
    cloudSyncTitle: 'Sincronizare Cloud',
    cloudUpload: 'Încarcă seiful în cloud',
    cloudDownload: 'Descarcă seiful din cloud',
    cloudLogout: 'Deconectare cloud',
    cloudNoVault: 'Nu există un seif salvat în cloud.',
    cloudOffline: 'Offline',
    cloudOfflineDesc: 'Modul offline — datele sunt stocate doar local. Configurează Supabase pentru sincronizare cloud.',
    cloudAutoSync: 'Sincronizare automată',
    cloudLastSync: 'Ultima sincronizare',
    cloudSynced: 'Sincronizat',
    cloudSyncError: 'Eroare la sincronizare',

  },

  en: {
    // PasswordGenerator
    appTitle: 'PassGen',
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

    // Tabs
    tabGenerator: 'Generator',
    tabWifi: 'WiFi QR',
    tabVault: 'Vault',
    tabHealth: 'Health',

    // Logout
    logout: 'Logout',

    // WelcomePage
    welcomeSubtitle: 'Generate secure passwords, quickly and easily',
    welcomeFeatureStrong: 'Strong passwords',
    welcomeFeatureSecurity: 'Security analysis',
    welcomeFeatureUsername: 'Username generator',
    welcomeFeatureVault: 'Encrypted vault',
    welcomeStart: 'Start',
    welcomeKeyboardHint: 'or press',

    // MasterPasswordSetup
    setupTitle: 'Create Master Password',
    setupSubtitle: 'Set up your master password to protect your vault.',
    setupWarning: 'This password cannot be recovered. If you forget it, you will lose access to all vault data.',
    setupMasterPassword: 'Master password',
    setupConfirm: 'Confirm password',
    setupReqLength: 'At least 12 characters',
    setupReqUppercase: 'At least one uppercase letter',
    setupReqLowercase: 'At least one lowercase letter',
    setupReqNumber: 'At least one digit',
    setupReqSymbol: 'At least one symbol',
    setupMismatch: 'Passwords do not match',
    setupButton: 'Create Vault',
    setupLoading: 'Creating...',
    setupError: 'Error creating vault. Please try again.',

    // UnlockScreen
    unlockSubtitle: 'Enter your master password to unlock the vault.',
    unlockMasterPassword: 'Master password',
    unlockButton: 'Unlock',
    unlockLoading: 'Unlocking...',
    unlockWrongPassword: 'Wrong password',
    unlockLockedOut: 'Too many attempts. Temporarily locked.',
    unlockLockedOutTimer: (s) => `Locked. Retry in ${s}s`,
    unlockError: 'Error unlocking. Please try again.',
    unlockForgot: 'Forgot password?',
    unlockResetWarning: 'Resetting will permanently delete all vault data!',
    unlockResetConfirm: 'Reset',
    unlockResetCancel: 'Cancel',

    // VaultView
    vaultTitle: 'My Vault',
    vaultAdd: 'Add',
    vaultSearchPlaceholder: 'Search vault...',
    vaultAllFolders: 'All',
    vaultFavorites: 'Favorites',
    vaultEmpty: 'Vault is empty',
    vaultEmptyHint: 'Add your first entry using the + button',
    vaultNoResults: 'No results found',
    vaultTryDifferentSearch: 'Try a different search term',
    vaultConfirmDelete: 'Confirm',
    vaultNewFolder: 'New folder',
    vaultFolderPlaceholder: 'Folder name...',
    vaultExport: 'Export vault',
    vaultImport: 'Import backup',
    vaultLock: 'Lock vault',
    vaultExportPasswordPrompt: 'Enter a password to encrypt the export:',
    vaultExportError: 'Error exporting vault.',
    vaultImportPasswordPrompt: 'Enter the backup decryption password:',
    vaultImportSuccess: (n) => `${n} entries imported successfully!`,
    vaultImportError: 'Error importing vault.',

    // VaultEntryForm
    vaultFormAddTitle: 'Add Entry',
    vaultFormEditTitle: 'Edit Entry',
    vaultFormTitle: 'Title',
    vaultFormTitlePlaceholder: 'e.g. Gmail, Facebook...',
    vaultFormTitleRequired: 'Title is required',
    vaultFormUrl: 'URL',
    vaultFormUsername: 'Username / Email',
    vaultFormUsernamePlaceholder: 'user@example.com',
    vaultFormPassword: 'Password',
    vaultFormGenerate: 'Generate',
    vaultFormFolder: 'Folder',
    vaultFormTags: 'Tags',
    vaultFormTagsPlaceholder: 'email, social, work (comma separated)',
    vaultFormNotes: 'Notes',
    vaultFormNotesPlaceholder: 'Additional notes...',
    vaultFormSave: 'Save',
    vaultFormUpdate: 'Update',
    vaultFormCancel: 'Cancel',
    vaultFormUrlPlaceholder: 'https://example.com',

    // HealthDashboard
    healthTitle: 'Vault Health',
    healthNoEntries: 'No entries in vault',
    healthNoEntriesHint: 'Add entries to your vault to analyze security.',
    healthWeakPasswords: 'Weak passwords',
    healthReusedPasswords: 'Reused passwords',
    healthOldPasswords: 'Old passwords',
    healthEmptyPasswords: 'Missing passwords',
    healthGroups: 'groups',
    healthScoreDesc: (n) => `Based on analysis of ${n} entries`,
    healthRecommendations: 'Recommendations',
    healthRecWeak: 'Replace weak passwords with ones generated by PassGen.',
    healthRecReused: 'Use unique passwords for each account.',
    healthRecOld: 'Update passwords older than 90 days.',
    healthRecEmpty: 'Add passwords for entries without one.',

    // Session persistence
    sessionSettings: 'Session',
    sessionTimeout: 'Stay unlocked',
    sessionDisabled: 'Disabled (locks on refresh)',
    sessionMinutes: (n: number) => `${n} minutes`,
    sessionHour: '1 hour',
    sessionActive: 'Session active',
    sessionExpires: 'Expires at',
    sessionOff: 'Off',
    sessionOneHourShort: '1h',
    sessionMinutesShort: (n: number) => `${n}m`,

    // Hash Generator
    tabHash: 'Hash',
    hashTitle: 'Hash Generator',
    hashDesc: 'Compute cryptographic hashes for any text or file.',
    hashInput: 'Input text',
    hashInputPlaceholder: 'Enter text to hash...',
    hashUploadFile: 'Upload file',
    hashFileLoaded: 'File loaded',
    hashCharCount: 'Characters',
    hashByteCount: 'Bytes',
    hashResults: 'Results',
    hashDisclaimer2: 'All computations are performed locally in your browser. No data leaves your device.',

    // Import CSV
    csvTitle: 'Import CSV',
    csvDesc: 'Import passwords from other password managers.',
    csvSource: 'Source',
    csvAutoDetect: 'Auto-detect',
    csvSelectFile: 'Select CSV file',
    csvFileHint: 'Accepts .csv and .txt',
    csvNoEntries: 'No valid entries found in the file.',
    csvParseError: 'Error reading the file.',
    csvPreviewTitle: 'Import preview',
    csvDetectedSource: 'Detected source',
    csvTotalRows: 'Total rows',
    csvImportable: 'Importable',
    csvSkipped: 'Skipped',
    csvPreview: 'Preview',
    csvMore: 'more',
    csvImportButton: 'Import',
    csvImportSuccess: (n) => `${n} entries imported from CSV successfully!`,
    vaultImportCsv: 'Import from CSV',

    // Biometric
    biometricUnlock: 'Unlock with biometrics',
    biometricEnable: 'Enable biometric unlock',
    biometricDisable: 'Disable biometrics',
    biometricNotAvailable: 'Biometric authentication is not available on this device.',
    biometricEnrolled: 'Biometrics enabled',
    biometricPrompt: 'Use your fingerprint or Face ID to unlock the vault.',
    biometricError: 'Biometric authentication failed.',
    biometricRegisterSuccess: 'Biometric unlock enabled successfully!',
    biometricRemoved: 'Biometric unlock has been disabled.',

    // WiFi QR Code
    wifiTitle: 'WiFi QR Code',
    wifiDesc: 'Generate a scannable QR code to quickly connect to your WiFi network.',
    wifiSSID: 'Network Name (SSID)',
    wifiSSIDPlaceholder: 'e.g. My_Home_WiFi',
    wifiEncryption: 'Security',
    wifiNoPassword: 'No password',
    wifiPassword: 'WiFi Password',
    wifiPasswordPlaceholder: 'Enter network password',
    wifiUseGenerated: 'Use generated password',
    wifiHidden: 'Hidden network',
    wifiDownload: 'Download PNG',
    wifiCopyString: 'Copy',
    wifiEnterBoth: 'Enter network name and password to generate QR code.',
    wifiEnterSSID: 'Enter network name to generate QR code.',

    // Password Map
    tabMap: 'Map',
    mapTitle: 'Password Map',
    mapDesc: 'Interactive visualization of your vault password security.',
    mapEmpty: 'Add passwords to your vault to see the security map.',
    mapTotal: 'Total',
    mapAvgScore: 'Avg Score',
    mapCritical: 'Critical',
    mapWeak: 'Weak',
    mapFair: 'Fair',
    mapStrong: 'Strong',
    mapExcellent: 'Excellent',
    mapStrongCount: 'Strong',
    mapScore: 'Security score',
    mapLength: 'Length',
    mapChars: 'chars',
    mapUser: 'Username',
    mapUrl: 'URL',
    mapHint: 'Click a circle for details. Larger circles = stronger passwords.',

    // AI Password Analyzer
    tabAnalyzer: 'Analyzer',
    analyzerTitle: 'AI Password Analyzer',
    analyzerDesc: 'Smart analysis that explains why a password is weak or strong.',
    analyzerPlaceholder: 'Enter a password to analyze...',
    analyzerButton: 'Analyze',
    analyzerUseGenerated: '↑ Use generated password',
    analyzerScoreLabel: 'Security Score',
    analyzerFindings: 'Findings',
    analyzerShort: 'Password too short',
    analyzerShortDetail: (n) => `Only ${n} characters — minimum recommended: 12.`,
    analyzerMediumLength: 'Acceptable length',
    analyzerMediumLengthDetail: '8-11 character password. A 12+ character password is much more secure.',
    analyzerGoodLength: 'Excellent length',
    analyzerGoodLengthDetail: (n) => `${n} characters — sufficient for high security.`,
    analyzerCommon: 'Very common password!',
    analyzerCommonDetail: 'This password appears in public breach lists. It can be guessed instantly.',
    analyzerKeyboard: 'Keyboard pattern detected',
    analyzerKeyboardDetail: (seq) => `The sequence "${seq}" follows the keyboard layout — easy to guess.`,
    analyzerSequential: 'Sequential characters',
    analyzerSequentialDetail: (seq) => `The sequence "${seq}" is a consecutive series — predictable.`,
    analyzerRepeating: 'Repeating pattern',
    analyzerRepeatingDetail: (pat) => `The pattern "${pat}" repeats — reduces actual entropy.`,
    analyzerDate: 'Date detected',
    analyzerDateDetail: 'The password appears to contain a date. Dates are easy to guess (birthdays, anniversaries).',
    analyzerDictionary: 'Common words detected',
    analyzerDictionaryDetail: (words) => `The words "${words}" are common in attack dictionaries.`,
    analyzerNoMix: 'Single character type',
    analyzerNoMixDetail: 'Uses only one character type (letters OR digits). A diverse mix increases security exponentially.',
    analyzerLowMix: 'Limited diversity',
    analyzerLowMixDetail: 'Only 2 character types. Add symbols or digits for more complexity.',
    analyzerGoodMix: 'Excellent character mix',
    analyzerGoodMixDetail: (n) => `${n} different character types — good complexity.`,
    analyzerLowUnique: 'Few unique characters',
    analyzerLowUniqueDetail: (pct) => `Only ${pct}% of characters are unique — many repetitions.`,
    analyzerLowEntropy: 'Low Shannon entropy',
    analyzerLowEntropyDetail: (val) => `Shannon entropy of ${val} bits/char indicates high predictability.`,
    analyzerHighEntropy: 'High Shannon entropy',
    analyzerHighEntropyDetail: (val) => `Shannon entropy of ${val} bits/char — excellent distribution.`,
    analyzerOnlyDigits: 'Digits only',
    analyzerOnlyDigitsDetail: 'A password made of only digits is extremely vulnerable to brute-force attacks.',

    // Audio Passphrase
    tabAudio: 'Audio',
    audioTitle: 'Audio Passphrase',
    audioDesc: 'Turn your password into music. Strong passwords sound complex, weak ones — monotone.',
    audioPlaceholder: 'Enter a password to play...',
    audioPlay: 'Play',
    audioStop: 'Stop',
    audioUseGenerated: '↑ Use generated password',
    audioScale: 'Scale',
    audioScalePentatonic: 'Pentatonic',
    audioScaleMajor: 'Major',
    audioScaleChromatic: 'Chromatic',
    audioTempo: 'Tempo',
    audioVolume: 'Volume',
    audioVisualizer: 'Visualizer',
    audioExplain: 'Each character produces a unique note based on its ASCII code. A diverse password generates a varied melody, while a simple one sounds repetitive and monotone.',

    // Account Settings
    accountTitle: 'My Account',
    accountProfile: 'Profile',
    accountEmail: 'Email address',
    accountEmailReadonly: 'Email cannot be changed.',
    accountDisplayName: 'Display name',
    accountDisplayNamePlaceholder: 'Enter a name...',
    accountSaveError: 'Error saving. Please try again.',
    accountInfo: 'Account info',
    accountMemberSince: 'Member since',
    accountLastLogin: 'Last login',
    accountEncryption: 'Encryption',
    accountDangerZone: 'Danger zone',
    accountDeleteDesc: 'Account deletion is permanent. All vault and cloud data will be permanently erased.',
    accountDeleteButton: 'Delete account permanently',
    accountDeleteWarning: 'Are you sure? This will permanently delete your account, cloud vault, and all associated data. This action cannot be undone.',
    accountDeleteSendCode: 'Send verification code',
    accountSendingCode: 'Sending code...',
    accountCodeSent: 'A verification code has been sent to',
    accountCodePlaceholder: '000000',
    accountCodeError: 'Could not send code. Please try again.',
    accountDeleteConfirm: 'Confirm deletion',
    accountDeleteError: 'Error deleting. Please try again.',
    accountNoAccessEmail: 'Can\'t access your email?',
    accountContactSupport: 'If you no longer have access to the email associated with your account, contact us at',
    accountDeleting: 'Deleting account...',
    accountButton: 'Account',

    // Cloud Auth & Sync
    cloudTitle: 'PassGen Cloud',
    cloudDesc: 'Sync your encrypted vault across devices. Zero-knowledge — the server never sees your passwords.',
    cloudLogin: 'Login',
    cloudRegister: 'Register',
    cloudEmail: 'Email address',
    cloudPassword: 'Cloud account password',
    cloudConfirmPassword: 'Confirm password',
    cloudLoginButton: 'Sign In',
    cloudRegisterButton: 'Create Account',
    cloudLoading: 'Processing...',
    cloudOr: 'or',
    cloudSkip: 'Continue without cloud (offline mode)',
    cloudCheckEmail: 'Check your email to confirm your account.',
    cloudAuthError: 'Authentication error. Please check your credentials.',
    cloudPasswordMismatch: 'Passwords do not match.',
    cloudPasswordTooShort: 'Password must be at least 6 characters.',
    cloudZeroKnowledge: 'End-to-end encryption: all passwords are encrypted locally with AES-256-GCM before being sent to the cloud. The server only stores encrypted blobs.',
    cloudSyncTitle: 'Cloud Sync',
    cloudUpload: 'Upload vault to cloud',
    cloudDownload: 'Download vault from cloud',
    cloudLogout: 'Cloud logout',
    cloudNoVault: 'No vault found in the cloud.',
    cloudOffline: 'Offline',
    cloudOfflineDesc: 'Offline mode — data is stored locally only. Configure Supabase for cloud sync.',
    cloudAutoSync: 'Auto-sync',
    cloudLastSync: 'Last synced',
    cloudSynced: 'Synced',
    cloudSyncError: 'Sync error',

  },
};

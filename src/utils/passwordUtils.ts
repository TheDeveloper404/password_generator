export interface PasswordCharacterOptions {
  [key: string]: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: '-' | '_' | '.';
  capitalize: boolean;
  includeNumber: boolean;
}

export type GeneratorMode = 'password' | 'passphrase';

export interface GeneratorPreset {
  id: string;
  label: string;
  mode: GeneratorMode;
  length?: number;
  options?: PasswordCharacterOptions;
  passphraseOptions?: PassphraseOptions;
}

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const PASSPHRASE_WORDS = [
  'amber',
  'anchor',
  'apple',
  'atlas',
  'aurora',
  'autumn',
  'beacon',
  'berry',
  'breeze',
  'cedar',
  'cipher',
  'cloud',
  'cobalt',
  'comet',
  'coral',
  'cosmos',
  'crystal',
  'delta',
  'ember',
  'falcon',
  'fable',
  'forest',
  'galaxy',
  'garden',
  'glimmer',
  'harbor',
  'hazel',
  'horizon',
  'ivory',
  'jungle',
  'lagoon',
  'lantern',
  'lunar',
  'maple',
  'meadow',
  'meteor',
  'misty',
  'nebula',
  'oasis',
  'olive',
  'onyx',
  'opal',
  'orbit',
  'pearl',
  'phoenix',
  'pixel',
  'prairie',
  'pulse',
  'quartz',
  'raven',
  'river',
  'rocket',
  'saffron',
  'sierra',
  'silver',
  'solstice',
  'spark',
  'spirit',
  'summit',
  'sunset',
  'thunder',
  'timber',
  'topaz',
  'trail',
  'velvet',
  'violet',
  'voyage',
  'willow',
  'winter',
  'zephyr',
];

export const PASSWORD_PRESETS: GeneratorPreset[] = [
  {
    id: 'wifi',
    label: 'Wi-Fi',
    mode: 'password',
    length: 20,
    options: { uppercase: true, lowercase: true, numbers: true, symbols: true },
  },
  {
    id: 'banking',
    label: 'Cont bancar',
    mode: 'password',
    length: 24,
    options: { uppercase: true, lowercase: true, numbers: true, symbols: true },
  },
  {
    id: 'social',
    label: 'Social',
    mode: 'password',
    length: 14,
    options: { uppercase: true, lowercase: true, numbers: true, symbols: false },
  },
  {
    id: 'pin',
    label: 'PIN',
    mode: 'password',
    length: 6,
    options: { uppercase: false, lowercase: false, numbers: true, symbols: false },
  },
  {
    id: 'memorable',
    label: 'Memorabil',
    mode: 'passphrase',
    passphraseOptions: { wordCount: 4, separator: '-', capitalize: true, includeNumber: true },
  },
];

function getSecureRandomInt(max: number): number {
  if (max <= 0) {
    return 0;
  }

  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

function getRandomCharacter(charset: string): string {
  const randomIndex = getSecureRandomInt(charset.length);
  return charset[randomIndex];
}

function shuffleCharacters(values: string[]): string[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = getSecureRandomInt(index + 1);
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function normalizePasswordOptions(options: PasswordCharacterOptions): PasswordCharacterOptions {
  const hasSelectedCharset = Object.values(options).some(Boolean);
  if (hasSelectedCharset) {
    return options;
  }

  return { ...options, lowercase: true };
}

export function generatePassword(
  length: number,
  options: PasswordCharacterOptions
): string {
  const normalizedOptions = normalizePasswordOptions(options);
  let chars = '';
  const guaranteedCharacters: string[] = [];

  (Object.keys(normalizedOptions) as Array<keyof PasswordCharacterOptions>).forEach((key) => {
    if (normalizedOptions[key]) {
      chars += CHARS[key as keyof typeof CHARS];
      guaranteedCharacters.push(getRandomCharacter(CHARS[key as keyof typeof CHARS]));
    }
  });

  const minimumLength = guaranteedCharacters.length;
  const targetLength = Math.max(length, minimumLength);

  while (guaranteedCharacters.length < targetLength) {
    guaranteedCharacters.push(getRandomCharacter(chars));
  }

  const shuffledCharacters = shuffleCharacters(guaranteedCharacters);
  return shuffledCharacters.join('');
}

export function generatePassphrase(options: PassphraseOptions): string {
  const words: string[] = [];

  for (let index = 0; index < options.wordCount; index++) {
    const randomWord = PASSPHRASE_WORDS[getSecureRandomInt(PASSPHRASE_WORDS.length)];
    words.push(options.capitalize ? `${randomWord[0].toUpperCase()}${randomWord.slice(1)}` : randomWord);
  }

  let passphrase = words.join(options.separator);

  if (options.includeNumber) {
    passphrase += `${options.separator}${getSecureRandomInt(10)}${getSecureRandomInt(10)}`;
  }

  return passphrase;
}

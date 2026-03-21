import { describe, it, expect } from 'vitest';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';

describe('i18n translations', () => {
  const languages: Language[] = ['ro', 'en'];

  it('has translations for both ro and en', () => {
    expect(translations.ro).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('both languages have the same keys', () => {
    const roKeys = Object.keys(translations.ro).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(roKeys).toEqual(enKeys);
  });

  it('no translation value is empty string', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      Object.entries(t).forEach(([key, value]) => {
        if (typeof value === 'string') {
          expect(value.trim().length, `${lang}.${key} should not be empty`).toBeGreaterThan(0);
        }
      });
    });
  });

  it('function translations return strings', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      // Check function-type translations
      expect(typeof t.crackSeconds(5)).toBe('string');
      expect(typeof t.crackMinutes(10)).toBe('string');
      expect(typeof t.crackHours(2)).toBe('string');
      expect(typeof t.crackDays(30)).toBe('string');
      expect(typeof t.crackYears(100)).toBe('string');
      expect(typeof t.policyMinLength(12)).toBe('string');
      expect(typeof t.sessionMinutes(15)).toBe('string');
      expect(typeof t.healthScoreDesc(5)).toBe('string');
      // Analyzer function translations
      expect(typeof t.analyzerShortDetail(4)).toBe('string');
      expect(typeof t.analyzerGoodLengthDetail(16)).toBe('string');
      expect(typeof t.analyzerKeyboardDetail('qwerty')).toBe('string');
      expect(typeof t.analyzerSequentialDetail('abcd')).toBe('string');
      expect(typeof t.analyzerRepeatingDetail('ab')).toBe('string');
      expect(typeof t.analyzerDictionaryDetail('pass, word')).toBe('string');
      expect(typeof t.analyzerGoodMixDetail(4)).toBe('string');
      expect(typeof t.analyzerLowUniqueDetail(30)).toBe('string');
      expect(typeof t.analyzerLowEntropyDetail('2.5')).toBe('string');
      expect(typeof t.analyzerHighEntropyDetail('4.2')).toBe('string');
    });
  });

  it('has WiFi QR Code translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.wifiTitle).toBeDefined();
      expect(t.wifiDesc).toBeDefined();
      expect(t.wifiSSID).toBeDefined();
      expect(t.wifiSSIDPlaceholder).toBeDefined();
      expect(t.wifiEncryption).toBeDefined();
      expect(t.wifiNoPassword).toBeDefined();
      expect(t.wifiPassword).toBeDefined();
      expect(t.wifiPasswordPlaceholder).toBeDefined();
      expect(t.wifiUseGenerated).toBeDefined();
      expect(t.wifiHidden).toBeDefined();
      expect(t.wifiDownload).toBeDefined();
      expect(t.wifiCopyString).toBeDefined();
      expect(t.wifiEnterBoth).toBeDefined();
      expect(t.wifiEnterSSID).toBeDefined();
    });
  });

  it('has session persistence translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.sessionSettings).toBeDefined();
      expect(t.sessionTimeout).toBeDefined();
      expect(t.sessionDisabled).toBeDefined();
      expect(typeof t.sessionMinutes(5)).toBe('string');
      expect(t.sessionHour).toBeDefined();
      expect(t.sessionActive).toBeDefined();
      expect(t.sessionExpires).toBeDefined();
    });
  });

  it('has vault form translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.vaultTitle).toBeDefined();
      expect(t.vaultFormTitle).toBeDefined();
      expect(t.vaultFormUsername).toBeDefined();
      expect(t.vaultFormPassword).toBeDefined();
      expect(t.vaultFormUrl).toBeDefined();
      expect(t.vaultFormSave).toBeDefined();
      expect(t.vaultFormCancel).toBeDefined();
    });
  });

  it('has health dashboard translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.healthTitle).toBeDefined();
      expect(t.healthNoEntries).toBeDefined();
      expect(t.healthWeakPasswords).toBeDefined();
      expect(t.healthReusedPasswords).toBeDefined();
      expect(t.healthOldPasswords).toBeDefined();
    });
  });

  it('has password options translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.mode).toBeDefined();
      expect(t.password).toBeDefined();
      expect(t.passphrase).toBeDefined();
    });
  });

  it('has strength indicator translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.strengthLabel).toBeDefined();
      expect(t.veryWeak).toBeDefined();
      expect(t.weak).toBeDefined();
      expect(t.medium).toBeDefined();
      expect(t.strong).toBeDefined();
      expect(t.veryStrong).toBeDefined();
    });
  });

  it('Romanian translations are in Romanian', () => {
    const ro = translations.ro;
    // Check a few known Romanian translations
    expect(ro.generatePassword).toContain('Generează');
    expect(ro.copiedToClipboard).toContain('Copiat');
  });

  it('English translations are in English', () => {
    const en = translations.en;
    expect(en.generatePassword).toContain('Generate');
    expect(en.copiedToClipboard).toContain('Copied');
  });

  it('has Password Map translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.mapTitle).toBeDefined();
      expect(t.mapDesc).toBeDefined();
      expect(t.mapEmpty).toBeDefined();
      expect(t.mapTotal).toBeDefined();
      expect(t.mapAvgScore).toBeDefined();
      expect(t.mapCritical).toBeDefined();
      expect(t.mapWeak).toBeDefined();
      expect(t.mapFair).toBeDefined();
      expect(t.mapStrong).toBeDefined();
      expect(t.mapExcellent).toBeDefined();
      expect(t.mapStrongCount).toBeDefined();
      expect(t.mapScore).toBeDefined();
      expect(t.mapLength).toBeDefined();
      expect(t.mapChars).toBeDefined();
      expect(t.mapUser).toBeDefined();
      expect(t.mapHint).toBeDefined();
    });
  });

  it('has AI Password Analyzer translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.analyzerTitle).toBeDefined();
      expect(t.analyzerDesc).toBeDefined();
      expect(t.analyzerPlaceholder).toBeDefined();
      expect(t.analyzerButton).toBeDefined();
      expect(t.analyzerUseGenerated).toBeDefined();
      expect(t.analyzerScoreLabel).toBeDefined();
      expect(t.analyzerCommon).toBeDefined();
      expect(t.analyzerShort).toBeDefined();
      expect(t.analyzerKeyboard).toBeDefined();
      expect(t.analyzerSequential).toBeDefined();
      expect(t.analyzerRepeating).toBeDefined();
      expect(t.analyzerOnlyDigits).toBeDefined();
      expect(t.analyzerNoMix).toBeDefined();
      expect(t.analyzerGoodLength).toBeDefined();
      expect(t.analyzerGoodMix).toBeDefined();
      expect(t.analyzerDictionary).toBeDefined();
      expect(t.analyzerLowUnique).toBeDefined();
      expect(t.analyzerLowEntropy).toBeDefined();
      expect(t.analyzerHighEntropy).toBeDefined();
    });
  });

  it('has Audio Passphrase translations', () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.audioTitle).toBeDefined();
      expect(t.audioDesc).toBeDefined();
      expect(t.audioPlaceholder).toBeDefined();
      expect(t.audioPlay).toBeDefined();
      expect(t.audioStop).toBeDefined();
      expect(t.audioUseGenerated).toBeDefined();
      expect(t.audioScale).toBeDefined();
      expect(t.audioScalePentatonic).toBeDefined();
      expect(t.audioScaleMajor).toBeDefined();
      expect(t.audioScaleChromatic).toBeDefined();
      expect(t.audioTempo).toBeDefined();
      expect(t.audioVolume).toBeDefined();
      expect(t.audioVisualizer).toBeDefined();
      expect(t.audioExplain).toBeDefined();
    });
  });
});

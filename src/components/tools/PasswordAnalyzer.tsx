import { useState, useCallback, useMemo } from 'react';
import { Brain, Copy, AlertTriangle, CheckCircle, Info, ShieldAlert, Clock, Keyboard, Hash } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PasswordAnalyzerProps {
  darkMode: boolean;
  generatedPassword?: string;
}

interface Finding {
  type: 'critical' | 'warning' | 'info' | 'good';
  icon: typeof AlertTriangle;
  message: string;
  detail: string;
}

// Common password patterns & dictionaries
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', 'login', 'princess', 'football', 'shadow', 'sunshine', 'trustno1',
  'iloveyou', 'batman', 'access', 'hello', 'charlie', 'donald', 'password1',
  'qwerty123', 'letmein', 'welcome', 'admin', 'passw0rd', 'p@ssw0rd',
];

const KEYBOARD_ROWS = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '1234567890', '!@#$%^&*()',
  'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb', 'tgbyhn',
];

const LEET_MAP: Record<string, string> = {
  '4': 'a', '@': 'a', '8': 'b', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't',
};

const COMMON_WORDS = [
  'love', 'baby', 'angel', 'star', 'cool', 'pass', 'word', 'test',
  'user', 'name', 'mail', 'home', 'work', 'game', 'play', 'rock',
  'blue', 'free', 'wolf', 'dark', 'fire', 'king', 'gold', 'silver',
  'super', 'power', 'magic', 'ninja', 'hero', 'boss', 'hack',
  'computer', 'internet', 'secret', 'security', 'account',
];

const DATE_PATTERNS = [
  /\b(19|20)\d{2}\b/,           // Year like 1990, 2023
  /\b\d{2}[./-]\d{2}[./-]\d{2,4}\b/, // dd/mm/yy or similar
  /\b(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\b/, // MMDD
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
];

function deLeet(pw: string): string {
  return pw
    .split('')
    .map((c) => LEET_MAP[c] || c)
    .join('');
}

function hasKeyboardSequence(pw: string, minLen = 4): string | null {
  const lower = pw.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - minLen; i++) {
      const seq = row.substring(i, i + minLen);
      const rev = seq.split('').reverse().join('');
      if (lower.includes(seq)) return seq;
      if (lower.includes(rev)) return rev;
    }
  }
  return null;
}

function hasRepeatingPattern(pw: string): string | null {
  for (let patLen = 1; patLen <= Math.floor(pw.length / 2); patLen++) {
    const pattern = pw.substring(0, patLen);
    const repeated = pattern.repeat(Math.ceil(pw.length / patLen)).substring(0, pw.length);
    if (repeated === pw && pw.length > patLen) return pattern;
  }
  // Check character repetitions like aaaa or 1111
  const match = pw.match(/(.)\1{3,}/);
  if (match) return match[0];
  return null;
}

function hasSequentialChars(pw: string, minLen = 4): string | null {
  for (let i = 0; i <= pw.length - minLen; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 1; j < minLen; j++) {
      if (pw.charCodeAt(i + j) !== pw.charCodeAt(i + j - 1) + 1) ascending = false;
      if (pw.charCodeAt(i + j) !== pw.charCodeAt(i + j - 1) - 1) descending = false;
    }
    if (ascending || descending) return pw.substring(i, i + minLen);
  }
  return null;
}

function findCommonWords(pw: string): string[] {
  const lower = pw.toLowerCase();
  const deLeetLower = deLeet(lower);
  const found: string[] = [];

  for (const word of COMMON_WORDS) {
    if (lower.includes(word) || deLeetLower.includes(word)) {
      found.push(word);
    }
  }
  return found;
}

function hasDatePattern(pw: string): boolean {
  return DATE_PATTERNS.some((regex) => regex.test(pw));
}

function analyzeCharDistribution(pw: string): { entropy: number; uniqueRatio: number } {
  const charFreq = new Map<string, number>();
  for (const c of pw) {
    charFreq.set(c, (charFreq.get(c) || 0) + 1);
  }
  const uniqueRatio = charFreq.size / pw.length;

  // Shannon entropy
  let entropy = 0;
  for (const count of charFreq.values()) {
    const p = count / pw.length;
    entropy -= p * Math.log2(p);
  }
  return { entropy, uniqueRatio };
}

export default function PasswordAnalyzer({ darkMode, generatedPassword = '' }: PasswordAnalyzerProps) {
  const [input, setInput] = useState(generatedPassword);
  const [analyzed, setAnalyzed] = useState('');
  const { t } = useTranslation();

  const handleAnalyze = useCallback(() => {
    setAnalyzed(input);
  }, [input]);

  const handleUseGenerated = useCallback(() => {
    if (generatedPassword) {
      setInput(generatedPassword);
      setAnalyzed(generatedPassword);
    }
  }, [generatedPassword]);

  const findings = useMemo((): Finding[] => {
    if (!analyzed) return [];
    const results: Finding[] = [];
    const pw = analyzed;

    // 1. Length check
    if (pw.length < 8) {
      results.push({
        type: 'critical',
        icon: AlertTriangle,
        message: t.analyzerShort,
        detail: t.analyzerShortDetail(pw.length),
      });
    } else if (pw.length < 12) {
      results.push({
        type: 'warning',
        icon: Info,
        message: t.analyzerMediumLength,
        detail: t.analyzerMediumLengthDetail,
      });
    } else {
      results.push({
        type: 'good',
        icon: CheckCircle,
        message: t.analyzerGoodLength,
        detail: t.analyzerGoodLengthDetail(pw.length),
      });
    }

    // 2. Common password check
    const lower = pw.toLowerCase();
    const deLeetLower = deLeet(lower);
    if (COMMON_PASSWORDS.includes(lower) || COMMON_PASSWORDS.includes(deLeetLower)) {
      results.push({
        type: 'critical',
        icon: ShieldAlert,
        message: t.analyzerCommon,
        detail: t.analyzerCommonDetail,
      });
    }

    // 3. Keyboard pattern
    const kbSeq = hasKeyboardSequence(pw);
    if (kbSeq) {
      results.push({
        type: 'warning',
        icon: Keyboard,
        message: t.analyzerKeyboard,
        detail: t.analyzerKeyboardDetail(kbSeq),
      });
    }

    // 4. Sequential characters
    const seqChars = hasSequentialChars(pw);
    if (seqChars) {
      results.push({
        type: 'warning',
        icon: Hash,
        message: t.analyzerSequential,
        detail: t.analyzerSequentialDetail(seqChars),
      });
    }

    // 5. Repeating pattern
    const repeat = hasRepeatingPattern(pw);
    if (repeat) {
      results.push({
        type: 'warning',
        icon: Copy,
        message: t.analyzerRepeating,
        detail: t.analyzerRepeatingDetail(repeat),
      });
    }

    // 6. Date pattern
    if (hasDatePattern(pw)) {
      results.push({
        type: 'warning',
        icon: Clock,
        message: t.analyzerDate,
        detail: t.analyzerDateDetail,
      });
    }

    // 7. Common words via leet speak
    const words = findCommonWords(pw);
    if (words.length > 0) {
      results.push({
        type: 'warning',
        icon: Info,
        message: t.analyzerDictionary,
        detail: t.analyzerDictionaryDetail(words.join(', ')),
      });
    }

    // 8. Character diversity
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);
    const types = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

    if (types <= 1) {
      results.push({
        type: 'critical',
        icon: AlertTriangle,
        message: t.analyzerNoMix,
        detail: t.analyzerNoMixDetail,
      });
    } else if (types === 2) {
      results.push({
        type: 'warning',
        icon: Info,
        message: t.analyzerLowMix,
        detail: t.analyzerLowMixDetail,
      });
    } else if (types >= 3) {
      results.push({
        type: 'good',
        icon: CheckCircle,
        message: t.analyzerGoodMix,
        detail: t.analyzerGoodMixDetail(types),
      });
    }

    // 9. Character distribution / Shannon entropy
    const { entropy, uniqueRatio } = analyzeCharDistribution(pw);
    if (uniqueRatio < 0.5) {
      results.push({
        type: 'warning',
        icon: Info,
        message: t.analyzerLowUnique,
        detail: t.analyzerLowUniqueDetail(Math.round(uniqueRatio * 100)),
      });
    }
    if (entropy < 2.5 && pw.length > 4) {
      results.push({
        type: 'warning',
        icon: AlertTriangle,
        message: t.analyzerLowEntropy,
        detail: t.analyzerLowEntropyDetail(entropy.toFixed(2)),
      });
    } else if (entropy >= 3.5) {
      results.push({
        type: 'good',
        icon: CheckCircle,
        message: t.analyzerHighEntropy,
        detail: t.analyzerHighEntropyDetail(entropy.toFixed(2)),
      });
    }

    // 10. Only digits
    if (/^\d+$/.test(pw)) {
      results.push({
        type: 'critical',
        icon: ShieldAlert,
        message: t.analyzerOnlyDigits,
        detail: t.analyzerOnlyDigitsDetail,
      });
    }

    return results;
  }, [analyzed, t]);

  const overallScore = useMemo(() => {
    if (!findings.length) return 0;
    const criticals = findings.filter((f) => f.type === 'critical').length;
    const warnings = findings.filter((f) => f.type === 'warning').length;
    const goods = findings.filter((f) => f.type === 'good').length;
    const raw = Math.max(0, 100 - criticals * 30 - warnings * 10 + goods * 5);
    return Math.min(100, raw);
  }, [findings]);

  const scoreColor =
    overallScore >= 75 ? 'text-emerald-500' :
    overallScore >= 50 ? 'text-amber-500' :
    'text-red-500';

  const scoreBarColor =
    overallScore >= 75 ? 'from-emerald-500 to-cyan-500' :
    overallScore >= 50 ? 'from-amber-500 to-orange-500' :
    'from-red-500 to-pink-500';

  const typeColors: Record<Finding['type'], { bg: string; border: string; text: string; icon: string }> = {
    critical: {
      bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: darkMode ? 'border-red-500/20' : 'border-red-200',
      text: darkMode ? 'text-red-300' : 'text-red-700',
      icon: 'text-red-500',
    },
    warning: {
      bg: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: darkMode ? 'border-amber-500/20' : 'border-amber-200',
      text: darkMode ? 'text-amber-300' : 'text-amber-700',
      icon: 'text-amber-500',
    },
    info: {
      bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: darkMode ? 'border-blue-500/20' : 'border-blue-200',
      text: darkMode ? 'text-blue-300' : 'text-blue-700',
      icon: 'text-blue-500',
    },
    good: {
      bg: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: darkMode ? 'border-emerald-500/20' : 'border-emerald-200',
      text: darkMode ? 'text-emerald-300' : 'text-emerald-700',
      icon: 'text-emerald-500',
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Brain size={20} className="text-purple-500" />
          {t.analyzerTitle}
        </h2>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.analyzerDesc}
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className={`flex items-center rounded-xl overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder={t.analyzerPlaceholder}
            className={`flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-mono ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          <button
            onClick={handleAnalyze}
            disabled={!input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t.analyzerButton}
          </button>
        </div>
        {generatedPassword && (
          <button
            onClick={handleUseGenerated}
            className={`text-[11px] px-3 py-1 rounded-lg transition-all ${darkMode ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'}`}
          >
            {t.analyzerUseGenerated}
          </button>
        )}
      </div>

      {/* Results */}
      {analyzed && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Score */}
          <div className={`rounded-xl p-4 border text-center ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className={`text-4xl font-black ${scoreColor}`}>
              {overallScore}
            </div>
            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.analyzerScoreLabel}
            </div>
            <div className={`h-2 rounded-full mt-3 overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor} transition-all duration-700`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-2">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.analyzerFindings} ({findings.length})
            </h3>
            {findings.map((finding, idx) => {
              const colors = typeColors[finding.type];
              return (
                <div key={idx} className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-start gap-2">
                    <finding.icon size={15} className={`${colors.icon} mt-0.5 shrink-0`} />
                    <div>
                      <p className={`text-sm font-medium ${colors.text}`}>{finding.message}</p>
                      <p className={`text-xs mt-0.5 opacity-80 ${colors.text}`}>{finding.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

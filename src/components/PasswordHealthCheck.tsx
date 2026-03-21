import { useMemo, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateStrength } from '../utils/strengthUtils';
import { DEFAULT_POLICY, evaluatePolicy } from '../utils/policyUtils';
import { useTranslation } from '../contexts/LanguageContext';

interface PasswordHealthCheckProps {
  darkMode: boolean;
  generatedPassword: string;
}

interface BreachCheckResult {
  found: boolean;
  count: number;
}

async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();

  for (const line of text.split('\n')) {
    const [hashSuffix, count] = line.trim().split(':');
    if (hashSuffix === suffix) {
      return { found: true, count: parseInt(count, 10) };
    }
  }

  return { found: false, count: 0 };
}

export default function PasswordHealthCheck({ darkMode, generatedPassword }: PasswordHealthCheckProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [candidate, setCandidate] = useState('');
  const [breachResult, setBreachResult] = useState<BreachCheckResult | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachError, setBreachError] = useState<string | null>(null);

  const strength = useMemo(
    () =>
      calculateStrength(candidate, {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      }),
    [candidate]
  );

  const policy = useMemo(() => evaluatePolicy(candidate, DEFAULT_POLICY), [candidate]);

  const riskState = useMemo(() => {
    if (!candidate) return { color: 'gray', label: t.riskNA };
    if (strength.score <= 1 || (breachResult?.found && breachResult.count > 100))
      return { color: 'red', label: t.riskHigh };
    if (strength.score <= 2 || breachResult?.found)
      return { color: 'amber', label: t.riskMedium };
    return { color: 'green', label: t.riskLow };
  }, [candidate, strength.score, breachResult, t]);

  const onBreachCheck = async () => {
    if (!candidate) return;
    setIsCheckingBreach(true);
    setBreachError(null);
    try {
      const result = await checkPasswordBreach(candidate);
      setBreachResult(result);
    } catch {
      setBreachError(t.breachError);
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const riskColors: Record<string, string> = {
    gray: darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500',
    red: 'bg-red-500/10 text-red-500',
    amber: 'bg-amber-500/10 text-amber-500',
    green: 'bg-emerald-500/10 text-emerald-500',
  };

  return (
    <div className="space-y-3">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between py-1 group`}
      >
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-6 h-6 rounded-md ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <ShieldCheck size={13} className="text-blue-500" />
          </div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.healthCheckTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskColors[riskState.color]}`}>
            {riskState.label}
          </span>
          {expanded ? (
            <ChevronUp size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
          ) : (
            <ChevronDown size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
          )}
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="space-y-3">
          <p className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.healthCheckDesc}
          </p>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={candidate}
                onChange={(e) => {
                  setCandidate(e.target.value);
                  setBreachResult(null);
                  setBreachError(null);
                }}
                placeholder={t.passwordToCheckPlaceholder}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
              />
              {generatedPassword && (
                <button
                  onClick={() => {
                    setCandidate(generatedPassword);
                    setBreachResult(null);
                    setBreachError(null);
                  }}
                  className={`text-xs px-2.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                    darkMode
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.useGenerated}
                </button>
              )}
            </div>
          </div>

          {candidate && (
            <>
              {/* Metrics */}
              <div className={`grid grid-cols-2 gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div>
                  {t.strengthLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{strength.label}</span>
                </div>
                <div className="text-right">
                  {t.entropyLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{strength.entropy} bits</span>
                </div>
                <div>
                  {t.policyLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{policy.compliancePercent}%</span>
                </div>
                <div className="text-right">
                  {t.crackTimeLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{strength.crackTime}</span>
                </div>
              </div>

              {/* Breach check */}
              <button
                onClick={() => void onBreachCheck()}
                disabled={isCheckingBreach || !candidate}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCheckingBreach ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {t.checkBreach}
              </button>

              {breachResult && !breachResult.found && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <ShieldCheck size={13} /> {t.breachNotFound}
                </div>
              )}
              {breachResult?.found && (
                <div className="flex items-center gap-1.5 text-xs text-red-500">
                  <ShieldAlert size={13} /> {t.breachFound(breachResult.count.toLocaleString())}
                </div>
              )}
              {breachError && (
                <p className="text-xs text-amber-500">{breachError}</p>
              )}

              <p className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {t.hashDisclaimer}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

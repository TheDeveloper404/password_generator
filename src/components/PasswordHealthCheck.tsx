import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, Loader2, Search, Sparkles } from 'lucide-react';
import { calculateStrength } from '../utils/strengthUtils';
import { DEFAULT_POLICY, evaluatePolicy } from '../utils/policyUtils';
import { checkPasswordBreach, BreachCheckResult } from '../utils/breachUtils';
import { getLiveSecurityTips } from '../utils/securityTips';
import SecurityTips from './SecurityTips';

interface PasswordHealthCheckProps {
  darkMode: boolean;
  minEntropy: number;
  generatedPassword: string;
}

export default function PasswordHealthCheck({ darkMode, minEntropy, generatedPassword }: PasswordHealthCheckProps) {
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

  const tips = useMemo(
    () =>
      getLiveSecurityTips({
        password: candidate,
        strength,
        policy,
        minEntropy,
        breachCount: breachResult?.count,
      }),
    [candidate, strength, policy, minEntropy, breachResult?.count]
  );

  const riskState = useMemo(() => {
    if (!candidate) {
      return {
        label: 'N/A',
        dotClass: darkMode ? 'bg-gray-500' : 'bg-gray-400',
        badgeClass: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
      };
    }

    if (breachResult?.breached) {
      return {
        label: 'High Risk',
        dotClass: 'bg-red-500',
        badgeClass: darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      };
    }

    if (strength.score <= 1 || policy.compliancePercent < 60) {
      return {
        label: 'High Risk',
        dotClass: 'bg-red-500',
        badgeClass: darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      };
    }

    if (strength.score === 2 || policy.compliancePercent < 100) {
      return {
        label: 'Medium Risk',
        dotClass: 'bg-amber-500',
        badgeClass: darkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700',
      };
    }

    return {
      label: 'Low Risk',
      dotClass: 'bg-green-500',
      badgeClass: darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
    };
  }, [candidate, breachResult?.breached, darkMode, policy.compliancePercent, strength.score]);

  const onBreachCheck = async () => {
    if (!candidate || isCheckingBreach) {
      return;
    }

    try {
      setIsCheckingBreach(true);
      setBreachError(null);
      const result = await checkPasswordBreach(candidate);
      setBreachResult(result);
    } catch {
      setBreachResult(null);
      setBreachError('Nu am putut verifica acum. Încearcă din nou.');
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const applyGeneratedPassword = () => {
    if (!generatedPassword) {
      return;
    }

    setCandidate(generatedPassword);
    setBreachResult(null);
    setBreachError(null);
  };

  const onCandidateChange = (value: string) => {
    setCandidate(value);
    setBreachResult(null);
    setBreachError(null);
  };

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${darkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Password Health Check</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Analiză locală + breach check prin k-anonymity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${riskState.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskState.dotClass}`} />
            {riskState.label}
          </span>
          <button
            type="button"
            onClick={applyGeneratedPassword}
            disabled={!generatedPassword}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-200 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent'
            }`}
          >
            Use generated
          </button>
        </div>
      </div>

      <input
        type="password"
        value={candidate}
        onChange={(event) => onCandidateChange(event.target.value)}
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
        }`}
        placeholder="Introdu parola de verificat"
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Strength: <span className="font-semibold">{strength.label}</span>
        </div>
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Entropy: <span className="font-semibold">{strength.entropy} bits</span>
        </div>
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Policy: <span className="font-semibold">{policy.compliancePercent}%</span>
        </div>
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Crack time: <span className="font-semibold">{strength.crackTime}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void onBreachCheck()}
          disabled={!candidate || isCheckingBreach}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCheckingBreach ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Check breach
        </button>

        {breachResult && !breachResult.breached && (
          <span className="inline-flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 size={14} /> Not found in known breaches
          </span>
        )}

        {breachResult?.breached && (
          <span className="inline-flex items-center gap-1 text-xs text-red-500">
            <ShieldAlert size={14} /> Found {breachResult.count.toLocaleString()} times
          </span>
        )}

        {breachError && <span className="text-xs text-amber-500">{breachError}</span>}
      </div>

      <SecurityTips tips={tips} darkMode={darkMode} title="Security tips live" />

      <div className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1`}>
        <Sparkles size={12} /> Parola completă nu este trimisă; verificarea folosește doar prefix hash.
      </div>
    </div>
  );
}

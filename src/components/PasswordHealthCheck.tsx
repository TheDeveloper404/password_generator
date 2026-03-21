import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, Loader2, Search, Sparkles } from 'lucide-react';
import { calculateStrength } from '../utils/strengthUtils';
import { DEFAULT_POLICY, evaluatePolicy } from '../utils/policyUtils';
import { checkPasswordBreach, BreachCheckResult } from '../utils/breachUtils';
import { getLiveSecurityTips } from '../utils/securityTips';
import { checkPIIExposure } from '../utils/piiUtils';
import SecurityTips from './SecurityTips';

interface PasswordHealthCheckProps {
  darkMode: boolean;
  minEntropy: number;
  generatedPassword: string;
}

export default function PasswordHealthCheck({ darkMode, minEntropy, generatedPassword }: PasswordHealthCheckProps) {
  const [candidate, setCandidate] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileDomain, setProfileDomain] = useState('');
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

  const piiExposure = useMemo(
    () =>
      checkPIIExposure(candidate, {
        name: profileName,
        email: profileEmail,
        domain: profileDomain,
      }),
    [candidate, profileDomain, profileEmail, profileName]
  );

  const effectiveScore = useMemo(() => {
    if (!piiExposure.hasExposure) {
      return strength.score;
    }

    return Math.max(0, strength.score - 1);
  }, [piiExposure.hasExposure, strength.score]);

  const effectiveLabel = useMemo(() => {
    const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    return labels[effectiveScore] ?? labels[0];
  }, [effectiveScore]);

  const tips = useMemo(
    () =>
      getLiveSecurityTips({
        password: candidate,
        strength,
        policy,
        minEntropy,
        breachCount: breachResult?.count,
        piiExposure: piiExposure.hasExposure,
        piiMatches: piiExposure.matches,
      }),
    [candidate, strength, policy, minEntropy, breachResult?.count, piiExposure.hasExposure, piiExposure.matches]
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

    if (piiExposure.hasExposure || effectiveScore <= 1 || policy.compliancePercent < 60) {
      return {
        label: 'High Risk',
        dotClass: 'bg-red-500',
        badgeClass: darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      };
    }

    if (effectiveScore === 2 || policy.compliancePercent < 100) {
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
  }, [candidate, breachResult?.breached, darkMode, effectiveScore, piiExposure.hasExposure, policy.compliancePercent]);

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
    <div className={`rounded-xl border p-4 space-y-4 ${darkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Password Health Check</h3>
          <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Verifică securitatea unei parole: puterea, conformitatea cu politica și dacă a apărut în breșe de date cunoscute (via <span className="font-medium">Have I Been Pwned</span>, k-anonymity — parola nu este trimisă).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex min-w-24 justify-center items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${riskState.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskState.dotClass}`} />
            {riskState.label}
          </span>
          <button
            type="button"
            onClick={applyGeneratedPassword}
            disabled={!generatedPassword}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-200 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent'
            }`}
          >
            Use generated
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Parolă de verificat</label>
        <input
          type="password"
          value={candidate}
          onChange={(event) => onCandidateChange(event.target.value)}
          className={`w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Introdu parola de verificat"
        />
      </div>

      <div className="space-y-2">
        <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Username/PII context (opțional)
        </label>
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <input
          type="text"
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          className={`w-full rounded-md border px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Nume utilizator"
        />
        <input
          type="email"
          value={profileEmail}
          onChange={(event) => setProfileEmail(event.target.value)}
          className={`w-full rounded-md border px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Email"
        />
        <input
          type="text"
          value={profileDomain}
          onChange={(event) => setProfileDomain(event.target.value)}
          className={`w-full rounded-md border px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Domeniu (ex: company.com)"
        />
        </div>
      </div>

      {piiExposure.hasExposure && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          PII exposure detectat: {piiExposure.matches.slice(0, 3).join(', ')}. Parola a fost penalizată.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Strength: <span className="font-semibold">{effectiveLabel}</span>
        </div>
        <div className={`rounded-md px-3 py-2 group relative ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Entropy: <span className="font-semibold">{strength.entropy} bits</span>
          <div className={`absolute bottom-full left-0 mb-1.5 z-10 w-56 rounded-md border p-2.5 text-[11px] leading-relaxed shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
            <span className="font-semibold">Entropy</span> măsoară imprevizibilitatea parolei în biți. Cu cât valoarea e mai mare, cu atât parola e mai greu de spart. Minim recomandat: 60 biți.
          </div>
        </div>
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Policy: <span className="font-semibold">{policy.compliancePercent}%</span>
        </div>
        <div className={`rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          Crack time: <span className="font-semibold">{strength.crackTime}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => void onBreachCheck()}
          disabled={!candidate || isCheckingBreach}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
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

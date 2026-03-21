import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, Loader2, Search, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateStrength } from '../utils/strengthUtils';
import { DEFAULT_POLICY, evaluatePolicy } from '../utils/policyUtils';
import { checkPasswordBreach, BreachCheckResult } from '../utils/breachUtils';
import { getLiveSecurityTips } from '../utils/securityTips';
import { checkPIIExposure } from '../utils/piiUtils';
import { useTranslation } from '../contexts/LanguageContext';
import SecurityTips from './SecurityTips';

interface PasswordHealthCheckProps {
  darkMode: boolean;
  minEntropy: number;
  generatedPassword: string;
}

export default function PasswordHealthCheck({ darkMode, minEntropy, generatedPassword }: PasswordHealthCheckProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
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
      }, t),
    [candidate, t]
  );

  const policy = useMemo(() => evaluatePolicy(candidate, DEFAULT_POLICY, t), [candidate, t]);

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
    const labels = [t.veryWeak, t.weak, t.medium, t.strong, t.veryStrong];
    return labels[effectiveScore] ?? labels[0];
  }, [effectiveScore, t]);

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
        t,
      }),
    [candidate, strength, policy, minEntropy, breachResult?.count, piiExposure.hasExposure, piiExposure.matches, t]
  );

  const riskState = useMemo(() => {
    if (!candidate) {
      return {
        label: t.riskNA,
        dotClass: darkMode ? 'bg-gray-500' : 'bg-gray-400',
        badgeClass: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
      };
    }

    if (breachResult?.breached) {
      return {
        label: t.riskHigh,
        dotClass: 'bg-red-500',
        badgeClass: darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      };
    }

    if (piiExposure.hasExposure || effectiveScore <= 1 || policy.compliancePercent < 60) {
      return {
        label: t.riskHigh,
        dotClass: 'bg-red-500',
        badgeClass: darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      };
    }

    if (effectiveScore === 2 || policy.compliancePercent < 100) {
      return {
        label: t.riskMedium,
        dotClass: 'bg-amber-500',
        badgeClass: darkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700',
      };
    }

    return {
      label: t.riskLow,
      dotClass: 'bg-green-500',
      badgeClass: darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
    };
  }, [candidate, breachResult?.breached, darkMode, effectiveScore, piiExposure.hasExposure, policy.compliancePercent, t]);

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
      setBreachError(t.breachError);
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
    if (!expanded) setExpanded(true);
  };

  const onCandidateChange = (value: string) => {
    setCandidate(value);
    setBreachResult(null);
    setBreachError(null);
  };

  return (
    <div className={`rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white'}`}>
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 p-4 text-left rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.healthCheckTitle}</h3>
          <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.healthCheckDesc}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${riskState.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskState.dotClass}`} />
            {riskState.label}
          </span>
          {expanded ? (
            <ChevronUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          ) : (
            <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          )}
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex justify-end">
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
              {t.useGenerated}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.passwordToCheck}</label>
            <input
              type="password"
              value={candidate}
              onChange={(event) => onCandidateChange(event.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder={t.passwordToCheckPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.piiContextLabel}
            </label>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <input
                type="text"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className={`w-full rounded-md border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={t.piiNamePlaceholder}
              />
              <input
                type="email"
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                className={`w-full rounded-md border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={t.piiEmailPlaceholder}
              />
              <input
                type="text"
                value={profileDomain}
                onChange={(event) => setProfileDomain(event.target.value)}
                className={`w-full rounded-md border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={t.piiDomainPlaceholder}
              />
            </div>
          </div>

          {piiExposure.hasExposure && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {t.piiExposureDetected(piiExposure.matches.slice(0, 3).join(', '))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`rounded-md px-3 py-1.5 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              {t.strengthLabel}: <span className="font-semibold">{effectiveLabel}</span>
            </div>
            <div className={`rounded-md px-3 py-1.5 group relative ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              {t.entropyLabel}: <span className="font-semibold">{strength.entropy} bits</span>
              <div className={`absolute bottom-full left-0 mb-1.5 z-10 w-56 rounded-md border p-2.5 text-[11px] leading-relaxed shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
                {t.entropyTooltip}
              </div>
            </div>
            <div className={`rounded-md px-3 py-1.5 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              {t.policyLabel}: <span className="font-semibold">{policy.compliancePercent}%</span>
            </div>
            <div className={`rounded-md px-3 py-1.5 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
              {t.crackTimeLabel}: <span className="font-semibold">{strength.crackTime}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onBreachCheck()}
            disabled={!candidate || isCheckingBreach}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCheckingBreach ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {t.checkBreach}
          </button>

          {breachResult && !breachResult.breached && (
            <span className="inline-flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 size={14} /> {t.breachNotFound}
            </span>
          )}

          {breachResult?.breached && (
            <span className="inline-flex items-center gap-1 text-xs text-red-500">
              <ShieldAlert size={14} /> {t.breachFound(breachResult.count.toLocaleString())}
            </span>
          )}

          {breachError && <span className="text-xs text-amber-500">{breachError}</span>}

          <SecurityTips tips={tips} darkMode={darkMode} title={t.securityTipsTitle} />

          <div className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1`}>
            <Sparkles size={12} /> {t.hashDisclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

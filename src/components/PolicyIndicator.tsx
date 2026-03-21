import { PolicyResult } from '../utils/policyUtils';
import { useTranslation } from '../contexts/LanguageContext';

interface PolicyIndicatorProps {
  result: PolicyResult;
  darkMode: boolean;
}

export default function PolicyIndicator({ result, darkMode }: PolicyIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.policyCompliance}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            result.compliant ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {result.compliancePercent}%
        </span>
      </div>

      <div className={`w-full h-1.5 overflow-hidden rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${result.compliant ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${result.compliancePercent}%` }}
        />
      </div>

      <ul className="space-y-1">
        {result.checks.map((check) => (
          <li
            key={check.key}
            className={`flex items-center justify-between text-xs ${
              check.passed
                ? 'text-emerald-500'
                : darkMode
                  ? 'text-gray-500'
                  : 'text-gray-400'
            }`}
          >
            <span>{check.label}</span>
            <span className="text-[10px]">{check.passed ? '✓' : '○'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

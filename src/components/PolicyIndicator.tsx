import { PolicyResult } from '../utils/policyUtils';
import { useTranslation } from '../contexts/LanguageContext';

interface PolicyIndicatorProps {
  result: PolicyResult;
  darkMode: boolean;
}

export default function PolicyIndicator({ result, darkMode }: PolicyIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          {t.policyCompliance}
        </span>
        <span
          className={`text-sm font-semibold ${
            result.compliant ? 'text-green-500' : darkMode ? 'text-amber-300' : 'text-amber-600'
          }`}
        >
          {result.compliancePercent}%
        </span>
      </div>

      <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
        <div
          className={`h-full transition-all duration-300 ${result.compliant ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${result.compliancePercent}%` }}
        />
      </div>

      <ul className="space-y-1 text-xs">
        {result.checks.map((check) => (
          <li
            key={check.key}
            className={`flex items-center justify-between ${
              check.passed
                ? 'text-green-500'
                : darkMode
                  ? 'text-gray-300'
                  : 'text-gray-600'
            }`}
          >
            <span>{check.label}</span>
            <span>{check.passed ? '✓' : '•'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

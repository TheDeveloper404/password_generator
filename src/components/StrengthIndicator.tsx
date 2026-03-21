import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface StrengthIndicatorProps {
  strength: {
    score: number;
    label: string;
    entropy: number;
    crackTime: string;
  };
  darkMode: boolean;
}

export default function StrengthIndicator({ strength, darkMode }: StrengthIndicatorProps) {
  const { t } = useTranslation();

  const getColorClass = (score: number) => {
    const colors = {
      0: 'bg-red-500',
      1: 'bg-orange-500',
      2: 'bg-yellow-500',
      3: 'bg-emerald-500',
      4: 'bg-emerald-600',
    };
    return colors[score as keyof typeof colors] || colors[0];
  };

  const getGlowClass = (score: number) => {
    const glows = {
      0: 'shadow-red-500/20',
      1: 'shadow-orange-500/20',
      2: 'shadow-yellow-500/20',
      3: 'shadow-emerald-500/20',
      4: 'shadow-emerald-600/20',
    };
    return glows[score as keyof typeof glows] || glows[0];
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.passwordStrength}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            strength.score >= 3
              ? 'bg-emerald-500/10 text-emerald-500'
              : strength.score >= 2
                ? 'bg-yellow-500/10 text-yellow-600'
                : 'bg-red-500/10 text-red-500'
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className={`h-2 w-full rounded-full overflow-hidden shadow-sm ${getGlowClass(strength.score)} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full ${getColorClass(strength.score)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${(strength.score + 1) * 20}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.entropyLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{strength.entropy} {t.bits}</span>
        </div>
        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>
          {t.crackTimeLabel}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{strength.crackTime}</span>
        </div>
      </div>
    </div>
  );
}

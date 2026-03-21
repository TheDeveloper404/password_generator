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
      3: 'bg-green-500',
      4: 'bg-green-600',
    };
    return colors[score as keyof typeof colors] || colors[0];
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          {t.passwordStrength}
        </span>
        <span
          className={`text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass(strength.score)} transition-all duration-300`}
          style={{ width: `${(strength.score + 1) * 20}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t.entropyLabel}: <span className="font-semibold">{strength.entropy} bits</span>
        </div>
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-right`}>
          {t.crackTimeLabel}: <span className="font-semibold">{strength.crackTime}</span>
        </div>
      </div>
    </div>
  );
}

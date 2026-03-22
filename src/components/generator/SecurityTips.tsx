import { Lightbulb, ShieldAlert, Lock, Key, Eye, Fingerprint } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface SecurityTipsProps {
  darkMode: boolean;
}

export default function SecurityTips({ darkMode }: SecurityTipsProps) {
  const { t } = useTranslation();

  const tips = [
    { icon: Lock, text: t.tipUniquePasswords, color: 'text-blue-500' },
    { icon: Key, text: t.tipMinLength, color: 'text-purple-500' },
    { icon: ShieldAlert, text: t.tipNoPersonalInfo, color: 'text-red-500' },
    { icon: Eye, text: t.tipUseManager, color: 'text-emerald-500' },
    { icon: Fingerprint, text: t.tipEnable2FA, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <Lightbulb size={13} className="text-amber-500" />
        </div>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.securityTipsTitle}
        </h3>
      </div>

      <div className="space-y-2">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-xs transition-all ${
              darkMode ? 'bg-gray-700/30 text-gray-300' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <tip.icon size={14} className={`mt-0.5 shrink-0 ${tip.color}`} />
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

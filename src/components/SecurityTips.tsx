import { SecurityTip } from '../utils/securityTips';

interface SecurityTipsProps {
  tips: SecurityTip[];
  darkMode: boolean;
  title?: string;
}

const severityStyles: Record<SecurityTip['severity'], string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-blue-500',
  good: 'text-green-500',
};

export default function SecurityTips({ tips, darkMode, title = 'Security tips live' }: SecurityTipsProps) {
  return (
    <div className={`rounded-lg border p-3.5 space-y-2.5 ${darkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
      <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      <ul className="space-y-2 text-xs">
        {tips.map((tip) => (
          <li key={tip.id} className={`flex gap-2.5 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className={`${severityStyles[tip.severity]} mt-[1px]`}>•</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useMemo } from 'react';
import { Shield, AlertTriangle, Copy as CopyIcon, Clock, AlertCircle, KeyRound } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { VaultData } from '../../types/vault';
import { analyzeVaultHealth, getScoreInfo } from '../../services/healthService';

interface HealthDashboardProps {
  darkMode: boolean;
  vault: VaultData;
}

export default function HealthDashboard({ darkMode, vault }: HealthDashboardProps) {
  const { t, lang } = useTranslation();
  const report = useMemo(() => analyzeVaultHealth(vault), [vault]);
  const scoreInfo = getScoreInfo(report.securityScore);

  const reusedGroupCount = report.reusedPasswords.size;
  let reusedEntryCount = 0;
  for (const entries of report.reusedPasswords.values()) {
    reusedEntryCount += entries.length;
  }

  const issues = [
    {
      icon: AlertTriangle,
      label: t.healthWeakPasswords,
      count: report.weakPasswords.length,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      items: report.weakPasswords,
    },
    {
      icon: CopyIcon,
      label: t.healthReusedPasswords,
      count: reusedEntryCount,
      subtitle: reusedGroupCount > 0 ? `(${reusedGroupCount} ${t.healthGroups})` : undefined,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      items: [...report.reusedPasswords.values()].flat(),
    },
    {
      icon: Clock,
      label: t.healthOldPasswords,
      count: report.oldPasswords.length,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      items: report.oldPasswords,
    },
    {
      icon: AlertCircle,
      label: t.healthEmptyPasswords,
      count: report.emptyPasswords.length,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      items: report.emptyPasswords,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
          <Shield size={14} className="text-emerald-500" />
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t.healthTitle}
        </h2>
      </div>

      {report.totalEntries === 0 ? (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <KeyRound size={32} className="mb-3 opacity-20" />
          <p className="text-sm">{t.healthNoEntries}</p>
          <p className="text-xs mt-1 opacity-60">{t.healthNoEntriesHint}</p>
        </div>
      ) : (
        <>
          {/* Score circle */}
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Background circle */}
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42"
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${report.securityScore * 2.64} 264`}
                  className={`${scoreInfo.color} transition-all duration-1000`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${scoreInfo.color}`}>{report.securityScore}</span>
                <span className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-lg font-semibold ${scoreInfo.color}`}>
                {lang === 'ro' ? scoreInfo.label : scoreInfo.labelEn}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.healthScoreDesc(report.totalEntries)}
              </p>
            </div>
          </div>

          {/* Issues breakdown */}
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${darkMode ? 'bg-gray-800/30 border border-gray-700/30' : 'bg-gray-50 border border-gray-100'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${issue.bgColor}`}>
                  <issue.icon size={14} className={issue.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {issue.label}
                  </p>
                  {issue.count > 0 && (
                    <p className={`text-[10px] truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {issue.items.slice(0, 3).map((e) => e.title).join(', ')}
                      {issue.items.length > 3 && ` +${issue.items.length - 3}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${issue.count > 0 ? issue.color : darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
                    {issue.count}
                  </span>
                  {issue.subtitle && (
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {issue.subtitle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {report.securityScore < 100 && (
            <div className={`rounded-xl p-3 space-y-2 ${darkMode ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-blue-50 border border-blue-100'}`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {t.healthRecommendations}
              </p>
              <ul className={`text-[11px] space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {report.weakPasswords.length > 0 && <li>• {t.healthRecWeak}</li>}
                {reusedGroupCount > 0 && <li>• {t.healthRecReused}</li>}
                {report.oldPasswords.length > 0 && <li>• {t.healthRecOld}</li>}
                {report.emptyPasswords.length > 0 && <li>• {t.healthRecEmpty}</li>}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

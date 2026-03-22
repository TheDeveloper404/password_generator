import { useEffect, useState } from 'react';
import { Shield, ArrowRight, Lock, Key, Fingerprint } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface WelcomePageProps {
  onEnter: () => void;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-96 h-96 bg-blue-500/5 blur-3xl animate-pulse" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/3 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating icons */}
      <div className={`absolute top-[15%] left-[10%] transition-all duration-[2000ms] ${mounted ? 'opacity-20 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
        <Lock size={32} className="text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
      </div>
      <div className={`absolute top-[20%] right-[15%] transition-all duration-[2000ms] ${mounted ? 'opacity-20 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
        <Key size={28} className="text-purple-400 animate-bounce" style={{ animationDuration: '3.5s' }} />
      </div>
      <div className={`absolute bottom-[20%] left-[20%] transition-all duration-[2000ms] ${mounted ? 'opacity-20 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
        <Fingerprint size={36} className="text-pink-400 animate-bounce" style={{ animationDuration: '4s' }} />
      </div>

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center gap-8 px-6 text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        {/* Logo */}
        <div className={`relative transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 blur-2xl opacity-30 animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 shadow-2xl rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30">
            <Shield size={44} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <div className={`space-y-3 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-6xl font-black tracking-tight text-transparent sm:text-7xl bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            {t.appTitle}
          </h1>
          <p className="max-w-md text-lg font-light text-gray-400 sm:text-xl">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Features */}
        <div className={`flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[t.welcomeFeatureStrong, t.welcomeFeatureSecurity, t.welcomeFeatureUsername, t.welcomeFeatureVault].map((feature) => (
            <span
              key={feature}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-500 delay-700 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-[0.98] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {t.welcomeStart}
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>

        {/* Keyboard hint */}
        <p className={`text-xs text-gray-600 transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {t.welcomeKeyboardHint} <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-gray-400">Enter</kbd>
        </p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Wifi, Download, Copy, Check, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { useTranslation } from '../contexts/LanguageContext';

type EncryptionType = 'WPA' | 'WEP' | 'nopass';

interface WiFiQrCodeProps {
  darkMode: boolean;
  generatedPassword: string;
}

export default function WiFiQrCode({ darkMode, generatedPassword }: WiFiQrCodeProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<EncryptionType>('WPA');
  const [hidden, setHidden] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Escape special chars in WiFi QR string
  const escapeWifi = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/"/g, '\\"');

  const buildWifiString = useCallback(() => {
    const s = escapeWifi(ssid);
    const p = escapeWifi(password);
    const h = hidden ? 'H:true;' : '';
    if (encryption === 'nopass') {
      return `WIFI:T:nopass;S:${s};${h};`;
    }
    return `WIFI:T:${encryption};S:${s};P:${p};${h};`;
  }, [ssid, password, encryption, hidden]);

  const generateQR = useCallback(async () => {
    if (!ssid.trim()) return;
    if (encryption !== 'nopass' && !password.trim()) return;

    const wifiString = buildWifiString();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      await QRCode.toCanvas(canvas, wifiString, {
        width: 200,
        margin: 2,
        color: {
          dark: darkMode ? '#ffffff' : '#1f2937',
          light: darkMode ? '#1f2937' : '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setGenerated(true);
    } catch {
      setGenerated(false);
    }
  }, [ssid, password, encryption, darkMode, buildWifiString]);

  // Regenerate when inputs change and both fields are filled
  useEffect(() => {
    if (ssid.trim() && (encryption === 'nopass' || password.trim())) {
      void generateQR();
    } else {
      setGenerated(false);
    }
  }, [ssid, password, encryption, hidden, darkMode, generateQR]);

  const useGeneratedPassword = () => {
    if (generatedPassword) {
      setPassword(generatedPassword);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `wifi-${ssid || 'qrcode'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyString = async () => {
    const wifiString = buildWifiString();
    try {
      await navigator.clipboard.writeText(wifiString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const encryptionOptions: { value: EncryptionType; label: string }[] = [
    { value: 'WPA', label: 'WPA/WPA2/WPA3' },
    { value: 'WEP', label: 'WEP' },
    { value: 'nopass', label: t.wifiNoPassword },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center justify-center w-6 h-6 rounded-md ${darkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
          <Wifi size={13} className="text-cyan-500" />
        </div>
        <h2 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t.wifiTitle}
        </h2>
      </div>

      <p className={`text-[11px] mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {t.wifiDesc}
      </p>

      {/* SSID */}
      <div className="space-y-2.5">
        <div>
          <label className={`text-[11px] font-medium mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.wifiSSID}
          </label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder={t.wifiSSIDPlaceholder}
            className={`w-full px-3 py-2 rounded-lg text-xs transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500`}
          />
        </div>

        {/* Encryption */}
        <div>
          <label className={`text-[11px] font-medium mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.wifiEncryption}
          </label>
          <div className="flex gap-1">
            {encryptionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEncryption(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  encryption === opt.value
                    ? 'bg-cyan-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        {encryption !== 'nopass' && (
          <div>
            <label className={`text-[11px] font-medium mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.wifiPassword}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.wifiPasswordPlaceholder}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500`}
              />
              {generatedPassword && (
                <button
                  onClick={useGeneratedPassword}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${darkMode ? 'bg-gray-800 text-cyan-400 hover:bg-gray-700' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'}`}
                  title={t.wifiUseGenerated}
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden network */}
        <label className={`flex items-center gap-2 text-[11px] cursor-pointer select-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={() => setHidden(!hidden)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
          />
          {t.wifiHidden}
        </label>
      </div>

      {/* QR Code Output */}
      <div className="flex flex-col items-center mt-4">
        <div
          className={`rounded-xl p-3 transition-all ${
            generated
              ? darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
              : 'opacity-0 h-0 overflow-hidden p-0'
          }`}
        >
          <canvas ref={canvasRef} />
        </div>

        {generated && (
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Download size={12} />
              {t.wifiDownload}
            </button>
            <button
              onClick={() => void handleCopyString()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? t.copiedToClipboard : t.wifiCopyString}
            </button>
          </div>
        )}

        {!generated && ssid.trim() && (
          <p className={`text-[10px] mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {encryption !== 'nopass' ? t.wifiEnterBoth : t.wifiEnterSSID}
          </p>
        )}
      </div>
    </div>
  );
}

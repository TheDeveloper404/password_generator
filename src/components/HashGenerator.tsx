import { useCallback, useState } from 'react';
import { Copy, Hash, Check } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface HashGeneratorProps {
  darkMode: boolean;
}

/* ── MD5 implementation (RFC 1321) ─────────────────────────────────── */

function md5(input: string): string {
  function add(a: number, b: number) {
    const l = (a & 0xffff) + (b & 0xffff);
    const h = (a >> 16) + (b >> 16) + (l >> 16);
    return (h << 16) | (l & 0xffff);
  }
  function rol(n: number, c: number) {
    return (n << c) | (n >>> (32 - c));
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add(rol(add(add(a, q), add(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (input.charCodeAt(++i) & 0x3ff));
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }

  const n = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = n * 8;
  bytes.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff);
  bytes.push(0, 0, 0, 0);

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const x: number[] = [];
    for (let j = 0; j < 16; j++) {
      x[j] =
        bytes[i + j * 4] |
        (bytes[i + j * 4 + 1] << 8) |
        (bytes[i + j * 4 + 2] << 16) |
        (bytes[i + j * 4 + 3] << 24);
    }

    const aa = a, bb = b, cc = c, dd = d;

    a = ff(a, b, c, d, x[0], 7, 0xd76aa478);   d = ff(d, a, b, c, x[1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, x[2], 17, 0x242070db);   b = ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[4], 7, 0xf57c0faf);    d = ff(d, a, b, c, x[5], 12, 0x4787c62a);
    c = ff(c, d, a, b, x[6], 17, 0xa8304613);   b = ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[8], 7, 0x698098d8);    d = ff(d, a, b, c, x[9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, x[10], 17, 0xffff5bb1);  b = ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[12], 7, 0x6b901122);   d = ff(d, a, b, c, x[13], 12, 0xfd987193);
    c = ff(c, d, a, b, x[14], 17, 0xa679438e);  b = ff(b, c, d, a, x[15], 22, 0x49b40821);

    a = gg(a, b, c, d, x[1], 5, 0xf61e2562);    d = gg(d, a, b, c, x[6], 9, 0xc040b340);
    c = gg(c, d, a, b, x[11], 14, 0x265e5a51);  b = gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[5], 5, 0xd62f105d);    d = gg(d, a, b, c, x[10], 9, 0x02441453);
    c = gg(c, d, a, b, x[15], 14, 0xd8a1e681);  b = gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[9], 5, 0x21e1cde6);    d = gg(d, a, b, c, x[14], 9, 0xc33707d6);
    c = gg(c, d, a, b, x[3], 14, 0xf4d50d87);   b = gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[13], 5, 0xa9e3e905);   d = gg(d, a, b, c, x[2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, x[7], 14, 0x676f02d9);   b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[5], 4, 0xfffa3942);    d = hh(d, a, b, c, x[8], 11, 0x8771f681);
    c = hh(c, d, a, b, x[11], 16, 0x6d9d6122);  b = hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[1], 4, 0xa4beea44);    d = hh(d, a, b, c, x[4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, x[7], 16, 0xf6bb4b60);   b = hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[13], 4, 0x289b7ec6);   d = hh(d, a, b, c, x[0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, x[3], 16, 0xd4ef3085);   b = hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[9], 4, 0xd9d4d039);    d = hh(d, a, b, c, x[12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8);  b = hh(b, c, d, a, x[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, x[0], 6, 0xf4292244);    d = ii(d, a, b, c, x[7], 10, 0x432aff97);
    c = ii(c, d, a, b, x[14], 15, 0xab9423a7);  b = ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[12], 6, 0x655b59c3);   d = ii(d, a, b, c, x[3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, x[10], 15, 0xffeff47d);  b = ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[8], 6, 0x6fa87e4f);    d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[6], 15, 0xa3014314);   b = ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[4], 6, 0xf7537e82);    d = ii(d, a, b, c, x[11], 10, 0xbd3af235);
    c = ii(c, d, a, b, x[2], 15, 0x2ad7d2bb);   b = ii(b, c, d, a, x[9], 21, 0xeb86d391);

    a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
  }

  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, i) => ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0')).join('');

  return hex(a) + hex(b) + hex(c) + hex(d);
}

/* ── Web Crypto SHA hashing ──────────────────────────────────────── */

async function sha(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── Hash algorithms config ──────────────────────────────────────── */

interface HashAlgo {
  id: string;
  label: string;
  bits: number;
  compute: (input: string) => Promise<string>;
}

const ALGORITHMS: HashAlgo[] = [
  { id: 'md5', label: 'MD5', bits: 128, compute: async (s) => md5(s) },
  { id: 'sha1', label: 'SHA-1', bits: 160, compute: (s) => sha('SHA-1', s) },
  { id: 'sha256', label: 'SHA-256', bits: 256, compute: (s) => sha('SHA-256', s) },
  { id: 'sha384', label: 'SHA-384', bits: 384, compute: (s) => sha('SHA-384', s) },
  { id: 'sha512', label: 'SHA-512', bits: 512, compute: (s) => sha('SHA-512', s) },
];

/* ── Component ───────────────────────────────────────────────────── */

export default function HashGenerator({ darkMode }: HashGeneratorProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFile, setIsFile] = useState(false);

  const computeAll = useCallback(async (text: string) => {
    if (!text) {
      setHashes({});
      return;
    }
    const results: Record<string, string> = {};
    await Promise.all(
      ALGORITHMS.map(async (algo) => {
        results[algo.id] = await algo.compute(text);
      })
    );
    setHashes(results);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    setIsFile(false);
    void computeAll(value);
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setInput(text.length > 10000 ? `[${t.hashFileLoaded}: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]` : text);
    setIsFile(true);
    void computeAll(text);
  };

  const handleCopy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
          <Hash size={20} className="text-purple-500" />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.hashTitle}
          </h2>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.hashDesc}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t.hashInput}
          </label>
          <label
            className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              darkMode
                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.hashUploadFile}
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          readOnly={isFile}
          placeholder={t.hashInputPlaceholder}
          rows={4}
          className={`w-full rounded-xl border px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
            darkMode
              ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-500'
              : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
          }`}
        />
        {input && (
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.hashCharCount}: {input.length} | {t.hashByteCount}: {new TextEncoder().encode(input).length}
          </div>
        )}
      </div>

      {/* Hash results */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t.hashResults}
          </h3>
          {ALGORITHMS.map((algo) => {
            const value = hashes[algo.id];
            if (!value) return null;
            return (
              <div
                key={algo.id}
                className={`rounded-xl p-3 transition-all ${
                  darkMode ? 'bg-gray-700/30 border border-gray-700/50' : 'bg-gray-50 border border-gray-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {algo.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                      {algo.bits} {t.bits}
                    </span>
                  </div>
                  <button
                    onClick={() => void handleCopy(algo.id, value)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                      copiedId === algo.id
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : darkMode
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {copiedId === algo.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === algo.id ? t.copiedToClipboard : t.copy}
                  </button>
                </div>
                <p className={`font-mono text-xs break-all leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Info disclaimer */}
      <p className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {t.hashDisclaimer2}
      </p>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square, Music } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface AudioPassphraseProps {
  darkMode: boolean;
  generatedPassword?: string;
}

// Musical scales
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0]; // C D E G A
const CHROMATIC = [
  261.63, 277.18, 293.66, 311.13, 329.63, 349.23,
  369.99, 392.0, 415.3, 440.0, 466.16, 493.88,
];
const MAJOR = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88]; // C major

type Scale = 'pentatonic' | 'chromatic' | 'major';

const SCALES: Record<Scale, number[]> = {
  pentatonic: PENTATONIC,
  chromatic: CHROMATIC,
  major: MAJOR,
};

function charToFrequency(char: string, scale: number[]): number {
  const code = char.charCodeAt(0);
  const idx = code % scale.length;
  const octaveShift = Math.floor((code % 36) / scale.length);
  return scale[idx] * Math.pow(2, octaveShift);
}

function charToWaveform(char: string): OscillatorType {
  const code = char.charCodeAt(0);
  const types: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
  return types[code % types.length];
}

function charToColor(char: string): string {
  const code = char.charCodeAt(0);
  const hue = (code * 37) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

export default function AudioPassphrase({ darkMode, generatedPassword = '' }: AudioPassphraseProps) {
  const [input, setInput] = useState(generatedPassword);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [scale, setScale] = useState<Scale>('pentatonic');
  const [tempo, setTempo] = useState(120); // BPM
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const cancelRef = useRef(false);
  const { t } = useTranslation();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  const playNote = useCallback(
    (ctx: AudioContext, freq: number, waveform: OscillatorType, startTime: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, startTime);

      // ADSR envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02); // Attack
      gain.gain.exponentialRampToValueAtTime(vol * 0.7, startTime + duration * 0.3); // Decay
      gain.gain.setValueAtTime(vol * 0.7, startTime + duration * 0.7); // Sustain
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    },
    []
  );

  const handlePlay = useCallback(async () => {
    if (!input || isPlaying) return;

    cancelRef.current = false;
    setIsPlaying(true);

    // Create AudioContext with low-latency hint for mobile
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ latencyHint: 'interactive' });
    audioCtxRef.current = ctx;

    // Mobile browsers (iOS Safari, Chrome Android) require explicit resume()
    // within a user gesture handler. Also play a silent buffer to "unlock" audio.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play a silent buffer to fully unlock audio on iOS Safari
    const silentBuffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const silentSource = ctx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(ctx.destination);
    silentSource.start(0);

    const noteDuration = 60 / tempo; // seconds per beat
    const scaleNotes = SCALES[scale];

    for (let i = 0; i < input.length; i++) {
      if (cancelRef.current) break;

      // Re-check suspended state (can happen on iOS when tab goes background)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const char = input[i];
      const freq = charToFrequency(char, scaleNotes);
      const waveform = charToWaveform(char);
      const startTime = ctx.currentTime + 0.05;

      playNote(ctx, freq, waveform, startTime, noteDuration * 0.8, volume);

      setCurrentIndex(i);

      // Wait for note duration
      await new Promise<void>((resolve) => {
        setTimeout(resolve, noteDuration * 1000);
      });
    }

    setIsPlaying(false);
    setCurrentIndex(-1);
    await ctx.close();
    audioCtxRef.current = null;
  }, [input, isPlaying, scale, tempo, volume, playNote]);

  const handleStop = useCallback(() => {
    cancelRef.current = true;
    setIsPlaying(false);
    setCurrentIndex(-1);
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  const handleUseGenerated = useCallback(() => {
    if (generatedPassword) {
      setInput(generatedPassword);
    }
  }, [generatedPassword]);

  // Visualizer bars data
  const bars = input.split('').map((char, idx) => {
    const scaleNotes = SCALES[scale];
    const freq = charToFrequency(char, scaleNotes);
    const normalizedHeight = Math.min(100, (freq / 1200) * 100);
    const color = charToColor(char);
    const isActive = idx === currentIndex;
    return { char, height: normalizedHeight, color, isActive, freq };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Music size={20} className="text-pink-500" />
          {t.audioTitle}
        </h2>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.audioDesc}
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className={`flex items-center rounded-xl overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.audioPlaceholder}
            className={`flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-mono ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          {isPlaying ? (
            <button
              onClick={handleStop}
              className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-semibold hover:from-red-600 hover:to-orange-700 transition-all flex items-center gap-1.5"
            >
              <Square size={12} />
              {t.audioStop}
            </button>
          ) : (
            <button
              onClick={() => void handlePlay()}
              disabled={!input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Play size={12} />
              {t.audioPlay}
            </button>
          )}
        </div>
        {generatedPassword && (
          <button
            onClick={handleUseGenerated}
            className={`text-[11px] px-3 py-1 rounded-lg transition-all ${darkMode ? 'text-pink-400 hover:bg-pink-500/10' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            {t.audioUseGenerated}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-3">
        {/* Scale */}
        <div>
          <label className={`text-[10px] font-medium block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.audioScale}
          </label>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as Scale)}
            className={`w-full rounded-lg px-2 py-1.5 text-xs border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
          >
            <option value="pentatonic">{t.audioScalePentatonic}</option>
            <option value="major">{t.audioScaleMajor}</option>
            <option value="chromatic">{t.audioScaleChromatic}</option>
          </select>
        </div>

        {/* Tempo */}
        <div>
          <label className={`text-[10px] font-medium block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.audioTempo}: {tempo} BPM
          </label>
          <input
            type="range"
            min={60}
            max={240}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* Volume */}
        <div>
          <label className={`text-[10px] font-medium flex items-center gap-1 mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {volume > 0 ? <Volume2 size={10} /> : <VolumeX size={10} />}
            {t.audioVolume}: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>

      {/* Visualizer */}
      {input && (
        <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.audioVisualizer}
          </h3>

          {/* Bars */}
          <div className="flex items-end gap-0.5 h-32 overflow-x-auto pb-1">
            {bars.map((bar, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center min-w-[14px] transition-all duration-150"
              >
                <div
                  className={`w-3 rounded-t-sm transition-all duration-150 ${bar.isActive ? 'animate-pulse' : ''}`}
                  style={{
                    height: `${bar.height}%`,
                    backgroundColor: bar.color,
                    boxShadow: bar.isActive ? `0 0 12px ${bar.color}` : 'none',
                    opacity: bar.isActive ? 1 : 0.6,
                    transform: bar.isActive ? 'scaleY(1.2)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                  }}
                />
                <span
                  className="text-[8px] mt-1 font-mono"
                  style={{
                    color: bar.isActive ? bar.color : darkMode ? '#6b7280' : '#9ca3af',
                    fontWeight: bar.isActive ? 700 : 400,
                  }}
                >
                  {bar.char}
                </span>
              </div>
            ))}
          </div>

          {/* Currently playing info */}
          {isPlaying && currentIndex >= 0 && currentIndex < bars.length && (
            <div className={`mt-3 pt-3 border-t flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: bars[currentIndex].color }}
                />
                <span className={`text-xs font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  &apos;{bars[currentIndex].char}&apos;
                </span>
              </div>
              <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {Math.round(bars[currentIndex].freq)} Hz • {currentIndex + 1}/{input.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className={`rounded-xl p-3 border text-xs ${darkMode ? 'bg-gray-800/30 border-gray-700/50 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p>{t.audioExplain}</p>
      </div>
    </div>
  );
}

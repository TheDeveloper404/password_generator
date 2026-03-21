import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../utils/i18n';
import AudioPassphrase from '../components/AudioPassphrase';

// Mock Web Audio API
const mockOscillator = {
  type: 'sine' as OscillatorType,
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

function renderWithLanguage(ui: React.ReactElement, lang: 'ro' | 'en' = 'en') {
  return render(
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: () => {} }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('AudioPassphrase Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
  });

  it('renders the component title', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(translations.en.audioTitle)).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(translations.en.audioDesc)).toBeInTheDocument();
  });

  it('renders password input with placeholder', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByPlaceholderText(translations.en.audioPlaceholder)).toBeInTheDocument();
  });

  it('renders play button', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(translations.en.audioPlay)).toBeInTheDocument();
  });

  it('play button is disabled when input is empty', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    const btn = screen.getByText(translations.en.audioPlay);
    expect(btn).toBeDisabled();
  });

  it('play button is enabled when input has text', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.audioPlaceholder);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByText(translations.en.audioPlay)).not.toBeDisabled();
  });

  it('shows "use generated" button when generatedPassword is provided', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} generatedPassword="MyP@ss!" />);
    expect(screen.getByText(translations.en.audioUseGenerated)).toBeInTheDocument();
  });

  it('does not show "use generated" button when generatedPassword is empty', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} generatedPassword="" />);
    expect(screen.queryByText(translations.en.audioUseGenerated)).not.toBeInTheDocument();
  });

  it('fills input when "use generated" is clicked', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} generatedPassword="Gen3r@ted" />);
    fireEvent.click(screen.getByText(translations.en.audioUseGenerated));
    const input = screen.getByPlaceholderText(translations.en.audioPlaceholder) as HTMLInputElement;
    expect(input.value).toBe('Gen3r@ted');
  });

  it('renders scale selector with options', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(translations.en.audioScalePentatonic)).toBeInTheDocument();
    expect(screen.getByText(translations.en.audioScaleMajor)).toBeInTheDocument();
    expect(screen.getByText(translations.en.audioScaleChromatic)).toBeInTheDocument();
  });

  it('renders tempo control', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(/120 BPM/)).toBeInTheDocument();
  });

  it('renders volume control', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('shows visualizer bars when input has text', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.audioPlaceholder);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.getByText(translations.en.audioVisualizer)).toBeInTheDocument();
  });

  it('hides visualizer when input is empty', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.queryByText(translations.en.audioVisualizer)).not.toBeInTheDocument();
  });

  it('renders explanation text', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />);
    expect(screen.getByText(translations.en.audioExplain)).toBeInTheDocument();
  });

  it('renders in Romanian', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} />, 'ro');
    expect(screen.getByText(translations.ro.audioTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.ro.audioPlay)).toBeInTheDocument();
  });

  it('works in dark mode', () => {
    renderWithLanguage(<AudioPassphrase darkMode={true} />);
    expect(screen.getByText(translations.en.audioTitle)).toBeInTheDocument();
  });

  it('initializes input with generatedPassword prop', () => {
    renderWithLanguage(<AudioPassphrase darkMode={false} generatedPassword="InitPass" />);
    const input = screen.getByPlaceholderText(translations.en.audioPlaceholder) as HTMLInputElement;
    expect(input.value).toBe('InitPass');
  });
});

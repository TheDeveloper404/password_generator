import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../utils/i18n';
import PasswordAnalyzer from '../components/tools/PasswordAnalyzer';

function renderWithLanguage(ui: React.ReactElement, lang: 'ro' | 'en' = 'en') {
  return render(
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: () => {} }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('PasswordAnalyzer Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component title', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    expect(screen.getByText(translations.en.analyzerTitle)).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    expect(screen.getByText(translations.en.analyzerDesc)).toBeInTheDocument();
  });

  it('renders input field with placeholder', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    expect(screen.getByPlaceholderText(translations.en.analyzerPlaceholder)).toBeInTheDocument();
  });

  it('renders analyze button', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    expect(screen.getByText(translations.en.analyzerButton)).toBeInTheDocument();
  });

  it('analyze button is disabled when input is empty', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const btn = screen.getByText(translations.en.analyzerButton);
    expect(btn).toBeDisabled();
  });

  it('analyze button is enabled when input has text', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'test123' } });
    const btn = screen.getByText(translations.en.analyzerButton);
    expect(btn).not.toBeDisabled();
  });

  it('shows "use generated" button when generatedPassword is provided', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} generatedPassword="MyP@ss123!" />);
    expect(screen.getByText(translations.en.analyzerUseGenerated)).toBeInTheDocument();
  });

  it('does not show "use generated" button when generatedPassword is empty', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} generatedPassword="" />);
    expect(screen.queryByText(translations.en.analyzerUseGenerated)).not.toBeInTheDocument();
  });

  it('shows findings after analyzing a short password', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerShort)).toBeInTheDocument();
  });

  it('detects common password "password"', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'password' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerCommon)).toBeInTheDocument();
  });

  it('detects keyboard pattern "qwerty"', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'qwertyTest1!' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerKeyboard)).toBeInTheDocument();
  });

  it('detects sequential characters "abcd"', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'abcdefTest1!' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerSequential)).toBeInTheDocument();
  });

  it('detects repeating pattern "abab"', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'abababab' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerRepeating)).toBeInTheDocument();
  });

  it('detects only-digits password', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: '123456789012' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerOnlyDigits)).toBeInTheDocument();
  });

  it('shows score after analysis', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerScoreLabel)).toBeInTheDocument();
  });

  it('shows findings count', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(/Findings/)).toBeInTheDocument();
  });

  it('recognizes good length password', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />);
    const input = screen.getByPlaceholderText(translations.en.analyzerPlaceholder);
    fireEvent.change(input, { target: { value: 'X9$kL2m!pQ7@wR4n' } });
    fireEvent.click(screen.getByText(translations.en.analyzerButton));
    expect(screen.getByText(translations.en.analyzerGoodLength)).toBeInTheDocument();
  });

  it('renders in Romanian', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} />, 'ro');
    expect(screen.getByText(translations.ro.analyzerTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.ro.analyzerButton)).toBeInTheDocument();
  });

  it('works in dark mode', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={true} />);
    expect(screen.getByText(translations.en.analyzerTitle)).toBeInTheDocument();
  });

  it('uses generated password when button clicked', () => {
    renderWithLanguage(<PasswordAnalyzer darkMode={false} generatedPassword="Gen3r@ted!Pass" />);
    fireEvent.click(screen.getByText(translations.en.analyzerUseGenerated));
    // After clicking, analysis should run and show results
    expect(screen.getByText(translations.en.analyzerScoreLabel)).toBeInTheDocument();
  });
});

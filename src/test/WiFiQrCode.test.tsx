import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../utils/i18n';
import WiFiQrCode from '../components/tools/WiFiQrCode';

// Helper to render with LanguageContext
function renderWithLanguage(ui: React.ReactElement, lang: 'ro' | 'en' = 'en') {
  return render(
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: () => {} }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('WiFiQrCode Component', () => {
  it('renders the component title', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByText(translations.en.wifiTitle)).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByText(translations.en.wifiDesc)).toBeInTheDocument();
  });

  it('renders SSID input', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByPlaceholderText(translations.en.wifiSSIDPlaceholder)).toBeInTheDocument();
  });

  it('renders encryption options', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByText('WPA/WPA2/WPA3')).toBeInTheDocument();
    expect(screen.getByText('WEP')).toBeInTheDocument();
    expect(screen.getByText(translations.en.wifiNoPassword)).toBeInTheDocument();
  });

  it('renders password input when encryption is not "nopass"', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByPlaceholderText(translations.en.wifiPasswordPlaceholder)).toBeInTheDocument();
  });

  it('hides password input when "No password" is selected', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    fireEvent.click(screen.getByText(translations.en.wifiNoPassword));
    expect(screen.queryByPlaceholderText(translations.en.wifiPasswordPlaceholder)).not.toBeInTheDocument();
  });

  it('renders hidden network checkbox', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.getByText(translations.en.wifiHidden)).toBeInTheDocument();
  });

  it('shows "use generated" button when generatedPassword is provided', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="MyP@ssw0rd!" />);
    expect(screen.getByTitle(translations.en.wifiUseGenerated)).toBeInTheDocument();
  });

  it('does not show "use generated" button when generatedPassword is empty', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    expect(screen.queryByTitle(translations.en.wifiUseGenerated)).not.toBeInTheDocument();
  });

  it('allows typing in SSID field', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    const ssidInput = screen.getByPlaceholderText(translations.en.wifiSSIDPlaceholder);
    fireEvent.change(ssidInput, { target: { value: 'MyNetwork' } });
    expect(ssidInput).toHaveValue('MyNetwork');
  });

  it('allows typing in password field', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    const pwdInput = screen.getByPlaceholderText(translations.en.wifiPasswordPlaceholder);
    fireEvent.change(pwdInput, { target: { value: 'secret123' } });
    expect(pwdInput).toHaveValue('secret123');
  });

  it('switches encryption type on button click', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    const wepButton = screen.getByText('WEP');
    fireEvent.click(wepButton);
    // WEP should now be the active (cyan) button
    expect(wepButton.className).toContain('bg-cyan-500');
  });

  it('toggles hidden network checkbox', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('renders in dark mode without errors', () => {
    renderWithLanguage(<WiFiQrCode darkMode={true} generatedPassword="test" />);
    expect(screen.getByText(translations.en.wifiTitle)).toBeInTheDocument();
  });

  it('renders in Romanian without errors', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="" />, 'ro');
    expect(screen.getByText(translations.ro.wifiTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.ro.wifiDesc)).toBeInTheDocument();
  });

  it('fills password from generated password when button is clicked', () => {
    renderWithLanguage(<WiFiQrCode darkMode={false} generatedPassword="Generated!123" />);
    const useGenBtn = screen.getByTitle(translations.en.wifiUseGenerated);
    fireEvent.click(useGenBtn);
    const pwdInput = screen.getByPlaceholderText(translations.en.wifiPasswordPlaceholder);
    expect(pwdInput).toHaveValue('Generated!123');
  });
});

import { useCallback, useEffect, useState } from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import WelcomePage from './components/WelcomePage';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);

  const handleEnter = useCallback(() => {
    setTransitioning(true);
    setWelcomeVisible(false);
    setTimeout(() => {
      setShowWelcome(false);
    }, 700);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showWelcome && e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showWelcome, handleEnter]);

  return (
    <>
      {showWelcome && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-700 ease-in-out ${
            welcomeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        >
          <WelcomePage onEnter={handleEnter} />
        </div>
      )}
      <div
        className={`transition-all duration-700 ease-out ${
          showWelcome && !transitioning
            ? 'opacity-0 scale-95'
            : transitioning
              ? 'opacity-100 scale-100'
              : 'opacity-100 scale-100'
        }`}
      >
        <PasswordGenerator />
      </div>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const phrases = [
  'Gestiona tu negocio con inteligencia',
  'Control total de inventario en tiempo real',
  'Ventas rápidas y eficientes',
  'Reportes detallados al instante',
  'La mejor solución como tu punto de venta'
];

export const LandingPage = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setFadeIn(false);
      
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setFadeIn(true);
      }, 300);
    }, 1500);

    const redirectTimer = setTimeout(() => {
      navigate('/login');
    }, phrases.length * 1500 + 500);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="logo-container">
          <div >
            <img src="/logoposcrumen.svg" alt="" className="logo-svg" />
          </div>
          <h1 className="logo-text">POS Crumen</h1>
        </div>

        <div className={`phrase-container ${fadeIn ? 'fade-in' : 'fade-out'}`}>
          <p className="animated-phrase">{phrases[currentPhrase]}</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

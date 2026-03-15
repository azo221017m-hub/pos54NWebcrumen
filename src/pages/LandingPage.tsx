import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const phrases = [
  'Únete a Comunidad Digital de Texcoco.',
  'Más Negocios cerca de ti.',
  'Negocio y Clientes de Texcoco.',
  'Mejor Experiencia de Compra-Venta en CRUMENCDT.',
  'Beneficios para Clientes y Negocios de CRUMENCDT.'
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
      navigate('/clientes');
    }, phrases.length * 1500 + 500);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      <div className="landing-content">
        <div className="logo-container">
          <div >
            <img src="/logoposcrumen.svg" alt="" className="logo-svg" />
          </div>
        </div>

        <div className={`phrase-container ${fadeIn ? 'fade-in' : 'fade-out'}`}>
          <p className="animated-phrase">{phrases[currentPhrase]}</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

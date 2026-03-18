import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import config from '../config/api.config';

type ServerStatus = 'waiting' | 'loading' | 'active';

const STATUS_INFO: Record<ServerStatus, { emoji: string; text: string }> = {
  waiting: { emoji: '😴', text: 'Servidor de la Comunidad en espera' },
  loading: { emoji: '👁️', text: 'Monitoreando CDT...' },
  active:  { emoji: '✅', text: 'Comunidad lista' },
};

const phrases = [
  'Únete a Comunidad Digital de Texcoco.',
  'Más Negocios cerca de ti.',
  'Negocio y Clientes de Texcoco.',
  'Mejor Experiencia de Compra-Venta en CRUMENCDT.',
  'Beneficios para Clientes y Negocios de CRUMENCDT.'
];

const PING_INTERVAL_MS = 3000;
const ACTIVE_DISPLAY_MS = 1200;
const REQUEST_TIMEOUT_MS = 5000;

export const LandingPage = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('waiting');
  const navigate = useNavigate();
  const cancelledRef = useRef(false);

  // Phrase rotation
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setFadeIn(true);
      }, 300);
    }, 1500);

    return () => clearInterval(phraseInterval);
  }, []);

  // Backend ping to wake up / activate the server
  useEffect(() => {
    cancelledRef.current = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const pingBackend = async () => {
      if (cancelledRef.current) return;
      setServerStatus('loading');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const response = await fetch(`${config.apiUrl}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!cancelledRef.current && response.ok) {
          setServerStatus('active');
          retryTimeout = setTimeout(() => {
            if (!cancelledRef.current) navigate('/clientes');
          }, ACTIVE_DISPLAY_MS);
          return;
        }
      } catch {
        // Server not ready yet; will retry
      }
      if (!cancelledRef.current) {
        retryTimeout = setTimeout(pingBackend, PING_INTERVAL_MS);
      }
    };

    pingBackend();

    return () => {
      cancelledRef.current = true;
      clearTimeout(retryTimeout);
    };
  }, [navigate]);

  const { emoji, text } = STATUS_INFO[serverStatus];

  return (
    <div className="landing-page">
      <div className="server-status-badge" data-status={serverStatus}>
        <span className="server-status-emoji">{emoji}</span>
        <span className="server-status-text">{text}</span>
      </div>
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

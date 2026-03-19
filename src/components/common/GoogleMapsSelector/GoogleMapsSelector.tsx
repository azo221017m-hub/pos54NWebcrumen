import React, { useState } from 'react';
import './GoogleMapsSelector.css';

const GEOLOCATION_TIMEOUT_MS = 10000;

interface GoogleMapsSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

const GoogleMapsSelector: React.FC<GoogleMapsSelectorProps> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string>('');

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const embed = `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed`;
        setEmbedUrl(embed);
        onChange(googleMapsUrl);
        setLoading(false);
      },
      (err) => {
        setError(`No se pudo obtener la ubicación: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS }
    );
  };

  const handleClear = () => {
    setEmbedUrl('');
    setError(null);
    onChange('');
  };

  return (
    <div className="gms-container">
      {!embedUrl ? (
        <div className="gms-location-wrapper">
          <button
            type="button"
            className="gms-btn-round"
            onClick={handleGetCurrentLocation}
            disabled={loading}
            title="Me encuentro en otro lugar, traermelo aquí"
            aria-label="Me encuentro en otro lugar, traermelo aquí"
          >
            {loading ? (
              <span className="gms-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gms-location-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
          </button>
          <span className="gms-tooltip">Me encuentro en otro lugar, traermelo aquí</span>
        </div>
      ) : (
        <div className="gms-map-wrapper">
          <iframe
            src={embedUrl}
            className="gms-iframe"
            allowFullScreen
            loading="lazy"
            title="Ubicación seleccionada en Google Maps"
          />
          <div className="gms-map-footer">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="gms-link"
            >
              🔗 Ver en Google Maps
            </a>
            <button type="button" className="gms-clear-btn" onClick={handleClear}>
              ✕ Cambiar ubicación
            </button>
          </div>
        </div>
      )}
      {error && <span className="gms-error">{error}</span>}
    </div>
  );
};

export default GoogleMapsSelector;

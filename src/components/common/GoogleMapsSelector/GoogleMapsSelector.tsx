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
        <button
          type="button"
          className="gms-btn"
          onClick={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <><span className="gms-spinner" /> Obteniendo ubicación...</>
          ) : (
            <>📍 Usar mi ubicación actual</>
          )}
        </button>
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

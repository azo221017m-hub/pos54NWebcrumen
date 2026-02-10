import React from 'react';
import './LoadingSpinner.css';

interface Props {
  size?: number;
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ size = 48, message = 'Cargando...' }) => {
  return (
    <div className="loading-spinner-container">
      <img 
        src="/logowebposcrumen.svg" 
        alt="Loading indicator" 
        className="loading-spinner-logo"
        style={{ width: size, height: size }}
      />
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

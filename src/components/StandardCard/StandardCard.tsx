import React, { type ReactNode } from 'react';
import '../../styles/StandardPageLayout.css';

interface CardField {
  label: string;
  value: string | number | ReactNode;
}

interface StandardCardProps {
  title: string;
  fields: CardField[];
  actions?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'edit' | 'delete';
  }[];
  className?: string;
}

const StandardCard: React.FC<StandardCardProps> = ({
  title,
  fields,
  actions,
  className = ''
}) => {
  return (
    <div className={`standard-card ${className}`}>
      {/* Header */}
      <div className="standard-card-header">
        <h3 className="standard-card-title">{title}</h3>
      </div>

      {/* Body */}
      <div className="standard-card-body">
        {fields.map((field, index) => (
          <div key={index} className="standard-card-field">
            <span className="standard-card-label">{field.label}:</span>
            <span className="standard-card-value">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Footer con acciones */}
      {actions && actions.length > 0 && (
        <div className="standard-card-footer">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`standard-card-btn ${action.variant ? `btn-${action.variant}` : ''}`}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandardCard;

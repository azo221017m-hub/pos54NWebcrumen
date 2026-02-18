import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/StandardPageLayout.css';

interface StandardPageLayoutProps {
  // Header props
  showBackButton?: boolean;
  backButtonPath?: string;
  backButtonText?: string;
  headerTitle: string;
  headerSubtitle?: string;
  headerLogo?: string;
  actionButton?: {
    text: string;
    icon?: ReactNode;
    onClick: () => void;
  };

  // Hero props (opcional)
  heroTitle?: string;
  heroDescription?: string;

  // Content
  children: ReactNode;

  // Loading state
  loading?: boolean;
  loadingMessage?: string;

  // Empty state
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  showBackButton = true,
  backButtonPath = '/dashboard',
  backButtonText = 'Regresa a DASHBOARD',
  headerTitle,
  headerSubtitle,
  headerLogo,
  actionButton,
  heroTitle,
  heroDescription,
  children,
  loading = false,
  loadingMessage = 'Cargando...',
  isEmpty = false,
  emptyIcon,
  emptyMessage = 'No hay datos disponibles'
}) => {
  const navigate = useNavigate();

  return (
    <div className="standard-page-container">
      {/* HEADER */}
      <header className="standard-page-header">
        {showBackButton && (
          <button
            className="btn-back"
            onClick={() => navigate(backButtonPath)}
            aria-label={backButtonText}
          >
            <ArrowLeft size={20} />
            {backButtonText}
          </button>
        )}

        <div className="header-title-section">
          {headerLogo && (
            <img
              src={headerLogo}
              alt="Logo"
              className="header-logo"
            />
          )}
          <div>
            <h1 className="header-title">{headerTitle}</h1>
            {headerSubtitle && (
              <p className="header-subtitle">{headerSubtitle}</p>
            )}
          </div>
        </div>

        {actionButton && (
          <button
            className="btn-action"
            onClick={actionButton.onClick}
          >
            {actionButton.icon}
            {actionButton.text}
          </button>
        )}
      </header>

      {/* HERO (opcional) */}
      {(heroTitle || heroDescription) && (
        <section className="standard-page-hero">
          <div className="hero-content">
            {heroTitle && <h2 className="hero-title">{heroTitle}</h2>}
            {heroDescription && <p className="hero-description">{heroDescription}</p>}
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <main className="standard-page-main">
        <div className="standard-page-content">
          {loading ? (
            <div className="standard-loading-container">
              <div className="spinner" />
              <p>{loadingMessage}</p>
            </div>
          ) : isEmpty ? (
            <div className="standard-empty-state">
              {emptyIcon}
              <p>{emptyMessage}</p>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
};

export default StandardPageLayout;

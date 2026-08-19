import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import { registrarLog } from '../../services/logService';
import '../PageDashboardMobile/PageDashboardMobile.css';
import './PageReportesMobile.css';

const getPrivilegio = (): number => {
  const data = localStorage.getItem('privilegio');
  return data ? Number(data) : 0;
};

const getIdNegocio = (): number | null => {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario?.idNegocio ?? null;
  } catch {
    return null;
  }
};

const REPORTES = [
  { path: '/reportes/salud', label: 'Salud del Negocio', icon: '📈' },
  { path: '/reportes/inventario', label: 'Inventario', icon: '📦' },
  { path: '/reportes/ventas', label: 'Ventas', icon: '💹' },
  { path: '/reportes/colaboradores', label: 'Colaboradores', icon: '👥' },
] as const;

const PageReportesMobile = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const privilegio = getPrivilegio();
  const idNegocio = getIdNegocio();
  const tieneAcceso = privilegio >= 5 || idNegocio === 99999;

  // Redirect desktop users back to /dashboard, como el resto de pares Desktop/Mobile del proyecto
  useEffect(() => {
    if (!isMobile) {
      navigate('/dashboard', { replace: true });
    }
  }, [isMobile, navigate]);

  // Mismo criterio de acceso que el submenú "Reportes" en DashboardPage.tsx (escritorio)
  useEffect(() => {
    if (!tieneAcceso) {
      navigate('/dashboard-mobile', { replace: true });
    }
  }, [tieneAcceso, navigate]);

  if (!tieneAcceso) return null;

  return (
    <div className="pdm-page">
      <header className="pdm-header">
        <button
          className="pdm-icon-btn prm-back-btn"
          onClick={() => navigate('/dashboard-mobile')}
          aria-label="Regresar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="pdm-header-text">
          <div className="pdm-header-negocio">Reportes</div>
          <div className="pdm-header-bienvenida">Salud, inventario, ventas y colaboradores</div>
        </div>
      </header>

      <main className="pdm-content">
        <p className="pdm-section-title">Reportes</p>
        <div className="pdm-menu-list">
          {REPORTES.map((r) => (
            <button
              key={r.path}
              className="pdm-menu-item"
              onClick={() => {
                registrarLog('Reportes', r.label, 'NAVEGACIÓN');
                navigate(r.path);
              }}
            >
              <span className="pdm-menu-item-icon">{r.icon}</span>
              {r.label}
              <span className="pdm-menu-item-chevron">›</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PageReportesMobile;

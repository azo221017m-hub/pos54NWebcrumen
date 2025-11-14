// src/components/TableroInicial.tsx
// Componente principal del tablero inicial con layout de 3 secciones

import { useState } from 'react';
import type { Usuario, ScreenType } from '../types';
import HeaderTableroInicio from './HeaderTableroInicio';
import NavegadorConfig from './NavegadorConfig';
import ContenedorIndicadores from './ContenedorIndicadores.js';
import PanelAlertasRapidas from './PanelAlertasRapidas';
import '../styles/TableroInicial.css';

// Componentes importados desde archivos separados

// Props del componente TableroInicial
interface TableroInicialProps {
  user: Usuario;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
}

// Componente principal del tablero inicial
const TableroInicial: React.FC<TableroInicialProps> = ({ 
  user, 
  onNavigate, 
  onLogout 
}) => {
  // Estado para controlar la protección de pantalla
  const [showGlassOverlay, setShowGlassOverlay] = useState<boolean>(false);

  // Función para alternar protección de pantalla
  const toggleGlassOverlay = (): void => {
    setShowGlassOverlay(!showGlassOverlay);
    console.log('🔒 Toggle protección de pantalla:', !showGlassOverlay);
  };

  // Función para manejar clics en indicadores
  const handleIndicatorClick = (indicator: string): void => {
    console.log('📊 Click en indicador:', indicator);
    
    // Mapear indicadores a navegación
    switch (indicator) {
      case 'ventas':
        onNavigate('indicadores-ventas' as ScreenType);
        break;
      case 'productos':
        onNavigate('config-productos' as ScreenType);
        break;
      case 'clientes':
        onNavigate('config-clientes' as ScreenType);
        break;
      case 'inventario':
        onNavigate('config-insumos' as ScreenType);
        break;
      default:
        console.log('📊 Indicador sin navegación definida');
    }
  };

  return (
    <div className="tablero-inicial">
      
      {/* Header del tablero - ocupa todo el ancho */}
      <HeaderTableroInicio 
        user={user}
        onLogout={onLogout}
        onToggleProtection={toggleGlassOverlay}
        showProtection={showGlassOverlay}
      />

      {/* Contenido principal con 3 secciones */}
      <main className="tablero-main">
        <div className="tablero-container">
          
          {/* Sección izquierda: Navegador de configuración */}
          <aside className="tablero-left">
            <NavegadorConfig onNavigate={onNavigate} />
          </aside>

          {/* Sección central: Contenedor de indicadores - expandido */}
          <section className="tablero-center">
            <ContenedorIndicadores onIndicatorClick={handleIndicatorClick} />
          </section>

          {/* Sección derecha: Panel de pedidos online */}
          <aside className="tablero-right">
            <PanelAlertasRapidas />
          </aside>

        </div>
      </main>

      {/* Overlay de protección de pantalla */}
      {showGlassOverlay && (
        <div 
          className="glass-overlay"
          onClick={toggleGlassOverlay}
        >
          <div className="glass-content">
            <div className="glass-lock-icon">
              <img src="/logowebposcrumen.svg" alt="Logo Crumen POS" className="glass-logo" />
            </div>
            <h2>Pantalla Protegida</h2>
            <p>Haz clic en cualquier lugar para desbloquear</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableroInicial;
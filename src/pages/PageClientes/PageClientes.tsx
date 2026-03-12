import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteWebService } from '../../services/clienteWebService';
import type { NegocioPublico } from '../../services/clienteWebService';
import { verificarTurnoAbierto } from '../../services/turnosService';
import './PageClientes.css';

const CATEGORIAS = ['Todos', 'Comida', 'Café', 'Postres', 'Bebidas'];

// Placeholder rating and prep-time generators based on business ID.
// These are used until actual rating/time fields are added to the database.
function getPseudoRating(id: number): string {
  const base = ((id * 17 + 3) % 15) / 10 + 3.5;
  return base.toFixed(1);
}

function getPrepTime(id: number): string {
  const mins = ((id * 7 + 5) % 20) + 10;
  return `${mins}-${mins + 5} min`;
}

const PageClientes: React.FC = () => {
  const navigate = useNavigate();
  const [negocios, setNegocios] = useState<NegocioPublico[]>([]);
  const [filteredNegocios, setFilteredNegocios] = useState<NegocioPublico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [pedidosActivos, setPedidosActivos] = useState<Set<number>>(new Set());
  const [seleccionandoNegocio, setSeleccionandoNegocio] = useState<number | null>(null);
  const [turnoError, setTurnoError] = useState<string | null>(null);

  useEffect(() => {
    // Load active orders from localStorage (keys: pedidoActivo_{idNegocio})
    const activos = new Set<number>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pedidoActivo_')) {
        const idNeg = parseInt(key.replace('pedidoActivo_', ''));
        if (!isNaN(idNeg)) activos.add(idNeg);
      }
    }
    setPedidosActivos(activos);

    cargarNegocios();
  }, []);

  const cargarNegocios = async () => {
    setIsLoading(true);
    try {
      const data = await clienteWebService.obtenerNegociosPublico();
      setNegocios(data);
      setFilteredNegocios(data);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = useCallback(
    (search: string, categoria: string) => {
      let resultado = negocios;

      if (search.trim()) {
        const term = search.toLowerCase();
        resultado = resultado.filter(
          (n) =>
            n.nombreNegocio.toLowerCase().includes(term) ||
            (n.tipoNegocio || '').toLowerCase().includes(term)
        );
      }

      if (categoria !== 'Todos') {
        resultado = resultado.filter((n) =>
          (n.tipoNegocio || '').toLowerCase().includes(categoria.toLowerCase())
        );
      }

      setFilteredNegocios(resultado);
    },
    [negocios]
  );

  useEffect(() => {
    aplicarFiltros(searchTerm, categoriaActiva);
  }, [searchTerm, categoriaActiva, aplicarFiltros]);

  const handleSeleccionarNegocio = async (negocio: NegocioPublico) => {
    if (seleccionandoNegocio) return;
    setSeleccionandoNegocio(negocio.idNegocio);
    setTurnoError(null);
    try {
      const newToken = await clienteWebService.seleccionarNegocio(negocio.idNegocio);
      clienteWebService.updateNegocioToken(newToken, negocio.idNegocio);

      // Validate that an open shift (turno) exists for the selected business
      const turnoAbierto = await verificarTurnoAbierto();
      if (!turnoAbierto) {
        setTurnoError(`${negocio.nombreNegocio} no tiene un turno abierto en este momento. Por favor intenta más tarde.`);
        return;
      }

      // Assign privilegio=1 for client-mode sales access
      localStorage.setItem('privilegio', '1');
      navigate('/ventas');
    } catch (error) {
      console.error('Error al seleccionar negocio:', error);
      setTurnoError('Ocurrió un error al conectar con el negocio. Por favor intenta de nuevo.');
    } finally {
      setSeleccionandoNegocio(null);
    }
  };

  const handleVerPedido = (idNegocio: number) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      clienteWebService.updateNegocioToken(currentToken, idNegocio);
      navigate('/ventas');
    }
  };

  return (
    <div className="pc-page">
      {/* Header */}
      <header className="pc-header">
        <div className="pc-header-top">
          <div className="pc-logo-area">
            <img src="/logowebposcrumencdt.svg" alt="CRUMEN54N" className="pc-logo" />
            <p className="pc-tagline">Explora Negocios en Texcoco, Pide y Obten Beneficios</p>
          </div>

          <div className="pc-header-center">
            {/* Search bar */}
            <div className="pc-search-wrapper">
              <svg className="pc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="pc-search-input"
                placeholder="Buscar negocio o producto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="pc-search-clear" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            {/* Category filters */}
            <div className="pc-categorias">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  className={`pc-cat-btn${categoriaActiva === cat ? ' pc-cat-btn--active' : ''}`}
                  onClick={() => setCategoriaActiva(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pc-header-right">
          </div>
        </div>
      </header>

      {/* Turno error banner */}
      {turnoError && (
        <div className="pc-turno-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pc-turno-error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{turnoError}</span>
          <button className="pc-turno-error-close" onClick={() => setTurnoError(null)} aria-label="Cerrar">✕</button>
        </div>
      )}

      {/* Main content with sidebar */}
      <div className="pc-layout">
        {/* Sidebar Banner */}
        <aside className="pc-sidebar">
          <div className="pc-banner-promo">
            <div className="pc-banner-content">
              <p className="pc-banner-small">SECCION PARA ANUNCIOS, VIDEOS, FOTOS</p>
              <p className="pc-banner-small">INTERCAMBIABLES</p>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="pc-main">
          {/* Business cards section with vertical scroll */}
          <div className="pc-content">
        {isLoading ? (
          <div className="pc-loading">
            <div className="pc-spinner" />
            <p>Cargando negocios...</p>
          </div>
        ) : filteredNegocios.length === 0 ? (
          <div className="pc-empty">
            <svg viewBox="0 0 64 64" fill="none" className="pc-empty-icon">
              <circle cx="32" cy="32" r="30" stroke="#d1d5db" strokeWidth="3" />
              <path d="M22 32h20M32 22v20" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p>No se encontraron negocios</p>
            {searchTerm && (
              <button className="pc-cat-btn" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="pc-results-count">
              {filteredNegocios.length} negocio{filteredNegocios.length !== 1 ? 's' : ''} disponible
              {filteredNegocios.length !== 1 ? 's' : ''}
            </p>
            <div className="pc-grid">
              {filteredNegocios.map((negocio) => {
                const tieneActivo = pedidosActivos.has(negocio.idNegocio);
                const cargando = seleccionandoNegocio === negocio.idNegocio;
                return (
                  <div key={negocio.idNegocio} className="pc-card">
                    {/* Card header / logo */}
                    <div className="pc-card-header">
                      {negocio.logotipo ? (
                        <img src={negocio.logotipo} alt={negocio.nombreNegocio} className="pc-card-logo" />
                      ) : (
                        <div className="pc-card-logo-placeholder">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="pc-store-icon">
                            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="pc-card-body">
                      <h3 className="pc-card-name">{negocio.nombreNegocio}</h3>
                      <p className="pc-card-tipo">{negocio.tipoNegocio || 'Negocio'}</p>

                      <div className="pc-card-meta">
                        <span className="pc-card-rating">
                          <svg viewBox="0 0 20 20" fill="#f59e0b" className="pc-star-icon">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {getPseudoRating(negocio.idNegocio)}
                        </span>
                        <span className="pc-card-separator">·</span>
                        <span className="pc-card-time">
                          ⏱ {getPrepTime(negocio.idNegocio)}
                        </span>
                      </div>

                      {/* Active order indicator */}
                      {tieneActivo && (
                        <div className="pc-active-order">
                          <svg viewBox="0 0 20 20" fill="#16a34a" className="pc-active-icon">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Tienes un pedido activo en este negocio</span>
                          <button
                            className="pc-ver-pedido-btn"
                            onClick={() => handleVerPedido(negocio.idNegocio)}
                          >
                            Ver pedido
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div className="pc-card-footer">
                      <button
                        className={`pc-ver-btn${cargando ? ' pc-ver-btn--loading' : ''}`}
                        onClick={() => handleSeleccionarNegocio(negocio)}
                        disabled={!!seleccionandoNegocio}
                      >
                        {cargando ? (
                          <>
                            <span className="pc-btn-spinner" />
                            Cargando...
                          </>
                        ) : (
                          'Ver productos'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="pc-footer">
        <p>Hecho en Texcoco · CRUMEN54N</p>
      </footer>
    </div>
  );
};

export default PageClientes;

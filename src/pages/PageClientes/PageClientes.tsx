import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteWebService } from '../../services/clienteWebService';
import type { NegocioPublico, ClienteWebData } from '../../services/clienteWebService';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../components/FeedbackToast';
import GoogleMapsSelector from '../../components/common/GoogleMapsSelector/GoogleMapsSelector';
import { obtenerAnunciosVigentes } from '../../services/anunciosService';
import type { Anuncio } from '../../types/anuncio.types';
import './PageClientes.css';

const CATEGORIAS = ['Todos', 'Alimentos', 'Bebidas Calientes', 'Cuidado Personal', 'Bebidas Frías'];

function getPrepTime(id: number): string {
  const mins = ((id * 7 + 5) % 20) + 10;
  return `${mins}-${mins + 5} min`;
}

// Renders 5 filled/empty stars for a 1-5 integer rating.
function renderStars(calificacion: number | null) {
  const rating = calificacion != null && calificacion >= 1 && calificacion <= 5
    ? Math.round(calificacion)
    : null;
  return (
    <span
      className="pc-card-rating"
      aria-label={rating != null ? `Calificación: ${rating} de 5 estrellas` : 'Sin calificación'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          fill={rating != null && star <= rating ? '#f59e0b' : '#d1d5db'}
          className="pc-star-icon"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating != null && <span className="pc-rating-value">{rating}</span>}
    </span>
  );
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

  // Client login state
  const [clienteLogueado, setClienteLogueado] = useState(false);
  const [clienteData, setClienteData] = useState<ClienteWebData | null>(null);

  // Avatar dropdown
  const [mostrarMenuAvatar, setMostrarMenuAvatar] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Anuncios vigentes sidebar
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [anuncioActivo, setAnuncioActivo] = useState(0);
  const [imagenActivaIdx, setImagenActivaIdx] = useState(0);

  // Login modal
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [loginTelefono, setLoginTelefono] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCargando, setLoginCargando] = useState(false);

  // Register modal
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [registroCargando, setRegistroCargando] = useState(false);

  // Thank-you modal (shown after successful registration)
  const [mostrarModalAgradecimiento, setMostrarModalAgradecimiento] = useState(false);
  const [registroData, setRegistroData] = useState({
    nombre: '',
    referencia: '',
    cumple: '',
    satisfaccion: '',
    comentarios: '',
    puntosfidelidad: '',
    telefono: '',
    email: '',
    direccion: '',
    password: ''
  });

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

    // Check if a client is already logged in
    const logueado = clienteWebService.isClienteMode();
    setClienteLogueado(logueado);
    if (logueado) {
      setClienteData(clienteWebService.getClienteSession());
    }

    cargarNegocios();
    cargarAnunciosVigentes();
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

  const cargarAnunciosVigentes = async () => {
    try {
      const data = await obtenerAnunciosVigentes();
      setAnuncios(data);
      setAnuncioActivo(0);
      setImagenActivaIdx(0);
    } catch {
      // Silently fail — anuncios are optional in the sidebar
    }
  };

  // Helper: collect non-null images from an anuncio
  const getImagenes = useCallback((anuncio: Anuncio): string[] =>
    [
      anuncio.imagen1Anuncio,
      anuncio.imagen2Anuncio,
      anuncio.imagen3Anuncio,
      anuncio.imagen4Anuncio,
      anuncio.imagen5Anuncio
    ].filter((img): img is string => img !== null && img !== ''), []);

  // Auto-advance the carousel every 3 seconds; reset image index when active anuncio changes
  useEffect(() => {
    setImagenActivaIdx(0);
    if (anuncios.length === 0) return;
    const currentAnuncio = anuncios[anuncioActivo];
    if (!currentAnuncio) return;
    const imagenes = getImagenes(currentAnuncio);
    if (imagenes.length <= 1) return;
    const timer = setInterval(() => {
      setImagenActivaIdx((prev) => (prev + 1) % imagenes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [anuncios, anuncioActivo, getImagenes]);

  // Auto-advance between anuncios after all images of the current one have been shown
  useEffect(() => {
    if (anuncios.length <= 1) return;
    const currentAnuncio = anuncios[anuncioActivo];
    if (!currentAnuncio) return;
    const imagenes = getImagenes(currentAnuncio);
    const delay = imagenes.length > 1 ? imagenes.length * 3000 : 5000;
    const timer = setTimeout(() => {
      setAnuncioActivo((prev) => (prev + 1) % anuncios.length);
      setImagenActivaIdx(0);
    }, delay);
    return () => clearTimeout(timer);
  }, [anuncios, anuncioActivo, getImagenes]);

  const aplicarFiltros = useCallback(
    (search: string, categoria: string) => {
      let resultado = negocios;

      if (search.trim()) {
        const term = search.toLowerCase();
        resultado = resultado.filter(
          (n) =>
            n.nombreNegocio.toLowerCase().includes(term) ||
            (n.tipoNegocio || '').toLowerCase().includes(term) ||
            (n.etiquetas || '')
              .split(',')
              .some((e) => e.trim().toLowerCase().includes(term))
        );
      }

      if (categoria !== 'Todos') {
        const catLower = categoria.toLowerCase();
        resultado = resultado.filter((n) => {
          const etiquetasList = (n.etiquetas || '')
            .split(',')
            .map((e) => e.trim().toLowerCase());
          return etiquetasList.some((e) => e.includes(catLower));
        });
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

  const handleAbrirModalLogin = () => {
    setLoginTelefono('');
    setLoginPassword('');
    setMostrarModalLogin(true);
  };

  const handleCerrarModalLogin = () => {
    setMostrarModalLogin(false);
    setLoginTelefono('');
    setLoginPassword('');
  };

  const handleLoginCliente = async () => {
    if (!loginTelefono.trim() || !loginPassword.trim()) {
      showInfoToast('Por favor ingresa tu teléfono y clave de acceso');
      return;
    }
    setLoginCargando(true);
    try {
      const result = await clienteWebService.login(loginTelefono.trim(), loginPassword);
      if (result.success && result.data) {
        clienteWebService.saveClienteSession(result.data.token, result.data.cliente);
        setClienteLogueado(true);
        setClienteData(result.data.cliente);
        setMostrarModalLogin(false);
        showSuccessToast(`¡Bienvenido${result.data.cliente.nombre ? ', ' + result.data.cliente.nombre : ''}! Ya puedes ver los productos.`);
      } else {
        showErrorToast(result.message || 'Teléfono o clave de acceso incorrectos');
      }
    } catch {
      showErrorToast('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoginCargando(false);
    }
  };

  const handleAbrirModalRegistro = () => {
    setMostrarModalLogin(false);
    setRegistroData({
      nombre: '',
      referencia: '',
      cumple: '',
      satisfaccion: '',
      comentarios: '',
      puntosfidelidad: '',
      telefono: '',
      email: '',
      direccion: '',
      password: ''
    });
    setMostrarModalRegistro(true);
  };

  const handleCerrarModalRegistro = () => {
    setMostrarModalRegistro(false);
  };

  const handleCerrarModalAgradecimiento = () => {
    setMostrarModalAgradecimiento(false);
    setMostrarModalLogin(true);
  };

  const handleRegistroChange = (field: string, value: string) => {
    setRegistroData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegistroCliente = async () => {
    if (!registroData.referencia.trim() || !registroData.password.trim()) {
      showInfoToast('Los campos referencia y contraseña son obligatorios');
      return;
    }
    setRegistroCargando(true);
    try {
      const result = await clienteWebService.registrarCliente({
        nombre: registroData.nombre || undefined,
        referencia: registroData.referencia.trim(),
        cumple: registroData.cumple || undefined,
        satisfaccion: registroData.satisfaccion ? Number(registroData.satisfaccion) : undefined,
        comentarios: registroData.comentarios || undefined,
        puntosfidelidad: registroData.puntosfidelidad ? Number(registroData.puntosfidelidad) : undefined,
        telefono: registroData.telefono || undefined,
        email: registroData.email || undefined,
        direccion: registroData.direccion || undefined,
        password: registroData.password
      });
      if (result.success) {
        setMostrarModalRegistro(false);
        setLoginTelefono(registroData.telefono || '');
        setLoginPassword('');
        setMostrarModalAgradecimiento(true);
      } else {
        showErrorToast(result.message || 'No se pudo completar el registro');
      }
    } catch {
      showErrorToast('Error de conexión. Intenta de nuevo.');
    } finally {
      setRegistroCargando(false);
    }
  };

  const handleLogout = () => {
    clienteWebService.clearClienteSession();
    setClienteLogueado(false);
    setClienteData(null);
    setMostrarMenuAvatar(false);
    showSuccessToast('Has cerrado sesión. ¡Hasta pronto!');
  };

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    if (!mostrarMenuAvatar) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setMostrarMenuAvatar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mostrarMenuAvatar]);

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
            {!clienteLogueado && (
              <div className="pc-header-actions">
                <div className="pc-btn-row">
                  <span className="pc-btn-hint">Click para iniciar sesión ➜</span>
                  <button
                    className="pc-header-iniciar-btn"
                    onClick={handleAbrirModalLogin}
                  >
                    INiCIaR PeDIDoS
                  </button>
                </div>
                <div className="pc-btn-row">
                  <span className="pc-btn-hint pc-btn-hint--comunidad">Click para registrarse ➜</span>
                  <button
                    className="pc-header-comunidad-btn"
                    onClick={handleAbrirModalRegistro}
                  >
                    UNIRME A LA COMUNIDAD
                  </button>
                </div>
              </div>
            )}
            {clienteLogueado && clienteData && (
              <div className="pc-avatar-container" ref={avatarRef}>
                <button
                  className="pc-avatar-btn"
                  onClick={() => setMostrarMenuAvatar(!mostrarMenuAvatar)}
                  aria-label="Menú de usuario"
                  aria-expanded={mostrarMenuAvatar}
                >
                  <span className="pc-avatar-initial">
                    {(clienteData.nombre || clienteData.telefono || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="pc-avatar-name">
                    {clienteData.nombre || clienteData.telefono || '—'}
                  </span>
                  <svg className="pc-avatar-chevron" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {mostrarMenuAvatar && (
                  <div className="pc-avatar-menu" role="menu">
                    <div className="pc-avatar-menu-header">
                      <span className="pc-avatar-menu-initial">
                        {(clienteData.nombre || clienteData.telefono || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="pc-avatar-menu-name">
                        {clienteData.nombre || clienteData.telefono || '—'}
                      </span>
                    </div>
                    <button
                      className="pc-avatar-menu-logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pc-avatar-menu-icon">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
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

        {/* Left sidebar — Anuncios vigentes */}
        <aside className="pc-sidebar">
          <div className="pc-banner-promo">
            {anuncios.length > 0 ? (() => {
              const anuncio = anuncios[anuncioActivo];
              const imagenes = getImagenes(anuncio);
              return (
                <div className="pc-carousel">
                  {imagenes.length > 0 ? (
                    <div className="pc-carousel-track">
                      <img
                        src={`data:image/jpeg;base64,${imagenes[imagenActivaIdx]}`}
                        alt={anuncio.tituloDeAnuncio}
                        className="pc-carousel-img"
                      />
                    </div>
                  ) : (
                    <div className="pc-carousel-track" />
                  )}
                  {anuncio.tituloDeAnuncio && (
                    <p className="pc-banner-small">{anuncio.tituloDeAnuncio}</p>
                  )}
                  {anuncio.detalleAnuncio && (
                    <p className="pc-carousel-detalle">{anuncio.detalleAnuncio}</p>
                  )}
                  {imagenes.length > 1 && (
                    <div className="pc-carousel-dots pc-carousel-dots--imagenes">
                      {imagenes.map((_, idx) => (
                        <button
                          key={idx}
                          className={`pc-carousel-dot${idx === imagenActivaIdx ? ' pc-carousel-dot--active' : ''}`}
                          onClick={() => setImagenActivaIdx(idx)}
                          aria-label={`Imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  {anuncios.length > 1 && (
                    <div className="pc-carousel-dots pc-carousel-dots--anuncios">
                      {anuncios.map((_, idx) => (
                        <button
                          key={idx}
                          className={`pc-carousel-dot${idx === anuncioActivo ? ' pc-carousel-dot--active' : ''}`}
                          onClick={() => { setAnuncioActivo(idx); setImagenActivaIdx(0); }}
                          aria-label={`Anuncio ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="pc-banner-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pc-banner-placeholder-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p className="pc-banner-small">Anuncios</p>
                <p className="pc-carousel-detalle">Próximamente promociones y novedades para ti</p>
              </div>
            )}
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
                        {renderStars(negocio.calificacion)}
                        <span className="pc-card-separator">·</span>
                        <span className="pc-card-time">
                          ⏱ {getPrepTime(negocio.idNegocio)}
                        </span>
                      </div>

                      {/* Active order indicator - only show when client is logged in */}
                      {tieneActivo && clienteLogueado && (
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
                      {clienteLogueado && (
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
                      )}
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

      {/* Login Modal */}
      {mostrarModalLogin && (
        <div className="pc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCerrarModalLogin(); }}>
          <div className="pc-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
            <div className="pc-modal-header">
              <h2 className="pc-modal-title" id="login-modal-title">INiCIaR PeDIDoS</h2>
              <button className="pc-modal-close" onClick={handleCerrarModalLogin} aria-label="Cerrar">✕</button>
            </div>
            <div className="pc-modal-body">
              <div className="pc-form-group">
                <label className="pc-form-label">Teléfono cliente</label>
                <input
                  type="tel"
                  className="pc-form-input"
                  placeholder="Tu número de teléfono"
                  value={loginTelefono}
                  onChange={(e) => setLoginTelefono(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoginCliente()}
                  autoFocus
                />
              </div>
              <div className="pc-form-group">
                <label className="pc-form-label">Clave de acceso secreta</label>
                <input
                  type="password"
                  className="pc-form-input"
                  placeholder="Tu clave secreta"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoginCliente()}
                />
              </div>
              <button
                className="pc-modal-btn"
                onClick={handleLoginCliente}
                disabled={loginCargando}
              >
                {loginCargando ? <><span className="pc-btn-spinner" /> Verificando...</> : 'Comenzar a Pedir'}
              </button>
              <div className="pc-unirse-link">
                <button className="pc-unirse-btn" onClick={handleAbrirModalRegistro}>
                  Únirme a la Comunidad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {mostrarModalRegistro && (
        <div className="pc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCerrarModalRegistro(); }}>
          <div className="pc-modal pc-modal--wide" role="dialog" aria-modal="true" aria-labelledby="registro-modal-title">
            <div className="pc-modal-header">
              <h2 className="pc-modal-title" id="registro-modal-title">Únirme a la Comunidad</h2>
              <button className="pc-modal-close" onClick={handleCerrarModalRegistro} aria-label="Cerrar">✕</button>
            </div>
            <div className="pc-modal-body">
              <div className="pc-form-row">
                <div className="pc-form-group">
                  <label className="pc-form-label">Nombre</label>
                  <input type="text" className="pc-form-input" placeholder="Tu nombre" autoComplete="off" value={registroData.nombre} onChange={(e) => handleRegistroChange('nombre', e.target.value)} />
                </div>
                <div className="pc-form-group">
                  <label className="pc-form-label pc-form-label--required">Referencia (nombre o alias)</label>
                  <input type="text" className="pc-form-input" placeholder="Nombre o alias" autoComplete="off" value={registroData.referencia} onChange={(e) => handleRegistroChange('referencia', e.target.value)} />
                </div>
              </div>
              <div className="pc-form-row">
                <div className="pc-form-group">
                  <label className="pc-form-label">Teléfono</label>
                  <input type="tel" className="pc-form-input" placeholder="Tu teléfono" autoComplete="off" value={registroData.telefono} onChange={(e) => handleRegistroChange('telefono', e.target.value)} />
                </div>
                <div className="pc-form-group">
                  <label className="pc-form-label">Cumpleaños</label>
                  <input type="date" className="pc-form-input" autoComplete="off" value={registroData.cumple} onChange={(e) => handleRegistroChange('cumple', e.target.value)} />
                </div>
              </div>
              <div className="pc-form-group">
                <label className="pc-form-label">Dirección</label>
                <GoogleMapsSelector
                  value={registroData.direccion}
                  onChange={(url) => handleRegistroChange('direccion', url)}
                />
              </div>
              <div className="pc-form-group">
                <label className="pc-form-label pc-form-label--required">Clave secreta</label>
                <input type="password" className="pc-form-input" placeholder="E5cr1b3 un* c1aV3 5ecre7a" autoComplete="new-password" value={registroData.password} onChange={(e) => handleRegistroChange('password', e.target.value)} />
              </div>
              <button
                className="pc-modal-btn"
                onClick={handleRegistroCliente}
                disabled={registroCargando}
              >
                {registroCargando ? <><span className="pc-btn-spinner" /> Registrando...</> : 'Registrarme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank-you modal after successful registration */}
      {mostrarModalAgradecimiento && (
        <div className="pc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCerrarModalAgradecimiento(); }}>
          <div className="pc-agradecimiento-modal" role="dialog" aria-modal="true" aria-label="Gracias por registrarte">
            <button
              className="pc-agradecimiento-close"
              onClick={handleCerrarModalAgradecimiento}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <img
              src="/agradecimientocdt.png"
              alt="¡Gracias por unirte a la comunidad!"
              className="pc-agradecimiento-img"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageClientes;

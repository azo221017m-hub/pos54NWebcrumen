import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteWebService } from '../../services/clienteWebService';
import type { NegocioPublico, ClienteWebData } from '../../services/clienteWebService';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../components/FeedbackToast';
import GoogleMapsSelector from '../../components/common/GoogleMapsSelector/GoogleMapsSelector';
import { obtenerAnunciosVigentes } from '../../services/anunciosService';
import type { Anuncio } from '../../types/anuncio.types';
import { useWebSocket } from '../../hooks/useWebSocket';
import TableroCliente from '../../components/tableroCliente/TableroCliente';
import './PageClientesMobile.css';

const CATEGORIAS = ['Todos', 'Alimentos', 'Bebidas Calientes', 'Cuidado Personal', 'Bebidas Frías'];
void CATEGORIAS; // kept for future use

function getPrepTime(id: number): string {
  const mins = ((id * 7 + 5) % 20) + 10;
  return `${mins}-${mins + 5} min`;
}

function renderStars(calificacion: number | null) {
  const rating = calificacion != null && calificacion >= 1 && calificacion <= 5
    ? Math.round(calificacion)
    : null;
  return (
    <span
      className="pcm-card-rating"
      aria-label={rating != null ? `Calificación: ${rating} de 5 estrellas` : 'Sin calificación'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          fill={rating != null && star <= rating ? '#f59e0b' : '#d1d5db'}
          className="pcm-star-icon"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating != null && <span className="pcm-rating-value">{rating}</span>}
    </span>
  );
}

const PageClientesMobile: React.FC = () => {
  const navigate = useNavigate();
  const [negocios, setNegocios] = useState<NegocioPublico[]>([]);
  const [filteredNegocios, setFilteredNegocios] = useState<NegocioPublico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  void setCategoriaActiva; // setter kept for future category filter use
  const [isLoading, setIsLoading] = useState(true);
  const [pedidosActivos, setPedidosActivos] = useState<Set<number>>(new Set());
  const [seleccionandoNegocio, setSeleccionandoNegocio] = useState<number | null>(null);
  const [turnoError, setTurnoError] = useState<string | null>(null);

  const processedStatesRef = useRef<Set<string>>(new Set());

  const [clienteLogueado, setClienteLogueado] = useState(false);
  const [clienteData, setClienteData] = useState<ClienteWebData | null>(null);

  const [mostrarMenuAvatar, setMostrarMenuAvatar] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mostrarTablero, setMostrarTablero] = useState(false);

  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [anuncioActivo, setAnuncioActivo] = useState(0);
  const [imagenActivaIdx, setImagenActivaIdx] = useState(0);

  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [loginTelefono, setLoginTelefono] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCargando, setLoginCargando] = useState(false);

  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [registroCargando, setRegistroCargando] = useState(false);

  const [mostrarModalAgradecimiento, setMostrarModalAgradecimiento] = useState(false);

  const NEGOCIO_CTA_INITIAL = { nombreNegocio: '', tipoNegocio: '', dudasComentarios: '', interes: 'Vender' };
  const [mostrarModalNegocioCta, setMostrarModalNegocioCta] = useState(false);
  const [negocioCtaData, setNegocioCtaData] = useState(NEGOCIO_CTA_INITIAL);

  const REPARTIDOR_INITIAL = {
    nombre: '',
    zonasPreferencia: '',
    fotoVehiculo: null as File | null,
    fotoPlacas: null as File | null,
    fotoRepartidor: null as File | null,
  };
  const [mostrarModalRepartidor, setMostrarModalRepartidor] = useState(false);
  const [repartidorData, setRepartidorData] = useState(REPARTIDOR_INITIAL);

  const [registroData, setRegistroData] = useState({
    referencia: '',
    telefono: '',
    cumple: '',
    direccion: '',
    password: ''
  });

  // Bottom sheet menu (comunidad / repartidor)
  const [mostrarMenuComunidad, setMostrarMenuComunidad] = useState(false);

  useEffect(() => {
    const activos = new Set<number>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pedidoActivo_')) {
        const idNeg = parseInt(key.replace('pedidoActivo_', ''));
        if (!isNaN(idNeg)) activos.add(idNeg);
      }
    }
    setPedidosActivos(activos);

    const logueado = clienteWebService.isClienteMode();
    setClienteLogueado(logueado);
    if (logueado) {
      setClienteData(clienteWebService.getClienteSession());
    }

    cargarNegocios();
    cargarAnunciosVigentes();
  }, []);

  useWebSocket({
    onMessage: (data) => {
      if (data.type !== 'estado_cambio_web') return;

      const idventa = data.idventa as number;
      const estado = data.estado as string;
      const stateKey = `${idventa}_${estado}`;

      if (processedStatesRef.current.has(stateKey)) return;

      const idNegocio = localStorage.getItem('idnegocio');
      if (!idNegocio) return;
      const activeVentaId = localStorage.getItem(`pedidoActivo_${idNegocio}`);
      if (!activeVentaId || Number(activeVentaId) !== idventa) return;

      processedStatesRef.current.add(stateKey);

      const audio = new Audio('/notificacion.wav');
      audio.play().catch((err) => { console.debug('Audio playback blocked:', err); });

      if (estado === 'ORDENADO') {
        showInfoToast('✅ Tu pedido fue ordenado');
      } else if (estado === 'EN_CAMINO') {
        showInfoToast('🚴 Tu pedido va en camino');
      }
    }
  });

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const cargarNegocios = async () => {
    setIsLoading(true);
    try {
      const data = await clienteWebService.obtenerNegociosPublico();
      const shuffled = shuffleArray(data);
      setNegocios(shuffled);
      setFilteredNegocios(shuffled);
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
      // Silently fail
    }
  };

  const getImagenes = useCallback((anuncio: Anuncio): string[] =>
    [
      anuncio.imagen1Anuncio,
      anuncio.imagen2Anuncio,
      anuncio.imagen3Anuncio,
      anuncio.imagen4Anuncio,
      anuncio.imagen5Anuncio
    ].filter((img): img is string => img !== null && img !== ''), []);

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
    if (!clienteLogueado) {
      handleAbrirModalLogin();
      return;
    }
    if (seleccionandoNegocio) return;
    setSeleccionandoNegocio(negocio.idNegocio);
    setTurnoError(null);
    try {
      const newToken = await clienteWebService.seleccionarNegocio(negocio.idNegocio);
      clienteWebService.updateNegocioToken(newToken, negocio.idNegocio);

      const turnoAbierto = await verificarTurnoAbierto();
      if (!turnoAbierto) {
        setTurnoError(`${negocio.nombreNegocio} no tiene un turno abierto en este momento. Por favor intenta más tarde.`);
        return;
      }

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
        const nombreCliente = result.data.cliente.referencia || result.data.cliente.nombre;
        showSuccessToast(`¡Bienvenido${nombreCliente ? ', ' + nombreCliente : ''}! Ya puedes ver los productos.`);
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
      referencia: '',
      telefono: '',
      cumple: '',
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
    if (!registroData.telefono.trim()) {
      showInfoToast('El campo Teléfono es obligatorio');
      return;
    }
    if (!registroData.direccion.trim()) {
      showInfoToast('La selección de dirección es obligatoria');
      return;
    }
    setRegistroCargando(true);
    try {
      const result = await clienteWebService.registrarCliente({
        referencia: registroData.referencia.trim(),
        telefono: registroData.telefono.trim(),
        cumple: registroData.cumple || undefined,
        direccion: registroData.direccion.trim(),
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

  const handleAbrirModalNegocioCta = () => {
    setNegocioCtaData(NEGOCIO_CTA_INITIAL);
    setMostrarMenuComunidad(false);
    setMostrarModalNegocioCta(true);
  };

  const handleCerrarModalNegocioCta = () => {
    setMostrarModalNegocioCta(false);
  };

  const handleEnviarWhatsappNegocio = () => {
    const { nombreNegocio, tipoNegocio, dudasComentarios } = negocioCtaData;
    if (!nombreNegocio.trim() || !tipoNegocio.trim() || !dudasComentarios.trim()) {
      showInfoToast('Por favor completa todos los campos antes de enviar');
      return;
    }
    const { interes } = negocioCtaData;
    const mensaje = `Interés: ${interes}\nNombre de Negocio: ${nombreNegocio.trim()}\nTipo de Negocio: ${tipoNegocio.trim()}\nDudas o Comentarios: ${dudasComentarios.trim()}`;
    const url = `whatsapp://send?phone=5527618631&text=${encodeURIComponent(mensaje)}`;
    window.location.href = url;
    setMostrarModalNegocioCta(false);
    setNegocioCtaData(NEGOCIO_CTA_INITIAL);
  };

  const handleAbrirModalRepartidor = () => {
    setRepartidorData(REPARTIDOR_INITIAL);
    setMostrarMenuComunidad(false);
    setMostrarModalRepartidor(true);
  };

  const handleCerrarModalRepartidor = () => {
    setMostrarModalRepartidor(false);
  };

  const handleEnviarWhatsappRepartidor = () => {
    const { nombre, zonasPreferencia } = repartidorData;
    if (!nombre.trim() || !zonasPreferencia.trim()) {
      showInfoToast('Por favor completa los campos de nombre y zonas de preferencia');
      return;
    }
    const fotoInfo = [
      repartidorData.fotoVehiculo ? `📸 Foto vehículo: ${repartidorData.fotoVehiculo.name}` : '',
      repartidorData.fotoPlacas ? `📸 Foto placas: ${repartidorData.fotoPlacas.name}` : '',
      repartidorData.fotoRepartidor ? `📸 Foto repartidor: ${repartidorData.fotoRepartidor.name}` : '',
    ].filter(Boolean).join('\n');
    const mensaje = `Solicitud Repartidor CDT\nNombre: ${nombre.trim()}\nZonas de preferencia: ${zonasPreferencia.trim()}${fotoInfo ? '\n' + fotoInfo + '\n(Por favor adjunta tus fotos en este chat)' : ''}`;
    const url = `whatsapp://send?phone=5527618631&text=${encodeURIComponent(mensaje)}`;
    window.location.href = url;
    setMostrarModalRepartidor(false);
    setRepartidorData(REPARTIDOR_INITIAL);
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
    <div className="pcm-page">
      {/* ── Anuncios Hero ── */}
      <div className="pcm-anuncios-hero">
        {(() => {
          const anuncio = anuncios.length > 0 ? anuncios[anuncioActivo] : null;
          const imagenes = anuncio ? getImagenes(anuncio) : [];
          return imagenes.length > 0 ? (
            <>
              <img
                src={`data:image/jpeg;base64,${imagenes[imagenActivaIdx]}`}
                alt={anuncio!.tituloDeAnuncio}
                className="pcm-anuncios-hero-img"
              />
              {anuncio!.tituloDeAnuncio && (
                <div className="pcm-anuncios-overlay">
                  <span className="pcm-anuncios-titulo">{anuncio!.tituloDeAnuncio}</span>
                </div>
              )}
              {anuncios.length > 1 && (
                <div className="pcm-anuncios-dots">
                  {anuncios.map((_, i) => (
                    <button
                      key={i}
                      className={`pcm-anuncios-dot${i === anuncioActivo ? ' pcm-anuncios-dot--active' : ''}`}
                      onClick={() => { setAnuncioActivo(i); setImagenActivaIdx(0); }}
                      aria-label={`Anuncio ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="pcm-anuncios-placeholder" aria-hidden="true">
              <span className="pcm-anuncios-placeholder-text">anuncios</span>
            </div>
          );
        })()}

        {/* Funciones Cliente — green circle button bottom-left */}
        <button
          className="pcm-funciones-btn"
          onClick={() => setMostrarMenuComunidad(true)}
          aria-label="Funciones cliente"
        >
          {clienteLogueado && clienteData ? (
            <span className="pcm-funciones-initial">
              {(clienteData.referencia || clienteData.nombre || clienteData.telefono || '?').charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className="pcm-funciones-label">funciones<br />cliente</span>
          )}
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="pcm-search-outer">
        <div className="pcm-search-wrapper">
          <svg className="pcm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="pcm-search-input"
            placeholder="buscar producto o negocio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="pcm-search-clear" onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda">✕</button>
          )}
        </div>
      </div>

      {/* Turno error banner */}
      {turnoError && (
        <div className="pcm-turno-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pcm-turno-error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{turnoError}</span>
          <button className="pcm-turno-error-close" onClick={() => setTurnoError(null)} aria-label="Cerrar">✕</button>
        </div>
      )}

      {/* Main scrollable content */}
      <main className="pcm-main">
        {/* Tablero Cliente */}
        {clienteLogueado && mostrarTablero && (
          <TableroCliente onOcultar={() => setMostrarTablero(false)} />
        )}

        {isLoading ? (
          <div className="pcm-loading">
            <div className="pcm-spinner" />
            <p>Activando Comunidad Digital Texcoco</p>
          </div>
        ) : filteredNegocios.length === 0 ? (
          <div className="pcm-empty">
            <svg viewBox="0 0 64 64" fill="none" className="pcm-empty-icon">
              <circle cx="32" cy="32" r="30" stroke="#d1d5db" strokeWidth="3" />
              <path d="M22 32h20M32 22v20" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p>No se encontraron negocios</p>
            {searchTerm && (
              <button className="pcm-cat-btn" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="pcm-list">
            {filteredNegocios.map((negocio) => {
              const tieneActivo = pedidosActivos.has(negocio.idNegocio);
              const cargando = seleccionandoNegocio === negocio.idNegocio;
              return (
                <div key={negocio.idNegocio} className="pcm-card">
                  {/* Logo panel */}
                  <div className="pcm-card-logo-wrap">
                    {negocio.logotipo ? (
                      <img src={negocio.logotipo} alt={negocio.nombreNegocio} className="pcm-card-logo" />
                    ) : (
                      <div className="pcm-card-logo-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="pcm-store-icon">
                          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                        </svg>
                      </div>
                    )}
                    {negocio.nuevoweb === 1 && (
                      <span className="pcm-badge pcm-badge--nuevo" aria-label="Nuevo negocio">NUEVO</span>
                    )}
                  </div>

                  <div className="pcm-card-body">
                    <div className="pcm-card-top">
                      <h3 className="pcm-card-name">{negocio.nombreNegocio}</h3>
                      <p className="pcm-card-tipo">{negocio.tipoNegocio || 'Negocio'}</p>
                    </div>

                    <div className="pcm-card-meta">
                      {renderStars(negocio.calificacion)}
                      <span className="pcm-card-separator">·</span>
                      <span className="pcm-card-time">⏱ {getPrepTime(negocio.idNegocio)}</span>
                    </div>

                    {(negocio.abiertoahoraweb === 1 || negocio.promocionhoyweb === 1 || negocio.entregarapidaweb === 1) && (
                      <div className="pcm-badges-row">
                        {negocio.abiertoahoraweb === 1 && (
                          <span className="pcm-badge pcm-badge--abierto">🟢 Abierto</span>
                        )}
                        {negocio.promocionhoyweb === 1 && (
                          <span className="pcm-badge pcm-badge--promocion">🏷️ Promo</span>
                        )}
                        {negocio.entregarapidaweb === 1 && (
                          <span className="pcm-badge pcm-badge--entrega">⚡ Rápido</span>
                        )}
                      </div>
                    )}

                    {tieneActivo && clienteLogueado && (
                      <div className="pcm-active-order">
                        <svg viewBox="0 0 20 20" fill="#16a34a" className="pcm-active-icon">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Pedido activo</span>
                        <button className="pcm-ver-pedido-btn" onClick={() => handleVerPedido(negocio.idNegocio)}>
                          Ver
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CTA button */}
                  <div className="pcm-card-cta">
                    {clienteLogueado && negocio.abiertoahoraweb === 1 && (
                      <button
                        className={`pcm-ver-btn${cargando ? ' pcm-ver-btn--loading' : ''}`}
                        onClick={() => handleSeleccionarNegocio(negocio)}
                        disabled={!!seleccionandoNegocio}
                      >
                        {cargando ? (
                          <span className="pcm-btn-spinner" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pcm-ver-icon">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        )}
                      </button>
                    )}
                    {!clienteLogueado && negocio.abiertoahoraweb === 1 && (
                      <button
                        className="pcm-ver-btn pcm-ver-btn--login"
                        onClick={handleAbrirModalLogin}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pcm-ver-icon">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom sheet — Funciones Cliente (login + avatar + comunidad) */}
      {mostrarMenuComunidad && (
        <div className="pcm-sheet-overlay" onClick={() => setMostrarMenuComunidad(false)}>
          <div className="pcm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pcm-sheet-handle" />

            {/* Logged-in: show client name + account actions */}
            {clienteLogueado && clienteData && (
              <>
                <div className="pcm-sheet-cliente-row">
                  <span className="pcm-sheet-cliente-avatar">
                    {(clienteData.referencia || clienteData.nombre || clienteData.telefono || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="pcm-sheet-cliente-name">
                    {clienteData.referencia || clienteData.nombre || clienteData.telefono}
                  </span>
                </div>
                <button className="pcm-sheet-item" onClick={() => { setMostrarTablero(true); setMostrarMenuComunidad(false); }}>
                  <span className="pcm-sheet-item-icon">📦</span>
                  <div>
                    <div className="pcm-sheet-item-label">Mis Pedidos</div>
                    <div className="pcm-sheet-item-sub">Ver estado de mis pedidos activos</div>
                  </div>
                </button>
                <button className="pcm-sheet-item" onClick={() => { handleLogout(); setMostrarMenuComunidad(false); }}>
                  <span className="pcm-sheet-item-icon">🚪</span>
                  <div>
                    <div className="pcm-sheet-item-label">Cerrar sesión</div>
                    <div className="pcm-sheet-item-sub">Salir de mi cuenta</div>
                  </div>
                </button>
              </>
            )}

            {/* Not logged-in: show login & register */}
            {!clienteLogueado && (
              <>
                <button className="pcm-sheet-item" onClick={() => { setMostrarMenuComunidad(false); handleAbrirModalLogin(); }}>
                  <span className="pcm-sheet-item-icon">🛒</span>
                  <div>
                    <div className="pcm-sheet-item-label">Iniciar Pedidos</div>
                    <div className="pcm-sheet-item-sub">Inicia sesión para hacer pedidos</div>
                  </div>
                </button>
                <button className="pcm-sheet-item" onClick={() => { setMostrarMenuComunidad(false); handleAbrirModalRegistro(); }}>
                  <span className="pcm-sheet-item-icon">🎉</span>
                  <div>
                    <div className="pcm-sheet-item-label">CREAR MI ACCESO Gratis</div>
                    <div className="pcm-sheet-item-sub">Únirme a la comunidad digital</div>
                  </div>
                </button>
              </>
            )}

            {/* Comunidad options always visible */}
            <button className="pcm-sheet-item" onClick={handleAbrirModalNegocioCta}>
              <span className="pcm-sheet-item-icon">🏪</span>
              <div>
                <div className="pcm-sheet-item-label">¿Tienes Negocio en Texcoco?</div>
                <div className="pcm-sheet-item-sub">Quiero mostrar mi negocio aquí</div>
              </div>
            </button>
            <button className="pcm-sheet-item" onClick={handleAbrirModalRepartidor}>
              <span className="pcm-sheet-item-icon">🛵</span>
              <div>
                <div className="pcm-sheet-item-label">¿Quieres ser repartidor CDT?</div>
                <div className="pcm-sheet-item-sub">Aplica como repartidor de la comunidad</div>
              </div>
            </button>

            <button className="pcm-sheet-cancel" onClick={() => setMostrarMenuComunidad(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Login Modal (bottom sheet) */}
      {mostrarModalLogin && (
        <div className="pcm-sheet-overlay">
          <div className="pcm-sheet pcm-sheet--form">
            <div className="pcm-sheet-handle" />
            <div className="pcm-sheet-header">
              <h3 className="pcm-sheet-title">INiCIaR PeDIDoS</h3>
              <button className="pcm-sheet-close" onClick={handleCerrarModalLogin} aria-label="Cerrar">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleLoginCliente(); }} className="pcm-form">
              <div className="pcm-form-group">
                <label className="pcm-form-label">Teléfono cliente</label>
                <input
                  type="text"
                  className="pcm-form-input"
                  placeholder="Tu número de teléfono"
                  value={loginTelefono}
                  onChange={(e) => setLoginTelefono(e.target.value)}
                  autoFocus
                  inputMode="numeric"
                />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Clave de acceso secreta</label>
                <input
                  type="password"
                  className="pcm-form-input"
                  placeholder="Tu clave secreta"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="pcm-btn-primary" disabled={loginCargando}>
                {loginCargando ? <><span className="pcm-btn-spinner" /> Verificando...</> : 'Comenzar a Pedir'}
              </button>
            </form>
            <div className="pcm-unirse-link">
              <button className="pcm-unirse-btn" onClick={handleAbrirModalRegistro}>
                Únirme a la Comunidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal (bottom sheet) */}
      {mostrarModalRegistro && (
        <div className="pcm-sheet-overlay">
          <div className="pcm-sheet pcm-sheet--form pcm-sheet--scroll">
            <div className="pcm-sheet-handle" />
            <div className="pcm-sheet-header">
              <h3 className="pcm-sheet-title">Únirme a la Comunidad</h3>
              <button className="pcm-sheet-close" onClick={handleCerrarModalRegistro} aria-label="Cerrar">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleRegistroCliente(); }} className="pcm-form">
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Alias como Cliente</label>
                <input type="text" className="pcm-form-input" placeholder="Nombre o alias" autoComplete="off" value={registroData.referencia} onChange={(e) => handleRegistroChange('referencia', e.target.value)} />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Teléfono</label>
                <input type="text" className="pcm-form-input" placeholder="Tu teléfono" autoComplete="off" inputMode="numeric" value={registroData.telefono} onChange={(e) => handleRegistroChange('telefono', e.target.value)} />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Fecha de Nacimiento</label>
                <input type="date" className="pcm-form-input" autoComplete="off" value={registroData.cumple} onChange={(e) => handleRegistroChange('cumple', e.target.value)} />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Dirección</label>
                <GoogleMapsSelector
                  value={registroData.direccion}
                  onChange={(url) => handleRegistroChange('direccion', url)}
                  variant="form"
                />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Clave secreta</label>
                <input type="password" className="pcm-form-input" placeholder="E5cr1b3 un* c1aV3 5ecre7a" autoComplete="new-password" value={registroData.password} onChange={(e) => handleRegistroChange('password', e.target.value)} />
              </div>
              <button type="submit" className="pcm-btn-primary" disabled={registroCargando}>
                {registroCargando ? <><span className="pcm-btn-spinner" /> Uniéndote...</> : 'Únirme'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Thank-you modal */}
      {mostrarModalAgradecimiento && (
        <div className="pcm-sheet-overlay">
          <div className="pcm-agradecimiento-modal">
            <button className="pcm-agradecimiento-close" onClick={handleCerrarModalAgradecimiento} aria-label="Cerrar">✕</button>
            <img src="/agradecimientocdt.png" alt="¡Gracias por unirte a la comunidad!" className="pcm-agradecimiento-img" />
          </div>
        </div>
      )}

      {/* Modal — Quiero Mostrar mi Negocio Aquí (bottom sheet) */}
      {mostrarModalNegocioCta && (
        <div className="pcm-sheet-overlay">
          <div className="pcm-sheet pcm-sheet--form pcm-sheet--scroll">
            <div className="pcm-sheet-handle" />
            <div className="pcm-sheet-header">
              <h3 className="pcm-sheet-title">Mostrar mi Negocio Aquí</h3>
              <button className="pcm-sheet-close" onClick={handleCerrarModalNegocioCta} aria-label="Cerrar">✕</button>
            </div>
            <div className="pcm-form">
              <div className="pcm-form-group">
                <label className="pcm-form-label">Me interesa</label>
                <div className="pcm-radio-group">
                  <label className="pcm-radio-option">
                    <input type="radio" name="interes" value="Vender" checked={negocioCtaData.interes === 'Vender'} onChange={() => setNegocioCtaData(prev => ({ ...prev, interes: 'Vender' }))} />
                    <span>Vender</span>
                  </label>
                  <label className="pcm-radio-option">
                    <input type="radio" name="interes" value="Anunciarme" checked={negocioCtaData.interes === 'Anunciarme'} onChange={() => setNegocioCtaData(prev => ({ ...prev, interes: 'Anunciarme' }))} />
                    <span>Anunciarme</span>
                  </label>
                </div>
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Nombre de Negocio</label>
                <input type="text" className="pcm-form-input" placeholder="Nombre de tu negocio" value={negocioCtaData.nombreNegocio} onChange={(e) => setNegocioCtaData(prev => ({ ...prev, nombreNegocio: e.target.value }))} autoFocus />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Tipo de Negocio</label>
                <input type="text" className="pcm-form-input" placeholder="Ej. Restaurante, Papelería..." value={negocioCtaData.tipoNegocio} onChange={(e) => setNegocioCtaData(prev => ({ ...prev, tipoNegocio: e.target.value }))} />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Dudas o Comentarios</label>
                <textarea className="pcm-form-input pcm-form-textarea" placeholder="Escribe tus dudas o comentarios..." rows={3} value={negocioCtaData.dudasComentarios} onChange={(e) => setNegocioCtaData(prev => ({ ...prev, dudasComentarios: e.target.value }))} />
              </div>
              <button className="pcm-btn-whatsapp" onClick={handleEnviarWhatsappNegocio}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="pcm-whatsapp-icon" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.849L.057 23.516a.5.5 0 00.612.612l5.637-1.476A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.218-3.845 1.007 1.023-3.738-.24-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Enviar Whatsapp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Quiero ser repartidor CDT (bottom sheet) */}
      {mostrarModalRepartidor && (
        <div className="pcm-sheet-overlay">
          <div className="pcm-sheet pcm-sheet--form pcm-sheet--scroll">
            <div className="pcm-sheet-handle" />
            <div className="pcm-sheet-header">
              <h3 className="pcm-sheet-title">🛵 Quiero ser repartidor CDT!</h3>
              <button className="pcm-sheet-close" onClick={handleCerrarModalRepartidor} aria-label="Cerrar">✕</button>
            </div>
            <div className="pcm-form">
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Nombre completo</label>
                <input type="text" className="pcm-form-input" placeholder="Tu nombre completo" autoFocus value={repartidorData.nombre} onChange={(e) => setRepartidorData(prev => ({ ...prev, nombre: e.target.value }))} />
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Fotografía de vehículo</label>
                <input type="file" className="pcm-form-input pcm-form-file" accept="image/*" onChange={(e) => setRepartidorData(prev => ({ ...prev, fotoVehiculo: e.target.files?.[0] ?? null }))} />
                {repartidorData.fotoVehiculo && <span className="pcm-file-name">📎 {repartidorData.fotoVehiculo.name}</span>}
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Foto de placas de vehículo</label>
                <input type="file" className="pcm-form-input pcm-form-file" accept="image/*" onChange={(e) => setRepartidorData(prev => ({ ...prev, fotoPlacas: e.target.files?.[0] ?? null }))} />
                {repartidorData.fotoPlacas && <span className="pcm-file-name">📎 {repartidorData.fotoPlacas.name}</span>}
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label">Foto de repartidor</label>
                <input type="file" className="pcm-form-input pcm-form-file" accept="image/*" onChange={(e) => setRepartidorData(prev => ({ ...prev, fotoRepartidor: e.target.files?.[0] ?? null }))} />
                {repartidorData.fotoRepartidor && <span className="pcm-file-name">📎 {repartidorData.fotoRepartidor.name}</span>}
              </div>
              <div className="pcm-form-group">
                <label className="pcm-form-label pcm-form-label--required">Zonas de preferencia</label>
                <textarea className="pcm-form-input pcm-form-textarea" placeholder="Ej. Centro de Texcoco, San Miguel Coatlinchán..." rows={3} value={repartidorData.zonasPreferencia} onChange={(e) => setRepartidorData(prev => ({ ...prev, zonasPreferencia: e.target.value }))} />
              </div>
              <p className="pcm-repartidor-note">
                Al enviar, te contactaremos por WhatsApp. Si seleccionaste fotos, adjúntalas en el chat después de enviar el mensaje.
              </p>
              <button className="pcm-btn-whatsapp" onClick={handleEnviarWhatsappRepartidor}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="pcm-whatsapp-icon" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.524 5.849L.057 23.516a.5.5 0 00.612.612l5.637-1.476A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.218-3.845 1.007 1.023-3.738-.24-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Enviar Solicitud por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageClientesMobile;

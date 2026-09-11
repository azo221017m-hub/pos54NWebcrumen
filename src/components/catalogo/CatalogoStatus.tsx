/**
 * Indicador de estado del catálogo local (PWA).
 *
 * Muestra ONLINE / OFFLINE / SINCRONIZANDO / ACTUALIZADO / ERROR DE SINCRONIZACIÓN.
 * Para no estorbar la operación, en estado normal (online y actualizado) el
 * indicador se oculta solo; permanece visible mientras hay algo que comunicar
 * (sin conexión, sincronizando o error). Al tocarlo se expande y ofrece forzar
 * la sincronización o reconstruir la copia local.
 *
 * Se monta una sola vez en App, de modo que funciona igual en las pantallas web
 * y en las móviles.
 */

import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, CheckCircle2, AlertTriangle, Cloud } from 'lucide-react';
import useCatalogoSync from '../../hooks/useCatalogoSync';
import './CatalogoStatus.css';

const MS_ANTES_DE_OCULTAR = 4000;

const CatalogoStatus = () => {
  const { estado, version, lastSync, online, mensaje, sincronizarAhora, reconstruir } =
    useCatalogoSync();
  const [expandido, setExpandido] = useState(false);
  const [autoOculto, setAutoOculto] = useState(false);
  const [estadoPrevio, setEstadoPrevio] = useState(estado);

  // Al cambiar el estado, volver a mostrar el indicador. Ajustar estado durante
  // el render (patrón recomendado por React) evita una pasada extra de efecto.
  if (estado !== estadoPrevio) {
    setEstadoPrevio(estado);
    setAutoOculto(false);
  }

  // "ACTUALIZADO" se desvanece solo para no estorbar la operación;
  // el resto de estados permanece visible mientras haya algo que comunicar.
  useEffect(() => {
    if (estado !== 'actualizado' || !online || expandido) return;

    const temporizador = setTimeout(() => setAutoOculto(true), MS_ANTES_DE_OCULTAR);
    return () => clearTimeout(temporizador);
  }, [estado, online, expandido]);

  const visible = estado !== 'inactivo' && !autoOculto;

  if (!visible && !expandido) return null;

  const presentacion = (() => {
    switch (estado) {
      case 'sincronizando':
        return { clase: 'sincronizando', icono: <RefreshCw size={14} className="catalogo-status-girando" />, texto: 'SINCRONIZANDO' };
      case 'offline':
        return { clase: 'offline', icono: <CloudOff size={14} />, texto: 'OFFLINE' };
      case 'error':
        return { clase: 'error', icono: <AlertTriangle size={14} />, texto: 'ERROR DE SINCRONIZACIÓN' };
      case 'actualizado':
        return { clase: 'actualizado', icono: <CheckCircle2 size={14} />, texto: 'ACTUALIZADO' };
      default:
        return { clase: 'inactivo', icono: <Cloud size={14} />, texto: online ? 'ONLINE' : 'OFFLINE' };
    }
  })();

  const fechaSync = lastSync
    ? new Date(lastSync).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div
      className={`catalogo-status catalogo-status-${presentacion.clase} ${expandido ? 'catalogo-status-expandido' : ''}`}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className="catalogo-status-chip"
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
        title="Estado del catálogo local"
      >
        {presentacion.icono}
        <span className="catalogo-status-texto">{presentacion.texto}</span>
      </button>

      {expandido && (
        <div className="catalogo-status-detalle">
          <dl className="catalogo-status-datos">
            <div>
              {/* Versión del CATÁLOGO: la replica IndexedDB desde MySQL */}
              <dt>Catálogo</dt>
              <dd>v{version}</dd>
            </div>
            <div>
              {/* Versión de la APLICACIÓN: la actualiza el Service Worker.
                  Son dos ciclos de vida independientes. */}
              <dt>Aplicación</dt>
              <dd>v{__APP_VERSION__}</dd>
            </div>
            <div>
              <dt>Última sync</dt>
              <dd>{fechaSync}</dd>
            </div>
            <div>
              <dt>Conexión</dt>
              <dd>{online ? 'En línea' : 'Sin conexión'}</dd>
            </div>
          </dl>

          {mensaje && <p className="catalogo-status-mensaje">{mensaje}</p>}

          <div className="catalogo-status-acciones">
            <button type="button" onClick={sincronizarAhora} disabled={estado === 'sincronizando'}>
              Sincronizar ahora
            </button>
            <button
              type="button"
              className="catalogo-status-secundario"
              onClick={reconstruir}
              disabled={estado === 'sincronizando'}
            >
              Reconstruir catálogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoStatus;

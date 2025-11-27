import { useState, useEffect, useCallback } from 'react';
import { negociosService } from '../../../services/negociosService';
import type { Negocio, NegocioCompleto } from '../../../types/negocio.types';
import { ListaNegocios } from '../ListaNegocios/ListaNegocios';
import { FormularioNegocio } from '../FormularioNegocio/FormularioNegocio';
import './GestionNegocios.css';
import { Plus, ArrowLeft } from 'lucide-react';

interface GestionNegociosProps {
  onVistaChange?: (vista: 'lista' | 'formulario' | 'detalle') => void;
}

export const GestionNegocios = ({ onVistaChange }: GestionNegociosProps) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario' | 'detalle'>('lista');
  const [negocioEditar, setNegocioEditar] = useState<NegocioCompleto | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Notificar al padre cuando cambia la vista
  useEffect(() => {
    if (onVistaChange) {
      onVistaChange(vistaActual);
    }
  }, [vistaActual, onVistaChange]);

  const cargarNegocios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando negocios...');
      const data = await negociosService.obtenerNegocios();
      console.log('✅ Negocios cargados:', data);
      console.log('📊 Total de negocios:', data.length);
      setNegocios(data);
    } catch (error) {
      console.error('❌ Error al cargar negocios:', error);
      mostrarMensaje('error', 'Error al cargar los negocios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarNegocios();
  }, [cargarNegocios]);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleNuevoNegocio = () => {
    setNegocioEditar(null);
    setVistaActual('formulario');
  };

  const handleEditarNegocio = async (negocio: Negocio) => {
    try {
      if (!negocio.idNegocio) return;
      
      setLoading(true);
      const negocioCompleto = await negociosService.obtenerNegocioPorId(negocio.idNegocio);
      setNegocioEditar(negocioCompleto);
      setVistaActual('formulario');
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar el negocio');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarNegocio = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este negocio?')) {
      return;
    }

    try {
      await negociosService.eliminarNegocio(id);
      mostrarMensaje('success', 'Negocio eliminado exitosamente');
      await cargarNegocios();
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar el negocio');
      console.error('Error:', error);
    }
  };

  const handleSubmitFormulario = async (data: NegocioCompleto) => {
    try {
      // Validar nombre único
      const nombreDisponible = await negociosService.validarNombreUnico(
        data.negocio.nombreNegocio,
        negocioEditar?.negocio.idNegocio
      );

      if (!nombreDisponible) {
        mostrarMensaje('error', 'Ya existe un negocio con ese nombre');
        return;
      }

      // Obtener usuario de localStorage
      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      
      // Agregar auditoría
      data.negocio.usuarioauditoria = usuario?.alias || 'sistema';
      data.parametros.usuarioAuditoria = usuario?.alias || 'sistema';

      if (negocioEditar?.negocio.idNegocio) {
        // Actualizar
        await negociosService.actualizarNegocio(negocioEditar.negocio.idNegocio, data);
        mostrarMensaje('success', 'Negocio actualizado exitosamente');
      } else {
        // Crear - no enviar numeronegocio ya que se genera automáticamente
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { numeronegocio, ...negocioSinNumero } = data.negocio;
        const dataNuevo = { ...data, negocio: negocioSinNumero };
        await negociosService.crearNegocio(dataNuevo);
        mostrarMensaje('success', 'Negocio creado exitosamente');
      }

      await cargarNegocios();
      setVistaActual('lista');
      setNegocioEditar(null);
    } catch (error) {
      if (error instanceof Error) {
        mostrarMensaje('error', error.message);
      } else {
        mostrarMensaje('error', 'Error al guardar el negocio');
      }
      console.error('Error:', error);
    }
  };

  const handleCancelar = () => {
    setVistaActual('lista');
    setNegocioEditar(null);
  };

  return (
    <div className="gestion-negocios">
      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Vista Lista */}
      {vistaActual === 'lista' && (
        <>
          <div className="gestion-header">
            <div className="header-info">
              <h2>Gestión de Negocios</h2>
              <div className="contadores-negocios">
                <div className="contador-item">
                  <span className="contador-label">Total:</span>
                  <strong className="contador-valor total">{negocios.length}</strong>
                </div>
                <div className="contador-item">
                  <span className="contador-label">Activos:</span>
                  <strong className="contador-valor activos">
                    {negocios.filter(n => n.estatusnegocio === 1).length}
                  </strong>
                </div>
                <div className="contador-item">
                  <span className="contador-label">Inactivos:</span>
                  <strong className="contador-valor inactivos">
                    {negocios.filter(n => n.estatusnegocio === 0).length}
                  </strong>
                </div>
              </div>
            </div>
            <button className="btn-nuevo" onClick={handleNuevoNegocio}>
              <Plus size={20} />
              Nuevo Negocio
            </button>
          </div>

          <ListaNegocios
            negocios={negocios}
            onEditar={handleEditarNegocio}
            onEliminar={handleEliminarNegocio}
            loading={loading}
          />
        </>
      )}

      {/* Vista Formulario */}
      {vistaActual === 'formulario' && (
        <>
          <div className="gestion-header">
            <button className="btn-volver" onClick={handleCancelar}>
              <ArrowLeft size={20} />
              Volver a la lista
            </button>
          </div>

          <FormularioNegocio
            negocioEditar={negocioEditar}
            onSubmit={handleSubmitFormulario}
            onCancel={handleCancelar}
          />
        </>
      )}

      {/* Vista Detalle */}
      {vistaActual === 'detalle' && negocioEditar && (
        <>
          <div className="gestion-header">
            <button className="btn-volver" onClick={handleCancelar}>
              <ArrowLeft size={20} />
              Volver a la lista
            </button>
          </div>

          <div className="detalle-negocio">
            <div className="detalle-header">
              <h2>Detalle del Negocio</h2>
              <button className="btn-editar-detalle" onClick={() => handleEditarNegocio(negocioEditar.negocio)}>
                Editar
              </button>
            </div>

            <div className="detalle-contenido">
              <div className="detalle-seccion">
                <h3>Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <label>Número:</label>
                    <span>{negocioEditar.negocio.numeronegocio}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Nombre:</label>
                    <span>{negocioEditar.negocio.nombreNegocio}</span>
                  </div>
                  <div className="detalle-item">
                    <label>RFC:</label>
                    <span>{negocioEditar.negocio.rfcnegocio}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Tipo:</label>
                    <span>{negocioEditar.parametros.tipoNegocio}</span>
                  </div>
                  <div className="detalle-item full-width">
                    <label>Dirección:</label>
                    <span>{negocioEditar.negocio.direccionfiscalnegocio}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Contacto</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <label>Persona de Contacto:</label>
                    <span>{negocioEditar.negocio.contactonegocio}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Teléfono Contacto:</label>
                    <span>{negocioEditar.negocio.telefonocontacto}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Teléfono Negocio:</label>
                    <span>{negocioEditar.parametros.telefonoNegocio}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Teléfono Pedidos:</label>
                    <span>{negocioEditar.parametros.telefonoPedidos}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Configuración</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <label>Impresión Recibo:</label>
                    <span>{negocioEditar.parametros.impresionRecibo ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Impresión Tablero:</label>
                    <span>{negocioEditar.parametros.impresionTablero ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Impresión Comanda:</label>
                    <span>{negocioEditar.parametros.impresionComanda ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Envío WhatsApp:</label>
                    <span>{negocioEditar.parametros.envioWhats ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

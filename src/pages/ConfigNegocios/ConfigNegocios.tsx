import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Store } from 'lucide-react';
import { negociosService } from '../../services/negociosService';
import type { Negocio, NegocioCompleto } from '../../types/negocio.types';
import { ListaNegocios } from '../../components/negocios/ListaNegocios/ListaNegocios';
import { FormularioNegocio } from '../../components/negocios/FormularioNegocio/FormularioNegocio';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigNegocios.css';

export const ConfigNegocios = () => {
  const navigate = useNavigate();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario'>('lista');
  const [negocioEditar, setNegocioEditar] = useState<NegocioCompleto | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

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
      const idEliminado = await negociosService.eliminarNegocio(id);
      mostrarMensaje('success', 'Negocio eliminado exitosamente');
      setNegocios(prev => prev.filter(n => n.idNegocio !== idEliminado));
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar el negocio');
      console.error('Error:', error);
    }
  };

  const handleSubmitFormulario = async (data: NegocioCompleto) => {
    try {
      const nombreDisponible = await negociosService.validarNombreUnico(
        data.negocio.nombreNegocio,
        negocioEditar?.negocio.idNegocio
      );

      if (!nombreDisponible) {
        mostrarMensaje('error', 'Ya existe un negocio con ese nombre');
        return;
      }

      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      
      data.negocio.usuarioauditoria = usuario?.alias || 'sistema';
      data.parametros.usuarioAuditoria = usuario?.alias || 'sistema';

      if (negocioEditar?.negocio.idNegocio) {
        const negocioActualizado = await negociosService.actualizarNegocio(negocioEditar.negocio.idNegocio, data);
        mostrarMensaje('success', 'Negocio actualizado exitosamente');
        setNegocios(prev =>
          prev.map(n =>
            n.idNegocio === negocioActualizado.idNegocio ? negocioActualizado : n
          )
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { numeronegocio, ...negocioSinNumero } = data.negocio;
        const dataNuevo = { ...data, negocio: negocioSinNumero };
        const nuevoNegocio = await negociosService.crearNegocio(dataNuevo);
        mostrarMensaje('success', 'Negocio creado exitosamente');
        setNegocios(prev => [...prev, nuevoNegocio]);
      }

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
    <div className="config-negocios-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
          <div className="mensaje-contenido">
            <span className="mensaje-texto">{mensaje.texto}</span>
            <button
              className="mensaje-cerrar"
              onClick={() => setMensaje(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header con botones */}
      <div className="config-header">
        {vistaActual === 'lista' ? (
          <>
            <button className="btn-volver" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
            
            <div className="config-header-content">
              <div className="config-title">
                <Store size={32} className="config-icon" />
                <div>
                  <h1>Gestión de Negocios</h1>
                  <p>
                    Total: {negocios.length} | 
                    Activos: {negocios.filter(n => n.estatusnegocio === 1).length} | 
                    Inactivos: {negocios.filter(n => n.estatusnegocio === 0).length}
                  </p>
                </div>
              </div>
              <button onClick={handleNuevoNegocio} className="btn-nuevo">
                <Plus size={20} />
                Nuevo Negocio
              </button>
            </div>
          </>
        ) : (
          <button className="btn-volver" onClick={handleCancelar}>
            <ArrowLeft size={20} />
            Volver a la lista
          </button>
        )}
      </div>

      {/* Contenedor fijo con Lista o Formulario */}
      <div className="config-container">
        {vistaActual === 'lista' ? (
          loading ? (
            <LoadingSpinner size={48} message="Cargando negocios..." />
          ) : (
            <ListaNegocios
              negocios={negocios}
              onEditar={handleEditarNegocio}
              onEliminar={handleEliminarNegocio}
              loading={loading}
            />
          )
        ) : (
          <FormularioNegocio
            negocioEditar={negocioEditar}
            onSubmit={handleSubmitFormulario}
            onCancel={handleCancelar}
          />
        )}
      </div>
    </div>
  );
};

export default ConfigNegocios;

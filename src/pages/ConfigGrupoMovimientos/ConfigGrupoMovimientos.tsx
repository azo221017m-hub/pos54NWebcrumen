import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Loader } from 'lucide-react';
import type { GrupoMovimientos, GrupoMovimientosCreate, GrupoMovimientosUpdate } from '../../types/grupoMovimientos.types';
import {
  obtenerGrupoMovimientos,
  crearGrupoMovimientos,
  actualizarGrupoMovimientos,
  eliminarGrupoMovimientos
} from '../../services/grupoMovimientosService';
import ListaGrupoMovimientos from '../../components/grupoMovimientos/ListaGrupoMovimientos/ListaGrupoMovimientos';
import FormularioGrupoMovimientos from '../../components/grupoMovimientos/FormularioGrupoMovimientos/FormularioGrupoMovimientos';
import './ConfigGrupoMovimientos.css';

const ConfigGrupoMovimientos: React.FC = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<GrupoMovimientos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoEditar, setGrupoEditar] = useState<GrupoMovimientos | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = parseInt(localStorage.getItem('idnegocio') || '1');

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarGrupos = useCallback(async () => {
    try {
      console.log('🔷 ConfigGrupoMovimientos - Iniciando carga de grupos...');
      setCargando(true);
      const data = await obtenerGrupoMovimientos();
      console.log('🔷 ConfigGrupoMovimientos - Datos recibidos:', data, 'Es array:', Array.isArray(data));
      setGrupos(data);
    } catch (error) {
      console.error('❌ ConfigGrupoMovimientos - Error al cargar grupos:', error);
      mostrarMensaje('error', 'Error al cargar los grupos de movimientos');
      setGrupos([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarGrupos();
  }, [cargarGrupos]);

  const handleNuevoGrupo = () => {
    setGrupoEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarGrupo = (grupo: GrupoMovimientos) => {
    setGrupoEditar(grupo);
    setMostrarFormulario(true);
  };

  const handleGuardarGrupo = async (grupoData: GrupoMovimientosCreate) => {
    try {
      if (grupoEditar) {
        const dataUpdate: GrupoMovimientosUpdate = {
          naturalezacuentacontable: grupoData.naturalezacuentacontable,
          nombrecuentacontable: grupoData.nombrecuentacontable,
          tipocuentacontable: grupoData.tipocuentacontable
        };
        const grupoActualizado = await actualizarGrupoMovimientos(grupoEditar.id_cuentacontable, dataUpdate);
        mostrarMensaje('success', 'Grupo de movimientos actualizado correctamente');
        setMostrarFormulario(false);
        setGrupoEditar(null);
        setGrupos(prev =>
          prev.map(g =>
            g.id_cuentacontable === grupoActualizado.id_cuentacontable ? grupoActualizado : g
          )
        );
      } else {
        const nuevoGrupo = await crearGrupoMovimientos(grupoData);
        mostrarMensaje('success', 'Grupo de movimientos creado correctamente');
        setMostrarFormulario(false);
        setGrupoEditar(null);
        setGrupos(prev => [...prev, nuevoGrupo]);
      }
    } catch (error) {
      console.error('Error al guardar grupo:', error);
      mostrarMensaje('error', 'Error al guardar el grupo de movimientos');
    }
  };

  const handleEliminarGrupo = async (id: number) => {
    const grupo = grupos.find(g => g.id_cuentacontable === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el grupo "${grupo?.nombrecuentacontable}"?\n\nEsta acción desactivará el grupo de movimientos.`
    )) {
      return;
    }

    try {
      const idEliminado = await eliminarGrupoMovimientos(id);
      mostrarMensaje('success', 'Grupo de movimientos eliminado correctamente');
      setGrupos(prev => prev.filter(g => g.id_cuentacontable !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      mostrarMensaje('error', 'Error al eliminar el grupo de movimientos');
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setGrupoEditar(null);
  };

  return (
    <div className="config-grupo-movimientos-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo}`}>
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
        <button className="btn-volver" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <FileText size={32} className="config-icon" />
            <div>
              <h1>Gestión de Grupos de Movimientos</h1>
              <p>Administra los grupos de movimientos del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevoGrupo} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Grupo
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando grupos de movimientos...</p>
          </div>
        ) : (
          <ListaGrupoMovimientos
            grupos={grupos}
            onEdit={handleEditarGrupo}
            onDelete={handleEliminarGrupo}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioGrupoMovimientos
          grupo={grupoEditar}
          idnegocio={idnegocio}
          onSave={handleGuardarGrupo}
          onCancel={handleCancelarFormulario}
        />
      )}
    </div>
  );
};

export default ConfigGrupoMovimientos;

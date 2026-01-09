import React, { useState, useEffect, useCallback } from 'react';
import type { GrupoMovimientos, GrupoMovimientosCreate, GrupoMovimientosUpdate } from '../../../types/grupoMovimientos.types';
import {
  obtenerGrupoMovimientos,
  crearGrupoMovimientos,
  actualizarGrupoMovimientos,
  eliminarGrupoMovimientos
} from '../../../services/grupoMovimientosService';
import ListaGrupoMovimientos from '../ListaGrupoMovimientos/ListaGrupoMovimientos';
import FormularioGrupoMovimientos from '../FormularioGrupoMovimientos/FormularioGrupoMovimientos';
import { Plus, FileText, Loader } from 'lucide-react';
import './GestionGrupoMovimientos.css';

interface Props {
  idnegocio: number;
}

const GestionGrupoMovimientos: React.FC<Props> = ({ idnegocio }) => {
  const [grupos, setGrupos] = useState<GrupoMovimientos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoEditar, setGrupoEditar] = useState<GrupoMovimientos | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarGrupos = useCallback(async () => {
    try {
      console.log('🔷 GestionGrupoMovimientos - Iniciando carga de grupos...');
      setCargando(true);
      const data = await obtenerGrupoMovimientos();
      console.log('🔷 GestionGrupoMovimientos - Datos recibidos:', data, 'Es array:', Array.isArray(data));
      setGrupos(data);
    } catch (error) {
      console.error('❌ GestionGrupoMovimientos - Error al cargar grupos:', error);
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
        // Actualizar grupo existente
        const dataUpdate: GrupoMovimientosUpdate = {
          naturalezacuentacontable: grupoData.naturalezacuentacontable,
          nombrecuentacontable: grupoData.nombrecuentacontable,
          tipocuentacontable: grupoData.tipocuentacontable
        };
        await actualizarGrupoMovimientos(grupoEditar.id_cuentacontable, dataUpdate);
        mostrarMensaje('success', 'Grupo de movimientos actualizado correctamente');
      } else {
        // Crear nuevo grupo
        await crearGrupoMovimientos(grupoData);
        mostrarMensaje('success', 'Grupo de movimientos creado correctamente');
      }
      setMostrarFormulario(false);
      setGrupoEditar(null);
      cargarGrupos();
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
      await eliminarGrupoMovimientos(id);
      mostrarMensaje('success', 'Grupo de movimientos eliminado correctamente');
      cargarGrupos();
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
    <div className="gestion-grupo-movimientos">
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

      <div className="grupos-header">
        <div className="grupos-header-content">
          <div className="grupos-title">
            <FileText size={32} className="grupos-icon" />
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

      <div className="grupos-content">
        {cargando ? (
          <div className="grupos-cargando">
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

export default GestionGrupoMovimientos;

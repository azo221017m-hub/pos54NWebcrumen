import React, { useState, useEffect, useCallback } from 'react';
import type { Insumo, InsumoCreate } from '../../../types/insumo.types';
import {
  obtenerInsumos,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo
} from '../../../services/insumosService';
import ListaInsumos from '../ListaInsumos/ListaInsumos';
import FormularioInsumo from '../FormularioInsumo/FormularioInsumo';
import { Plus, Package, Loader } from 'lucide-react';
import './GestionInsumos.css';

interface Props {
  idnegocio: number;
}

const GestionInsumos: React.FC<Props> = ({ idnegocio }) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState<Insumo | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarInsumos = useCallback(async () => {
    try {
      console.log('🔷 GestionInsumos - Iniciando carga de insumos...');
      setCargando(true);
      const data = await obtenerInsumos(idnegocio);
      console.log('🔷 GestionInsumos - Datos recibidos:', data, 'Es array:', Array.isArray(data));
      setInsumos(data);
    } catch (error) {
      console.error('❌ GestionInsumos - Error al cargar insumos:', error);
      mostrarMensaje('error', 'Error al cargar los insumos');
      setInsumos([]); // Asegurar que siempre sea un array en caso de error
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  const handleNuevo = () => {
    setInsumoEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (insumo: Insumo) => {
    setInsumoEditar(insumo);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setInsumoEditar(null);
  };

  const handleCrear = async (data: InsumoCreate) => {
    try {
      await crearInsumo(data);
      mostrarMensaje('success', 'Insumo creado exitosamente');
      setMostrarFormulario(false);
      cargarInsumos();
    } catch (error) {
      console.error('Error al crear insumo:', error);
      mostrarMensaje('error', 'Error al crear el insumo');
    }
  };

  const handleActualizar = async (data: InsumoCreate) => {
    if (!insumoEditar) return;

    try {
      await actualizarInsumo(insumoEditar.id_insumo, data);
      mostrarMensaje('success', 'Insumo actualizado exitosamente');
      setMostrarFormulario(false);
      setInsumoEditar(null);
      cargarInsumos();
    } catch (error) {
      console.error('Error al actualizar insumo:', error);
      mostrarMensaje('error', 'Error al actualizar el insumo');
    }
  };

  const handleEliminar = async (id: number) => {
    const insumo = insumos.find(i => i.id_insumo === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el insumo "${insumo?.nombre}"?\n\nEsta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      await eliminarInsumo(id);
      mostrarMensaje('success', 'Insumo eliminado exitosamente');
      cargarInsumos();
    } catch (error) {
      console.error('Error al eliminar insumo:', error);
      mostrarMensaje('error', 'Error al eliminar el insumo');
    }
  };

  if (cargando) {
    return (
      <div className="gestion-insumos-cargando">
        <Loader className="spinner" size={48} />
        <p>Cargando insumos...</p>
      </div>
    );
  }

  return (
    <div className="gestion-insumos">
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

      {!mostrarFormulario ? (
        <>
          {/* Header con botón Nuevo */}
          <div className="gestion-header">
            <div className="header-info">
              <div className="header-icon">
                <Package size={32} />
              </div>
              <div className="header-text">
                <h2>Gestión de Insumos</h2>
                <p>Administra los insumos del negocio</p>
              </div>
            </div>
            <button className="btn-nuevo" onClick={handleNuevo}>
              <Plus size={20} />
              Nuevo Insumo
            </button>
          </div>

          {/* Lista con scroll */}
          <div className="insumos-scroll-container">
            <ListaInsumos
              insumos={insumos}
              onEdit={handleEditar}
              onDelete={handleEliminar}
            />
          </div>
        </>
      ) : (
        <div className="formulario-wrapper">
          <FormularioInsumo
            insumoEditar={insumoEditar}
            onSubmit={insumoEditar ? handleActualizar : handleCrear}
            onCancel={handleCancelar}
            loading={cargando}
          />
        </div>
      )}
    </div>
  );
};

export default GestionInsumos;

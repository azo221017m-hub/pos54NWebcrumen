import React, { useState, useEffect, useCallback } from 'react';
import type { Proveedor, ProveedorCreate } from '../../../types/proveedor.types';
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../../../services/proveedoresService';
import ListaProveedores from '../ListaProveedores/ListaProveedores';
import FormularioProveedor from '../FormularioProveedor/FormularioProveedor';
import { Plus, Truck, Loader } from 'lucide-react';
import './GestionProveedores.css';

interface Props {
  idnegocio: number;
}

const GestionProveedores: React.FC<Props> = ({ idnegocio }) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerProveedores(idnegocio);
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      mostrarMensaje('error', 'Error al cargar los proveedores');
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  const handleNuevo = () => {
    setProveedorEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (proveedor: Proveedor) => {
    setProveedorEditar(proveedor);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setProveedorEditar(null);
  };

  const handleCrear = async (data: ProveedorCreate) => {
    try {
      await crearProveedor(data);
      mostrarMensaje('success', 'Proveedor creado exitosamente');
      setMostrarFormulario(false);
      cargarProveedores();
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      mostrarMensaje('error', 'Error al crear el proveedor');
    }
  };

  const handleActualizar = async (data: ProveedorCreate) => {
    if (!proveedorEditar) return;

    try {
      const dataUpdate = {
        ...data,
        id_proveedor: proveedorEditar.id_proveedor,
        activo: data.activo !== undefined ? data.activo : 1
      };
      
      await actualizarProveedor(proveedorEditar.id_proveedor, dataUpdate);
      mostrarMensaje('success', 'Proveedor actualizado exitosamente');
      setMostrarFormulario(false);
      setProveedorEditar(null);
      cargarProveedores();
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      mostrarMensaje('error', 'Error al actualizar el proveedor');
    }
  };

  const handleEliminar = async (id: number) => {
    const proveedor = proveedores.find(p => p.id_proveedor === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar al proveedor "${proveedor?.nombre}"?\n\nEsta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      await eliminarProveedor(id);
      mostrarMensaje('success', 'Proveedor eliminado exitosamente');
      cargarProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      mostrarMensaje('error', 'Error al eliminar el proveedor');
    }
  };

  if (cargando) {
    return (
      <div className="gestion-proveedores-cargando">
        <Loader className="spinner" size={48} />
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="gestion-proveedores">
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
          <div className="gestion-header">
            <div className="header-info">
              <div className="header-icon">
                <Truck size={32} />
              </div>
              <div className="header-text">
                <h2>Gestión de Proveedores</h2>
                <p>Administra tus proveedores</p>
              </div>
            </div>
            <button className="btn-nuevo" onClick={handleNuevo}>
              <Plus size={20} />
              Nuevo Proveedor
            </button>
          </div>

          <div className="proveedores-scroll-container">
            <ListaProveedores
              proveedores={proveedores}
              onEdit={handleEditar}
              onDelete={handleEliminar}
            />
          </div>
        </>
      ) : (
        <div className="formulario-wrapper">
          <FormularioProveedor
            proveedorEditar={proveedorEditar}
            onSubmit={proveedorEditar ? handleActualizar : handleCrear}
            onCancel={handleCancelar}
            loading={cargando}
          />
        </div>
      )}
    </div>
  );
};

export default GestionProveedores;

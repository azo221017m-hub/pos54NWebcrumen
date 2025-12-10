import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Truck, Loader } from 'lucide-react';
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../../../types/proveedor.types';
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../../../services/proveedoresService';
import ListaProveedores from '../ListaProveedores/ListaProveedores';
import FormularioProveedor from '../FormularioProveedor/FormularioProveedor';
import './GestionProveedores.css';

const GestionProveedores: React.FC = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      mostrarMensaje('error', 'Error al cargar los proveedores');
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  const handleNuevo = () => {
    setProveedorSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    const proveedor = proveedores.find(p => p.id_proveedor === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar al proveedor "${proveedor?.nombre}"?\n\nEsta acción desactivará el proveedor.`
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

  const handleSubmit = async (data: ProveedorCreate | ProveedorUpdate) => {
    setGuardando(true);

    try {
      if ('id_proveedor' in data) {
        await actualizarProveedor(data.id_proveedor, data);
        mostrarMensaje('success', 'Proveedor actualizado exitosamente');
        setMostrarFormulario(false);
        setProveedorSeleccionado(null);
        cargarProveedores();
      } else {
        await crearProveedor(data);
        mostrarMensaje('success', 'Proveedor creado exitosamente');
        setMostrarFormulario(false);
        cargarProveedores();
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      mostrarMensaje('error', 'Error al guardar el proveedor');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setProveedorSeleccionado(null);
  };

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-proveedores">
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

      <div className="proveedores-header">
        <div className="proveedores-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="proveedores-header-content">
          <div className="proveedores-title">
            <Truck size={32} className="proveedores-icon" />
            <div>
              <h1>Gestión de Proveedores</h1>
              <p>Administra los proveedores del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="proveedores-content">
        {cargando ? (
          <div className="proveedores-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando proveedores...</p>
          </div>
        ) : (
          <ListaProveedores
            proveedores={proveedores}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {mostrarFormulario && (
        <FormularioProveedor
          proveedorEditar={proveedorSeleccionado}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
          loading={guardando}
        />
      )}
    </div>
  );
};

export default GestionProveedores;

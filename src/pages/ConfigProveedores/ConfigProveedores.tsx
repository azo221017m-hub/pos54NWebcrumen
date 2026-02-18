import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Truck, Edit, Trash2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../../types/proveedor.types';
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../../services/proveedoresService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import FormularioProveedor from '../../components/proveedores/FormularioProveedor/FormularioProveedor';
import './ConfigProveedores.css';

const ConfigProveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
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
      const idEliminado = await eliminarProveedor(id);
      mostrarMensaje('success', 'Proveedor eliminado exitosamente');
      setProveedores(prev => prev.filter(p => p.id_proveedor !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      mostrarMensaje('error', 'Error al eliminar el proveedor');
    }
  };

  const handleSubmit = async (data: ProveedorCreate | ProveedorUpdate) => {
    setGuardando(true);

    try {
      if ('id_proveedor' in data) {
        const proveedorActualizado = await actualizarProveedor(data.id_proveedor, data);
        mostrarMensaje('success', 'Proveedor actualizado exitosamente');
        setMostrarFormulario(false);
        setProveedorSeleccionado(null);
        setProveedores(prev =>
          prev.map(p =>
            p.id_proveedor === proveedorActualizado.id_proveedor ? proveedorActualizado : p
          )
        );
      } else {
        const nuevoProveedor = await crearProveedor(data);
        mostrarMensaje('success', 'Proveedor creado exitosamente');
        setMostrarFormulario(false);
        setProveedores(prev => [...prev, nuevoProveedor]);
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

  return (
    <>
      {/* Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Proveedores"
        headerSubtitle="Administra los proveedores del sistema"
        backButtonText="Regresa a DASHBOARD"
        backButtonPath="/dashboard"
        actionButton={{
          text: 'Nuevo Proveedor',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando proveedores..."
        isEmpty={proveedores.length === 0}
        emptyIcon={<Truck size={80} />}
        emptyMessage="No hay proveedores registrados. Comienza agregando uno nuevo."
      >
        <div className="standard-cards-grid">
          {proveedores.map((proveedor) => (
            <StandardCard
              key={proveedor.id_proveedor}
              title={proveedor.nombre}
              fields={[
                {
                  label: 'RFC',
                  value: proveedor.rfc || 'No especificado'
                },
                {
                  label: 'Teléfono',
                  value: proveedor.telefono ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} />
                      {proveedor.telefono}
                    </span>
                  ) : 'No especificado'
                },
                {
                  label: 'Correo',
                  value: proveedor.correo ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} />
                      {proveedor.correo}
                    </span>
                  ) : 'No especificado'
                },
                {
                  label: 'Dirección',
                  value: proveedor.direccion ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {proveedor.direccion}
                    </span>
                  ) : 'No especificada'
                },
                {
                  label: 'Banco',
                  value: proveedor.banco ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={14} />
                      {proveedor.banco}
                    </span>
                  ) : 'No especificado'
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: proveedor.activo ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  )
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={16} />,
                  onClick: () => handleEditar(proveedor),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={16} />,
                  onClick: () => handleEliminar(proveedor.id_proveedor),
                  variant: 'delete'
                }
              ]}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioProveedor
          proveedorEditar={proveedorSeleccionado}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
          loading={guardando}
        />
      )}
    </>
  );
};

export default ConfigProveedores;

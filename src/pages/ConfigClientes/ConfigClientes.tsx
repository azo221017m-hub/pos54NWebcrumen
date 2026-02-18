import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Edit, Trash2, Phone, Mail, MapPin, Award } from 'lucide-react';
import type { Cliente, ClienteCreate } from '../../types/cliente.types';
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../../services/clientesService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import FormularioCliente from '../../components/clientes/FormularioCliente/FormularioCliente';
import './ConfigClientes.css';

const ConfigClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      mostrarMensaje('error', 'Error al cargar los clientes');
      setClientes([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const handleNuevo = () => {
    setClienteEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setClienteEditar(null);
  };

  const handleCrear = async (data: ClienteCreate) => {
    try {
      const nuevoCliente = await crearCliente(data);
      mostrarMensaje('success', 'Cliente creado exitosamente');
      setMostrarFormulario(false);
      // Actualizar estado local sin recargar
      setClientes(prev => [...prev, nuevoCliente]);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      mostrarMensaje('error', 'Error al crear el cliente');
    }
  };

  const handleActualizar = async (data: ClienteCreate) => {
    if (!clienteEditar) return;

    try {
      const dataUpdate = {
        ...data,
        categoriacliente: data.categoriacliente || 'NUEVO',
        estatus_seguimiento: data.estatus_seguimiento || 'NINGUNO',
        medio_contacto: data.medio_contacto || 'WHATSAPP',
        puntosfidelidad: data.puntosfidelidad || 0,
        estatus: data.estatus !== undefined ? data.estatus : 1
      };
      
      const clienteActualizado = await actualizarCliente(clienteEditar.idCliente, dataUpdate);
      mostrarMensaje('success', 'Cliente actualizado exitosamente');
      setMostrarFormulario(false);
      setClienteEditar(null);
      // Actualizar estado local sin recargar
      setClientes(prev =>
        prev.map(cliente =>
          cliente.idCliente === clienteActualizado.idCliente ? clienteActualizado : cliente
        )
      );
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      mostrarMensaje('error', 'Error al actualizar el cliente');
    }
  };

  const handleEliminar = async (id: number) => {
    const cliente = clientes.find(c => c.idCliente === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar al cliente "${cliente?.nombre}"?\n\nEsta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      const idEliminado = await eliminarCliente(id);
      mostrarMensaje('success', 'Cliente eliminado exitosamente');
      setClientes(prev => prev.filter(cliente => cliente.idCliente !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      mostrarMensaje('error', 'Error al eliminar el cliente');
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colores: Record<string, string> = {
      'VIP': '#8b5cf6',
      'FRECUENTE': '#10b981',
      'RECURRENTE': '#3b82f6',
      'NUEVO': '#f59e0b',
      'INACTIVO': '#6b7280'
    };
    return colores[categoria] || '#6b7280';
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
        headerTitle="Gestión de Clientes"
        headerSubtitle="Administra tu cartera de clientes"
        backButtonText="Regresa a DASHBOARD"
        backButtonPath="/dashboard"
        actionButton={{
          text: 'Nuevo Cliente',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando clientes..."
        isEmpty={clientes.length === 0}
        emptyIcon={<Users size={80} />}
        emptyMessage="No hay clientes registrados. Comienza agregando uno nuevo."
      >
        <div className="standard-cards-grid">
          {clientes.map((cliente) => (
            <StandardCard
              key={cliente.idCliente}
              title={cliente.nombre}
              fields={[
                {
                  label: 'Categoría',
                  value: (
                    <span style={{ 
                      color: getCategoriaColor(cliente.categoriacliente),
                      fontWeight: 600
                    }}>
                      {cliente.categoriacliente}
                    </span>
                  )
                },
                {
                  label: 'Teléfono',
                  value: cliente.telefono ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} />
                      {cliente.telefono}
                    </span>
                  ) : 'No especificado'
                },
                {
                  label: 'Email',
                  value: cliente.email ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} />
                      {cliente.email}
                    </span>
                  ) : 'No especificado'
                },
                {
                  label: 'Dirección',
                  value: cliente.direccion ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {cliente.direccion}
                    </span>
                  ) : 'No especificada'
                },
                {
                  label: 'Puntos Fidelidad',
                  value: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 600 }}>
                      <Award size={14} />
                      {cliente.puntosfidelidad}
                    </span>
                  )
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: cliente.estatus ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {cliente.estatus ? 'Activo' : 'Inactivo'}
                    </span>
                  )
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={16} />,
                  onClick: () => handleEditar(cliente),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={16} />,
                  onClick: () => handleEliminar(cliente.idCliente),
                  variant: 'delete'
                }
              ]}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCliente
          clienteEditar={clienteEditar}
          onSubmit={clienteEditar ? handleActualizar : handleCrear}
          onCancel={handleCancelar}
          loading={cargando}
        />
      )}
    </>
  );
};

export default ConfigClientes;

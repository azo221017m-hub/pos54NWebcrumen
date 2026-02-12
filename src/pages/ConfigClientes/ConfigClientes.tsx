import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import type { Cliente, ClienteCreate } from '../../types/cliente.types';
import {
  useClientesQuery,
  useCrearClienteMutation,
  useActualizarClienteMutation,
  useEliminarClienteMutation,
} from '../../hooks/queries/useClientes';
import ListaClientes from '../../components/clientes/ListaClientes/ListaClientes';
import FormularioCliente from '../../components/clientes/FormularioCliente/FormularioCliente';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigClientes.css';

const ConfigClientes: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // TanStack Query hooks
  const { data: clientes = [], isLoading: cargando } = useClientesQuery();
  const crearClienteMutation = useCrearClienteMutation();
  const actualizarClienteMutation = useActualizarClienteMutation();
  const eliminarClienteMutation = useEliminarClienteMutation();

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

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
      await crearClienteMutation.mutateAsync(data);
      mostrarMensaje('success', 'Cliente creado exitosamente');
      setMostrarFormulario(false);
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
      
      await actualizarClienteMutation.mutateAsync({ id: clienteEditar.idCliente, data: dataUpdate });
      mostrarMensaje('success', 'Cliente actualizado exitosamente');
      setMostrarFormulario(false);
      setClienteEditar(null);
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
      await eliminarClienteMutation.mutateAsync(id);
      mostrarMensaje('success', 'Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      mostrarMensaje('error', 'Error al eliminar el cliente');
    }
  };

  return (
    <div className="config-clientes-page">
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
            <Users size={32} className="config-icon" />
            <div>
              <h1>Gestión de Clientes</h1>
              <p>Administra tu cartera de clientes</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando clientes..." />
        ) : (
          <ListaClientes
            clientes={clientes}
            onEdit={handleEditar}
            onDelete={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCliente
          clienteEditar={clienteEditar}
          onSubmit={clienteEditar ? handleActualizar : handleCrear}
          onCancel={handleCancelar}
          loading={cargando}
        />
      )}
    </div>
  );
};

export default ConfigClientes;

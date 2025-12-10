import React, { useState, useEffect, useCallback } from 'react';
import type { Cliente, ClienteCreate } from '../../../types/cliente.types';
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../../../services/clientesService';
import ListaClientes from '../ListaClientes/ListaClientes';
import FormularioCliente from '../FormularioCliente/FormularioCliente';
import { Plus, Users, Loader } from 'lucide-react';
import './GestionClientes.css';

interface Props {
  idnegocio: number;
}

const GestionClientes: React.FC<Props> = ({ idnegocio: _idnegocio }) => {
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
      await crearCliente(data);
      mostrarMensaje('success', 'Cliente creado exitosamente');
      setMostrarFormulario(false);
      cargarClientes();
    } catch (error) {
      console.error('Error al crear cliente:', error);
      mostrarMensaje('error', 'Error al crear el cliente');
    }
  };

  const handleActualizar = async (data: ClienteCreate) => {
    if (!clienteEditar) return;

    try {
      // Convertir ClienteCreate a ClienteUpdate asegurando campos requeridos
      const dataUpdate = {
        ...data,
        categoriacliente: data.categoriacliente || 'NUEVO',
        estatus_seguimiento: data.estatus_seguimiento || 'NINGUNO',
        medio_contacto: data.medio_contacto || 'WHATSAPP',
        puntosfidelidad: data.puntosfidelidad || 0,
        estatus: data.estatus !== undefined ? data.estatus : 1
      };
      
      await actualizarCliente(clienteEditar.idCliente, dataUpdate);
      mostrarMensaje('success', 'Cliente actualizado exitosamente');
      setMostrarFormulario(false);
      setClienteEditar(null);
      cargarClientes();
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
      await eliminarCliente(id);
      mostrarMensaje('success', 'Cliente eliminado exitosamente');
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      mostrarMensaje('error', 'Error al eliminar el cliente');
    }
  };

  if (cargando) {
    return (
      <div className="gestion-clientes-cargando">
        <Loader className="spinner" size={48} />
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="gestion-clientes">
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
                <Users size={32} />
              </div>
              <div className="header-text">
                <h2>Gestión de Clientes</h2>
                <p>Administra tu cartera de clientes</p>
              </div>
            </div>
            <button className="btn-nuevo" onClick={handleNuevo}>
              <Plus size={20} />
              Nuevo Cliente
            </button>
          </div>

          <div className="clientes-scroll-container">
            <ListaClientes
              clientes={clientes}
              onEdit={handleEditar}
              onDelete={handleEliminar}
            />
          </div>
        </>
      ) : (
        <div className="formulario-wrapper">
          <FormularioCliente
            clienteEditar={clienteEditar}
            onSubmit={clienteEditar ? handleActualizar : handleCrear}
            onCancel={handleCancelar}
            loading={cargando}
          />
        </div>
      )}
    </div>
  );
};

export default GestionClientes;

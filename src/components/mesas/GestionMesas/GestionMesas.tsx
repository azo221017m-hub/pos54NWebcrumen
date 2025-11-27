import React, { useState, useEffect, useCallback } from 'react';
import type { Mesa, MesaCreate, MesaUpdate } from '../../../types/mesa.types';
import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa
} from '../../../services/mesasService';
import FormularioMesa from '../FormularioMesa/FormularioMesa';
import ListaMesas from '../ListaMesas/ListaMesas';
import { Plus, Table2, Loader } from 'lucide-react';
import './GestionMesas.css';

interface GestionMesasProps {
  idnegocio: number;
}

const GestionMesas: React.FC<GestionMesasProps> = ({ idnegocio }) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesaEditar, setMesaEditar] = useState<Mesa | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const cargarMesas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerMesas(idnegocio);
      setMesas(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      mostrarMensaje('error', 'Error al cargar las mesas');
    } finally {
      setCargando(false);
    }
  }, [idnegocio]);

  useEffect(() => {
    cargarMesas();
  }, [cargarMesas]);

  const handleCrearMesa = async (mesa: MesaCreate | MesaUpdate) => {
    try {
      await crearMesa(mesa as MesaCreate);
      mostrarMensaje('success', 'Mesa creada exitosamente');
      setMostrarFormulario(false);
      cargarMesas();
    } catch (error) {
      console.error('Error al crear mesa:', error);
      mostrarMensaje('error', 'Error al crear la mesa');
    }
  };

  const handleActualizarMesa = async (mesa: MesaCreate | MesaUpdate) => {
    if (!mesaEditar) return;
    
    try {
      await actualizarMesa(mesaEditar.idmesa, mesa as MesaUpdate);
      mostrarMensaje('success', 'Mesa actualizada exitosamente');
      setMostrarFormulario(false);
      setMesaEditar(undefined);
      cargarMesas();
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      mostrarMensaje('error', 'Error al actualizar la mesa');
    }
  };

  const handleEliminarMesa = async (idmesa: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      return;
    }

    try {
      await eliminarMesa(idmesa);
      mostrarMensaje('success', 'Mesa eliminada exitosamente');
      cargarMesas();
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      mostrarMensaje('error', 'Error al eliminar la mesa');
    }
  };

  const handleEditarMesa = (mesa: Mesa) => {
    setMesaEditar(mesa);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMesaEditar(undefined);
  };

  const handleNuevaMesa = () => {
    setMesaEditar(undefined);
    setMostrarFormulario(true);
  };

  if (cargando) {
    return (
      <div className="gestion-mesas-cargando">
        <Loader size={48} className="spinner" />
        <p>Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div className="gestion-mesas">
      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {!mostrarFormulario ? (
        <>
          <div className="gestion-header">
            <div className="header-info">
              <div className="header-icon">
                <Table2 size={32} />
              </div>
              <div>
                <h2>Gestión de Mesas</h2>
                <p>Administra las mesas del restaurante</p>
              </div>
            </div>
            <button onClick={handleNuevaMesa} className="btn-nueva-mesa">
              <Plus size={20} />
              Nueva Mesa
            </button>
          </div>

          <div className="gestion-stats">
            <div className="stat-card">
              <span className="stat-numero">{mesas.length}</span>
              <span className="stat-label">Total Mesas</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero">
                {mesas.filter(m => m.estatusmesa === 'DISPONIBLE').length}
              </span>
              <span className="stat-label">Disponibles</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero">
                {mesas.filter(m => m.estatusmesa === 'OCUPADA').length}
              </span>
              <span className="stat-label">Ocupadas</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero">
                {mesas.filter(m => m.estatusmesa === 'RESERVADA').length}
              </span>
              <span className="stat-label">Reservadas</span>
            </div>
          </div>

          <div className="mesas-scroll-container">
            <ListaMesas
              mesas={mesas}
              onEdit={handleEditarMesa}
              onDelete={handleEliminarMesa}
            />
          </div>
        </>
      ) : (
        <FormularioMesa
          mesaInicial={mesaEditar}
          onSubmit={mesaEditar ? handleActualizarMesa : handleCrearMesa}
          onCancel={handleCancelar}
          idnegocio={idnegocio}
        />
      )}
    </div>
  );
};

export default GestionMesas;

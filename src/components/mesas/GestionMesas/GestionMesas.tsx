import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mesa, MesaCreate, MesaUpdate } from '../../../types/mesa.types';
import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa
} from '../../../services/mesasService';
import FormularioMesa from '../FormularioMesa/FormularioMesa';
import ListaMesas from '../ListaMesas/ListaMesas';
import { Plus, Table2, Loader, ArrowLeft } from 'lucide-react';
import './GestionMesas.css';

interface GestionMesasProps {
  idnegocio: number;
}

const GestionMesas: React.FC<GestionMesasProps> = ({ idnegocio }) => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesaEditar, setMesaEditar] = useState<Mesa | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
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

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-mesas">
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

      <div className="mesas-header">
        <div className="mesas-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="mesas-header-content">
          <div className="mesas-title">
            <Table2 size={32} className="mesas-icon" />
            <div>
              <h1>Gestión de Mesas</h1>
              <p>Administra las mesas del restaurante</p>
            </div>
          </div>
          <button onClick={handleNuevaMesa} className="btn-nuevo">
            <Plus size={20} />
            Nueva Mesa
          </button>
        </div>
      </div>

      <div className="mesas-content">
        {cargando ? (
          <div className="mesas-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando mesas...</p>
          </div>
        ) : (
          <ListaMesas
            mesas={mesas}
            onEdit={handleEditarMesa}
            onDelete={handleEliminarMesa}
          />
        )}
      </div>

      {mostrarFormulario && (
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

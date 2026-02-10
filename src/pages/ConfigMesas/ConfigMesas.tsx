import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Table2 } from 'lucide-react';
import type { Mesa, MesaCreate, MesaUpdate } from '../../types/mesa.types';
import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa
} from '../../services/mesasService';
import FormularioMesa from '../../components/mesas/FormularioMesa/FormularioMesa';
import ListaMesas from '../../components/mesas/ListaMesas/ListaMesas';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigMesas.css';

const ConfigMesas: React.FC = () => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesaEditar, setMesaEditar] = useState<Mesa | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarMesas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerMesas();
      setMesas(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      mostrarMensaje('error', 'Error al cargar las mesas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMesas();
  }, [cargarMesas]);

  const handleCrearMesa = async (mesa: MesaCreate | MesaUpdate) => {
    try {
      const nuevaMesa = await crearMesa(mesa as MesaCreate);
      mostrarMensaje('success', 'Mesa creada exitosamente');
      setMostrarFormulario(false);
      setMesas(prev => [...prev, nuevaMesa]);
    } catch (error) {
      console.error('Error al crear mesa:', error);
      mostrarMensaje('error', 'Error al crear la mesa');
    }
  };

  const handleActualizarMesa = async (mesa: MesaCreate | MesaUpdate) => {
    if (!mesaEditar) return;
    
    try {
      const mesaActualizada = await actualizarMesa(mesaEditar.idmesa, mesa as MesaUpdate);
      mostrarMensaje('success', 'Mesa actualizada exitosamente');
      setMostrarFormulario(false);
      setMesaEditar(undefined);
      setMesas(prev =>
        prev.map(m =>
          m.idmesa === mesaActualizada.idmesa ? mesaActualizada : m
        )
      );
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
      const idEliminado = await eliminarMesa(idmesa);
      mostrarMensaje('success', 'Mesa eliminada exitosamente');
      setMesas(prev => prev.filter(m => m.idmesa !== idEliminado));
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

  return (
    <div className="config-mesas-page">
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
            <Table2 size={32} className="config-icon" />
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

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando mesas..." />
        ) : (
          <ListaMesas
            mesas={mesas}
            onEdit={handleEditarMesa}
            onDelete={handleEliminarMesa}
          />
        )}
      </div>

      {/* Formulario Modal */}
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

export default ConfigMesas;

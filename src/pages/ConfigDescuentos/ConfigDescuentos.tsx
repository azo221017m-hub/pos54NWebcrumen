import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BadgePercent, Loader } from 'lucide-react';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../types/descuento.types';
import { obtenerDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento } from '../../services/descuentosService';
import FormularioDescuento from '../../components/descuentos/FormularioDescuento/FormularioDescuento';
import ListaDescuentos from '../../components/descuentos/ListaDescuentos/ListaDescuentos';
import './ConfigDescuentos.css';

const ConfigDescuentos: React.FC = () => {
  const navigate = useNavigate();
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descuentoEditar, setDescuentoEditar] = useState<Descuento | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDescuentos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerDescuentos();
      setDescuentos(data);
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
      mostrarMensaje('error', 'Error al cargar los descuentos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDescuentos();
  }, [cargarDescuentos]);

  const handleCrearDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    try {
      const nuevoDescuento = await crearDescuento(descuento as DescuentoCreate);
      mostrarMensaje('success', 'Descuento creado exitosamente');
      setMostrarFormulario(false);
      setDescuentos(prev => [...prev, nuevoDescuento]);
    } catch (error) {
      console.error('Error al crear descuento:', error);
      mostrarMensaje('error', 'Error al crear el descuento');
    }
  };

  const handleActualizarDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    if (!descuentoEditar) return;
    
    try {
      const descuentoActualizado = await actualizarDescuento(descuentoEditar.id_descuento, descuento as DescuentoUpdate);
      mostrarMensaje('success', 'Descuento actualizado exitosamente');
      setMostrarFormulario(false);
      setDescuentoEditar(undefined);
      setDescuentos(prev =>
        prev.map(d =>
          d.id_descuento === descuentoActualizado.id_descuento ? descuentoActualizado : d
        )
      );
    } catch (error) {
      console.error('Error al actualizar descuento:', error);
      mostrarMensaje('error', 'Error al actualizar el descuento');
    }
  };

  const handleEliminarDescuento = async (id_descuento: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este descuento?')) {
      return;
    }

    try {
      const idEliminado = await eliminarDescuento(id_descuento);
      mostrarMensaje('success', 'Descuento eliminado exitosamente');
      setDescuentos(prev => prev.filter(d => d.id_descuento !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar descuento:', error);
      mostrarMensaje('error', 'Error al eliminar el descuento');
    }
  };

  const handleEditarDescuento = (descuento: Descuento) => {
    setDescuentoEditar(descuento);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setDescuentoEditar(undefined);
  };

  const handleNuevoDescuento = () => {
    setDescuentoEditar(undefined);
    setMostrarFormulario(true);
  };

  return (
    <div className="config-descuentos-page">
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
            <BadgePercent size={32} className="config-icon" />
            <div>
              <h1>Gestión de Descuentos</h1>
              <p>Administra los descuentos del negocio</p>
            </div>
          </div>
          <button onClick={handleNuevoDescuento} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Descuento
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando descuentos...</p>
          </div>
        ) : (
          <ListaDescuentos
            descuentos={descuentos}
            onEdit={handleEditarDescuento}
            onDelete={handleEliminarDescuento}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioDescuento
          descuentoInicial={descuentoEditar}
          onSubmit={descuentoEditar ? handleActualizarDescuento : handleCrearDescuento}
          onCancel={handleCancelar}
          idnegocio={idnegocio}
        />
      )}
    </div>
  );
};

export default ConfigDescuentos;

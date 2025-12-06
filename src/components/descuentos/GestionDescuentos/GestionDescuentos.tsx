import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../../types/descuento.types';
import { obtenerDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento } from '../../../services/descuentosService';
import FormularioDescuento from '../FormularioDescuento/FormularioDescuento';
import ListaDescuentos from '../ListaDescuentos/ListaDescuentos';
import { Plus, BadgePercent, Loader, ArrowLeft } from 'lucide-react';
import './GestionDescuentos.css';

interface GestionDescuentosProps {
  idnegocio: number;
}

const GestionDescuentos: React.FC<GestionDescuentosProps> = ({ idnegocio }) => {
  const navigate = useNavigate();
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descuentoEditar, setDescuentoEditar] = useState<Descuento | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDescuentos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerDescuentos(idnegocio);
      setDescuentos(data);
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
      mostrarMensaje('error', 'Error al cargar los descuentos');
    } finally {
      setCargando(false);
    }
  }, [idnegocio]);

  useEffect(() => {
    cargarDescuentos();
  }, [cargarDescuentos]);

  const handleCrearDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    try {
      await crearDescuento(descuento as DescuentoCreate);
      mostrarMensaje('success', 'Descuento creado exitosamente');
      setMostrarFormulario(false);
      cargarDescuentos();
    } catch (error) {
      console.error('Error al crear descuento:', error);
      mostrarMensaje('error', 'Error al crear el descuento');
    }
  };

  const handleActualizarDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    if (!descuentoEditar) return;
    
    try {
      await actualizarDescuento(descuentoEditar.id_descuento, descuento as DescuentoUpdate);
      mostrarMensaje('success', 'Descuento actualizado exitosamente');
      setMostrarFormulario(false);
      setDescuentoEditar(undefined);
      cargarDescuentos();
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
      await eliminarDescuento(id_descuento);
      mostrarMensaje('success', 'Descuento eliminado exitosamente');
      cargarDescuentos();
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

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-descuentos">
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

      <div className="descuentos-header">
        <div className="descuentos-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="descuentos-header-content">
          <div className="descuentos-title">
            <BadgePercent size={32} className="descuentos-icon" />
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

      <div className="descuentos-content">
        {cargando ? (
          <div className="descuentos-cargando">
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

export default GestionDescuentos;

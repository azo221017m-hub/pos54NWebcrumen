import React, { useState, useEffect, useCallback } from 'react';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../../types/descuento.types';
import { obtenerDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento } from '../../../services/descuentosService';
import FormularioDescuento from '../FormularioDescuento/FormularioDescuento';
import ListaDescuentos from '../ListaDescuentos/ListaDescuentos';
import { Plus, BadgePercent, Loader } from 'lucide-react';
import './GestionDescuentos.css';

interface GestionDescuentosProps {
  idnegocio: number;
}

const GestionDescuentos: React.FC<GestionDescuentosProps> = ({ idnegocio }) => {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descuentoEditar, setDescuentoEditar] = useState<Descuento | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
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

  if (cargando) {
    return (
      <div className="gestion-descuentos-cargando">
        <Loader size={48} className="spinner" />
        <p>Cargando descuentos...</p>
      </div>
    );
  }

  return (
    <div className="gestion-descuentos">
      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      {!mostrarFormulario ? (
        <>
          <div className="gestion-header">
            <div className="header-info">
              <div className="header-icon">
                <BadgePercent size={32} />
              </div>
              <div>
                <h2>Gestión de Descuentos</h2>
                <p>Administra los descuentos del negocio</p>
              </div>
            </div>
            <button onClick={handleNuevoDescuento} className="btn-nuevo-descuento">
              <Plus size={20} />
              Nuevo Descuento
            </button>
          </div>

          <div className="gestion-stats">
            <div className="stat-card">
              <span className="stat-numero">{descuentos.length}</span>
              <span className="stat-label">Total Descuentos</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero">
                {descuentos.filter(d => d.estatusdescuento === 'ACTIVO').length}
              </span>
              <span className="stat-label">Activos</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero">
                {descuentos.filter(d => d.requiereautorizacion === 'SI').length}
              </span>
              <span className="stat-label">Con Autorización</span>
            </div>
          </div>

          <div className="descuentos-scroll-container">
            <ListaDescuentos
              descuentos={descuentos}
              onEdit={handleEditarDescuento}
              onDelete={handleEliminarDescuento}
            />
          </div>
        </>
      ) : (
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

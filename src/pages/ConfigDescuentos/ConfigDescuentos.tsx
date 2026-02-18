import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../types/descuento.types';
import { obtenerDescuentos, crearDescuento, actualizarDescuento, eliminarDescuento } from '../../services/descuentosService';
import FormularioDescuento from '../../components/descuentos/FormularioDescuento/FormularioDescuento';
import './ConfigDescuentos.css';

const ConfigDescuentos: React.FC = () => {
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

  const getTipoClass = (tipo: string) => {
    return tipo.toLowerCase() === 'porcentaje' ? '% ' : '$';
  };

  return (
    <>
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Descuentos"
        headerSubtitle="Administra los descuentos del negocio"
        actionButton={{
          text: 'Nuevo Descuento',
          icon: <Plus size={20} />,
          onClick: handleNuevoDescuento
        }}
        loading={cargando}
        loadingMessage="Cargando descuentos..."
        isEmpty={descuentos.length === 0}
        emptyMessage="No hay descuentos registrados."
      >
        <div className="standard-cards-grid">
          {descuentos.map((descuento) => (
            <StandardCard
              key={descuento.id_descuento}
              title={descuento.nombre}
              fields={[
                {
                  label: 'Tipo',
                  value: descuento.tipodescuento
                },
                {
                  label: 'Valor',
                  value: `${getTipoClass(descuento.tipodescuento)}${descuento.valor}`
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{
                      color: descuento.estatusdescuento === 'ACTIVO' ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {descuento.estatusdescuento}
                    </span>
                  )
                },
                {
                  label: 'Requiere Autorización',
                  value: descuento.requiereautorizacion === 'SI' ? 'Sí' : 'No'
                },
                {
                  label: 'Usuario',
                  value: descuento.UsuarioCreo
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={16} />,
                  onClick: () => handleEditarDescuento(descuento),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={16} />,
                  onClick: () => handleEliminarDescuento(descuento.id_descuento),
                  variant: 'delete'
                }
              ]}
            />
          ))}
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
      </StandardPageLayout>
    </>
  );
};

export default ConfigDescuentos;

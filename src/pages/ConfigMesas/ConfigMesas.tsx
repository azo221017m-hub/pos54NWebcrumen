import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Table2, Edit, Trash2 } from 'lucide-react';
import type { Mesa, MesaCreate, MesaUpdate } from '../../types/mesa.types';
import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa
} from '../../services/mesasService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import FormularioMesa from '../../components/mesas/FormularioMesa/FormularioMesa';
import './ConfigMesas.css';

const ConfigMesas: React.FC = () => {
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
    } finally{
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

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case 'DISPONIBLE': return '#10b981'; // verde
      case 'OCUPADA': return '#ef4444'; // rojo
      case 'RESERVADA': return '#f59e0b'; // naranja
      default: return '#6b7280'; // gris
    }
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
        headerTitle="GESTIÓN DE MESAS"
        headerSubtitle={`${mesas.length} mesas registradas`}
        actionButton={{
          text: 'Nueva Mesa',
          icon: <Plus size={20} />,
          onClick: handleNuevaMesa
        }}
        loading={cargando}
        loadingMessage="Cargando mesas..."
        isEmpty={mesas.length === 0}
        emptyIcon={<Table2 size={80} />}
        emptyMessage="No hay mesas registradas."
      >
        <div className="standard-cards-grid">
          {mesas.map((mesa) => (
            <StandardCard
              key={mesa.idmesa}
              title={mesa.nombremesa}
              fields={[
                {
                  label: 'Número',
                  value: `Mesa #${mesa.numeromesa}`
                },
                {
                  label: 'Capacidad',
                  value: `${mesa.cantcomensales} comensales`
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: getEstatusColor(mesa.estatusmesa),
                      fontWeight: 600
                    }}>
                      {mesa.estatusmesa}
                    </span>
                  )
                },
                {
                  label: 'Estado Tiempo',
                  value: mesa.estatustiempo.replace('_', ' ')
                },
                {
                  label: 'Creado por',
                  value: mesa.UsuarioCreo
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={18} />,
                  onClick: () => handleEditarMesa(mesa),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={18} />,
                  onClick: () => handleEliminarMesa(mesa.idmesa),
                  variant: 'delete'
                }
              ]}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioMesa
          mesaInicial={mesaEditar}
          onSubmit={mesaEditar ? handleActualizarMesa : handleCrearMesa}
          onCancel={handleCancelar}
          idnegocio={idnegocio}
        />
      )}
    </>
  );
};

export default ConfigMesas;

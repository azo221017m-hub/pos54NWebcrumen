import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Edit, Trash2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Insumo, InsumoCreate } from '../../types/insumo.types';
import {
  obtenerInsumos,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo
} from '../../services/insumosService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import FormularioInsumo from '../../components/insumos/FormularioInsumo/FormularioInsumo';
import './ConfigInsumos.css';

const ConfigInsumos: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState<Insumo | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  // Helper para extraer mensaje de error
  const extraerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
    return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || mensajePorDefecto;
  };

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarInsumos = useCallback(async () => {
    try {
      console.log('🔷 ConfigInsumos - Iniciando carga de insumos...');
      setCargando(true);
      const data = await obtenerInsumos(idnegocio);
      console.log('🔷 ConfigInsumos - Datos recibidos:', data, 'Es array:', Array.isArray(data));
      setInsumos(data);
    } catch (error) {
      console.error('❌ ConfigInsumos - Error al cargar insumos:', error);
      mostrarMensaje('error', 'Error al cargar los insumos');
      setInsumos([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  const handleNuevo = () => {
    setInsumoEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (insumo: Insumo) => {
    setInsumoEditar(insumo);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setInsumoEditar(null);
  };

  const handleCrear = async (data: InsumoCreate) => {
    try {
      const nuevoInsumo = await crearInsumo(data);
      mostrarMensaje('success', 'Insumo creado exitosamente');
      setMostrarFormulario(false);
      setInsumos(prev => [...prev, nuevoInsumo]);
    } catch (error: unknown) {
      console.error('Error al crear insumo:', error);
      const mensaje = extraerMensajeError(error, 'Error al crear el insumo');
      mostrarMensaje('error', mensaje);
      throw error; // Re-lanzar para que el formulario no se cierre automáticamente
    }
  };

  const handleActualizar = async (data: InsumoCreate) => {
    if (!insumoEditar) return;

    try {
      const insumoActualizado = await actualizarInsumo(insumoEditar.id_insumo, data);
      mostrarMensaje('success', 'Insumo actualizado exitosamente');
      setMostrarFormulario(false);
      setInsumoEditar(null);
      setInsumos(prev =>
        prev.map(ins =>
          ins.id_insumo === insumoActualizado.id_insumo ? insumoActualizado : ins
        )
      );
    } catch (error: unknown) {
      console.error('Error al actualizar insumo:', error);
      const mensaje = extraerMensajeError(error, 'Error al actualizar el insumo');
      mostrarMensaje('error', mensaje);
      throw error; // Re-lanzar para que el formulario no se cierre automáticamente
    }
  };

  const handleEliminar = async (id: number) => {
    const insumo = insumos.find(i => i.id_insumo === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el insumo "${insumo?.nombre}"?\n\nEsta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      const idEliminado = await eliminarInsumo(id);
      mostrarMensaje('success', 'Insumo eliminado exitosamente');
      setInsumos(prev => prev.filter(ins => ins.id_insumo !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar insumo:', error);
      mostrarMensaje('error', 'Error al eliminar el insumo');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getStockStatus = (actual: number, minimo: number) => {
    const actualNum = Number(actual);
    const minimoNum = Number(minimo);
    
    if (actualNum <= minimoNum) return 'critico';
    if (actualNum <= minimoNum * 1.5) return 'bajo';
    return 'normal';
  };

  const getStockIcon = (status: string) => {
    if (status === 'critico') return <AlertTriangle size={16} style={{ color: '#ef4444' }} />;
    if (status === 'bajo') return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
    return null;
  };

  return (
    <>
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button
            className="btn-close"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Insumos"
        headerSubtitle="Administra los insumos del negocio"
        backButtonText="Regresa a DASHBOARD"
        backButtonPath="/dashboard"
        actionButton={{
          text: 'Nuevo Insumo',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando insumos..."
        isEmpty={insumos.length === 0}
        emptyIcon={<Package size={80} />}
        emptyMessage="No hay insumos registrados. Comienza agregando uno nuevo."
      >
        <div className="standard-cards-grid">
          {insumos.map((insumo) => {
            const stockStatus = getStockStatus(insumo.stock_actual, insumo.stock_minimo);
            
            return (
              <StandardCard
                key={insumo.id_insumo}
                title={insumo.nombre}
                fields={[
                  {
                    label: 'Unidad Medida',
                    value: insumo.unidad_medida
                  },
                  {
                    label: 'Proveedor',
                    value: insumo.idproveedor || 'Sin proveedor'
                  },
                  {
                    label: 'Stock Actual',
                    value: (
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: stockStatus === 'critico' ? '#ef4444' : stockStatus === 'bajo' ? '#f59e0b' : 'inherit'
                      }}>
                        {getStockIcon(stockStatus)}
                        {insumo.stock_actual}
                      </span>
                    )
                  },
                  {
                    label: 'Stock Mínimo',
                    value: insumo.stock_minimo
                  },
                  {
                    label: 'Costo Promedio',
                    value: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign size={14} />
                        {formatCurrency(insumo.costo_promedio_ponderado)}
                      </span>
                    )
                  },
                  {
                    label: 'Precio Venta',
                    value: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign size={14} />
                        {formatCurrency(insumo.precio_venta)}
                      </span>
                    )
                  },
                  {
                    label: 'Valor Stock',
                    value: (
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        fontWeight: 600,
                        color: '#10b981'
                      }}>
                        <TrendingUp size={14} />
                        {formatCurrency(insumo.stock_actual * insumo.costo_promedio_ponderado)}
                      </span>
                    )
                  },
                  {
                    label: 'Inventariable',
                    value: insumo.inventariable ? 'Sí' : 'No'
                  },
                  {
                    label: 'Estado',
                    value: insumo.activo ? 'Activo' : 'Inactivo'
                  }
                ]}
                actions={[
                  {
                    label: 'Editar',
                    icon: <Edit size={16} />,
                    onClick: () => handleEditar(insumo),
                    variant: 'edit'
                  },
                  {
                    label: 'Eliminar',
                    icon: <Trash2 size={16} />,
                    onClick: () => handleEliminar(insumo.id_insumo),
                    variant: 'delete'
                  }
                ]}
              />
            );
          })}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioInsumo
          insumoEditar={insumoEditar}
          onSubmit={insumoEditar ? handleActualizar : handleCrear}
          onCancel={handleCancelar}
          loading={cargando}
        />
      )}
    </>
  );
};

export default ConfigInsumos;

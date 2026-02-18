import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt, DollarSign, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import type { Gasto, GastoCreate } from '../../types/gastos.types';
import {
  obtenerGastos,
  crearGasto,
  actualizarGasto
} from '../../services/gastosService';
import FormularioGastos from '../../components/gastos/FormularioGastos/FormularioGastos';
import '../../styles/StandardPageLayout.css';

const PageGastos: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<Gasto | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerGastos();
      setGastos(data);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
      mostrarMensaje('error', 'Error al cargar los gastos');
      setGastos([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  const abrirNuevoGasto = () => {
    setGastoEditar(null);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: GastoCreate) => {
    try {
      if (gastoEditar) {
        // Actualizar
        const gastoActualizado = await actualizarGasto(gastoEditar.idventa, data);
        mostrarMensaje('success', 'Gasto actualizado correctamente');
        setMostrarFormulario(false);
        setGastoEditar(null);
        // Actualizar estado local sin recargar
        setGastos(prev =>
          prev.map(gasto =>
            gasto.idventa === gastoActualizado.idventa ? gastoActualizado : gasto
          )
        );
      } else {
        // Crear
        const nuevoGasto = await crearGasto(data);
        mostrarMensaje('success', 'Gasto creado correctamente');
        setMostrarFormulario(false);
        // Actualizar estado local sin recargar
        setGastos(prev => [...prev, nuevoGasto]);
      }
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al guardar el gasto';
      mostrarMensaje('error', mensaje);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setGastoEditar(null);
  };

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoPago = (estado: string | null) => {
    if (!estado) return { color: '#94a3b8', text: 'Sin estado' };
    if (estado === 'PAGADO') return { color: '#10b981', text: 'PAGADO', icon: <CheckCircle size={14} /> };
    if (estado === 'PENDIENTE') return { color: '#f59e0b', text: 'PENDIENTE', icon: <XCircle size={14} /> };
    return { color: '#64748b', text: estado };
  };

  return (
    <>
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo === 'success' ? 'success' : mensaje.tipo === 'error' ? 'error' : 'info'}`}>
          <p>{mensaje.texto}</p>
          <button onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gastos"
        headerSubtitle="Registra y gestiona los gastos del negocio"
        actionButton={{
          text: 'Nuevo Gasto',
          icon: <Plus size={20} />,
          onClick: abrirNuevoGasto
        }}
        loading={cargando}
        loadingMessage="Cargando gastos..."
        isEmpty={gastos.length === 0}
        emptyIcon={<Receipt size={80} />}
        emptyMessage="No hay gastos registrados"
      >
        <div className="standard-cards-grid">
          {gastos.map((gasto) => {
            const estadoPago = getEstadoPago(gasto.estatusdepago);
            return (
              <StandardCard
                key={gasto.idventa}
                title={`Folio: ${gasto.folioventa}`}
                fields={[
                  {
                    label: 'Tipo de Gasto',
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} />
                        {gasto.descripcionmov || 'N/A'}
                      </div>
                    )
                  },
                  {
                    label: 'Importe',
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={14} />
                        <span style={{ fontWeight: 600, color: '#ef4444' }}>
                          ${gasto.totaldeventa.toFixed(2)}
                        </span>
                      </div>
                    )
                  },
                  {
                    label: 'Fecha',
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} />
                        {formatFecha(gasto.fechadeventa)}
                      </div>
                    )
                  },
                  {
                    label: 'Estado de Pago',
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {estadoPago.icon}
                        <span style={{ color: estadoPago.color, fontWeight: 600 }}>
                          {estadoPago.text}
                        </span>
                      </div>
                    )
                  },
                  {
                    label: 'Referencia',
                    value: gasto.referencia || 'Sin referencia'
                  }
                ]}
                actions={[]}
              />
            );
          })}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioGastos
          gasto={gastoEditar}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      )}
    </>
  );
};

export default PageGastos;

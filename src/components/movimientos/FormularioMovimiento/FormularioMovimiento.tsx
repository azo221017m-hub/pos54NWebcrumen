import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type {
  MovimientoConDetalles,
  MovimientoCreate,
  DetalleMovimientoCreate,
  MotivoMovimiento,
  TipoInsumo
} from '../../../types/movimientos.types';
import type { Insumo } from '../../../types/insumo.types';
import { obtenerInsumos } from '../../../services/insumosService';
import './FormularioMovimiento.css';

interface Props {
  movimiento: MovimientoConDetalles | null;
  onGuardar: (data: MovimientoCreate) => Promise<void>;
  onCancelar: () => void;
}

const FormularioMovimiento: React.FC<Props> = ({ movimiento, onGuardar, onCancelar }) => {
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
  
  // Estado del formulario
  const [motivomovimiento, setMotivoMovimiento] = useState<MotivoMovimiento>('COMPRA');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<DetalleMovimientoCreate[]>([]);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para insumos
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(false);

  // Cargar insumos disponibles
  useEffect(() => {
    const cargarInsumos = async () => {
      setCargandoInsumos(true);
      try {
        const data = await obtenerInsumos(idnegocio);
        setInsumos(data);
      } catch (error) {
        console.error('Error al cargar insumos:', error);
      } finally {
        setCargandoInsumos(false);
      }
    };
    cargarInsumos();
  }, [idnegocio]);

  // Cargar datos si es edición
  useEffect(() => {
    if (movimiento) {
      setMotivoMovimiento(movimiento.motivomovimiento);
      setObservaciones(movimiento.observaciones || '');
      setDetalles(
        movimiento.detalles.map((d) => ({
          idinsumo: d.idinsumo,
          nombreinsumo: d.nombreinsumo,
          tipoinsumo: d.tipoinsumo,
          cantidad: d.cantidad,
          unidadmedida: d.unidadmedida,
          costo: d.costo,
          precio: d.precio,
          observaciones: d.observaciones
        }))
      );
    }
  }, [movimiento]);

  const agregarDetalle = () => {
    const nuevoDetalle: DetalleMovimientoCreate = {
      idinsumo: 0,
      nombreinsumo: '',
      tipoinsumo: 'INVENTARIO',
      cantidad: 0,
      unidadmedida: '',
      costo: 0,
      precio: 0,
      observaciones: ''
    };
    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index: number, campo: keyof DetalleMovimientoCreate, valor: any) => {
    const nuevosDetalles = [...detalles];
    
    if (campo === 'idinsumo') {
      const insumoSeleccionado = insumos.find((i) => i.id_insumo === Number(valor));
      if (insumoSeleccionado) {
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          idinsumo: insumoSeleccionado.id_insumo,
          nombreinsumo: insumoSeleccionado.nombre,
          unidadmedida: insumoSeleccionado.unidad_medida,
          tipoinsumo: 'INVENTARIO',
          costo: insumoSeleccionado.costo_promedio_ponderado || 0
        };
      }
    } else {
      (nuevosDetalles[index] as any)[campo] = valor;
    }
    
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      alert('Debe agregar al menos un insumo');
      return;
    }

    const movimientoData: MovimientoCreate = {
      tipomovimiento: motivomovimiento === 'COMPRA' || motivomovimiento === 'AJUSTE_MANUAL' || motivomovimiento === 'DEVOLUCION' || motivomovimiento === 'INV_INICIAL' ? 'ENTRADA' : 'SALIDA',
      motivomovimiento,
      fechamovimiento: new Date().toISOString(),
      observaciones,
      estatusmovimiento: 'PENDIENTE',
      detalles
    };

    setGuardando(true);
    try {
      await onGuardar(movimientoData);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="formulario-movimiento-overlay">
      <div className="formulario-movimiento-container">
        <div className="formulario-movimiento-header">
          <h2>{movimiento ? 'Editar Movimiento' : 'SUMATORIA DE MOVIMIENTO de INVENTARIO'}</h2>
          <button className="btn-cerrar" onClick={onCancelar} disabled={guardando}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-movimiento">
          {/* Header con motivo y botones */}
          <div className="formulario-header-section">
            <div className="motivo-section">
              <label>motivo de Movimiento</label>
              <select
                value={motivomovimiento}
                onChange={(e) => setMotivoMovimiento(e.target.value as MotivoMovimiento)}
                disabled={guardando}
                required
              >
                <option value="COMPRA">COMPRA</option>
                <option value="AJUSTE_MANUAL">AJUSTE_MANUAL</option>
                <option value="MERMA">MERMA</option>
                <option value="CANCELACION">CANCELACION</option>
                <option value="DEVOLUCION">DEVOLUCION</option>
                <option value="INV_INICIAL">INV_INICIAL</option>
                <option value="CONSUMO">CONSUMO</option>
              </select>
              <button type="button" className="btn-add-insumo" onClick={agregarDetalle}>
                + INSUMO
              </button>
            </div>

            <div className="botones-accion">
              <button type="button" className="btn-pendiente" disabled>
                PENDIENTE
              </button>
              <button type="submit" className="btn-procesar" disabled={guardando}>
                {guardando ? 'GUARDANDO...' : 'PROCESAR'}
              </button>
            </div>
          </div>

          {/* Tabla de insumos */}
          <div className="tabla-insumos-container">
            <table className="tabla-insumos">
              <thead>
                <tr>
                  <th>INSUMO</th>
                  <th>CANTIDAD</th>
                  <th>COSTO</th>
                  <th>PROVEEDOR</th>
                  <th>Existencia</th>
                  <th>Costo Última Ponderado</th>
                  <th>Cantidad Última Compra</th>
                  <th>Proveedor Última Compra</th>
                  <th>Costo Última Compra</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={detalle.idinsumo}
                        onChange={(e) => actualizarDetalle(index, 'idinsumo', e.target.value)}
                        disabled={guardando || cargandoInsumos}
                        required
                      >
                        <option value={0}>Seleccione...</option>
                        {insumos.map((insumo) => (
                          <option key={insumo.id_insumo} value={insumo.id_insumo}>
                            {insumo.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        value={detalle.cantidad}
                        onChange={(e) => actualizarDetalle(index, 'cantidad', Number(e.target.value))}
                        disabled={guardando}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={detalle.costo || 0}
                        onChange={(e) => actualizarDetalle(index, 'costo', Number(e.target.value))}
                        disabled={guardando}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={detalle.observaciones || ''}
                        onChange={(e) => actualizarDetalle(index, 'observaciones', e.target.value)}
                        placeholder="Proveedor"
                        disabled={guardando}
                      />
                    </td>
                    <td>
                      <input type="text" disabled className="campo-solo-lectura" />
                    </td>
                    <td>
                      <input type="text" disabled className="campo-solo-lectura" />
                    </td>
                    <td>
                      <input type="text" disabled className="campo-solo-lectura" />
                    </td>
                    <td>
                      <input type="text" disabled className="campo-solo-lectura" />
                    </td>
                    <td>
                      <input type="text" disabled className="campo-solo-lectura" />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-eliminar-detalle"
                        onClick={() => eliminarDetalle(index)}
                        disabled={guardando}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observaciones */}
          <div className="observaciones-section">
            <label>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones generales del movimiento..."
              disabled={guardando}
              rows={3}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioMovimiento;

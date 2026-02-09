import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2 } from 'lucide-react';
import type {
  MovimientoConDetalles,
  MovimientoCreate,
  DetalleMovimientoCreate,
  MotivoMovimiento,
  UltimaCompraData
} from '../../../types/movimientos.types';
import type { Insumo } from '../../../types/insumo.types';
import type { Proveedor } from '../../../types/proveedor.types';
import { obtenerInsumos } from '../../../services/insumosService';
import { obtenerProveedores } from '../../../services/proveedoresService';
import { obtenerUltimaCompra } from '../../../services/movimientosService';
import { showInfoToast } from '../../FeedbackToast';
import './FormularioMovimiento.css';

// Extended type to include stock_actual as a fallback field and unique row ID
interface DetalleMovimientoExtended extends DetalleMovimientoCreate {
  stockActual?: number;
  _rowId?: string; // Unique identifier for this row to maintain data mapping
}

// Movement types that are considered ENTRADA
const ENTRADA_TYPES: readonly MotivoMovimiento[] = ['COMPRA', 'AJUSTE_MANUAL', 'DEVOLUCION', 'INV_INICIAL'] as const;

interface Props {
  movimiento: MovimientoConDetalles | null;
  onGuardar: (data: MovimientoCreate) => Promise<void>;
  onCancelar: () => void;
  mensaje?: {
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null;
}

const FormularioMovimiento: React.FC<Props> = ({ movimiento, onGuardar, onCancelar, mensaje }) => {
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
  
  // Estado del formulario
  const [motivomovimiento, setMotivoMovimiento] = useState<MotivoMovimiento>('COMPRA');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<DetalleMovimientoExtended[]>([]);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para insumos
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(false);
  
  // Estado para proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  
  // Estado para datos de última compra por detalle (using rowId instead of index)
  const [ultimasCompras, setUltimasCompras] = useState<Map<string, UltimaCompraData>>(new Map());

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
  
  // Cargar proveedores disponibles
  useEffect(() => {
    const cargarProveedores = async () => {
      setCargandoProveedores(true);
      try {
        const data = await obtenerProveedores();
        setProveedores(data);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      } finally {
        setCargandoProveedores(false);
      }
    };
    cargarProveedores();
  }, []);

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
          observaciones: d.observaciones,
          proveedor: d.proveedor,
          _rowId: crypto.randomUUID() // Generate unique ID for each row
        }))
      );
    }
  }, [movimiento]);

  const agregarDetalle = () => {
    const nuevoDetalle: DetalleMovimientoExtended = {
      idinsumo: 0,
      nombreinsumo: '',
      tipoinsumo: 'INVENTARIO',
      cantidad: 0,
      unidadmedida: '',
      costo: 0,
      precio: 0,
      observaciones: '',
      proveedor: '',
      _rowId: crypto.randomUUID() // Generate unique ID for this row
    };
    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  // Helper function to format insumo information message
  // Format matches requirements for fields: INSUMO, CANT., COSTO, PROVEEDOR, U.M., EXIST., COSTO POND., CANT. ÚLT., PROV. ÚLT., COSTO ÚLT.
  // Message uses newlines to separate logical sections and pipes (|) to separate related fields within each line
  const formatInsumoMessage = (
    insumoNombre: string,
    cantidad: number,
    costo: number | undefined,
    proveedor: string | undefined,
    datos: UltimaCompraData
  ): string => {
    const lines = [
      `INSUMO: ${insumoNombre}`,
      `CANT.: ${cantidad} | COSTO: ${costo ?? 0}`,
      `PROVEEDOR: ${proveedor || 'N/A'}`,
      `U.M.: ${datos.unidadMedida} | EXIST.: ${datos.existencia}`,
      `COSTO POND.: ${datos.costoUltimoPonderado}`,
      `CANT. ÚLT.: ${datos.cantidadUltimaCompra} | PROV. ÚLT.: ${datos.proveedorUltimaCompra || 'N/A'}`,
      `COSTO ÚLT.: ${datos.costoUltimaCompra}`
    ];
    return lines.join('\n');
  };

  const actualizarDetalle = async (index: number, campo: keyof DetalleMovimientoExtended, valor: string | number) => {
    const nuevosDetalles = [...detalles];
    const detalle = nuevosDetalles[index];
    const rowId = detalle._rowId!; // Get the unique row ID
    
    if (campo === 'idinsumo') {
      const insumoSeleccionado = insumos.find((i) => i.id_insumo === Number(valor));
      if (insumoSeleccionado) {
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          idinsumo: insumoSeleccionado.id_insumo,
          nombreinsumo: insumoSeleccionado.nombre,
          unidadmedida: insumoSeleccionado.unidad_medida,
          tipoinsumo: 'INVENTARIO',
          costo: insumoSeleccionado.costo_promedio_ponderado || 0,
          proveedor: insumoSeleccionado.idproveedor || '',
          // Store stock_actual as fallback in case ultimasCompras isn't populated
          stockActual: insumoSeleccionado.stock_actual
        };
        
        // Populate with insumo data: Existencia, Costo Promedio Ponderado, and Proveedor
        // Use rowId instead of index for the Map key
        const nuevasUltimasCompras = new Map(ultimasCompras);
        nuevasUltimasCompras.set(rowId, {
          existencia: insumoSeleccionado.stock_actual,
          costoUltimoPonderado: insumoSeleccionado.costo_promedio_ponderado,
          unidadMedida: insumoSeleccionado.unidad_medida,
          cantidadUltimaCompra: 0,
          proveedorUltimaCompra: '',
          costoUltimaCompra: 0
        });
        
        // Fetch last purchase data
        // The service now returns default values (0 for numbers, '' for strings) if no data is found (404)
        const ultimaCompraData = await obtenerUltimaCompra(insumoSeleccionado.id_insumo);
        
        // Merge API data with initial insumo data
        // Keep existencia from insumo.stock_actual (not from ultima compra API)
        const datosCompletos = {
          ...nuevasUltimasCompras.get(rowId)!,
          ...ultimaCompraData,
          // Preserve existencia from insumo.stock_actual - do NOT use ultima compra value
          existencia: insumoSeleccionado.stock_actual
        };
        
        nuevasUltimasCompras.set(rowId, datosCompletos);
        setUltimasCompras(nuevasUltimasCompras);
        
        // Display message to user with insumo information
        const mensaje = formatInsumoMessage(
          insumoSeleccionado.nombre,
          nuevosDetalles[index].cantidad,
          nuevosDetalles[index].costo,
          nuevosDetalles[index].proveedor,
          datosCompletos
        );
        showInfoToast(mensaje);
        
        // DEBUG: Display selected insumo values
        if (import.meta.env.DEV) {
          console.log('=== DEBUG: Insumo Seleccionado ===');
          console.log(`INSUMO: ${insumoSeleccionado.nombre}`);
          console.log(`CANT.: ${nuevosDetalles[index].cantidad}`);
          console.log(`COSTO: ${nuevosDetalles[index].costo}`);
          console.log(`PROVEEDOR: ${nuevosDetalles[index].proveedor}`);
          console.log(`U.M.: ${datosCompletos.unidadMedida}`);
          console.log(`EXIST.: ${datosCompletos.existencia}`);
          console.log(`COSTO POND.: ${datosCompletos.costoUltimoPonderado}`);
          console.log(`CANT. ÚLT.: ${datosCompletos.cantidadUltimaCompra}`);
          console.log(`PROV. ÚLT.: ${datosCompletos.proveedorUltimaCompra}`);
          console.log(`COSTO ÚLT.: ${datosCompletos.costoUltimaCompra}`);
          console.log('================================');
        }
      }
    } else {
      // Type-safe way to update the field
      if (campo === 'cantidad' || campo === 'costo' || campo === 'precio') {
        nuevosDetalles[index][campo] = valor as number;
      } else if (campo === 'proveedor' || campo === 'observaciones') {
        nuevosDetalles[index][campo] = valor as string;
      }
    }
    
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      alert('Debe agregar al menos un insumo');
      return;
    }

    // Validate all rows have required fields filled
    const detallesIncompletos = detalles.filter(d => d.idinsumo === 0 || d.cantidad === 0);
    if (detallesIncompletos.length > 0) {
      alert('Todos los insumos deben tener seleccionado un producto y una cantidad mayor a cero');
      return;
    }

    const tipoMovimiento = ENTRADA_TYPES.includes(motivomovimiento) ? 'ENTRADA' : 'SALIDA';

    const movimientoData: MovimientoCreate = {
      tipomovimiento: tipoMovimiento,
      motivomovimiento,
      fechamovimiento: new Date().toISOString(),
      observaciones,
      estatusmovimiento: 'PENDIENTE',
      // Remove stockActual and _rowId from detalles before submitting (they're only for UI)
      // Si tipomovimiento es 'SALIDA', multiplicar cantidad por -1
      detalles: detalles.map(({ stockActual: _stockActual, _rowId, ...detalle }) => ({
        ...detalle,
        cantidad: tipoMovimiento === 'SALIDA' ? detalle.cantidad * -1 : detalle.cantidad
      }))
    };

    setGuardando(true);
    try {
      await onGuardar(movimientoData);
    } finally {
      setGuardando(false);
    }
  };

  // Memoized calculation: total sum of (cantidad * costo) for all items
  const totalGeneral = useMemo(() => {
    return detalles.reduce((sum, d) => sum + ((d.cantidad || 0) * (d.costo || 0)), 0);
  }, [detalles]);

  // Memoized calculation: subtotals by supplier
  const subtotalesPorProveedor = useMemo(() => {
    return detalles.reduce((acc, d) => {
      const proveedor = d.proveedor || 'Sin proveedor';
      const subtotal = (d.cantidad || 0) * (d.costo || 0);
      if (!acc[proveedor]) {
        acc[proveedor] = 0;
      }
      acc[proveedor] += subtotal;
      return acc;
    }, {} as Record<string, number>);
  }, [detalles]);

  return (
    <div className="formulario-movimiento-overlay">
      <div className="formulario-movimiento-container">
        <div className="formulario-movimiento-header">
          <h2>{movimiento ? 'Editar Movimiento' : 'SUMATORIA DE MOVIMIENTO de INVENTARIO'}</h2>
          <button 
            className="btn-cerrar" 
            onClick={onCancelar} 
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={28} />
          </button>
        </div>

        {/* Mensajes dentro del modal */}
        {mensaje && (
          <div className={`formulario-mensaje formulario-mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

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
              
              {/* Observaciones moved here */}
              <div className="observaciones-inline">
                <label>Observaciones</label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones generales del movimiento..."
                  disabled={guardando}
                />
              </div>
            </div>

            <div className="botones-accion">
              <button type="submit" className="btn-solicitar" disabled={guardando}>
                {guardando ? 'GUARDANDO...' : 'SOLICITAR'}
              </button>
              <button type="button" className="btn-aplicar" disabled>
                APLICAR
              </button>
            </div>
          </div>

          {/* Tabla de insumos */}
          <div className="tabla-insumos-container">
            <table className="tabla-insumos">
              <thead>
                <tr>
                  <th>INSUMO</th>
                  <th>CANT.</th>
                  <th>COSTO</th>
                  <th>PROVEEDOR</th>
                  <th>U.M.</th>
                  <th>EXIST.</th>
                  <th>COSTO POND.</th>
                  <th>CANT. ÚLT.</th>
                  <th>PROV. ÚLT.</th>
                  <th>COSTO ÚLT.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => {
                  // Use the unique row ID to look up data instead of index
                  const ultimaCompra = detalle._rowId ? ultimasCompras.get(detalle._rowId) : undefined;
                  return (
                  <tr key={detalle._rowId || index}>
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
                      {/* Note: proveedor stores name directly, consistent with existing insumo.idproveedor field */}
                      <select
                        value={detalle.proveedor || ''}
                        onChange={(e) => actualizarDetalle(index, 'proveedor', e.target.value)}
                        disabled={guardando || cargandoProveedores}
                      >
                        <option value="">Seleccione...</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                            {proveedor.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.unidadMedida || detalle.unidadmedida || ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.existencia ?? detalle.stockActual ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.costoUltimoPonderado ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.cantidadUltimaCompra ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      {ultimaCompra?.proveedorUltimaCompra ? (
                        <button
                          type="button"
                          className="btn-ultima-compra"
                          onClick={() => {
                            if (ultimaCompra.proveedorUltimaCompra) {
                              actualizarDetalle(index, 'proveedor', ultimaCompra.proveedorUltimaCompra);
                            }
                          }}
                          disabled={guardando}
                          title={`Usar proveedor última compra: ${ultimaCompra.proveedorUltimaCompra}`}
                        >
                          {ultimaCompra.proveedorUltimaCompra}
                        </button>
                      ) : (
                        <input 
                          type="text" 
                          value="" 
                          disabled 
                          className="campo-solo-lectura" 
                        />
                      )}
                    </td>
                    <td>
                      {ultimaCompra?.costoUltimaCompra ? (
                        <button
                          type="button"
                          className="btn-ultima-compra"
                          onClick={() => {
                            if (ultimaCompra.costoUltimaCompra !== undefined) {
                              actualizarDetalle(index, 'costo', ultimaCompra.costoUltimaCompra);
                            }
                          }}
                          disabled={guardando}
                          title={`Usar costo última compra: ${ultimaCompra.costoUltimaCompra}`}
                        >
                          ${ultimaCompra.costoUltimaCompra}
                        </button>
                      ) : (
                        <input 
                          type="text" 
                          value="" 
                          disabled 
                          className="campo-solo-lectura" 
                        />
                      )}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sección de sumatorias */}
          {detalles.length > 0 && (
            <div className="sumatorias-section">
              <div className="sumatorias-content">
                <div className="total-general">
                  <strong>Total General: </strong>
                  <span className="total-value">
                    ${totalGeneral.toFixed(2)}
                  </span>
                </div>
                
                <div className="subtotales-proveedores">
                  <strong>Subtotales por proveedor:</strong>
                  {Object.entries(subtotalesPorProveedor).map(([proveedor, subtotal]) => (
                    <div key={proveedor} className="subtotal-item">
                      <span className="proveedor-nombre">{proveedor}:</span>
                      <span className="subtotal-value">${subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormularioMovimiento;

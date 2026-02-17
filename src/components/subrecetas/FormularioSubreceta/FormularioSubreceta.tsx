import React, { useState, useMemo, useEffect } from 'react';
import { Save, X, ChefHat, Plus, Trash2, FileText, Upload } from 'lucide-react';
import type { Subreceta, DetalleSubreceta, SubrecetaCreate, SubrecetaUpdate } from '../../../types/subreceta.types';
import type { Insumo } from '../../../types/insumo.types';
import { obtenerInsumos } from '../../../services/insumosService';
import './FormularioSubreceta.css';

interface Props {
  subreceta: Subreceta | null;
  idnegocio: number;
  onSubmit: (data: SubrecetaCreate | SubrecetaUpdate) => void;
  onCancel: () => void;
}

const FormularioSubreceta: React.FC<Props> = ({ subreceta, idnegocio, onSubmit, onCancel }) => {
  const initialState = useMemo(() => {
    if (subreceta) {
      return {
        nombreSubReceta: subreceta.nombreSubReceta,
        instruccionesSubr: subreceta.instruccionesSubr || '',
        archivoInstruccionesSubr: subreceta.archivoInstruccionesSubr || '',
        costoSubReceta: subreceta.costoSubReceta,
        estatusSubr: subreceta.estatusSubr,
        detalles: subreceta.detalles || []
      };
    }
    return {
      nombreSubReceta: '',
      instruccionesSubr: '',
      archivoInstruccionesSubr: '',
      costoSubReceta: 0,
      estatusSubr: 1,
      detalles: []
    };
  }, [subreceta]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(false);

  // Cargar insumos al montar el componente
  useEffect(() => {
    const cargarInsumos = async () => {
      setCargandoInsumos(true);
      try {
        const data = await obtenerInsumos(idnegocio);
        // Filtrar solo insumos activos e inventariables
        const insumosActivos = data.filter(insumo => insumo.activo === 1 && insumo.inventariable === 1);
        setInsumos(insumosActivos);
        console.log('📦 FormularioSubreceta: Insumos cargados:', insumosActivos.length);
      } catch (error) {
        console.error('Error al cargar insumos:', error);
        setInsumos([]);
      } finally {
        setCargandoInsumos(false);
      }
    };

    cargarInsumos();
  }, [idnegocio]);

  // Agregar nuevo ingrediente
  const agregarIngrediente = () => {
    const nuevoIngrediente: DetalleSubreceta = {
      nombreInsumoSubr: '',
      umInsumoSubr: 'kilo',
      cantidadUsoSubr: 0,
      costoInsumoSubr: 0,
      estatus: 1
    };

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoIngrediente]
    }));
  };

  // Eliminar ingrediente
  const eliminarIngrediente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  // Actualizar ingrediente
  const actualizarIngrediente = (index: number, campo: string, valor: string | number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [campo]: valor } : detalle
      )
    }));
  };

  // Seleccionar insumo y llenar automáticamente datos
  const seleccionarInsumo = (index: number, nombreInsumo: string) => {
    if (!nombreInsumo) {
      actualizarIngrediente(index, 'nombreInsumoSubr', '');
      actualizarIngrediente(index, 'umInsumoSubr', '');
      actualizarIngrediente(index, 'costoInsumoSubr', 0);
      setTimeout(calcularCostoTotal, 0);
      return;
    }

    const insumoSeleccionado = insumos.find(ins => ins.nombre === nombreInsumo);
    
    if (insumoSeleccionado) {
      // Actualizar el detalle con los datos del insumo
      setFormData(prev => ({
        ...prev,
        detalles: prev.detalles.map((detalle, i) => {
          if (i === index) {
            return {
              ...detalle,
              nombreInsumoSubr: insumoSeleccionado.nombre,
              umInsumoSubr: insumoSeleccionado.unidad_medida,
              costoInsumoSubr: Number(insumoSeleccionado.costo_promedio_ponderado) || 0
            };
          }
          return detalle;
        })
      }));
      
      // Recalcular costo total después de actualizar
      setTimeout(calcularCostoTotal, 0);
    }
  };

  // Calcular costo total automáticamente (cantidad * costo unitario por cada ingrediente)
  const calcularCostoTotal = () => {
    const total = formData.detalles.reduce((sum, detalle) => {
      const costoLinea = (detalle.cantidadUsoSubr || 0) * (detalle.costoInsumoSubr || 0);
      return sum + costoLinea;
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      costoSubReceta: total
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar selección de archivo PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        e.target.value = '';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB');
        e.target.value = '';
        return;
      }

      setFormData(prev => ({
        ...prev,
        archivoInstruccionesSubr: file.name
      }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombreSubReceta.trim()) {
      nuevosErrores.nombreSubReceta = 'El nombre es obligatorio';
    }

    if (formData.detalles.length === 0) {
      nuevosErrores.detalles = 'Debe agregar al menos un ingrediente';
    }

    // Validar cada ingrediente
    formData.detalles.forEach((detalle, index) => {
      if (!detalle.nombreInsumoSubr.trim()) {
        nuevosErrores[`detalle_${index}_nombre`] = 'El nombre del ingrediente es obligatorio';
      }
      if (detalle.cantidadUsoSubr <= 0) {
        nuevosErrores[`detalle_${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
      }
      if (detalle.costoInsumoSubr <= 0) {
        nuevosErrores[`detalle_${index}_costo`] = 'El costo debe ser mayor a 0';
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const usuarioData = localStorage.getItem('usuario');
    let usuario = 'Admin';
    try {
      if (usuarioData) {
        usuario = JSON.parse(usuarioData).alias || 'Admin';
      }
    } catch (error) {
      console.error('Error parsing usuario from localStorage:', error);
      usuario = 'Admin';
    }

    const data = {
      ...formData,
      usuarioauditoria: usuario,
      idnegocio
    };

    await onSubmit(data);
  };

  return (
    <div className="formulario-subreceta-overlay">
      <div className="formulario-subreceta-container">
        <div className="formulario-header">
          <ChefHat size={28} />
          <h2>{subreceta ? 'Editar Subreceta' : 'Nueva Subreceta'}</h2>
          <button className="btn-cerrar" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-subreceta">
          <div className="scroll-container">
            {/* Sección 1: Información General */}
            <div className="form-section">
              <h3 className="section-title">
                <FileText size={20} />
                Información General
              </h3>

              <div className="form-group">
                <label htmlFor="nombreSubReceta">
                  Nombre de la Subreceta <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombreSubReceta"
                  name="nombreSubReceta"
                  value={formData.nombreSubReceta}
                  onChange={handleChange}
                  className={errores.nombreSubReceta ? 'error' : ''}
                  placeholder="Ej: Salsa Especial"
                  maxLength={150}
                />
                {errores.nombreSubReceta && (
                  <span className="error-message">{errores.nombreSubReceta}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="instruccionesSubr">
                  Instrucciones de Preparación
                </label>
                <textarea
                  id="instruccionesSubr"
                  name="instruccionesSubr"
                  value={formData.instruccionesSubr}
                  onChange={handleChange}
                  placeholder="Describe el proceso de preparación..."
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="archivoInstruccionesSubr">
                    Archivo de Instrucciones (PDF)
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="archivoInstruccionesSubr"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <label htmlFor="archivoInstruccionesSubr" className="file-input-label">
                      <Upload size={18} />
                      {formData.archivoInstruccionesSubr || 'Seleccionar PDF...'}
                    </label>
                  </div>
                  {formData.archivoInstruccionesSubr && (
                    <span className="file-name-display">
                      📄 {formData.archivoInstruccionesSubr}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="estatusSubr">
                    Estatus <span className="required">*</span>
                  </label>
                  <select
                    id="estatusSubr"
                    name="estatusSubr"
                    value={formData.estatusSubr}
                    onChange={handleChange}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Costo Total (calculado automáticamente)</label>
                <div className="costo-display">
                  ${Number(formData.costoSubReceta || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Sección 2: Ingredientes/Insumos */}
            <div className="form-section">
              <div className="section-header-with-button">
                <h3 className="section-title">
                  <ChefHat size={20} />
                  Ingredientes/Insumos {formData.detalles.length > 0 && `(${formData.detalles.length})`}
                </h3>
                <button
                  type="button"
                  className="btn-agregar-ingrediente"
                  onClick={agregarIngrediente}
                >
                  <Plus size={18} />
                  Agregar Ingrediente
                </button>
              </div>

              {errores.detalles && (
                <div className="error-message section-error">{errores.detalles}</div>
              )}

              {formData.detalles.length === 0 ? (
                <div className="ingredientes-vacio">
                  <p>No hay ingredientes agregados. Haz clic en "Agregar Ingrediente" para comenzar.</p>
                </div>
              ) : (
                <div className="ingredientes-lista">
                  {formData.detalles.map((detalle, index) => (
                    <div key={index} className="ingrediente-item">
                      <div className="ingrediente-numero">{index + 1}</div>
                      
                      <div className="ingrediente-campos">
                        <div className="form-group">
                          <label>Ingrediente/Insumo *</label>
                          <select
                            value={detalle.nombreInsumoSubr}
                            onChange={(e) => seleccionarInsumo(index, e.target.value)}
                            className={errores[`detalle_${index}_nombre`] ? 'error' : ''}
                            disabled={cargandoInsumos || (detalle.idDetalleSubReceta ? true : false)}
                            title={detalle.idDetalleSubReceta ? 'No se puede cambiar el insumo en modo edición' : ''}
                          >
                            <option value="">Seleccionar insumo...</option>
                            {insumos.map(insumo => (
                              <option key={insumo.id_insumo} value={insumo.nombre}>
                                {insumo.nombre}
                              </option>
                            ))}
                            {/* Si el insumo actual no está en la lista, mostrarlo como opción deshabilitada */}
                            {detalle.nombreInsumoSubr && 
                             !insumos.some(ins => ins.nombre === detalle.nombreInsumoSubr) && (
                              <option value={detalle.nombreInsumoSubr} disabled>
                                {detalle.nombreInsumoSubr} (No disponible)
                              </option>
                            )}
                          </select>
                          {cargandoInsumos && (
                            <span className="loading-message">Cargando insumos...</span>
                          )}
                          {detalle.idDetalleSubReceta && (
                            <span className="info-message">ℹ️ Solo se puede editar la cantidad</span>
                          )}
                          {errores[`detalle_${index}_nombre`] && (
                            <span className="error-message">{errores[`detalle_${index}_nombre`]}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Unidad de Medida</label>
                          <input
                            type="text"
                            value={detalle.umInsumoSubr}
                            readOnly
                            className="readonly-field"
                            placeholder="Automático"
                          />
                        </div>

                        <div className="form-group">
                          <label>Cantidad *</label>
                          <input
                            type="number"
                            value={detalle.cantidadUsoSubr}
                            onChange={(e) => {
                              actualizarIngrediente(index, 'cantidadUsoSubr', parseFloat(e.target.value) || 0);
                              setTimeout(calcularCostoTotal, 0);
                            }}
                            className={errores[`detalle_${index}_cantidad`] ? 'error' : ''}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                          {errores[`detalle_${index}_cantidad`] && (
                            <span className="error-message">{errores[`detalle_${index}_cantidad`]}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Costo Unitario</label>
                          <input
                            type="text"
                            value={`$${Number(detalle.costoInsumoSubr || 0).toFixed(2)}`}
                            readOnly
                            className="readonly-field"
                            placeholder="Automático"
                          />
                        </div>

                        <div className="form-group">
                          <label>Subtotal</label>
                          <input
                            type="text"
                            value={`$${(Number(detalle.cantidadUsoSubr || 0) * Number(detalle.costoInsumoSubr || 0)).toFixed(2)}`}
                            readOnly
                            className="readonly-field subtotal-field"
                            placeholder="$0.00"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`btn-eliminar-ingrediente ${detalle.idDetalleSubReceta ? 'disabled' : ''}`}
                        onClick={() => {
                          if (!detalle.idDetalleSubReceta) {
                            eliminarIngrediente(index);
                            setTimeout(calcularCostoTotal, 0);
                          }
                        }}
                        disabled={detalle.idDetalleSubReceta ? true : false}
                        title={detalle.idDetalleSubReceta ? 'No se pueden eliminar ingredientes existentes' : 'Eliminar ingrediente'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="formulario-footer">
            <button type="button" className="btn btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-guardar">
              <Save size={18} />
              {subreceta ? 'Actualizar' : 'Guardar'} Subreceta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioSubreceta;

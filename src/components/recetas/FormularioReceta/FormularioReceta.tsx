import React, { useState, useMemo, useEffect } from 'react';
import { Save, X, ChefHat, Plus, Trash2, Package } from 'lucide-react';
import type { Receta, DetalleReceta, RecetaCreate, RecetaUpdate } from '../../../types/receta.types';
import type { Insumo } from '../../../types/insumo.types';
import type { Subreceta } from '../../../types/subreceta.types';
import { obtenerInsumos } from '../../../services/insumosService';
import { obtenerSubrecetas } from '../../../services/subrecetasService';
import './FormularioReceta.css';

interface Props {
  receta: Receta | null;
  idnegocio: number;
  onSubmit: (data: RecetaCreate | RecetaUpdate) => void;
  onCancel: () => void;
}

const FormularioReceta: React.FC<Props> = ({ receta, idnegocio, onSubmit, onCancel }) => {
  const initialState = useMemo(() => {
    if (receta) {
      return {
        nombreReceta: receta.nombreReceta,
        instrucciones: receta.instrucciones || '',
        archivoInstrucciones: receta.archivoInstrucciones || '',
        costoReceta: receta.costoReceta,
        estatus: receta.estatus,
        detalles: receta.detalles || []
      };
    }
    return {
      nombreReceta: '',
      instrucciones: '',
      archivoInstrucciones: '',
      costoReceta: 0,
      estatus: 1,
      detalles: [] as DetalleReceta[]
    };
  }, [receta]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(true);
  const [subrecetas, setSubrecetas] = useState<Subreceta[]>([]);
  const [cargandoSubrecetas, setCargandoSubrecetas] = useState(true);
  const [subrecetaSeleccionada, setSubrecetaSeleccionada] = useState<string>('');

  // Cargar insumos al montar el componente
  useEffect(() => {
    const cargarInsumos = async () => {
      setCargandoInsumos(true);
      try {
        const data = await obtenerInsumos(idnegocio);
        // Filtrar solo insumos activos e inventariables
        const insumosActivos = data.filter(insumo => insumo.activo === 1 && insumo.inventariable === 1);
        setInsumos(insumosActivos);
      } catch (error) {
        console.error('Error al cargar insumos:', error);
        setInsumos([]);
      } finally {
        setCargandoInsumos(false);
      }
    };

    cargarInsumos();
  }, [idnegocio]);

  // Cargar subrecetas al montar el componente
  useEffect(() => {
    const cargarSubrecetas = async () => {
      setCargandoSubrecetas(true);
      try {
        const data = await obtenerSubrecetas(idnegocio);
        // Filtrar solo subrecetas activas
        const subrecetasActivas = data.filter(subreceta => subreceta.estatusSubr === 1);
        setSubrecetas(subrecetasActivas);
        console.log('✅ Subrecetas cargadas:', subrecetasActivas.length);
      } catch (error) {
        console.error('Error al cargar subrecetas:', error);
        setSubrecetas([]);
      } finally {
        setCargandoSubrecetas(false);
      }
    };

    cargarSubrecetas();
  }, [idnegocio]);

  const agregarIngrediente = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          idreferencia: '',
          umInsumo: 'kilo',
          cantidadUso: 0,
          costoInsumo: 0,
          estatus: 1
        } as DetalleReceta
      ]
    }));
  };

  const eliminarIngrediente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const agregarDesdeSubreceta = async () => {
    if (!subrecetaSeleccionada) {
      alert('Por favor selecciona una subreceta');
      return;
    }

    const subreceta = subrecetas.find(s => s.idSubReceta.toString() === subrecetaSeleccionada);
    if (!subreceta) {
      alert('Subreceta no encontrada');
      return;
    }

    // Si la subreceta no tiene detalles cargados, mostrar mensaje
    if (!subreceta.detalles || subreceta.detalles.length === 0) {
      alert(`La subreceta "${subreceta.nombreSubReceta}" no tiene ingredientes configurados`);
      return;
    }

    // Mapear los detalles de subreceta a detalles de receta
    const nuevosDetalles: DetalleReceta[] = subreceta.detalles.map(det => ({
      nombreinsumo: det.nombreInsumoSubr,
      idreferencia: '', // No tenemos idreferencia en subreceta, dejar vacío
      umInsumo: det.umInsumoSubr,
      cantidadUso: det.cantidadUsoSubr,
      costoInsumo: det.costoInsumoSubr,
      estatus: 1
    }));

    // Agregar los ingredientes al final de la lista actual
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, ...nuevosDetalles]
    }));

    // Limpiar selección
    setSubrecetaSeleccionada('');
    
    // Mostrar mensaje de éxito
    alert(`✅ Se agregaron ${nuevosDetalles.length} ingrediente(s) de la subreceta "${subreceta.nombreSubReceta}"`);
  };

  const actualizarIngrediente = (index: number, campo: keyof DetalleReceta, valor: string | number) => {
    setFormData(prev => {
      const nuevosDetalles = [...prev.detalles];
      
      // Si están cambiando el insumo seleccionado (idreferencia)
      if (campo === 'idreferencia' && typeof valor === 'string') {
        const insumoSeleccionado = insumos.find(ins => ins.id_insumo.toString() === valor);
        if (insumoSeleccionado) {
          // Auto-completar los datos del insumo incluyendo el nombre
          nuevosDetalles[index] = {
            ...nuevosDetalles[index],
            idreferencia: valor,
            nombreinsumo: insumoSeleccionado.nombre,
            umInsumo: insumoSeleccionado.unidad_medida,
            costoInsumo: Number(insumoSeleccionado.costo_promedio_ponderado)
          };
        } else {
          nuevosDetalles[index] = {
            ...nuevosDetalles[index],
            [campo]: valor
          };
        }
      } else {
        // Actualización normal de otros campos
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          [campo]: valor
        };
      }
      
      return {
        ...prev,
        detalles: nuevosDetalles
      };
    });
  };

  const calcularCostoTotal = (): number => {
    return formData.detalles.reduce((total, detalle) => {
      const subtotal = Number(detalle.cantidadUso || 0) * Number(detalle.costoInsumo || 0);
      return total + subtotal;
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrores(prev => ({ ...prev, archivo: 'Solo se permiten archivos PDF' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrores(prev => ({ ...prev, archivo: 'El archivo no puede superar 5MB' }));
        return;
      }
      setErrores(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { archivo, ...rest } = prev;
        return rest;
      });
      setFormData(prev => ({ ...prev, archivoInstrucciones: file.name }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    console.log('🔍 Validando formulario...');
    console.log('🔍 Nombre de receta:', formData.nombreReceta);
    console.log('🔍 Cantidad de detalles:', formData.detalles.length);

    if (!formData.nombreReceta.trim()) {
      nuevosErrores.nombreReceta = 'El nombre es requerido';
    }

    if (formData.detalles.length === 0) {
      nuevosErrores.detalles = 'Debe agregar al menos un ingrediente';
    }

    formData.detalles.forEach((detalle, index) => {
      console.log(`🔍 Detalle ${index}:`, detalle);
      
      // Validar que tenga insumo seleccionado O nombre de insumo (desde subreceta)
      if ((!detalle.idreferencia || !detalle.idreferencia.trim()) && 
          (!detalle.nombreinsumo || !detalle.nombreinsumo.trim())) {
        nuevosErrores['detalle_' + index + '_referencia'] = 'Debe seleccionar un insumo o ingresar un nombre';
        console.log(`❌ Detalle ${index}: Sin insumo`);
      }
      if (!detalle.cantidadUso || detalle.cantidadUso <= 0) {
        nuevosErrores['detalle_' + index + '_cantidad'] = 'Cantidad debe ser mayor a 0';
        console.log(`❌ Detalle ${index}: Cantidad inválida`);
      }
    });

    console.log('🔍 Errores encontrados:', nuevosErrores);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 FormularioReceta: Iniciando validación...');
    console.log('🔵 FormularioReceta: Datos del formulario:', formData);

    if (!validarFormulario()) {
      console.log('🔴 FormularioReceta: Validación fallida', errores);
      alert('Por favor corrija los errores en el formulario antes de guardar');
      return;
    }

    console.log('✅ FormularioReceta: Validación exitosa');

    const costoTotal = calcularCostoTotal();
    const dataToSubmit = {
      ...formData,
      costoReceta: costoTotal,
      idnegocio,
      usuarioauditoria: 'admin'
    };

    console.log('🔵 FormularioReceta: Datos a enviar:', dataToSubmit);

    if (receta) {
      console.log('🔵 FormularioReceta: Actualizando receta existente');
      onSubmit({
        ...dataToSubmit,
        idReceta: receta.idReceta
      } as RecetaUpdate);
    } else {
      console.log('🔵 FormularioReceta: Creando nueva receta');
      onSubmit(dataToSubmit as RecetaCreate);
    }
  };

  const costoTotal = calcularCostoTotal();

  return (
    <div className="receta-modal-overlay" onClick={onCancel}>
      <div className="receta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="receta-modal-header">
          <div className="receta-header-content">
            <ChefHat className="receta-header-icon" />
            <h2>{receta ? 'Editar Receta' : 'Nueva Receta'}</h2>
          </div>
          <button onClick={onCancel} className="receta-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="receta-form">
          <div className="receta-form-grid">
            <div className="receta-form-group full-width">
              <label className="receta-label">
                Nombre de la Receta *
              </label>
              <input
                type="text"
                value={formData.nombreReceta}
                onChange={(e) => setFormData({ ...formData, nombreReceta: e.target.value })}
                className={'receta-input' + (errores.nombreReceta ? ' error' : '')}
                placeholder="Ej: Pizza Margarita"
              />
              {errores.nombreReceta && (
                <span className="receta-error-message">{errores.nombreReceta}</span>
              )}
            </div>

            <div className="receta-form-group full-width">
              <label className="receta-label">
                Instrucciones
              </label>
              <textarea
                value={formData.instrucciones}
                onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                className="receta-textarea"
                placeholder="Describe el proceso de preparación..."
                rows={4}
              />
            </div>

            <div className="receta-form-group full-width">
              <label className="receta-label">
                Archivo de Instrucciones (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="receta-file-input"
              />
              {formData.archivoInstrucciones && (
                <span className="receta-file-name">{formData.archivoInstrucciones}</span>
              )}
              {errores.archivo && (
                <span className="receta-error-message">{errores.archivo}</span>
              )}
              <small className="receta-help-text">Máximo 5MB, solo PDF</small>
            </div>
          </div>

          {/* Sección de Subrecetas */}
          <div className="receta-subrecetas-section">
            <div className="receta-section-header">
              <h3>
                <Package size={20} style={{ marginRight: '8px' }} />
                Agregar desde Subreceta
              </h3>
            </div>
            
            <div className="receta-subreceta-selector">
              <div className="receta-form-group" style={{ flex: 1 }}>
                <label className="receta-label">Seleccionar Subreceta</label>
                <select
                  value={subrecetaSeleccionada}
                  onChange={(e) => setSubrecetaSeleccionada(e.target.value)}
                  className="receta-select"
                  disabled={cargandoSubrecetas || subrecetas.length === 0}
                >
                  <option value="">
                    {cargandoSubrecetas 
                      ? 'Cargando subrecetas...' 
                      : subrecetas.length === 0 
                        ? 'No hay subrecetas disponibles'
                        : 'Selecciona una subreceta...'}
                  </option>
                  {subrecetas.map((subreceta) => (
                    <option key={subreceta.idSubReceta} value={subreceta.idSubReceta}>
                      {subreceta.nombreSubReceta} - ${Number(subreceta.costoSubReceta).toFixed(2)}
                      {subreceta.detalles ? ` (${subreceta.detalles.length} ingredientes)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="button"
                onClick={agregarDesdeSubreceta}
                className="receta-add-subreceta-btn"
                disabled={!subrecetaSeleccionada || cargandoSubrecetas}
              >
                <Plus size={18} />
                Agregar Ingredientes
              </button>
            </div>

            <p className="receta-subreceta-help">
              💡 Los ingredientes de la subreceta seleccionada se agregarán automáticamente a la lista de ingredientes de esta receta.
            </p>
          </div>

          <div className="receta-ingredients-section">
            <div className="receta-section-header">
              <h3>Ingredientes</h3>
              <button
                type="button"
                onClick={agregarIngrediente}
                className="receta-add-ingredient-btn"
              >
                <Plus size={18} />
                Agregar Ingrediente
              </button>
            </div>

            {errores.detalles && (
              <span className="receta-error-message">{errores.detalles}</span>
            )}

            <div className="receta-ingredients-list">
              {formData.detalles.map((detalle, index) => {
                const subtotal = Number(detalle.cantidadUso || 0) * Number(detalle.costoInsumo || 0);
                
                return (
                  <div key={index} className="receta-ingredient-card">
                    <div className="receta-ingredient-number">#{index + 1}</div>
                    
                    <div className="receta-ingredient-grid">
                      <div className="receta-form-group">
                        <label className="receta-label">Insumo *</label>
                        {detalle.nombreinsumo && !detalle.idreferencia ? (
                          // Mostrar campo de texto con el nombre cuando viene de subreceta
                          <div className="receta-insumo-from-subreceta">
                            <input
                              type="text"
                              value={detalle.nombreinsumo}
                              onChange={(e) => actualizarIngrediente(index, 'nombreinsumo', e.target.value)}
                              className="receta-input"
                              placeholder="Nombre del insumo"
                            />
                            <span className="receta-badge-subreceta">Desde Subreceta</span>
                          </div>
                        ) : (
                          // Mostrar select normal para seleccionar insumo
                          <select
                            value={detalle.idreferencia}
                            onChange={(e) => actualizarIngrediente(index, 'idreferencia', e.target.value)}
                            className={'receta-select' + (errores['detalle_' + index + '_referencia'] ? ' error' : '')}
                            disabled={cargandoInsumos}
                          >
                            <option value="">Seleccionar insumo...</option>
                            {insumos.map((insumo) => (
                              <option key={insumo.id_insumo} value={insumo.id_insumo}>
                                {insumo.nombre} - {insumo.unidad_medida} (${Number(insumo.costo_promedio_ponderado).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        )}
                        {errores['detalle_' + index + '_referencia'] && (
                          <span className="receta-error-message-small">
                            {errores['detalle_' + index + '_referencia']}
                          </span>
                        )}
                      </div>

                      <div className="receta-form-group">
                        <label className="receta-label">Unidad de Medida *</label>
                        <input
                          type="text"
                          value={detalle.umInsumo}
                          readOnly
                          className="receta-input receta-readonly-input"
                          placeholder="Auto"
                        />
                      </div>

                      <div className="receta-form-group">
                        <label className="receta-label">Cantidad *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.cantidadUso || ''}
                          onChange={(e) => actualizarIngrediente(index, 'cantidadUso', parseFloat(e.target.value) || 0)}
                          className={'receta-input' + (errores['detalle_' + index + '_cantidad'] ? ' error' : '')}
                          placeholder="0.00"
                        />
                        {errores['detalle_' + index + '_cantidad'] && (
                          <span className="receta-error-message-small">
                            {errores['detalle_' + index + '_cantidad']}
                          </span>
                        )}
                      </div>

                      <div className="receta-form-group">
                        <label className="receta-label">Costo Unitario *</label>
                        <input
                          type="text"
                          value={'$' + Number(detalle.costoInsumo || 0).toFixed(4)}
                          readOnly
                          className="receta-input receta-readonly-input"
                          placeholder="$0.0000"
                        />
                      </div>

                      <div className="receta-form-group">
                        <label className="receta-label">Subtotal</label>
                        <input
                          type="text"
                          value={'$' + subtotal.toFixed(2)}
                          readOnly
                          className="receta-input receta-subtotal-input"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarIngrediente(index)}
                      className="receta-delete-ingredient-btn"
                      title="Eliminar ingrediente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="receta-cost-summary">
            <div className="receta-cost-label">Costo Total de la Receta:</div>
            <div className="receta-cost-value">{'$' + costoTotal.toFixed(2)}</div>
          </div>

          <div className="receta-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="receta-button receta-button-cancel"
            >
              <X size={18} />
              Cancelar
            </button>
            <button
              type="submit"
              className="receta-button receta-button-submit"
            >
              <Save size={18} />
              {receta ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioReceta;

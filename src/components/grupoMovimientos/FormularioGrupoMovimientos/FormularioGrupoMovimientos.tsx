import React, { useState, useMemo } from 'react';
import type { GrupoMovimientos, GrupoMovimientosCreate, NaturalezaGrupoMovimientos } from '../../../types/grupoMovimientos.types';
import { X, Save } from 'lucide-react';
import './FormularioGrupoMovimientos.css';

interface Props {
  grupo: GrupoMovimientos | null;
  idnegocio: number;
  onSave: (grupo: GrupoMovimientosCreate) => void;
  onCancel: () => void;
}

// Definición de tipos de grupo con nuevos nombres y descripciones
/**
 * Interface que define la estructura de las opciones de tipo de grupo
 * @property value - El valor que se guarda en la base de datos
 * @property label - El texto mostrado al usuario en el dropdown
 * @property helpText - Texto de ayuda que explica el propósito del tipo de grupo
 */
interface TipoGrupoOption {
  value: string;
  label: string;
  helpText: string;
}

// Opciones dinámicas según la naturaleza
const opcionesTipoGrupo: Record<NaturalezaGrupoMovimientos, TipoGrupoOption[]> = {
  COMPRA: [
    { 
      value: 'Productos para Venta', 
      label: 'Productos para Venta', 
      helpText: 'Insumos y mercancía que se venden o se usan para producir' 
    },
    { 
      value: 'Equipo y Mobiliario', 
      label: 'Equipo y Mobiliario', 
      helpText: 'Bienes duraderos del negocio' 
    },
    { 
      value: 'Servicios para el Negocio', 
      label: 'Servicios para el Negocio', 
      helpText: 'Servicios contratados para operar' 
    },
    { 
      value: 'Gestión y Administración', 
      label: 'Gestión y Administración', 
      helpText: 'Compras administrativas y de control' 
    },
    { 
      value: 'Compra No Habitual', 
      label: 'Compra No Habitual', 
      helpText: 'Compras fuera de lo normal' 
    }
  ],
  GASTO: [
    { 
      value: 'Gastos de Operación Diaria', 
      label: 'Gastos de Operación Diaria', 
      helpText: 'Gastos necesarios para vender y operar' 
    },
    { 
      value: 'Costos Financieros', 
      label: 'Costos Financieros', 
      helpText: 'Intereses y comisiones' 
    },
    { 
      value: 'Gasto No Recurrente', 
      label: 'Gasto No Recurrente', 
      helpText: 'Gastos inesperados o excepcionales' 
    },
    { 
      value: 'Impuestos y Obligaciones', 
      label: 'Impuestos y Obligaciones', 
      helpText: 'Pagos al SAT u otras autoridades' 
    }
  ]
};

// Texto de ayuda para naturaleza del grupo
const naturalezaHelpText: Record<NaturalezaGrupoMovimientos, string> = {
  COMPRA: 'Adquisiciones que se quedan en el negocio o generan valor.',
  GASTO: 'Dinero ya consumido para operar.'
};

const FormularioGrupoMovimientos: React.FC<Props> = ({ grupo, idnegocio, onSave, onCancel }) => {
  const initialState = useMemo(() => {
    if (grupo) {
      return {
        naturalezacuentacontable: grupo.naturalezacuentacontable,
        nombrecuentacontable: grupo.nombrecuentacontable,
        tipocuentacontable: grupo.tipocuentacontable
      };
    }
    return {
      naturalezacuentacontable: 'COMPRA' as NaturalezaGrupoMovimientos,
      nombrecuentacontable: '',
      tipocuentacontable: ''
    };
  }, [grupo]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Memoizar el texto de ayuda del tipo de grupo seleccionado
  const selectedTipoHelpText = useMemo(() => {
    if (!formData.tipocuentacontable) return null;
    return opcionesTipoGrupo[formData.naturalezacuentacontable].find(
      opt => opt.value === formData.tipocuentacontable
    )?.helpText;
  }, [formData.tipocuentacontable, formData.naturalezacuentacontable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia la naturaleza, resetear el tipo de grupo
    if (name === 'naturalezacuentacontable') {
      setFormData(prev => ({ 
        ...prev, 
        naturalezacuentacontable: value as NaturalezaGrupoMovimientos, 
        tipocuentacontable: '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombrecuentacontable.trim()) {
      nuevosErrores.nombrecuentacontable = 'El nombre es obligatorio';
    }

    if (!formData.tipocuentacontable.trim()) {
      nuevosErrores.tipocuentacontable = 'El tipo de grupo es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const grupoData: GrupoMovimientosCreate = {
      ...formData,
      idnegocio
    };

    await onSave(grupoData);
  };

  return (
    <div className="formulario-grupo-overlay">
      <div className="formulario-grupo-container">
        <div className="formulario-header">
          <h2>{grupo ? 'Editar Grupo de Movimientos' : 'Nuevo Grupo de Movimientos'}</h2>
          <button className="btn-cerrar" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-grupo">
          <div className="scroll-container">
            {/* Naturaleza de Grupo */}
            <div className="form-group">
              <div className="label-with-help">
                <label htmlFor="naturalezacuentacontable">
                  Naturaleza del Grupo <span className="required">*</span>
                </label>
                <span className="help-label">
                  {naturalezaHelpText[formData.naturalezacuentacontable]}
                </span>
              </div>
              <select
                id="naturalezacuentacontable"
                name="naturalezacuentacontable"
                value={formData.naturalezacuentacontable}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="COMPRA">COMPRA</option>
                <option value="GASTO">GASTO</option>
              </select>
            </div>

            {/* Tipo de Grupo */}
            <div className="form-group">
              <div className="label-with-help">
                <label htmlFor="tipocuentacontable">
                  Tipo de Grupo <span className="required">*</span>
                </label>
                {selectedTipoHelpText && (
                  <span className="help-label">
                    {selectedTipoHelpText}
                  </span>
                )}
              </div>
              <select
                id="tipocuentacontable"
                name="tipocuentacontable"
                value={formData.tipocuentacontable}
                onChange={handleChange}
                className={`form-control ${errores.tipocuentacontable ? 'error' : ''}`}
                required
              >
                <option value="">Seleccione un tipo</option>
                {opcionesTipoGrupo[formData.naturalezacuentacontable].map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              {errores.tipocuentacontable && (
                <span className="error-message">{errores.tipocuentacontable}</span>
              )}
            </div>

            {/* Nombre del Grupo */}
            <div className="form-group">
              <label htmlFor="nombrecuentacontable">
                Nombre del Grupo <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombrecuentacontable"
                name="nombrecuentacontable"
                value={formData.nombrecuentacontable}
                onChange={handleChange}
                className={`form-control ${errores.nombrecuentacontable ? 'error' : ''}`}
                placeholder="Ej: Compra de Materia Prima"
                maxLength={150}
                required
              />
              {errores.nombrecuentacontable && (
                <span className="error-message">{errores.nombrecuentacontable}</span>
              )}
            </div>
          </div>

          <div className="formulario-footer">
            <button type="button" className="btn btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-guardar">
              <Save size={18} />
              {grupo ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioGrupoMovimientos;

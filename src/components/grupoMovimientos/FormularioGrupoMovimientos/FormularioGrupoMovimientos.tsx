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

// Opciones dinámicas según la naturaleza
const opcionesTipoGrupo: Record<NaturalezaGrupoMovimientos, string[]> = {
  COMPRA: ['Inventario', 'Activo Fijo', 'Servicios', 'Administrativo', 'Extraordinaria'],
  GASTO: ['Operación', 'Financiero', 'Extraordinario', 'Fiscal']
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const grupoData: GrupoMovimientosCreate = {
      ...formData,
      idnegocio
    };

    onSave(grupoData);
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
              <label htmlFor="naturalezacuentacontable">
                Naturaleza del Grupo <span className="required">*</span>
              </label>
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

            {/* Tipo de Grupo */}
            <div className="form-group">
              <label htmlFor="tipocuentacontable">
                Tipo de Grupo <span className="required">*</span>
              </label>
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
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errores.tipocuentacontable && (
                <span className="error-message">{errores.tipocuentacontable}</span>
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

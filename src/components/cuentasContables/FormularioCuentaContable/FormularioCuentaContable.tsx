import React, { useState, useMemo } from 'react';
import type { CuentaContable, CuentaContableCreate, NaturalezaCuentaContable } from '../../../types/cuentaContable.types';
import { X, Save } from 'lucide-react';
import './FormularioCuentaContable.css';

interface Props {
  cuenta: CuentaContable | null;
  idnegocio: number;
  onSave: (cuenta: CuentaContableCreate) => void;
  onCancel: () => void;
}

// Opciones dinámicas según la naturaleza
const opcionesTipoCuenta: Record<NaturalezaCuentaContable, string[]> = {
  COMPRA: ['Inventario', 'Activo Fijo', 'Servicios', 'Administrativo', 'Extraordinaria'],
  GASTO: ['Operación', 'Financiero', 'Extraordinario', 'Fiscal']
};

const FormularioCuentaContable: React.FC<Props> = ({ cuenta, idnegocio, onSave, onCancel }) => {
  const initialState = useMemo(() => {
    if (cuenta) {
      return {
        naturalezacuentacontable: cuenta.naturalezacuentacontable,
        nombrecuentacontable: cuenta.nombrecuentacontable,
        tipocuentacontable: cuenta.tipocuentacontable
      };
    }
    return {
      naturalezacuentacontable: 'COMPRA' as NaturalezaCuentaContable,
      nombrecuentacontable: '',
      tipocuentacontable: ''
    };
  }, [cuenta]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia la naturaleza, resetear el tipo de cuenta
    if (name === 'naturalezacuentacontable') {
      setFormData(prev => ({ 
        ...prev, 
        naturalezacuentacontable: value as NaturalezaCuentaContable, 
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
      nuevosErrores.tipocuentacontable = 'El tipo de cuenta es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const cuentaData: CuentaContableCreate = {
      ...formData,
      idnegocio
    };

    onSave(cuentaData);
  };

  return (
    <div className="formulario-cuenta-overlay">
      <div className="formulario-cuenta-container">
        <div className="formulario-header">
          <h2>{cuenta ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}</h2>
          <button className="btn-cerrar" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-cuenta">
          <div className="scroll-container">
            {/* Naturaleza de Cuenta */}
            <div className="form-group">
              <label htmlFor="naturalezacuentacontable">
                Naturaleza de Cuenta <span className="required">*</span>
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

            {/* Nombre de Cuenta */}
            <div className="form-group">
              <label htmlFor="nombrecuentacontable">
                Nombre de la Cuenta <span className="required">*</span>
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

            {/* Tipo de Cuenta */}
            <div className="form-group">
              <label htmlFor="tipocuentacontable">
                Tipo de Cuenta <span className="required">*</span>
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
                {opcionesTipoCuenta[formData.naturalezacuentacontable].map(tipo => (
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
              {cuenta ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCuentaContable;

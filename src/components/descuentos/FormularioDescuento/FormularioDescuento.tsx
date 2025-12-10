import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, BadgePercent } from 'lucide-react';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../../types/descuento.types';
import { RequiereAutorizacion } from '../../../types/descuento.types';
import { validarNombreDescuentoUnico } from '../../../services/descuentosService';
import './FormularioDescuento.css';

interface FormularioDescuentoProps {
  descuentoInicial?: Descuento;
  onSubmit: (descuento: DescuentoCreate | DescuentoUpdate) => void;
  onCancel: () => void;
  idnegocio: number;
}

const FormularioDescuento: React.FC<FormularioDescuentoProps> = ({ 
  descuentoInicial, 
  onSubmit, 
  onCancel,
  idnegocio
}) => {
  const initialFormData = useMemo(() => ({
    nombre: descuentoInicial?.nombre || '',
    tipodescuento: descuentoInicial?.tipodescuento || '',
    valor: descuentoInicial?.valor || 0,
    estatusdescuento: descuentoInicial?.estatusdescuento || 'ACTIVO',
    requiereautorizacion: descuentoInicial?.requiereautorizacion || RequiereAutorizacion.NO
  }), [descuentoInicial]);

  const [formData, setFormData] = useState(initialFormData);

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [validandoNombre, setValidandoNombre] = useState(false);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? Number(value) : value
    }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = async (): Promise<boolean> => {
    const nuevosErrores: { [key: string]: string } = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del descuento es requerido';
    } else {
      // Validar que el nombre sea único
      setValidandoNombre(true);
      try {
        const esUnico = await validarNombreDescuentoUnico(
          formData.nombre,
          idnegocio,
          descuentoInicial?.id_descuento
        );
        if (!esUnico) {
          nuevosErrores.nombre = 'Este nombre de descuento ya existe en el negocio';
        }
      } catch (error) {
        console.error('Error al validar nombre:', error);
      }
      setValidandoNombre(false);
    }

    // Validar tipo de descuento
    if (!formData.tipodescuento.trim()) {
      nuevosErrores.tipodescuento = 'El tipo de descuento es requerido';
    }

    // Validar valor
    if (formData.valor < 0) {
      nuevosErrores.valor = 'El valor del descuento debe ser positivo';
    }

    // Validar estatus
    if (!formData.estatusdescuento.trim()) {
      nuevosErrores.estatusdescuento = 'El estatus es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const esValido = await validarFormulario();
    if (!esValido) return;

    const usuario = localStorage.getItem('usuario') || 'sistema';

    if (descuentoInicial) {
      // Actualizar
      const descuentoUpdate: DescuentoUpdate = {
        ...formData,
        UsuarioModifico: usuario
      };
      onSubmit(descuentoUpdate);
    } else {
      // Crear
      const descuentoCreate: DescuentoCreate = {
        ...formData,
        UsuarioCreo: usuario
      };
      onSubmit(descuentoCreate);
    }
  };

  return (
    <div className="formulario-descuento-overlay" onClick={onCancel}>
      <div className="formulario-descuento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-descuento-header">
          <div className="formulario-header-content">
            <BadgePercent className="formulario-header-icon" />
            <h2>{descuentoInicial ? 'Editar Descuento' : 'Nuevo Descuento'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="formulario-descuento-form">
        {/* Sección 1: Información Básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre del Descuento <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Descuento Estudiante, Promo Fin de Semana..."
              className={errores.nombre ? 'error' : ''}
            />
            {validandoNombre && (
              <span className="validating-message">Validando...</span>
            )}
            {errores.nombre && (
              <span className="error-message">{errores.nombre}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipodescuento">
                Tipo de Descuento <span className="required">*</span>
              </label>
              <div className="tipo-descuento-selector">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipodescuento === 'Porcentaje' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipodescuento: 'Porcentaje' }))}
                >
                  <span className="tipo-icon">%</span>
                  <span className="tipo-label">Porcentaje</span>
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipodescuento === 'Efectivo' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipodescuento: 'Efectivo' }))}
                >
                  <span className="tipo-icon">$</span>
                  <span className="tipo-label">Efectivo</span>
                </button>
              </div>
              {errores.tipodescuento && (
                <span className="error-message">{errores.tipodescuento}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="valor">
                Valor <span className="required">*</span>
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={errores.valor ? 'error' : ''}
              />
              {errores.valor && (
                <span className="error-message">{errores.valor}</span>
              )}
            </div>
          </div>
        </div>

        {/* Sección 2: Configuración */}
        <div className="form-section">
          <h3>Configuración</h3>
          
          <div className="form-group">
            <label htmlFor="estatusdescuento">
              Estatus <span className="required">*</span>
            </label>
            <input
              type="text"
              id="estatusdescuento"
              name="estatusdescuento"
              value={formData.estatusdescuento}
              onChange={handleInputChange}
              placeholder="Ej: ACTIVO, INACTIVO..."
              className={errores.estatusdescuento ? 'error' : ''}
            />
            {errores.estatusdescuento && (
              <span className="error-message">{errores.estatusdescuento}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="requiereautorizacion">
              ¿Requiere Autorización? <span className="required">*</span>
            </label>
            <select
              id="requiereautorizacion"
              name="requiereautorizacion"
              value={formData.requiereautorizacion}
              onChange={handleInputChange}
            >
              <option value={RequiereAutorizacion.NO}>No</option>
              <option value={RequiereAutorizacion.SI}>Sí</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="formulario-descuento-actions">
          <button type="button" onClick={onCancel} className="btn-cancelar">
            <X size={20} />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={validandoNombre}
          >
            <Save size={20} />
            {descuentoInicial ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default FormularioDescuento;

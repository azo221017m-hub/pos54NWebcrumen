import React, { useState, useEffect, useMemo } from 'react';
import type { Mesa, MesaCreate, MesaUpdate } from '../../../types/mesa.types';
import { EstatusMesa, EstatusTiempo } from '../../../types/mesa.types';
import { validarNumeroMesaUnico } from '../../../services/mesasService';
import { Table2, X, Save } from 'lucide-react';
import './FormularioMesa.css';

interface FormularioMesaProps {
  mesaInicial?: Mesa;
  onSubmit: (mesa: MesaCreate | MesaUpdate) => void;
  onCancel: () => void;
  idnegocio: number;
}

const FormularioMesa: React.FC<FormularioMesaProps> = ({ 
  mesaInicial, 
  onSubmit, 
  onCancel,
  idnegocio
}) => {
  const initialFormData = useMemo(() => ({
    nombremesa: mesaInicial?.nombremesa || '',
    numeromesa: mesaInicial?.numeromesa || 0,
    cantcomensales: mesaInicial?.cantcomensales || 1,
    estatusmesa: mesaInicial?.estatusmesa || EstatusMesa.DISPONIBLE,
    tiempodeinicio: mesaInicial?.tiempodeinicio || '',
    tiempoactual: mesaInicial?.tiempoactual || '',
    estatustiempo: mesaInicial?.estatustiempo || EstatusTiempo.INACTIVA
  }), [mesaInicial]);

  const [formData, setFormData] = useState(initialFormData);

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [validandoNumero, setValidandoNumero] = useState(false);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numeromesa' || name === 'cantcomensales' ? Number(value) : value
    }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = async (): Promise<boolean> => {
    const nuevosErrores: { [key: string]: string } = {};

    // Validar nombre de mesa
    if (!formData.nombremesa.trim()) {
      nuevosErrores.nombremesa = 'El nombre de la mesa es requerido';
    }

    // Validar número de mesa
    if (formData.numeromesa <= 0) {
      nuevosErrores.numeromesa = 'El número de mesa debe ser mayor a 0';
    } else {
      // Validar que el número de mesa sea único
      setValidandoNumero(true);
      try {
        const esUnico = await validarNumeroMesaUnico(
          formData.numeromesa,
          idnegocio,
          mesaInicial?.idmesa
        );
        if (!esUnico) {
          nuevosErrores.numeromesa = 'Este número de mesa ya existe en el negocio';
        }
      } catch (error) {
        console.error('Error al validar número de mesa:', error);
      }
      setValidandoNumero(false);
    }

    // Validar cantidad de comensales
    if (formData.cantcomensales <= 0) {
      nuevosErrores.cantcomensales = 'La cantidad de comensales debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const esValido = await validarFormulario();
    if (!esValido) return;

    const usuarioData = localStorage.getItem('usuario');
    const usuario = usuarioData ? JSON.parse(usuarioData).alias : 'sistema';

    if (mesaInicial) {
      // Actualizar
      const mesaUpdate: MesaUpdate = {
        ...formData,
        tiempodeinicio: formData.tiempodeinicio || null,
        tiempoactual: formData.tiempoactual || null,
        UsuarioModifico: usuario
      };
      onSubmit(mesaUpdate);
    } else {
      // Crear
      const mesaCreate: MesaCreate = {
        ...formData,
        tiempodeinicio: formData.tiempodeinicio || undefined,
        tiempoactual: formData.tiempoactual || undefined,
        UsuarioCreo: usuario
      };
      onSubmit(mesaCreate);
    }
  };

  return (
    <div className="formulario-mesa-overlay" onClick={onCancel}>
      <div className="formulario-mesa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-mesa-header">
          <div className="formulario-header-content">
            <Table2 className="formulario-header-icon" />
            <h2>{mesaInicial ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="formulario-mesa-form">
        {/* Sección 1: Información Básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="nombremesa">
              Nombre de Mesa <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombremesa"
              name="nombremesa"
              value={formData.nombremesa}
              onChange={handleInputChange}
              placeholder="Ej: Mesa Principal, Mesa Terraza..."
              className={errores.nombremesa ? 'error' : ''}
            />
            {errores.nombremesa && (
              <span className="error-message">{errores.nombremesa}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numeromesa">
                Número de Mesa <span className="required">*</span>
              </label>
              <input
                type="number"
                id="numeromesa"
                name="numeromesa"
                value={formData.numeromesa}
                onChange={handleInputChange}
                min="1"
                className={errores.numeromesa ? 'error' : ''}
              />
              {validandoNumero && (
                <span className="validating-message">Validando...</span>
              )}
              {errores.numeromesa && (
                <span className="error-message">{errores.numeromesa}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cantcomensales">
                Capacidad (Comensales) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="cantcomensales"
                name="cantcomensales"
                value={formData.cantcomensales}
                onChange={handleInputChange}
                min="1"
                className={errores.cantcomensales ? 'error' : ''}
              />
              {errores.cantcomensales && (
                <span className="error-message">{errores.cantcomensales}</span>
              )}
            </div>
          </div>
        </div>

        {/* Sección 2: Estado de Mesa */}
        <div className="form-section">
          <h3>Estado de Mesa</h3>
          
          <div className="form-group">
            <label htmlFor="estatusmesa">
              Estatus de Mesa <span className="required">*</span>
            </label>
            <select
              id="estatusmesa"
              name="estatusmesa"
              value={formData.estatusmesa}
              onChange={handleInputChange}
            >
              <option value={EstatusMesa.DISPONIBLE}>Disponible</option>
              <option value={EstatusMesa.OCUPADA}>Ocupada</option>
              <option value={EstatusMesa.RESERVADA}>Reservada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="estatustiempo">
              Estatus de Tiempo <span className="required">*</span>
            </label>
            <select
              id="estatustiempo"
              name="estatustiempo"
              value={formData.estatustiempo}
              onChange={handleInputChange}
            >
              <option value={EstatusTiempo.INACTIVA}>Inactiva</option>
              <option value={EstatusTiempo.EN_CURSO}>En Curso</option>
              <option value={EstatusTiempo.DEMORA}>Demora</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="formulario-mesa-actions">
          <button type="button" onClick={onCancel} className="btn-cancelar">
            <X size={20} />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={validandoNumero}
          >
            <Save size={20} />
            {mesaInicial ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default FormularioMesa;

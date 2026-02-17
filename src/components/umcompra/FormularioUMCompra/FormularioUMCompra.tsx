import React, { useState, useEffect, useMemo } from 'react';
import { Scale, Package, Building2, ArrowRightLeft } from 'lucide-react';
import type { UMCompra, UMCompraFormData } from '../../../types/umcompra.types';
import './FormularioUMCompra.css';

interface FormularioUMCompraProps {
  umEditar?: UMCompra | null;
  onSubmit: (um: UMCompraFormData) => void;
  onCancelar: () => void;
  loading?: boolean;
}

export const FormularioUMCompra: React.FC<FormularioUMCompraProps> = ({
  umEditar,
  onSubmit,
  onCancelar,
  loading = false
}) => {
  const initialFormData = useMemo(() => ({
    nombreUmCompra: umEditar?.nombreUmCompra || '',
    valor: umEditar?.valor || 0,
    umMatPrima: umEditar?.umMatPrima || '',
    valorConvertido: umEditar?.valorConvertido || 0,
    usuarioauditoria: umEditar?.usuarioauditoria || ''
  }), [umEditar]);

  const [formData, setFormData] = useState<UMCompraFormData>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener usuario de auditoría
    const usuarioStorage = localStorage.getItem('usuario');
    const usuarioAudit = usuarioStorage ? JSON.parse(usuarioStorage).alias : 'sistema';

    await onSubmit({
      ...formData,
      usuarioauditoria: usuarioAudit
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' || name === 'valorConvertido'
        ? value === '' ? 0 : Number(value)
        : value
    }));
  };

  return (
    <div className="formulario-umcompra-container">
      <form onSubmit={handleSubmit} className="formulario-umcompra">
        <div className="formulario-umcompra-header">
          <Scale className="header-icon" size={28} />
          <h2>{umEditar ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}</h2>
        </div>

        <div className="formulario-umcompra-content">
          {/* Sección: Información General */}
          <div className="form-section">
            <div className="section-header">
              <Package size={20} />
              <h3>Información General</h3>
            </div>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="nombreUmCompra">
                <Scale size={16} className="inline-icon" />
                Nombre de Unidad <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombreUmCompra"
                name="nombreUmCompra"
                value={formData.nombreUmCompra}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Ej: Kilogramo, Litro, Pieza, Caja"
              />
              <small className="form-hint">Nombre descriptivo de la unidad de medida</small>
            </div>

            <div className="form-group">
              <label htmlFor="valor">
                <Scale size={16} className="inline-icon" />
                Valor <span className="required">*</span>
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                step="0.001"
                min="0"
                required
                placeholder="0.000"
              />
              <small className="form-hint">Valor numérico de la unidad (hasta 3 decimales)</small>
            </div>

            <div className="form-group">
              <label htmlFor="valorConvertido">
                <ArrowRightLeft size={16} className="inline-icon" />
                Valor Convertido <span className="required">*</span>
              </label>
              <input
                type="number"
                id="valorConvertido"
                name="valorConvertido"
                value={formData.valorConvertido}
                onChange={handleChange}
                step="0.001"
                min="0"
                required
                placeholder="0.000"
              />
              <small className="form-hint">Valor equivalente en otra unidad</small>
            </div>
          </div>
        </div>

        {/* Sección: Materia Prima y Asignación */}
        <div className="form-section">
          <div className="section-header">
            <Building2 size={20} />
            <h3>Detalles Adicionales</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="umMatPrima">
                <Package size={16} className="inline-icon" />
                Unidad de Materia Prima <span className="required">*</span>
              </label>
              <select
                id="umMatPrima"
                name="umMatPrima"
                value={formData.umMatPrima}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una unidad</option>
                <option value="Kilo">Kilo</option>
                <option value="Litro">Litro</option>
                <option value="Pieza">Pieza</option>
              </select>
              <small className="form-hint">Unidad base para la materia prima</small>
            </div>
          </div>
        </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancelar} 
            className="btn-cancelar"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (umEditar ? 'Actualizar' : 'Crear Unidad')}
          </button>
        </div>
      </form>
    </div>
  );
};

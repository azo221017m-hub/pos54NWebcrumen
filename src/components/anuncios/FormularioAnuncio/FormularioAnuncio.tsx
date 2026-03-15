import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, Megaphone, CalendarDays } from 'lucide-react';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../../../types/anuncio.types';
import './FormularioAnuncio.css';

interface ImagePreviewProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

const ImagenAnuncio: React.FC<ImagePreviewProps> = ({ index, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('La imagen no debe superar 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.onerror = () => setError('Error al leer el archivo');
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="imagen-anuncio-slot">
      <span className="imagen-label">Imagen {index}</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`imagen-anuncio-${index}`}
      />
      {value ? (
        <div className="imagen-preview-wrapper">
          <img
            src={value}
            alt={`Imagen ${index}`}
            className="imagen-preview"
          />
          <button
            type="button"
            className="imagen-remove-btn"
            onClick={handleRemove}
            title="Eliminar imagen"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label htmlFor={`imagen-anuncio-${index}`} className="imagen-upload-label">
          <span className="imagen-upload-icon">+</span>
          <span className="imagen-upload-text">Agregar</span>
        </label>
      )}
      {error && <span className="imagen-error">{error}</span>}
      <small className="imagen-help">PNG, JPG, WebP (máx. 2MB)</small>
    </div>
  );
};

interface FormularioAnuncioProps {
  anuncioInicial?: Anuncio;
  onSubmit: (anuncio: AnuncioCreate | AnuncioUpdate) => void;
  onCancel: () => void;
}

const FormularioAnuncio: React.FC<FormularioAnuncioProps> = ({
  anuncioInicial,
  onSubmit,
  onCancel
}) => {
  const initialFormData = useMemo(() => ({
    tituloDeAnuncio: anuncioInicial?.tituloDeAnuncio || '',
    detalleAnuncio: anuncioInicial?.detalleAnuncio || '',
    imagen1Anuncio: anuncioInicial?.imagen1Anuncio || '',
    imagen2Anuncio: anuncioInicial?.imagen2Anuncio || '',
    imagen3Anuncio: anuncioInicial?.imagen3Anuncio || '',
    imagen4Anuncio: anuncioInicial?.imagen4Anuncio || '',
    imagen5Anuncio: anuncioInicial?.imagen5Anuncio || '',
    fechaDeVigencia: anuncioInicial?.fechaDeVigencia || ''
  }), [anuncioInicial]);

  const [formData, setFormData] = useState(initialFormData);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};
    if (!formData.tituloDeAnuncio.trim()) {
      nuevosErrores.tituloDeAnuncio = 'El título del anuncio es requerido';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const payload = {
        tituloDeAnuncio: formData.tituloDeAnuncio.trim(),
        detalleAnuncio: formData.detalleAnuncio || undefined,
        imagen1Anuncio: formData.imagen1Anuncio || undefined,
        imagen2Anuncio: formData.imagen2Anuncio || undefined,
        imagen3Anuncio: formData.imagen3Anuncio || undefined,
        imagen4Anuncio: formData.imagen4Anuncio || undefined,
        imagen5Anuncio: formData.imagen5Anuncio || undefined,
        fechaDeVigencia: formData.fechaDeVigencia || undefined
      };
      await onSubmit(payload);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="formulario-anuncio-overlay" onClick={onCancel}>
      <div className="formulario-anuncio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-anuncio-header">
          <div className="formulario-header-content">
            <Megaphone className="formulario-header-icon" size={28} />
            <h2>{anuncioInicial ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-anuncio-form">
          {/* Sección: Información del Anuncio */}
          <div className="form-section">
            <h3>Información del Anuncio</h3>

            <div className="form-group">
              <label htmlFor="tituloDeAnuncio">
                Título del Anuncio <span className="required">*</span>
              </label>
              <input
                type="text"
                id="tituloDeAnuncio"
                name="tituloDeAnuncio"
                value={formData.tituloDeAnuncio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, tituloDeAnuncio: e.target.value }));
                  if (errores.tituloDeAnuncio) setErrores(prev => ({ ...prev, tituloDeAnuncio: '' }));
                }}
                placeholder="Ej: Promoción de temporada, Nuevo producto..."
                className={errores.tituloDeAnuncio ? 'error' : ''}
              />
              {errores.tituloDeAnuncio && (
                <span className="error-message">{errores.tituloDeAnuncio}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="detalleAnuncio">Detalle del Anuncio</label>
              <textarea
                id="detalleAnuncio"
                name="detalleAnuncio"
                value={formData.detalleAnuncio}
                onChange={(e) => setFormData(prev => ({ ...prev, detalleAnuncio: e.target.value }))}
                placeholder="Describe el anuncio en detalle..."
                rows={4}
                className="textarea-anuncio"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaDeVigencia">
                <CalendarDays size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Fecha de Vigencia
              </label>
              <input
                type="date"
                id="fechaDeVigencia"
                name="fechaDeVigencia"
                value={formData.fechaDeVigencia}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaDeVigencia: e.target.value }))}
                className="date-input-anuncio"
              />
              <small className="help-text">Fecha hasta la cual el anuncio estará vigente</small>
            </div>
          </div>

          {/* Sección: Imágenes */}
          <div className="form-section">
            <h3>Imágenes del Anuncio <span className="section-subtitle">(máximo 5, cada una hasta 2MB)</span></h3>
            <div className="imagenes-grid">
              {[1, 2, 3, 4, 5].map((num) => {
                const key = `imagen${num}Anuncio` as keyof typeof formData;
                return (
                  <ImagenAnuncio
                    key={num}
                    index={num}
                    value={formData[key] as string}
                    onChange={(val) => setFormData(prev => ({ ...prev, [key]: val }))}
                  />
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="formulario-anuncio-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar">
              <X size={20} />
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={guardando}>
              <Save size={20} />
              {guardando ? 'Guardando...' : anuncioInicial ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAnuncio;

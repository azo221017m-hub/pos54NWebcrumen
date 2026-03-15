import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, Megaphone, Upload, Trash2, Calendar } from 'lucide-react';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../../../types/anuncio.types';
import './FormularioAnuncio.css';

interface Props {
  anuncioEditar: Anuncio | null;
  onSubmit: (data: AnuncioCreate | AnuncioUpdate) => void;
  onCancel: () => void;
  loading: boolean;
}

interface ImageSlot {
  key: keyof Pick<Anuncio, 'imagen1Anuncio' | 'imagen2Anuncio' | 'imagen3Anuncio' | 'imagen4Anuncio' | 'imagen5Anuncio'>;
  label: string;
}

const IMAGE_SLOTS: ImageSlot[] = [
  { key: 'imagen1Anuncio', label: 'Imagen 1' },
  { key: 'imagen2Anuncio', label: 'Imagen 2' },
  { key: 'imagen3Anuncio', label: 'Imagen 3' },
  { key: 'imagen4Anuncio', label: 'Imagen 4' },
  { key: 'imagen5Anuncio', label: 'Imagen 5' },
];

const FormularioAnuncio: React.FC<Props> = ({ anuncioEditar, onSubmit, onCancel, loading }) => {
  const datosIniciales = useMemo(() => {
    if (anuncioEditar) {
      return {
        tituloDeAnuncio: anuncioEditar.tituloDeAnuncio,
        detalleAnuncio: anuncioEditar.detalleAnuncio || '',
        imagen1Anuncio: anuncioEditar.imagen1Anuncio,
        imagen2Anuncio: anuncioEditar.imagen2Anuncio,
        imagen3Anuncio: anuncioEditar.imagen3Anuncio,
        imagen4Anuncio: anuncioEditar.imagen4Anuncio,
        imagen5Anuncio: anuncioEditar.imagen5Anuncio,
        fechaDeVigencia: anuncioEditar.fechaDeVigencia || '',
      };
    }
    return {
      tituloDeAnuncio: '',
      detalleAnuncio: '',
      imagen1Anuncio: null as string | null,
      imagen2Anuncio: null as string | null,
      imagen3Anuncio: null as string | null,
      imagen4Anuncio: null as string | null,
      imagen5Anuncio: null as string | null,
      fechaDeVigencia: '',
    };
  }, [anuncioEditar]);

  const [formData, setFormData] = useState(datosIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});
  // Previews: mapea el key de imagen a una URL de preview (data URL)
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Inicializar previews al montar o cuando cambia anuncioEditar
  useEffect(() => {
    setFormData(datosIniciales);
    const initialPreviews: Record<string, string | null> = {};
    for (const slot of IMAGE_SLOTS) {
      const b64 = anuncioEditar?.[slot.key];
      initialPreviews[slot.key] = b64 ? `data:image/jpeg;base64,${b64}` : null;
    }
    setPreviews(initialPreviews);
  }, [anuncioEditar, datosIniciales]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo de 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrores(prev => ({ ...prev, [key]: 'La imagen no puede superar 5 MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Extraer sólo el base64 sin el prefijo data:...;base64,
      const base64 = dataUrl.split(',')[1];
      setFormData(prev => ({ ...prev, [key]: base64 }));
      setPreviews(prev => ({ ...prev, [key]: dataUrl }));
      if (errores[key]) {
        setErrores(prev => ({ ...prev, [key]: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuitarImagen = (key: string) => {
    setFormData(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: null }));
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!formData.tituloDeAnuncio.trim()) {
      nuevosErrores.tituloDeAnuncio = 'El título es requerido';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    const datos: AnuncioCreate = {
      tituloDeAnuncio: formData.tituloDeAnuncio.trim(),
      detalleAnuncio: formData.detalleAnuncio.trim() || null,
      imagen1Anuncio: formData.imagen1Anuncio,
      imagen2Anuncio: formData.imagen2Anuncio,
      imagen3Anuncio: formData.imagen3Anuncio,
      imagen4Anuncio: formData.imagen4Anuncio,
      imagen5Anuncio: formData.imagen5Anuncio,
      fechaDeVigencia: formData.fechaDeVigencia || null,
    };

    if (anuncioEditar) {
      onSubmit({ ...datos, idAnuncio: anuncioEditar.idAnuncio } as AnuncioUpdate);
    } else {
      onSubmit(datos);
    }
  };

  return (
    <div className="formulario-anuncio-overlay">
      <div className="formulario-anuncio-modal">
        {/* Header */}
        <div className="formulario-anuncio-header">
          <div className="header-icon">
            <Megaphone size={22} />
          </div>
          <h2>{anuncioEditar ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h2>
          <button className="btn-cerrar" onClick={onCancel} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="formulario-anuncio-body" onSubmit={handleSubmit}>
          {/* Título */}
          <div className="form-field">
            <label htmlFor="tituloDeAnuncio" className="form-label">
              Título del Anuncio <span className="required">*</span>
            </label>
            <input
              id="tituloDeAnuncio"
              name="tituloDeAnuncio"
              type="text"
              className={`form-input ${errores.tituloDeAnuncio ? 'input-error' : ''}`}
              value={formData.tituloDeAnuncio}
              onChange={handleChange}
              placeholder="Ej. Promoción de verano"
              maxLength={250}
            />
            {errores.tituloDeAnuncio && (
              <span className="error-text">{errores.tituloDeAnuncio}</span>
            )}
          </div>

          {/* Detalle */}
          <div className="form-field">
            <label htmlFor="detalleAnuncio" className="form-label">
              Detalle del Anuncio
            </label>
            <textarea
              id="detalleAnuncio"
              name="detalleAnuncio"
              className="form-textarea"
              value={formData.detalleAnuncio}
              onChange={handleChange}
              placeholder="Descripción detallada del anuncio..."
              rows={4}
            />
          </div>

          {/* Fecha de Vigencia */}
          <div className="form-field">
            <label htmlFor="fechaDeVigencia" className="form-label">
              <Calendar size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Fecha de Vigencia
            </label>
            <input
              id="fechaDeVigencia"
              name="fechaDeVigencia"
              type="date"
              className="form-input form-input-date"
              value={formData.fechaDeVigencia}
              onChange={handleChange}
            />
          </div>

          {/* Imágenes */}
          <div className="form-field">
            <label className="form-label">Imágenes del Anuncio</label>
            <div className="imagenes-grid">
              {IMAGE_SLOTS.map((slot) => {
                const preview = previews[slot.key];
                return (
                  <div key={slot.key} className="imagen-slot">
                    <span className="imagen-label">{slot.label}</span>
                    {preview ? (
                      <div className="imagen-preview-container">
                        <img
                          src={preview}
                          alt={slot.label}
                          className="imagen-preview"
                        />
                        <button
                          type="button"
                          className="btn-quitar-imagen"
                          onClick={() => handleQuitarImagen(slot.key)}
                          title="Quitar imagen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-seleccionar-imagen"
                        onClick={() => fileInputRefs.current[slot.key]?.click()}
                      >
                        <Upload size={20} />
                        <span>Seleccionar</span>
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                      onChange={(e) => handleImageChange(e, slot.key)}
                    />
                    {errores[slot.key] && (
                      <span className="error-text">{errores[slot.key]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="formulario-anuncio-footer">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-small" />
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Guardando...' : anuncioEditar ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAnuncio;

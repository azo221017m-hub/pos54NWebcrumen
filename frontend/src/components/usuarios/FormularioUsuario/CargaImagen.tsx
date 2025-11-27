import React, { useState, useRef } from 'react';
import { Upload, X, Eye } from 'lucide-react';
import './CargaImagen.css';

interface CargaImagenProps {
  label: string;
  tipoImagen: 'fotoine' | 'fotopersona' | 'fotoavatar';
  imagenActual?: string | null;
  onImagenSeleccionada: (imagen: string | null, tipo: string) => void;
  descripcion?: string;
}

const CargaImagen: React.FC<CargaImagenProps> = ({
  label,
  tipoImagen,
  imagenActual,
  onImagenSeleccionada,
  descripcion
}) => {
  const [imagenPreview, setImagenPreview] = useState<string | null>(imagenActual || null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remover el prefijo data:image/...;base64,
      const base64Data = base64String.split(',')[1];
      
      setImagenPreview(base64String);
      onImagenSeleccionada(base64Data, tipoImagen);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarImagen = () => {
    setImagenPreview(null);
    onImagenSeleccionada(null, tipoImagen);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClickCargar = () => {
    inputRef.current?.click();
  };

  return (
    <div className="carga-imagen-container">
      <label className="carga-imagen-label">
        {label}
        {descripcion && <span className="carga-imagen-descripcion">{descripcion}</span>}
      </label>

      <div className="carga-imagen-contenido">
        {imagenPreview ? (
          <div className="imagen-preview-container">
            <img 
              src={imagenPreview} 
              alt={label} 
              className="imagen-preview"
            />
            <div className="imagen-acciones">
              <button
                type="button"
                onClick={() => setMostrarModal(true)}
                className="btn-accion btn-ver"
                title="Ver imagen completa"
              >
                <Eye size={18} />
              </button>
              <button
                type="button"
                onClick={handleEliminarImagen}
                className="btn-accion btn-eliminar"
                title="Eliminar imagen"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="zona-carga" onClick={handleClickCargar}>
            <Upload size={40} />
            <p>Haz clic para cargar imagen</p>
            <span className="zona-carga-info">PNG, JPG o JPEG (máx. 5MB)</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className="input-file-hidden"
        />
      </div>

      {/* Modal para ver imagen completa */}
      {mostrarModal && imagenPreview && (
        <div className="modal-imagen-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-imagen-contenido" onClick={e => e.stopPropagation()}>
            <button
              className="modal-cerrar"
              onClick={() => setMostrarModal(false)}
            >
              <X size={24} />
            </button>
            <img src={imagenPreview} alt={label} className="modal-imagen" />
            <p className="modal-titulo">{label}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargaImagen;

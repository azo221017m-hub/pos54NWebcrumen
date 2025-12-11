import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import './ImageUpload.css';

interface Props {
  value?: string; // base64 or URL
  onChange: (base64Image: string) => void;
  previewSize?: number; // Size in pixels, defaults to 20
  shape?: 'circle' | 'square'; // Shape of preview, defaults to 'circle'
  label?: string;
  accept?: string; // File types to accept, defaults to images
}

const ImageUpload: React.FC<Props> = ({ 
  value, 
  onChange, 
  previewSize = 20, 
  shape = 'circle',
  label = 'Seleccionar imagen',
  accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('La imagen no debe superar 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    setError(null);

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      onChange(base64String);
    };
    reader.onerror = () => {
      setError('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="image-upload-content">
        {previewUrl ? (
          <div className="image-preview-container">
            <div 
              className={`image-preview ${shape === 'circle' ? 'circle' : 'square'}`}
              style={{ 
                width: `${previewSize}px`, 
                height: `${previewSize}px`,
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <button 
              type="button" 
              onClick={handleRemove} 
              className="image-remove-btn"
              title="Eliminar imagen"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={handleClick} 
            className="image-upload-btn"
          >
            <Upload size={20} />
            <span>{label}</span>
          </button>
        )}
      </div>

      {error && (
        <span className="image-upload-error">{error}</span>
      )}

      <small className="image-upload-help">
        Formatos aceptados: PNG, JPG, GIF, WebP (máx. 2MB)
      </small>
    </div>
  );
};

export default ImageUpload;

// src/components/CategoriaImageUpload.tsx
import React, { useState } from 'react';

interface CategoriaImageUploadProps {
  onFileSelect: (file: File | null) => void;
  initialImage?: string;
  disabled?: boolean;
}

const CategoriaImageUpload: React.FC<CategoriaImageUploadProps> = ({ onFileSelect, initialImage, disabled }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="categoria-image">Imagen de la categoría</label>
      <input
        type="file"
        id="categoria-image"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
      />
      {previewUrl && (
        <div style={{ marginTop: '10px' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoriaImageUpload;

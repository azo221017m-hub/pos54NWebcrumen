// src/components/ImageUpload.tsx
// Componente para carga y previsualización de imágenes del logotipo del negocio

import React, { useState, useRef } from 'react';
import '../styles/ImageUpload.css';

// Props del componente
interface ImageUploadProps {
  currentImage?: string; // URL de la imagen actual (base64 o URL)
  onImageChange: (file: File | null) => void; // Callback cuando cambia la imagen
  onImageRemove?: () => void; // Callback para remover imagen
  label?: string; // Etiqueta personalizada
  className?: string; // Clases CSS adicionales
  disabled?: boolean; // Si está deshabilitado
}

// Componente ImageUpload
const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  onImageRemove,
  label = 'Logotipo del Negocio',
  className = '',
  disabled = false
}) => {
  // Estados del componente
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Referencia al input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Función para validar el archivo
  const validateFile = (file: File): string | null => {
    console.log('📄 Validando archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo se permiten: JPEG, PNG, GIF, WebP';
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Máximo 5MB permitido';
    }
    
    return null; // Archivo válido
  };
  
  // Función para manejar la selección de archivo
  const handleFileSelect = (file: File) => {
    console.log('🖼️ Archivo seleccionado:', file.name);
    
    const validationError = validateFile(file);
    if (validationError) {
      console.error('❌ Error de validación:', validationError);
      setError(validationError);
      return;
    }
    
    setError('');
    
    // Crear URL de preview
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Notificar al componente padre
    onImageChange(file);
    
    console.log('✅ Imagen cargada correctamente');
  };
  
  // Función para manejar el change del input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  // Función para manejar el click en el contenedor
  const handleContainerClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Función para remover imagen
  const handleRemoveImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('🗑️ Removiendo imagen...');
    
    setPreviewUrl(null);
    setError('');
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Notificar al componente padre
    onImageChange(null);
    if (onImageRemove) {
      onImageRemove();
    }
    
    console.log('✅ Imagen removida');
  };
  
  // Funciones para drag and drop
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  return (
    <div className={`image-upload-wrapper ${className}`}>
      <label className="form-label">{label}</label>
      
      <div
        className={`image-upload-container ${previewUrl ? 'has-image' : ''} ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleContainerClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="image-upload-input"
          disabled={disabled}
        />
        
        {previewUrl ? (
          <div className="image-preview-container">
            <img 
              src={previewUrl} 
              alt="Preview del logotipo" 
              className="image-preview"
            />
            <div className="image-upload-buttons">
              <button
                type="button"
                onClick={handleContainerClick}
                className="btn-upload"
                disabled={disabled}
              >
                📷 Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-remove"
                disabled={disabled}
              >
                🗑️ Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <div className="image-upload-icon">
              {isDragging ? '📥' : '🖼️'}
            </div>
            <div className="image-upload-text">
              <div className="primary">
                {isDragging ? 'Suelta la imagen aquí' : 'Haz clic para subir logotipo'}
              </div>
              <div className="secondary">
                o arrastra y suelta una imagen
              </div>
              <div className="secondary">
                JPEG, PNG, GIF, WebP (máx. 5MB)
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="image-upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
import React, { useState, useEffect } from 'react';

interface FormModeradorProps {
  onClose: () => void;
  onSuccess: () => void;
  idnegocio: string;
}

const FormModerador: React.FC<FormModeradorProps> = ({ onClose, onSuccess, idnegocio }) => {
  const [nombreModerador, setNombreModerador] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🛠️ Valor de idnegocio:', idnegocio);
  }, [idnegocio]);

  const handleSubmit = async () => {
    if (!nombreModerador.trim()) {
      setError('El nombre del moderador es obligatorio.');
      return;
    }

    try {
      console.log('📡 Enviando datos al backend:', {
        nombremoderador: nombreModerador.trim(),
        idnegocio,
      });

      const response = await fetch('/api/moderadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombremoderador: nombreModerador.trim(),
          idnegocio,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Moderador creado:', data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al crear moderador:', err);
      setError('Hubo un error al crear el moderador.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar Moderador</h3>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="text"
          placeholder="Nombre del moderador"
          value={nombreModerador}
          onChange={(e) => setNombreModerador(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default FormModerador;
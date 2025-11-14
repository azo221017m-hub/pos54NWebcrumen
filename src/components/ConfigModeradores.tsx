
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Toast from './Toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Moderador {
  idmoderador: number;
  nombremoderador: string;
  fechaRegistroauditoria: string;
  usuarioauditoria: string;
  fehamodificacionauditoria: string;
  idnegocio: number;
}

const ConfigModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {

  const { user } = useAuth();
  const idnegocio = user?.idNegocio || 1;
  const usuarioauditoria = user?.alias || 'unknown';

  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModerador, setEditingModerador] = useState<Moderador | null>(null);
  const [nombreModerador, setNombreModerador] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);


  useEffect(() => {
    fetch(`/api/moderadores?idnegocio=${idnegocio}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setModeradores(data.data);
      });
  }, [idnegocio]);

  const handleOpenModal = (moderador?: Moderador) => {
    if (moderador) {
      setEditingModerador(moderador);
      setNombreModerador(moderador.nombremoderador);
    } else {
      setEditingModerador(null);
      setNombreModerador('');
    }
    setIsModalOpen(true);
  };

  const handleSaveModerador = async () => {
    // Validar duplicados
    const nombreDuplicado = moderadores.some(
      (mod) => mod.nombremoderador.toLowerCase() === nombreModerador.toLowerCase()
    );
    if (nombreDuplicado) {
      setToastMessage('El nombre del moderador ya existe. Por favor, elige otro nombre.');
      setShowToast(true);
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      nombremoderador: nombreModerador,
      idnegocio,
      usuarioauditoria: usuarioauditoria,
      fechaRegistroauditoria: editingModerador ? undefined : now,
      fehamodificacionauditoria: now,
    };

    const url = editingModerador
      ? `/api/moderadores/${editingModerador.idmoderador}`
      : '/api/moderadores';
    const method = editingModerador ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Backend error response:', errorResponse); // Log backend response
        setToastMessage('Error al guardar el moderador. Intente nuevamente.');
        setShowToast(true);
        return;
      }

      const data = await response.json();
      if (editingModerador) {
        setModeradores((prev) =>
          prev.map((mod) => (mod.idmoderador === editingModerador.idmoderador ? data : mod))
        );
      } else {
        setModeradores((prev) => [...prev, data]);
      }
      setIsModalOpen(false);

      setToastMessage('Moderador guardado con éxito');
      setShowToast(true);

      // Refetch moderadores after successful insert
      const fetchModeradores = async () => {
        const response = await fetch('/api/moderadores');
        const data = await response.json();
        if (data.success) {
          setModeradores(data.data);
        }
      };

      await fetchModeradores();
    } catch (error) {
      console.error('Error saving moderador:', error);
      setToastMessage('Error al guardar el moderador. Intente nuevamente.');
      setShowToast(true);
    }
  };


  const handleDeleteModerador = (id: number) => {
    fetch(`/api/moderadores/${id}`, { method: 'DELETE' })
      .then(async (response) => {
        if (!response.ok) {
          let errorMsg = 'Failed to delete moderador';
          try {
            const errorJson = await response.json();
            errorMsg = errorJson.message || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }
        await response.json();
        setModeradores((prev) => prev.filter((mod) => mod.idmoderador !== id));
        setToastMessage('Moderador eliminado con éxito');
        setShowToast(true);
      })
      .catch((error) => {
        setToastMessage(error.message || 'No se pudo eliminar el moderador. Intente nuevamente.');
        setShowToast(true);
      });
  };



  return (
    <div className="config-screen">
      <button onClick={onBack} className="btn-primary">← Regresar</button>
      <h2>Moderadores</h2>
      <button className="btn-primary" onClick={() => handleOpenModal()}>Agregar Moderador</button>
      <div className="moderadores-card-grid">
        {moderadores.map((moderador) => (
          <div className="moderador-card" key={moderador.idmoderador}>
            <div className="moderador-card-header">
              <div className="moderador-avatar">
                <span>{moderador.nombremoderador.charAt(0).toUpperCase()}</span>
              </div>
              <div className="moderador-actions">
                <button className="btn-edit" title="Editar" onClick={() => handleOpenModal(moderador)}><FaEdit /></button>
                <button className="btn-delete" title="Eliminar" onClick={() => handleDeleteModerador(moderador.idmoderador)}><FaTrash /></button>
              </div>
            </div>
            <div className="moderador-card-body">
              <div className="moderador-nombre">{moderador.nombremoderador}</div>
              <div className="moderador-meta">Registro: {moderador.fechaRegistroauditoria}</div>
              <div className="moderador-meta">Usuario: {moderador.usuarioauditoria}</div>
            </div>
          </div>
        ))}
      </div>
      {/* ...existing code for modal de moderador y toast... */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>{editingModerador ? 'Editar Moderador' : 'Agregar Moderador'}</h4>
            <input
              type="text"
              value={nombreModerador}
              onChange={(e) => setNombreModerador(e.target.value)}
              placeholder="Nombre del moderador"
            />
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button onClick={handleSaveModerador}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default ConfigModeradores;

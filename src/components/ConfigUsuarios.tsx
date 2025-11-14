
import { useState } from 'react';

interface Props {
  onNavigate: (screen: string) => void;
}

const mockUsuarios = [
  {
    idUsuario: 1,
    nombre: 'Juan Pérez',
    alias: 'jperez',
    telefono: '555-1234',
    desempeno: 4,
    popularidad: 5,
    estatus: true
  },
  {
    idUsuario: 2,
    nombre: 'Ana Gómez',
    alias: 'agomez',
    telefono: '555-5678',
    desempeno: 5,
    popularidad: 3,
    estatus: false
  }
];

const componentStyles = `
  .usuarios-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
  .usuarios-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
  .usuarios-title { font-size: 2rem; font-weight: 700; color: #4a5568; }
  .btn-add-usuario { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; padding: 0.5rem 1.2rem; font-size: 1rem; cursor: pointer; font-weight: 600; }
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
  .usuario-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 1.2rem; display: flex; flex-direction: column; gap: 0.7rem; border: 1px solid #e2e8f0; }
  .card-header { display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 1.2rem; font-weight: 600; color: #2d3748; margin: 0; }
  .card-info { font-size: 0.98rem; color: #4a5568; display: flex; flex-direction: column; gap: 0.2rem; }
  .card-actions { display: flex; gap: 0.7rem; margin-top: 0.5rem; }
  .btn-card-action { background: #edf2f7; border: none; border-radius: 6px; padding: 0.3rem 0.8rem; font-size: 0.98rem; cursor: pointer; }
  .btn-edit-card { color: #4c51bf; }
  .btn-delete-card { color: #e53e3e; }
  .btn-regresar { background: none; border: none; color: #4c51bf; font-size: 1rem; cursor: pointer; margin-bottom: 1.2rem; }
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44,62,80,0.18); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-content { background: #fff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); min-width: 340px; max-width: 98vw; padding: 0; overflow: hidden; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
  .btn-close { background: none; border: none; font-size: 1.3rem; color: #718096; cursor: pointer; }
`;

export default function ConfigUsuarios({ onNavigate }: Props) {
  const [usuarios] = useState(mockUsuarios);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Acciones
  const abrirModalNuevo = () => {
    setIsEditing(false);
    setShowModal(true);
  };
  const abrirModalEdicion = (usuario: typeof mockUsuarios[0]) => {
    console.log('Editing user:', usuario);
    setIsEditing(true);
    setShowModal(true);
  };
  const cerrarModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  return (
    <>
      <style>{componentStyles}</style>
      <div className="usuarios-container">
        {/* Botón de regresar */}
        <button 
          className="btn-regresar"
          onClick={() => onNavigate('tablero-inicial')}
        >
          ← Regresar al Tablero
        </button>

        {/* Header con título y botón agregar */}
        <div className="usuarios-header">
          <h1 className="usuarios-title">
            👤 Gestión de Usuarios
          </h1>
          <button 
            className="btn-add-usuario"
            onClick={abrirModalNuevo}
          >
            ➕ Agregar Usuario
          </button>
        </div>

        {/* Grid de minicards de usuarios */}
        <div className="cards-grid">
          {usuarios.map((usuario: typeof mockUsuarios[0]) => (
            <div key={usuario.idUsuario} className="usuario-card">
              <div className="card-header">
                <h3 className="card-title">{usuario.nombre}</h3>
                <span style={{ fontWeight: 600, color: usuario.estatus ? '#48bb78' : '#e53e3e' }}>
                  {usuario.estatus ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="card-info">
                <div><strong>Alias:</strong> {usuario.alias}</div>
                <div><strong>Teléfono:</strong> {usuario.telefono}</div>
                <div><strong>Desempeño:</strong> {usuario.desempeno} ⭐</div>
                <div><strong>Popularidad:</strong> {usuario.popularidad} ⭐</div>
              </div>
              <div className="card-actions">
                <button className="btn-card-action btn-edit-card" onClick={() => abrirModalEdicion(usuario)}>
                  ✏️ Editar
                </button>
                <button className="btn-card-action btn-delete-card" disabled>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
          {usuarios.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '3rem',
              background: 'white',
              borderRadius: '12px',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>👤</div>
              <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>No hay usuarios registrados</h3>
              <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Comienza creando tu primer usuario</p>
              <button 
                className="btn-add-usuario" 
                onClick={abrirModalNuevo}
                style={{ position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
              >
                ➕ Crear primer usuario
              </button>
            </div>
          )}
        </div>

        {/* Modal para crear/editar usuario (estructura vacía) */}
        {showModal && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{isEditing ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
                <button className="btn-close" onClick={cerrarModal}>✕</button>
              </div>
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#718096' }}>
                {/* Aquí irá el formulario de usuario */}
                <p>Formulario de usuario (pendiente de implementación)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
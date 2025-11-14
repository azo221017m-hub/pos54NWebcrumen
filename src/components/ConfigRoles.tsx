// src/components/ConfigRoles.tsx
// Componente para gestión de roles de usuario

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, Rol, CreateRolData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface ConfigRolesProps {
  currentUser: Usuario | null; // Usuario actual logueado
  onBack?: () => void; // Función para regresar (opcional)
}

/**
 * Componente ConfigRoles
 * Gestiona la configuración de roles con formularios y lista
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al HomeScreen
 */
const ConfigRoles: React.FC<ConfigRolesProps> = ({ currentUser, onBack }) => {
  // Estados del componente
  const [roles, setRoles] = useState<Rol[]>([]); // Lista de roles
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  const [isEditing, setIsEditing] = useState<boolean>(false); // Control del modo edición
  const [editingId, setEditingId] = useState<number | null>(null); // ID del rol siendo editado
  
  // Estado para el formulario de nuevo rol
  const [formData, setFormData] = useState<CreateRolData>({
    nombreRol: '',
    descripcion: '',
    estatus: 1, // Por defecto activo
    usuario: currentUser?.usuario || 'admin'
  });

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Función para mostrar Toast
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cerrar Toast
  const closeToast = () => {
    setShowToast(false);
  };

  // Función para cargar roles desde la API
  const loadRoles = async (): Promise<void> => {
    try {
      console.log('👥 Cargando roles...'); // Log de carga
      const response = await apiService.getRolesComplete();
      
      if (response.success && response.data) {
        setRoles(response.data);
        console.log(`✅ ${response.data.length} roles cargados`); // Log de éxito
      } else {
        console.error('❌ Error cargando roles:', response.message);
        showToastMessage('Error cargando roles', 'error');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadRoles();
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Función para crear rol
  const handleCreateRol = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('👥 Creando rol...'); // Log de creación
      
      // Actualiza usuario con el usuario actual
      const dataToSubmit = {
        ...formData,
        usuario: currentUser?.usuario || 'admin'
      };
      
      const response = await apiService.createRol(dataToSubmit);
      
      if (response.success) {
        showToastMessage('Rol creado exitosamente', 'success');
        setShowForm(false);
        resetForm();
        loadRoles(); // Recarga la lista
      } else {
        showToastMessage(response.message || 'Error creando rol', 'error');
      }
    } catch (error) {
      console.error('❌ Error creando rol:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Función para editar rol
  const handleEditRol = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!editingId) return;
    
    try {
      console.log(`👥 Editando rol ${editingId}...`);
      
      const dataToSubmit = {
        ...formData,
        usuario: currentUser?.usuario || 'admin'
      };
      
      const response = await apiService.updateRol(editingId, dataToSubmit);
      
      if (response.success) {
        showToastMessage('Rol actualizado exitosamente', 'success');
        setShowForm(false);
        resetForm();
        loadRoles();
      } else {
        showToastMessage(response.message || 'Error actualizando rol', 'error');
      }
    } catch (error) {
      console.error('❌ Error editando rol:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Función para iniciar edición
  const startEdit = (rol: Rol): void => {
    setFormData({
      nombreRol: rol.nombreRol,
      descripcion: rol.descripcion,
      estatus: rol.estatus,
      usuario: currentUser?.usuario || 'admin'
    });
    setEditingId(rol.idRol);
    setIsEditing(true);
    setShowForm(true);
  };

  // Función para resetear formulario
  const resetForm = (): void => {
    setFormData({
      nombreRol: '',
      descripcion: '',
      estatus: 1,
      usuario: currentUser?.usuario || 'admin'
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para cancelar edición/creación
  const handleCancel = (): void => {
    setShowForm(false);
    resetForm();
  };

  // Renderizado del componente
  return (
    <div className="config-container">
      {/* Componente Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
        />
      )}

      {/* Encabezado */}
      <div className="config-header">
        <div className="header-left">
          {onBack && (
            <button 
              className="btn-secondary"
              onClick={onBack}
            >
              ← Regresar
            </button>
          )}
          <h1>Configuración de Roles</h1>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Rol
        </button>
      </div>

      {/* Formulario de nuevo/editar rol */}
      {showForm && (
        <div className="form-modal">
          <div className="form-card card">
            <h2>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</h2>
            <form onSubmit={isEditing ? handleEditRol : handleCreateRol}>
              <div className="form-group">
                <label className="form-label">Nombre del Rol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombreRol}
                  onChange={(e) => setFormData({...formData, nombreRol: e.target.value})}
                  placeholder="Ej: Administrador, Cajero, etc."
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del rol y sus permisos"
                  required
                />
              </div>
              
              {/* Dropdown para Estado */}
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  value={formData.estatus}
                  onChange={(e) => setFormData({...formData, estatus: Number(e.target.value)})}
                  required
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Actualizar Rol' : 'Registrar Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de roles */}
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Rol</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Última Actualización</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="loading">Cargando roles...</td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No hay roles registrados</td>
              </tr>
            ) : (
              roles.map((rol) => (
                <tr key={rol.idRol}>
                  <td>{rol.idRol}</td>
                  <td>{rol.nombreRol}</td>
                  <td>{rol.descripcion}</td>
                  <td>
                    <span className={`status ${rol.estatus === 1 ? 'active' : 'inactive'}`}>
                      {rol.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(rol.fechaRegistro).toLocaleDateString()}</td>
                  <td>{new Date(rol.fechaActualizacion).toLocaleDateString()}</td>
                  <td>{rol.usuario}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => startEdit(rol)}
                        title="Editar rol"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigRoles;
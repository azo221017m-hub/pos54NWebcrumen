// src/components/ConfigUsuarios.tsx
// Componente para gestión de usuarios con dropdowns mejorados

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, CreateUsuarioData, Negocio } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para roles
interface Rol {
  idRol: number;
  nombreRol: string;
  activo: number;
}

// Interfaz para las props del componente
interface ConfigUsuariosProps {
  currentUser: Usuario | null; // Usuario actual logueado
  onBack?: () => void; // Función para regresar (opcional)
}

/**
 * Componente ConfigUsuarios
 * Gestiona la configuración de usuarios con formularios y lista
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al HomeScreen
 */
const ConfigUsuarios: React.FC<ConfigUsuariosProps> = ({ currentUser, onBack }) => {
  // Estados del componente
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Lista de usuarios
  const [negocios, setNegocios] = useState<Negocio[]>([]); // Lista de negocios
  const [roles, setRoles] = useState<Rol[]>([]); // Lista de roles
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  
  // Estado para el formulario de nuevo usuario
  const [formData, setFormData] = useState<CreateUsuarioData>({
    idNegocio: 0,
    idRol: 0,
    nombre: '',
    usuario: '',
    password: '',
    email: '',
    activo: 1, // Por defecto activo
    usuarioAuditoria: currentUser?.usuario || 'admin'
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

  // Función para cargar usuarios desde la API
  const loadUsuarios = async (): Promise<void> => {
    try {
      console.log('📄 Cargando usuarios...'); // Log de carga
      const response = await apiService.getUsuarios();
      
      if (response.success && response.data) {
        setUsuarios(response.data);
        console.log(`✅ ${response.data.length} usuarios cargados`); // Log de éxito
      } else {
        console.error('❌ Error cargando usuarios:', response.message);
        showToastMessage('Error cargando usuarios', 'error');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Función para cargar negocios desde la API
  const loadNegocios = async (): Promise<void> => {
    try {
      console.log('🏢 Cargando negocios...'); // Log de carga
      const response = await apiService.getNegocios();
      
      if (response.success && response.data) {
        setNegocios(response.data);
        console.log(`✅ ${response.data.length} negocios cargados`); // Log de éxito
      } else {
        console.error('❌ Error cargando negocios:', response.message);
        showToastMessage('Error cargando negocios', 'error');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Función para cargar roles desde la API
  const loadRoles = async (): Promise<void> => {
    try {
      console.log('👥 Cargando roles...'); // Log de carga
      const response = await apiService.getRoles();
      
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
      await Promise.all([loadUsuarios(), loadNegocios(), loadRoles()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Función para crear usuario
  const handleCreateUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('👤 Creando usuario...'); // Log de creación
      
      // Actualiza usuarioAuditoria con el usuario actual
      const dataToSubmit = {
        ...formData,
        usuarioAuditoria: currentUser?.usuario || 'admin'
      };
      
      const response = await apiService.createUsuario(dataToSubmit);
      
      if (response.success) {
        showToastMessage('Usuario creado exitosamente', 'success');
        setShowForm(false);
        // Resetea el formulario
        setFormData({
          idNegocio: 0,
          idRol: 0,
          nombre: '',
          usuario: '',
          password: '',
          email: '',
          activo: 1,
          usuarioAuditoria: currentUser?.usuario || 'admin'
        });
        loadUsuarios(); // Recarga la lista
      } else {
        showToastMessage(response.message || 'Error creando usuario', 'error');
      }
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      showToastMessage('Error de conexión', 'error');
    }
  };

  // Función para obtener nombre de negocio por ID
  const getNombreNegocio = (idNegocio: number): string => {
    const negocio = negocios.find(n => n.idNegocio === idNegocio);
    return negocio ? negocio.nombreNegocio : 'N/A';
  };

  // Función para obtener nombre de rol por ID
  const getNombreRol = (idRol: number): string => {
    const rol = roles.find(r => r.idRol === idRol);
    return rol ? rol.nombreRol : 'N/A';
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
          <h1>Configuración de Usuarios</h1>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Formulario de nuevo usuario */}
      {showForm && (
        <div className="form-modal">
          <div className="form-card card">
            <h2>Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              
              {/* Dropdown para Negocio */}
              <div className="form-group">
                <label className="form-label">Negocio</label>
                <select
                  className="form-input"
                  value={formData.idNegocio}
                  onChange={(e) => setFormData({...formData, idNegocio: Number(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar negocio...</option>
                  {negocios.map((negocio) => (
                    <option key={negocio.idNegocio} value={negocio.idNegocio}>
                      {negocio.nombreNegocio}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Dropdown para Rol */}
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                  className="form-input"
                  value={formData.idRol}
                  onChange={(e) => setFormData({...formData, idRol: Number(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombreRol}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              {/* Dropdown para Estado */}
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  value={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: Number(e.target.value)})}
                  required
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Negocio</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="loading">Cargando usuarios...</td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No hay usuarios registrados</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario}>
                  <td>{usuario.idUsuario}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.email}</td>
                  <td>{getNombreNegocio(usuario.idNegocio)}</td>
                  <td>{getNombreRol(usuario.idRol)}</td>
                  <td>
                    <span className={`status ${usuario.estatus === 1 ? 'active' : 'inactive'}`}>
                      {usuario.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigUsuarios;
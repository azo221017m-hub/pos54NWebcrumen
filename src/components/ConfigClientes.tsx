// src/components/ConfigClientes.tsx
// Componente para gestión de clientes

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, Cliente, CreateClienteData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface ConfigClientesProps {
  currentUser: Usuario | null; // Usuario actual logueado
  onBack?: () => void; // Función para regresar (opcional)
}

/**
 * Componente ConfigClientes
 * Gestiona la configuración de clientes con formularios y lista
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al HomeScreen
 */
const ConfigClientes: React.FC<ConfigClientesProps> = ({ currentUser, onBack }) => {
  // Estados del componente
  const [clientes, setClientes] = useState<Cliente[]>([]); // Lista de clientes
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  
  // Estado para el formulario de nuevo cliente
  const [formData, setFormData] = useState<CreateClienteData>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
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

  // Función para cargar clientes desde la API
  const loadClientes = async (): Promise<void> => {
    try {
      console.log('👥 Cargando clientes...'); // Log de carga
      const response = await apiService.getClientes();
      
      if (response.success && response.data) {
        setClientes(response.data);
        console.log(`✅ ${response.data.length} clientes cargados`); // Log de éxito
      } else {
        console.error('❌ Error cargando clientes:', response.message);
        showToastMessage('Error cargando clientes', 'error');
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
      await loadClientes();
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Función para crear cliente
  const handleCreateCliente = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('👥 Creando cliente...'); // Log de creación
      
      // Actualiza usuario con el usuario actual
      const dataToSubmit = {
        ...formData,
        usuario: currentUser?.usuario || 'admin'
      };
      
      const response = await apiService.createCliente(dataToSubmit);
      
      if (response.success) {
        showToastMessage('Cliente creado exitosamente', 'success');
        setShowForm(false);
        // Resetea el formulario
        setFormData({
          nombre: '',
          telefono: '',
          email: '',
          direccion: '',
          estatus: 1,
          usuario: currentUser?.usuario || 'admin'
        });
        loadClientes(); // Recarga la lista
      } else {
        showToastMessage(response.message || 'Error creando cliente', 'error');
      }
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      showToastMessage('Error de conexión', 'error');
    }
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
          <h1>Configuración de Clientes</h1>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Formulario de nuevo cliente */}
      {showForm && (
        <div className="form-modal">
          <div className="form-card card">
            <h2>Nuevo Cliente</h2>
            <form onSubmit={handleCreateCliente}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Nombre completo del cliente"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="Número de teléfono"
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
                  placeholder="Correo electrónico"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección completa del cliente"
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
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Última Actualización</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="loading">Cargando clientes...</td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">No hay clientes registrados</td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td>{cliente.idCliente}</td>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.telefono}</td>
                  <td>{cliente.email}</td>
                  <td className="address-cell">{cliente.direccion}</td>
                  <td>
                    <span className={`status ${cliente.estatus === 1 ? 'active' : 'inactive'}`}>
                      {cliente.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(cliente.fechaRegistro).toLocaleDateString()}</td>
                  <td>{new Date(cliente.fechaActualizacion).toLocaleDateString()}</td>
                  <td>{cliente.usuario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigClientes;
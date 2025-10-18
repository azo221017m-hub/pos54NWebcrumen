// src/components/ConfigNegocios.tsx
// Componente para gestión de negocios

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Negocio, CreateNegocioData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface ConfigNegociosProps {
  onBack: () => void; // Función para regresar
}

// Componente de configuración de negocios
const ConfigNegocios: React.FC<ConfigNegociosProps> = ({ onBack }) => {
  // Estado para la lista de negocios
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  
  // Estado de carga
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Estado para mostrar formulario
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Estado para datos del formulario
  const [formData, setFormData] = useState<CreateNegocioData>({
    numerocliente: '',
    nombreNegocio: '',
    rfc: '',
    direccion: '',
    telefono: '',
    usuario: 'admin'
  });

  // Estado para mensajes
  const [message, setMessage] = useState<string>('');

  // Efecto para cargar negocios al montar
  useEffect(() => {
    loadNegocios(); // Carga los negocios
  }, []);

  // Función para cargar negocios
  const loadNegocios = async (): Promise<void> => {
    try {
      console.log('🏢 Cargando negocios...'); // Log de carga
      setIsLoading(true);
      
      const response = await apiService.getNegocios();
      
      if (response.success && response.data) {
        setNegocios(response.data);
        console.log(`✅ ${response.data.length} negocios cargados`); // Log de éxito
      } else {
        setMessage('Error cargando negocios');
      }
    } catch (error) {
      console.error('❌ Error cargando negocios:', error);
      setMessage('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear negocio
  const handleCreateNegocio = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('🏢 Creando negocio...'); // Log de creación
      
      const response = await apiService.createNegocio(formData);
      
      if (response.success) {
        setMessage('Negocio creado exitosamente');
        setShowForm(false);
        setFormData({
          numerocliente: '',
          nombreNegocio: '',
          rfc: '',
          direccion: '',
          telefono: '',
          usuario: 'admin'
        });
        loadNegocios(); // Recarga la lista
      } else {
        setMessage(response.message || 'Error creando negocio');
      }
    } catch (error) {
      console.error('❌ Error creando negocio:', error);
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <button className="back-button" onClick={onBack}>
          ← Regresar
        </button>
        <h1>Gestión de Negocios</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Negocio
        </button>
      </div>

      {/* Mensaje */}
      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* Formulario de nuevo negocio */}
      {showForm && (
        <div className="form-modal">
          <div className="form-card card">
            <h2>Nuevo Negocio</h2>
            <form onSubmit={handleCreateNegocio}>
              <div className="form-group">
                <label className="form-label">Número de Cliente</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.numerocliente}
                  onChange={(e) => setFormData({...formData, numerocliente: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre del Negocio</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombreNegocio}
                  onChange={(e) => setFormData({...formData, nombreNegocio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">RFC</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.rfc}
                  onChange={(e) => setFormData({...formData, rfc: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <textarea
                  className="form-input"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Negocio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de negocios */}
      <div className="data-table">
        {isLoading ? (
          <div className="loading">Cargando negocios...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número Cliente</th>
                <th>Nombre</th>
                <th>RFC</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((negocio) => (
                <tr key={negocio.idNegocio}>
                  <td>{negocio.idNegocio}</td>
                  <td>{negocio.numerocliente}</td>
                  <td>{negocio.nombreNegocio}</td>
                  <td>{negocio.rfc}</td>
                  <td>{negocio.telefono}</td>
                  <td>
                    <span className={`status ${negocio.estatusCliente === 1 ? 'active' : 'inactive'}`}>
                      {negocio.estatusCliente === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConfigNegocios;
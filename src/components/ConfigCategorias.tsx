// src/components/ConfigCategorias.tsx
// Componente para gestión de categorías con tabla de datos y formulario de inserción

import React, { useState, useEffect } from 'react';
import type { Categoria, CreateCategoriaData, ApiResponse, Usuario, ScreenType } from '../types/index';
import { getCategorias, createCategoria } from '../services/api';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaz para props del componente
interface ConfigCategoriasProps {
  onNavigate: (screen: ScreenType) => void; // Función para navegar entre pantallas
  currentUser: Usuario; // Usuario autenticado actual
}

// Componente principal de configuración de categorías
const ConfigCategorias: React.FC<ConfigCategoriasProps> = ({ onNavigate, currentUser }) => {
  // Estados para el manejo de datos y UI
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Lista de categorías
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado de envío de formulario

  // Estados para el formulario de nueva categoría
  const [formData, setFormData] = useState<CreateCategoriaData>({
    nombre: '',
    descripcion: '',
    estatus: 1,
    usuario: currentUser.usuario // Llenar automáticamente con el usuario logueado
  });

  // Estados para Toast de notificaciones
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Función para mostrar notificaciones
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-ocultar se maneja automáticamente por el nuevo componente Toast
  };

  // Función para cargar categorías desde la API
  const cargarCategorias = async () => {
    try {
      setLoading(true);
      console.log('Cargando categorías...');
      
      const response: ApiResponse<Categoria[]> = await getCategorias();
      console.log('Respuesta de categorías:', response);
      
      if (response.success && response.data) {
        setCategorias(response.data);
        mostrarToast(`${response.data.length} categorías cargadas correctamente`, 'success');
      } else {
        setCategorias([]);
        mostrarToast(response.message || 'Error al cargar categorías', 'error');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
      mostrarToast('Error de conexión al cargar categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estatus' ? Number(value) : value
    }));
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      mostrarToast('El nombre de la categoría es obligatorio', 'error');
      return;
    }

    if (!formData.descripcion.trim()) {
      mostrarToast('La descripción de la categoría es obligatoria', 'error');
      return;
    }

    // Usuario se toma automáticamente del currentUser, no necesita validación

    try {
      setSubmitting(true);
      console.log('Enviando nueva categoría:', formData);
      
      // Preparar datos con fechas actuales
      const categoriaData: CreateCategoriaData = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        usuario: currentUser.usuario // Usar siempre el usuario actual
      };

      const response: ApiResponse = await createCategoria(categoriaData);
      console.log('Respuesta de creación:', response);
      
      if (response.success) {
        mostrarToast('Categoría creada exitosamente', 'success');
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          descripcion: '',
          estatus: 1,
          usuario: currentUser.usuario // Mantener el usuario logueado
        });
        
        // Recargar lista de categorías
        await cargarCategorias();
      } else {
        mostrarToast(response.message || 'Error al crear la categoría', 'error');
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      mostrarToast('Error de conexión al crear categoría', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear fecha para display
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="config-screen">
      {/* Toast Component */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      
      {/* Header con título y navegación */}
      <div className="config-header">
        <div className="config-breadcrumb">
          <span className="breadcrumb-item">
            <button onClick={() => onNavigate('home')}>🏠 Inicio</button>
          </span>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-item">🏷️ Categorías</span>
        </div>
        <h1>Gestión de Categorías</h1>
        <p>Administra las categorías del sistema</p>
      </div>

      <div className="config-container">
        {/* Contenido principal */}
        <div className="config-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🏷️</span>
              Nueva Categoría
            </h2>
          </div>

          <div className="card-content">
            {/* Formulario de nueva categoría */}
            <form onSubmit={handleSubmit} className="config-form">
              <div className="form-section">
                <h3>Información de la Categoría</h3>
                
                <div className="form-row">
                  {/* Campo nombre */}
                  <div className="form-group">
                    <label htmlFor="nombre" className="form-label">
                      Nombre de la Categoría *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ingrese el nombre de la categoría"
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Campo estatus */}
                  <div className="form-group">
                    <label htmlFor="estatus" className="form-label">
                      Estatus
                    </label>
                    <select
                      id="estatus"
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  {/* Campo descripción */}
                  <div className="form-group">
                    <label htmlFor="descripcion" className="form-label">
                      Descripción *
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="form-input form-textarea"
                      placeholder="Ingrese la descripción de la categoría"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Campo usuario oculto - se mantiene automáticamente con currentUser */}
              </div>

              {/* Botones de acción */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tabla de categorías existentes */}
        <div className="config-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📋</span>
              Categorías Registradas ({categorias.length})
            </h2>
          </div>
          
          <div className="card-content">
            {loading ? (
              <div className="loading-skeleton" style={{ height: '200px' }}></div>
            ) : categorias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏷️</div>
                <h3>No hay categorías registradas</h3>
                <p>Crea la primera categoría usando el formulario superior</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estatus</th>
                      <th>Fecha Registro</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr key={categoria.idCategoria}>
                        <td className="text-center">{categoria.idCategoria}</td>
                        <td>
                          <strong>{categoria.nombre}</strong>
                        </td>
                        <td className="text-description">
                          {categoria.descripcion.length > 50 
                            ? `${categoria.descripcion.substring(0, 50)}...` 
                            : categoria.descripcion}
                        </td>
                        <td className="text-center">
                          <span className={`status-badge ${categoria.estatus === 1 ? 'status-active' : 'status-inactive'}`}>
                            {categoria.estatus === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="text-date">
                          {formatearFecha(categoria.fechaRegistro)}
                        </td>
                        <td>{categoria.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Botón de regresar */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('home')}
          >
            🏠 Regresar al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigCategorias;
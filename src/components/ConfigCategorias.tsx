// src/components/ConfigCategorias.tsx
// Componente para gestión de categorías con tabla de datos y formulario de inserción

import React, { useState, useEffect } from 'react';
import type { Categoria, CreateCategoriaData, ApiResponse, Usuario } from '../types/index';
import { getCategorias, createCategoria } from '../services/api';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaz para props del componente
interface ConfigCategoriasProps {
  onNavigate: (screen: string) => void; // Función para navegar entre pantallas
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
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar notificaciones
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-ocultar después de 3 segundos
    setTimeout(() => setShowToast(false), 3000);
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

    if (!formData.usuario || !formData.usuario.trim()) {
      mostrarToast('El usuario es obligatorio', 'error');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Enviando nueva categoría:', formData);
      
      // Preparar datos con fechas actuales
      const categoriaData: CreateCategoriaData = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        usuario: formData.usuario ? formData.usuario.trim() : ''
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
      {/* Header con título y botón de regreso */}
      <div className="config-header">
        <div className="config-title-section">
          <h1 className="config-title">Gestión de Categorías</h1>
          <p className="config-subtitle">Administra las categorías del sistema</p>
        </div>
        <button 
          className="btn-secondary config-back-btn"
          onClick={() => onNavigate('home')}
          type="button"
        >
          ← Regresar al Inicio
        </button>
      </div>

      <div className="config-content">
        {/* Formulario de nueva categoría */}
        <div className="config-form-section categorias-form-section">
          <h2 className="section-title categorias-section-title">Nueva Categoría</h2>
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-grid categorias-form-grid">
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
                  className="form-textarea"
                  placeholder="Ingrese la descripción de la categoría"
                  rows={3}
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
                  className="form-select"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>

              {/* Campo usuario */}
              <div className="form-group">
                <label htmlFor="usuario" className="form-label">
                  Usuario *
                </label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Usuario que registra"
                  maxLength={100}
                  readOnly // Solo lectura ya que se llena automáticamente
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  required
                />
                <small className="form-hint">Campo automático desde login</small>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Categoría'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de categorías existentes */}
        <div className="config-table-section categorias-table-section">
          <h2 className="section-title categorias-section-title">
            Categorías Registradas ({categorias.length})
          </h2>
          
          {loading ? (
            <div className="loading-message">
              <p>Cargando categorías...</p>
            </div>
          ) : categorias.length === 0 ? (
            <div className="empty-message categorias-empty-message">
              <p className="categorias-empty-title">No hay categorías registradas</p>
              <p className="empty-subtitle categorias-empty-subtitle">Crea la primera categoría usando el formulario superior</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table categoria-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th>Fecha Registro</th>
                    <th>Fecha Actualización</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => (
                    <tr key={categoria.idCategoria}>
                      <td className="text-center">{categoria.idCategoria}</td>
                      <td className="text-bold categoria-nombre">{categoria.nombre}</td>
                      <td className="text-description categoria-descripcion">{categoria.descripcion}</td>
                      <td className="text-center categoria-estatus">
                        <span className={`categoria-status-badge ${categoria.estatus === 1 ? 'categoria-status-active' : 'categoria-status-inactive'}`}>
                          {categoria.estatus === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-date categoria-fecha">{formatearFecha(categoria.fechaRegistro)}</td>
                      <td className="text-date categoria-fecha">{formatearFecha(categoria.fechaActualizacion)}</td>
                      <td className="categoria-usuario">{categoria.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Componente Toast para notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ConfigCategorias;
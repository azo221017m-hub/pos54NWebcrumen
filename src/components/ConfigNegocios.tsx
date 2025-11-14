// src/components/ConfigNegocios.tsx
// Componente para configuración completa de negocios con formulario tipo acordeón

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ImageUpload from './ImageUpload';
import Toast from './Toast';
import type { 
  ScreenType,
  NegocioConfiguracionCompleto,
  CreateNegocioConfiguracionData,
  UpdateNegocioConfiguracionData,
  CreateParametrosNegocioCompletosData,
  UpdateParametrosNegocioCompletosData,
  ApiResponse 
} from '../types';
import '../styles/ConfigScreens.css';

// Props del componente
interface ConfigNegociosProps {
  onNavigate: (screen: ScreenType) => void; // Función para navegar entre pantallas
}

// Componente ConfigNegocios
const ConfigNegocios: React.FC<ConfigNegociosProps> = ({ onNavigate }) => {
  console.log('🏢 Inicializando ConfigNegocios...');
  
  // Hooks
  const { user } = useAuth();
  
  // Estados del componente
  const [negocios, setNegocios] = useState<NegocioConfiguracionCompleto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Estados del formulario
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentNegocio, setCurrentNegocio] = useState<NegocioConfiguracionCompleto | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Estados del acordeón
  const [activeSection, setActiveSection] = useState<string>('perfil'); // 'perfil', 'configuracion', 'recibos'
  
  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    // Sección Perfil Negocio
    numeronegocio: '',
    nombreNegocio: '',
    rfcnegocio: '',
    direccionfiscalnegocio: '',
    contactonegocio: '',
    telefonocontacto: '',
    estatusnegocio: true,
    logotipo: null as File | null,
    
    // Sección Configuración Negocio  
    telefonoNegocio: '',
    telefonoPedidos: '',
    ubicacion: '',
    tipoNegocio: '',
    
    // Sección Configuración Recibos
    encabezado: '',
    pie: '',
    impresionRecibo: true,
    impresionTablero: true,
    envioWhats: false,
    impresionComanda: true,
    envioMensaje: false,
    estatus: true
  });
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState<boolean>(false);
  
  // Función para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`📢 Toast ${type}:`, message);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };
  
  // Cargar negocios al montar el componente
  useEffect(() => {
    cargarNegocios();
  }, []);
  
  // Función para cargar negocios
  const cargarNegocios = async () => {
    console.log('📥 Cargando negocios...');
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/negocios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data: ApiResponse<NegocioConfiguracionCompleto[]> = await response.json();
      console.log('📦 Respuesta recibida:', data);
      
      if (data.success && data.data) {
        setNegocios(data.data);
        console.log(`✅ ${data.data.length} negocios cargados`);
      } else {
        console.error('❌ Error del servidor:', data.message);
        setError(data.message || 'Error al cargar negocios');
        showToastMessage(data.message || 'Error al cargar negocios', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando negocios:', error);
      const errorMessage = 'Error de conexión al cargar negocios';
      setError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para validar si una sección está completa
  const isSectionComplete = (section: string): boolean => {
    switch (section) {
      case 'perfil':
        return !!(formData.numeronegocio && formData.nombreNegocio);
      case 'configuracion':
        return !!(formData.telefonoNegocio || formData.ubicacion || formData.tipoNegocio);
      case 'recibos':
        return !!(formData.encabezado || formData.pie);
      default:
        return false;
    }
  };

  // Función para obtener el porcentaje de completado
  const getSectionProgress = (section: string): number => {
    switch (section) {
      case 'perfil':
        const perfilFields = [
          formData.numeronegocio,
          formData.nombreNegocio,
          formData.rfcnegocio,
          formData.contactonegocio,
          formData.telefonocontacto,
          formData.direccionfiscalnegocio
        ];
        const perfilCompleted = perfilFields.filter(field => field && field.toString().trim() !== '').length;
        return Math.round((perfilCompleted / perfilFields.length) * 100);
      
      case 'configuracion':
        const configFields = [
          formData.telefonoNegocio,
          formData.telefonoPedidos,
          formData.ubicacion,
          formData.tipoNegocio
        ];
        const configCompleted = configFields.filter(field => field && field.toString().trim() !== '').length;
        return Math.round((configCompleted / configFields.length) * 100);
      
      case 'recibos':
        const recibosFields = [
          formData.encabezado,
          formData.pie
        ];
        const recibosCompleted = recibosFields.filter(field => field && field.toString().trim() !== '').length;
        const switchValues = [
          formData.impresionRecibo,
          formData.impresionTablero,
          formData.impresionComanda
        ].filter(Boolean).length;
        return Math.round(((recibosCompleted + switchValues) / (recibosFields.length + 3)) * 100);
      
      default:
        return 0;
    }
  };

  // Función para cambiar sección del acordeón
  const handleSectionChange = (section: string) => {
    console.log('🔄 Cambiando sección:', section, 'Progreso:', getSectionProgress(section) + '%');
    setActiveSection(section);
  };

  // Función para navegar a la siguiente sección
  const goToNextSection = () => {
    const sections = ['perfil', 'configuracion', 'recibos'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      handleSectionChange(sections[currentIndex + 1]);
    }
  };

  // Función para navegar a la sección anterior
  const goToPreviousSection = () => {
    const sections = ['perfil', 'configuracion', 'recibos'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      handleSectionChange(sections[currentIndex - 1]);
    }
  };
  
  // Función para manejar cambios en inputs
  const handleInputChange = (field: string, value: any) => {
    console.log('📝 Actualizando campo:', field, '=', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Función para manejar cambio de imagen
  const handleImageChange = (file: File | null) => {
    console.log('🖼️ Cambio de imagen:', file?.name || 'ninguna');
    setFormData(prev => ({
      ...prev,
      logotipo: file
    }));
  };
  
  // Función para abrir formulario de creación
  const abrirFormularioCreacion = () => {
    console.log('➕ Abriendo formulario de creación...');
    setIsEditing(false);
    setCurrentNegocio(null);
    setActiveSection('perfil');
    
    // Resetear formulario
    setFormData({
      numeronegocio: '',
      nombreNegocio: '',
      rfcnegocio: '',
      direccionfiscalnegocio: '',
      contactonegocio: '',
      telefonocontacto: '',
      estatusnegocio: true,
      logotipo: null,
      telefonoNegocio: '',
      telefonoPedidos: '',
      ubicacion: '',
      tipoNegocio: '',
      encabezado: '',
      pie: '',
      impresionRecibo: true,
      impresionTablero: true,
      envioWhats: false,
      impresionComanda: true,
      envioMensaje: false,
      estatus: true
    });
    
    setShowForm(true);
  };
  
  // Función para abrir formulario de edición
  const abrirFormularioEdicion = (negocio: NegocioConfiguracionCompleto) => {
    console.log('✏️ Abriendo formulario de edición para:', negocio.nombreNegocio);
    setIsEditing(true);
    setCurrentNegocio(negocio);
    setActiveSection('perfil');
    
    // Llenar formulario con datos existentes
    setFormData({
      numeronegocio: negocio.numeronegocio,
      nombreNegocio: negocio.nombreNegocio,
      rfcnegocio: negocio.rfcnegocio,
      direccionfiscalnegocio: negocio.direccionfiscalnegocio,
      contactonegocio: negocio.contactonegocio,
      telefonocontacto: negocio.telefonocontacto,
      estatusnegocio: negocio.estatusnegocio,
      logotipo: null, // Se maneja por separado
      telefonoNegocio: negocio.parametros?.telefonoNegocio || '',
      telefonoPedidos: negocio.parametros?.telefonoPedidos || '',
      ubicacion: negocio.parametros?.ubicacion || '',
      tipoNegocio: negocio.parametros?.tipoNegocio || '',
      encabezado: negocio.parametros?.encabezado || '',
      pie: negocio.parametros?.pie || '',
      impresionRecibo: negocio.parametros?.impresionRecibo ?? true,
      impresionTablero: negocio.parametros?.impresionTablero ?? true,
      envioWhats: negocio.parametros?.envioWhats ?? false,
      impresionComanda: negocio.parametros?.impresionComanda ?? true,
      envioMensaje: negocio.parametros?.envioMensaje ?? false,
      estatus: negocio.parametros?.estatus ?? true
    });
    
    setShowForm(true);
  };
  
  // Función para cerrar formulario
  const cerrarFormulario = () => {
    console.log('❌ Cerrando formulario...');
    setShowForm(false);
    setIsEditing(false);
    setCurrentNegocio(null);
  };
  
  // Función para crear negocio
  const crearNegocio = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('💾 Creando negocio...');
    
    if (!user) {
      showToastMessage('Usuario no autenticado', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Crear datos del negocio
      const negocioData: CreateNegocioConfiguracionData = {
        numeronegocio: formData.numeronegocio.trim(),
        nombreNegocio: formData.nombreNegocio.trim(),
        rfcnegocio: formData.rfcnegocio.trim(),
        direccionfiscalnegocio: formData.direccionfiscalnegocio.trim(),
        contactonegocio: formData.contactonegocio.trim(),
        telefonocontacto: formData.telefonocontacto.trim(),
        estatusnegocio: formData.estatusnegocio,
        usuarioauditoria: user.alias
      };
      
      // Si hay logotipo, convertir a buffer
      if (formData.logotipo) {
        // Aquí se manejaría la conversión del archivo a buffer
        // Por ahora lo omitimos para simplicidad
      }
      
      const response = await fetch('/api/negocios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(negocioData)
      });
      
      const data: ApiResponse<{ idNegocio: number }> = await response.json();
      console.log('📦 Respuesta de creación:', data);
      
      if (data.success && data.data) {
        console.log('✅ Negocio creado con ID:', data.data.idNegocio);
        
        // Si hay parámetros, crearlos
        const parametrosData: CreateParametrosNegocioCompletosData = {
          idNegocio: data.data.idNegocio,
          telefonoNegocio: formData.telefonoNegocio.trim(),
          telefonoPedidos: formData.telefonoPedidos.trim(),
          ubicacion: formData.ubicacion.trim(),
          tipoNegocio: formData.tipoNegocio.trim(),
          impresionRecibo: formData.impresionRecibo,
          impresionTablero: formData.impresionTablero,
          envioWhats: formData.envioWhats,
          encabezado: formData.encabezado.trim(),
          pie: formData.pie.trim(),
          impresionComanda: formData.impresionComanda,
          envioMensaje: formData.envioMensaje,
          estatus: formData.estatus,
          usuarioAuditoria: user.alias
        };
        
        await crearParametrosNegocio(parametrosData);
        
        showToastMessage('Negocio creado correctamente', 'success');
        cerrarFormulario();
        await cargarNegocios();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al crear negocio', 'error');
      }
    } catch (error) {
      console.error('❌ Error creando negocio:', error);
      showToastMessage('Error de conexión al crear negocio', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Función para crear parámetros de negocio
  const crearParametrosNegocio = async (parametrosData: CreateParametrosNegocioCompletosData) => {
    console.log('⚙️ Creando parámetros de negocio...');
    
    try {
      const response = await fetch('/api/negocios/parametros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parametrosData)
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Parámetros creados correctamente');
      } else {
        console.error('❌ Error creando parámetros:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error en parámetros:', error);
      throw error;
    }
  };
  
  // Función para actualizar negocio
  const actualizarNegocio = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('💾 Actualizando negocio...');
    
    if (!user || !currentNegocio) {
      showToastMessage('Datos insuficientes para actualizar', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Actualizar datos del negocio
      const negocioData: UpdateNegocioConfiguracionData = {
        numeronegocio: formData.numeronegocio.trim(),
        nombreNegocio: formData.nombreNegocio.trim(),
        rfcnegocio: formData.rfcnegocio.trim(),
        direccionfiscalnegocio: formData.direccionfiscalnegocio.trim(),
        contactonegocio: formData.contactonegocio.trim(),
        telefonocontacto: formData.telefonocontacto.trim(),
        estatusnegocio: formData.estatusnegocio,
        usuarioauditoria: user.alias
      };
      
      const response = await fetch(`/api/negocios/${currentNegocio.idNegocio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(negocioData)
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Negocio actualizado correctamente');
        
        // Actualizar parámetros si existen
        const parametrosData: UpdateParametrosNegocioCompletosData = {
          telefonoNegocio: formData.telefonoNegocio.trim(),
          telefonoPedidos: formData.telefonoPedidos.trim(),
          ubicacion: formData.ubicacion.trim(),
          tipoNegocio: formData.tipoNegocio.trim(),
          impresionRecibo: formData.impresionRecibo,
          impresionTablero: formData.impresionTablero,
          envioWhats: formData.envioWhats,
          encabezado: formData.encabezado.trim(),
          pie: formData.pie.trim(),
          impresionComanda: formData.impresionComanda,
          envioMensaje: formData.envioMensaje,
          estatus: formData.estatus,
          usuarioAuditoria: user.alias
        };
        
        await actualizarParametrosNegocio(currentNegocio.idNegocio, parametrosData);
        
        showToastMessage('Negocio actualizado correctamente', 'success');
        cerrarFormulario();
        await cargarNegocios();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al actualizar negocio', 'error');
      }
    } catch (error) {
      console.error('❌ Error actualizando negocio:', error);
      showToastMessage('Error de conexión al actualizar negocio', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Función para actualizar parámetros de negocio
  const actualizarParametrosNegocio = async (idNegocio: number, parametrosData: UpdateParametrosNegocioCompletosData) => {
    console.log('⚙️ Actualizando parámetros de negocio...');
    
    try {
      const response = await fetch(`/api/negocios/${idNegocio}/parametros`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parametrosData)
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Parámetros actualizados correctamente');
      } else {
        console.error('❌ Error actualizando parámetros:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error en parámetros:', error);
      throw error;
    }
  };
  
  // Función para eliminar negocio
  const eliminarNegocio = async (negocio: NegocioConfiguracionCompleto) => {
    console.log('🗑️ Eliminando negocio:', negocio.nombreNegocio);
    
    if (!confirm(`¿Estás seguro de que deseas desactivar el negocio "${negocio.nombreNegocio}"?`)) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/negocios/${negocio.idNegocio}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Negocio desactivado correctamente');
        showToastMessage('Negocio desactivado correctamente', 'success');
        await cargarNegocios();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al desactivar negocio', 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando negocio:', error);
      showToastMessage('Error de conexión al desactivar negocio', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render del componente
  return (
    <div className="config-container">
      {/* Header con botón regresar y título */}
      <div className="config-header">
        <button
          className="btn-regresar"
          onClick={() => onNavigate('tablero-inicial')}
          disabled={isProcessing}
        >
          ← Regresar
        </button>
        <h1>🏢 Gestión de Negocios</h1>
        <button
          className="btn-agregar"
          onClick={abrirFormularioCreacion}
          disabled={isLoading || isProcessing}
        >
          ✨ Agregar Negocio
        </button>
      </div>

      {/* Contenido principal */}
      <div className="config-content">
        {/* Mostrar error si existe */}
        {error && (
          <div className="error-container">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Grid de minicards de negocios existentes */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando negocios...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Error al cargar negocios</h3>
            <p>Por favor, intenta recargar la página</p>
            <button onClick={cargarNegocios} className="btn-retry">
              🔄 Reintentar
            </button>
          </div>
        ) : negocios.length === 0 ? (
          <div className="empty-state">
            <h3>No hay negocios registrados</h3>
            <p>Comienza agregando tu primer negocio</p>
          </div>
        ) : (
          negocios.map((negocio) => (
            <div key={negocio.idNegocio} className="negocio-card">
              <div className="negocio-card-header">
                <h3>{negocio.nombreNegocio}</h3>
                <span className={`status-badge ${negocio.estatusnegocio ? 'active' : 'inactive'}`}>
                  {negocio.estatusnegocio ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="negocio-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <label>RFC</label>
                    <span>{negocio.rfcnegocio || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Número</label>
                    <span>{negocio.numeronegocio || 'No asignado'}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-item">
                    <label>Contacto</label>
                    <span>{negocio.contactonegocio || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Teléfono</label>
                    <span>{negocio.telefonocontacto || 'No especificado'}</span>
                  </div>
                </div>

                {negocio.direccionfiscalnegocio && (
                  <div className="detail-item full-width">
                    <label>Dirección Fiscal</label>
                    <span>{negocio.direccionfiscalnegocio}</span>
                  </div>
                )}
              </div>

              <div className="negocio-actions">
                <button
                  className="btn-edit"
                  onClick={() => abrirFormularioEdicion(negocio)}
                  disabled={isProcessing}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-delete"
                  onClick={() => eliminarNegocio(negocio)}
                  disabled={isProcessing}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario con acordeón mejorado */}
      {showForm && (
        <div className="modal-overlay" onClick={cerrarFormulario}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {isEditing ? '✏️ Editar Negocio' : '➕ Agregar Negocio'}
              </h2>
              <button className="modal-close" onClick={cerrarFormulario}>×</button>
            </div>
            
            <form onSubmit={isEditing ? actualizarNegocio : crearNegocio} className="accordion-form">
              <div className="modal-body">
                {/* Acordeón de secciones */}
                <div className="accordion">
                  
                  {/* Sección: Perfil Negocio */}
                  <div className="accordion-section">
                    <button
                      type="button"
                      className={`accordion-header ${activeSection === 'perfil' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('perfil')}
                      title="Información básica del negocio y datos de contacto"
                    >
                      <div className="accordion-title">
                        <span className="accordion-icon">🏢</span>
                        <div>
                          <span className="accordion-text">Perfil del Negocio</span>
                          <div className="section-subtitle">
                            Información básica • {getSectionProgress('perfil')}% completado
                          </div>
                        </div>
                      </div>
                      <div className="accordion-indicators">
                        <div className={`section-progress ${isSectionComplete('perfil') ? 'completed' : ''}`}></div>
                        <span className={`accordion-arrow ${activeSection === 'perfil' ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    <div className={`accordion-content ${activeSection === 'perfil' ? 'expanded' : ''}`}>
                      <div className="form-grid">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="numeronegocio">Número de Negocio *</label>
                            <input
                              type="text"
                              id="numeronegocio"
                              name="numeronegocio"
                              value={formData.numeronegocio}
                              onChange={(e) => handleInputChange('numeronegocio', e.target.value)}
                              placeholder="Ej: NEG-001"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="nombreNegocio">Nombre del Negocio *</label>
                            <input
                              type="text"
                              id="nombreNegocio"
                              name="nombreNegocio"
                              value={formData.nombreNegocio}
                              onChange={(e) => handleInputChange('nombreNegocio', e.target.value)}
                              placeholder="Nombre comercial"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="rfcnegocio">RFC</label>
                            <input
                              type="text"
                              id="rfcnegocio"
                              name="rfcnegocio"
                              value={formData.rfcnegocio}
                              onChange={(e) => handleInputChange('rfcnegocio', e.target.value.toUpperCase())}
                              placeholder="RFC del negocio"
                              maxLength={13}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="telefonocontacto">Teléfono de Contacto</label>
                            <input
                              type="tel"
                              id="telefonocontacto"
                              name="telefonocontacto"
                              value={formData.telefonocontacto}
                              onChange={(e) => handleInputChange('telefonocontacto', e.target.value)}
                              placeholder="Ej: +52 999 123 4567"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="direccionfiscalnegocio">Dirección Fiscal</label>
                            <textarea
                              id="direccionfiscalnegocio"
                              name="direccionfiscalnegocio"
                              value={formData.direccionfiscalnegocio}
                              onChange={(e) => handleInputChange('direccionfiscalnegocio', e.target.value)}
                              placeholder="Dirección fiscal completa"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="contactonegocio">Persona de Contacto</label>
                            <input
                              type="text"
                              id="contactonegocio"
                              name="contactonegocio"
                              value={formData.contactonegocio}
                              onChange={(e) => handleInputChange('contactonegocio', e.target.value)}
                              placeholder="Nombre del responsable"
                            />
                          </div>
                          <div className="form-group">
                            <label>Estado del Negocio</label>
                            <div className="form-switch switch-labeled switch-success">
                              <div className="switch-container">
                                <input
                                  type="checkbox"
                                  id="estatusnegocio"
                                  name="estatusnegocio"
                                  checked={formData.estatusnegocio}
                                  onChange={(e) => handleInputChange('estatusnegocio', e.target.checked)}
                                />
                                <span className="switch-slider"></span>
                              </div>
                              <label htmlFor="estatusnegocio" className="switch-label">
                                <span className="switch-text">
                                  {formData.estatusnegocio ? '🟢 Negocio Activo' : '🔴 Negocio Inactivo'}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group full-width">
                            <label>Logotipo del Negocio</label>
                            <ImageUpload
                              onImageChange={handleImageChange}
                              currentImage={currentNegocio?.logotipo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Configuración Negocio */}
                  <div className="accordion-section">
                    <button
                      type="button"
                      className={`accordion-header ${activeSection === 'configuracion' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('configuracion')}
                      title="Configuración operativa y parámetros del negocio"
                    >
                      <div className="accordion-title">
                        <span className="accordion-icon">⚙️</span>
                        <div>
                          <span className="accordion-text">Configuración del Negocio</span>
                          <div className="section-subtitle">
                            Parámetros operativos • {getSectionProgress('configuracion')}% completado
                          </div>
                        </div>
                      </div>
                      <div className="accordion-indicators">
                        <div className={`section-progress ${isSectionComplete('configuracion') ? 'completed' : ''}`}></div>
                        <span className={`accordion-arrow ${activeSection === 'configuracion' ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    <div className={`accordion-content ${activeSection === 'configuracion' ? 'expanded' : ''}`}>
                      <div className="form-grid">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="telefonoNegocio">Teléfono Principal</label>
                            <input
                              type="tel"
                              id="telefonoNegocio"
                              name="telefonoNegocio"
                              value={formData.telefonoNegocio}
                              onChange={(e) => handleInputChange('telefonoNegocio', e.target.value)}
                              placeholder="Teléfono principal"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="telefonoPedidos">Teléfono de Pedidos</label>
                            <input
                              type="tel"
                              id="telefonoPedidos"
                              name="telefonoPedidos"
                              value={formData.telefonoPedidos}
                              onChange={(e) => handleInputChange('telefonoPedidos', e.target.value)}
                              placeholder="Teléfono para pedidos"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="ubicacion">Ubicación</label>
                            <input
                              type="text"
                              id="ubicacion"
                              name="ubicacion"
                              value={formData.ubicacion}
                              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                              placeholder="Ubicación del negocio"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="tipoNegocio">Tipo de Negocio</label>
                            <select
                              id="tipoNegocio"
                              name="tipoNegocio"
                              value={formData.tipoNegocio}
                              onChange={(e) => handleInputChange('tipoNegocio', e.target.value)}
                            >
                              <option value="">Seleccionar tipo</option>
                              <option value="Restaurante">Restaurante</option>
                              <option value="Cafetería">Cafetería</option>
                              <option value="Panadería">Panadería</option>
                              <option value="Tienda">Tienda</option>
                              <option value="Bar">Bar</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Configuración Recibos */}
                  <div className="accordion-section">
                    <button
                      type="button"
                      className={`accordion-header ${activeSection === 'recibos' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('recibos')}
                      title="Configuración de impresión y mensajes en recibos"
                    >
                      <div className="accordion-title">
                        <span className="accordion-icon">🧾</span>
                        <div>
                          <span className="accordion-text">Configuración de Recibos</span>
                          <div className="section-subtitle">
                            Impresión y mensajes • {getSectionProgress('recibos')}% completado
                          </div>
                        </div>
                      </div>
                      <div className="accordion-indicators">
                        <div className={`section-progress ${isSectionComplete('recibos') ? 'completed' : ''}`}></div>
                        <span className={`accordion-arrow ${activeSection === 'recibos' ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    <div className={`accordion-content ${activeSection === 'recibos' ? 'expanded' : ''}`}>
                      <div className="form-grid">
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="encabezado">Encabezado del Recibo</label>
                            <textarea
                              id="encabezado"
                              name="encabezado"
                              value={formData.encabezado}
                              onChange={(e) => handleInputChange('encabezado', e.target.value)}
                              placeholder="Texto que aparecerá en el encabezado del recibo"
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="pie">Pie del Recibo</label>
                            <textarea
                              id="pie"
                              name="pie"
                              value={formData.pie}
                              onChange={(e) => handleInputChange('pie', e.target.value)}
                              placeholder="Texto que aparecerá en el pie del recibo"
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Switches de configuración - SIMPLIFICADOS */}
                        <div className="switches-grid">
                          <div className="switch-row">
                            <div className="form-group">
                              <label>Impresión de Recibo</label>
                              <div className="form-switch">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="impresionRecibo"
                                    name="impresionRecibo"
                                    checked={formData.impresionRecibo}
                                    onChange={(e) => handleInputChange('impresionRecibo', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="impresionRecibo" className="switch-label">
                                  <span className="switch-text">
                                    {formData.impresionRecibo ? '✅ Impresión Habilitada' : '❌ Impresión Deshabilitada'}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Impresión de Tablero</label>
                              <div className="form-switch">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="impresionTablero"
                                    name="impresionTablero"
                                    checked={formData.impresionTablero}
                                    onChange={(e) => handleInputChange('impresionTablero', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="impresionTablero" className="switch-label">
                                  <span className="switch-text">
                                    {formData.impresionTablero ? '✅ Tablero Activo' : '❌ Tablero Inactivo'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="switch-row">
                            <div className="form-group">
                              <label>Envío WhatsApp</label>
                              <div className="form-switch switch-success">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="envioWhats"
                                    name="envioWhats"
                                    checked={formData.envioWhats}
                                    onChange={(e) => handleInputChange('envioWhats', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="envioWhats" className="switch-label">
                                  <span className="switch-text">
                                    {formData.envioWhats ? '📲 WhatsApp Habilitado' : '📵 WhatsApp Deshabilitado'}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Impresión de Comanda</label>
                              <div className="form-switch">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="impresionComanda"
                                    name="impresionComanda"
                                    checked={formData.impresionComanda}
                                    onChange={(e) => handleInputChange('impresionComanda', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="impresionComanda" className="switch-label">
                                  <span className="switch-text">
                                    {formData.impresionComanda ? '✅ Comanda Habilitada' : '❌ Comanda Deshabilitada'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="switch-row">
                            <div className="form-group">
                              <label>Envío de Mensaje</label>
                              <div className="form-switch switch-warning">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="envioMensaje"
                                    name="envioMensaje"
                                    checked={formData.envioMensaje}
                                    onChange={(e) => handleInputChange('envioMensaje', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="envioMensaje" className="switch-label">
                                  <span className="switch-text">
                                    {formData.envioMensaje ? '📤 Mensajes Activos' : '📪 Mensajes Inactivos'}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Estado de Parámetros</label>
                              <div className="form-switch switch-success">
                                <div className="switch-container">
                                  <input
                                    type="checkbox"
                                    id="estatus"
                                    name="estatus"
                                    checked={formData.estatus}
                                    onChange={(e) => handleInputChange('estatus', e.target.checked)}
                                  />
                                  <span className="switch-slider"></span>
                                </div>
                                <label htmlFor="estatus" className="switch-label">
                                  <span className="switch-text">
                                    {formData.estatus ? '🟢 Parámetros Activos' : '🔴 Parámetros Inactivos'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navegación del acordeón */}
                <div className="accordion-navigation">
                  <button 
                    type="button"
                    className="nav-btn"
                    onClick={goToPreviousSection}
                    disabled={activeSection === 'perfil'}
                  >
                    ← Anterior
                  </button>
                  
                  <div className="section-indicators">
                    <div className={`indicator ${activeSection === 'perfil' ? 'active' : ''} ${isSectionComplete('perfil') ? 'completed' : ''}`}>
                      <span className="indicator-icon">🏢</span>
                      <span className="indicator-text">Perfil</span>
                    </div>
                    <div className={`indicator ${activeSection === 'configuracion' ? 'active' : ''} ${isSectionComplete('configuracion') ? 'completed' : ''}`}>
                      <span className="indicator-icon">⚙️</span>
                      <span className="indicator-text">Config</span>
                    </div>
                    <div className={`indicator ${activeSection === 'recibos' ? 'active' : ''} ${isSectionComplete('recibos') ? 'completed' : ''}`}>
                      <span className="indicator-icon">🧾</span>
                      <span className="indicator-text">Recibos</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className="nav-btn primary"
                    onClick={goToNextSection}
                    disabled={activeSection === 'recibos'}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={cerrarFormulario}
                  className="btn-secondary"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast para notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

    </div>
  );
};

export default ConfigNegocios;
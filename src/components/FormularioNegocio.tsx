// src/components/FormularioNegocio.tsx
// Componente para registro completo de negocio (cliente + negocio + parámetros)

import { useState } from 'react'; // Importa hooks de React
import type { Usuario, CreateNegocioCompletoData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface FormularioNegocioProps {
  currentUser: Usuario | null; // Usuario actual logueado
  onBack?: () => void; // Función para regresar (opcional)
}

/**
 * Componente FormularioNegocio
 * Gestiona el registro completo de negocio con cliente, negocio y parámetros
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al HomeScreen
 */
const FormularioNegocio: React.FC<FormularioNegocioProps> = ({ currentUser, onBack }) => {
  // Estado para el formulario completo
  const [formData, setFormData] = useState<CreateNegocioCompletoData>({
    cliente: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      estatus: 1,
      usuario: currentUser?.usuario || 'admin'
    },
    negocio: {
      nombreNegocio: '',
      rfc: '',
      direccion: '',
      telefono: '',
      estatusCliente: 1,
      usuario: currentUser?.usuario || 'admin'
    },
    parametros: {
      idNegocio: 0, // Se asignará después de crear el negocio
      tipoNegocio: '',
      impresionRecibo: 1,
      encabezado: '',
      pie: '',
      tipoRecibo: 'Ticket',
      envioMensaje: 0,
      estatus: 1,
      usuario: currentUser?.usuario || 'admin'
    }
  });

  // Estados para control del formulario
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Función para actualizar datos del cliente
  const updateClienteData = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        [field]: value
      }
    }));
  };

  // Función para actualizar datos del negocio
  const updateNegocioData = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      negocio: {
        ...prev.negocio,
        [field]: value
      }
    }));
  };

  // Función para actualizar datos de parámetros
  const updateParametrosData = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      parametros: {
        ...prev.parametros,
        [field]: value
      }
    }));
  };

  // Función para registrar negocio completo
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      console.log('🏢 Iniciando registro completo de negocio...'); // Log de inicio
      
      // Actualiza campos de usuario en todos los formularios
      const dataToSubmit: CreateNegocioCompletoData = {
        cliente: {
          ...formData.cliente,
          usuario: currentUser?.usuario || 'admin'
        },
        negocio: {
          ...formData.negocio,
          usuario: currentUser?.usuario || 'admin'
        },
        parametros: {
          ...formData.parametros,
          usuario: currentUser?.usuario || 'admin'
        }
      };
      
      const response = await apiService.createNegocioCompleto(dataToSubmit);
      
      if (response.success) {
        showToastMessage('Negocio registrado exitosamente', 'success');
        
        // Resetea el formulario
        setFormData({
          cliente: {
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            estatus: 1,
            usuario: currentUser?.usuario || 'admin'
          },
          negocio: {
            nombreNegocio: '',
            rfc: '',
            direccion: '',
            telefono: '',
            estatusCliente: 1,
            usuario: currentUser?.usuario || 'admin'
          },
          parametros: {
            idNegocio: 0,
            tipoNegocio: '',
            impresionRecibo: 1,
            encabezado: '',
            pie: '',
            tipoRecibo: 'Ticket',
            envioMensaje: 0,
            estatus: 1,
            usuario: currentUser?.usuario || 'admin'
          }
        });
        
      } else {
        showToastMessage(response.message || 'Error registrando negocio', 'error');
      }
    } catch (error) {
      console.error('❌ Error registrando negocio:', error);
      showToastMessage('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
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
          <h1>Registro Completo de Negocio</h1>
        </div>
      </div>

      {/* Formulario completo */}
      <form onSubmit={handleSubmit} className="formulario-negocio">
        
        {/* División 1: Formulario de Cliente */}
        <div className="form-section">
          <div className="form-card card">
            <h2>📋 Datos del Cliente</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cliente.nombre}
                  onChange={(e) => updateClienteData('nombre', e.target.value)}
                  placeholder="Nombre completo del cliente"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.cliente.telefono}
                  onChange={(e) => updateClienteData('telefono', e.target.value)}
                  placeholder="Número de teléfono"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.cliente.email}
                  onChange={(e) => updateClienteData('email', e.target.value)}
                  placeholder="Correo electrónico"
                  required
                />
              </div>
              
              {/* Campo Estado Cliente oculto - se mantiene como activo por defecto */}
              
              <div className="form-group form-group-full">
                <label className="form-label">Dirección del Cliente</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.cliente.direccion}
                  onChange={(e) => updateClienteData('direccion', e.target.value)}
                  placeholder="Dirección completa del cliente"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* División 2: Formulario de Negocio */}
        <div className="form-section">
          <div className="form-card card">
            <h2>🏢 Datos del Negocio</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre del Negocio</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.negocio.nombreNegocio}
                  onChange={(e) => updateNegocioData('nombreNegocio', e.target.value)}
                  placeholder="Nombre del negocio"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">RFC</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.negocio.rfc}
                  onChange={(e) => updateNegocioData('rfc', e.target.value)}
                  placeholder="RFC del negocio"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Teléfono del Negocio</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.negocio.telefono}
                  onChange={(e) => updateNegocioData('telefono', e.target.value)}
                  placeholder="Teléfono del negocio"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Estado del Negocio</label>
                <select
                  className="form-input"
                  value={formData.negocio.estatusCliente}
                  onChange={(e) => updateNegocioData('estatusCliente', Number(e.target.value))}
                  required
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
              
              <div className="form-group form-group-full">
                <label className="form-label">Dirección del Negocio</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.negocio.direccion}
                  onChange={(e) => updateNegocioData('direccion', e.target.value)}
                  placeholder="Dirección completa del negocio"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* División 3: Formulario de Parámetros */}
        <div className="form-section">
          <div className="form-card card">
            <h2>⚙️ Parámetros del Negocio</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tipo de Negocio</label>
                <select
                  className="form-input"
                  value={formData.parametros.tipoNegocio}
                  onChange={(e) => updateParametrosData('tipoNegocio', e.target.value)}
                  required
                >
                  <option value="">Selecciona tipo de negocio</option>
                  <option value="A granel">A granel</option>
                  <option value="Con Platillos">Con Platillos</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tipo de Recibo</label>
                <select
                  className="form-input"
                  value={formData.parametros.tipoRecibo}
                  onChange={(e) => updateParametrosData('tipoRecibo', e.target.value)}
                  required
                >
                  <option value="Ticket">Ticket</option>
                  <option value="Factura">Factura</option>
                  <option value="Nota">Nota</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Impresión de Recibo</label>
                <select
                  className="form-input"
                  value={formData.parametros.impresionRecibo}
                  onChange={(e) => updateParametrosData('impresionRecibo', Number(e.target.value))}
                  required
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Envío de Mensaje</label>
                <select
                  className="form-input"
                  value={formData.parametros.envioMensaje}
                  onChange={(e) => updateParametrosData('envioMensaje', Number(e.target.value))}
                  required
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>
              
              <div className="form-group form-group-full">
                <label className="form-label">Encabezado del Recibo</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.parametros.encabezado}
                  onChange={(e) => updateParametrosData('encabezado', e.target.value)}
                  placeholder="Texto que aparecerá en el encabezado del recibo"
                  required
                />
              </div>
              
              <div className="form-group form-group-full">
                <label className="form-label">Pie del Recibo</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.parametros.pie}
                  onChange={(e) => updateParametrosData('pie', e.target.value)}
                  placeholder="Texto que aparecerá en el pie del recibo"
                  required
                />
              </div>
              
              {/* Campo Estado de Parámetros oculto - se mantiene como activo por defecto */}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions-full">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrar Negocio Completo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioNegocio;
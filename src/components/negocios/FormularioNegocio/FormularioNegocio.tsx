import { useState, useEffect, useRef } from 'react';
import type { Negocio, ParametrosNegocio, NegocioCompleto } from '../../../types/negocio.types';
import { negociosService } from '../../../services/negociosService';
import './FormularioNegocio.css';
import { Store, Building2, Phone, FileText, Printer, MessageSquare, Check, X, Upload, Image as ImageIcon } from 'lucide-react';

interface FormularioNegocioProps {
  negocioEditar?: NegocioCompleto | null;
  onSubmit: (data: NegocioCompleto) => Promise<void>;
  onCancel: () => void;
}

export const FormularioNegocio = ({ negocioEditar, onSubmit, onCancel }: FormularioNegocioProps) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<NegocioCompleto>({
    negocio: {
      numeronegocio: '', // Se generará automáticamente
      nombreNegocio: '',
      rfcnegocio: '',
      direccionfiscalnegocio: '',
      contactonegocio: '',
      logotipo: null,
      telefonocontacto: '',
      estatusnegocio: 1,
    },
    parametros: {
      idNegocio: 0,
      telefonoNegocio: '',
      telefonoPedidos: '',
      ubicacion: '',
      tipoNegocio: 'Alimentos', // Valor por defecto actualizado
      impresionRecibo: 1,
      impresionTablero: 1,
      envioWhats: 1,
      encabezado: '',
      pie: '',
      impresionComanda: 1,
      envioMensaje: 1,
      estatus: 1,
    },
  });

  useEffect(() => {
    if (negocioEditar) {
      // Si estamos editando, el número ya existe
      setFormData({
        negocio: negocioEditar.negocio,
        parametros: negocioEditar.parametros || {
          idNegocio: negocioEditar.negocio.idNegocio || 0,
          telefonoNegocio: '',
          telefonoPedidos: '',
          ubicacion: '',
          tipoNegocio: 'Alimentos',
          impresionRecibo: 1,
          impresionTablero: 1,
          envioWhats: 1,
          encabezado: '',
          pie: '',
          impresionComanda: 1,
          envioMensaje: 1,
          estatus: 1,
        },
      });
      // Set image preview if exists
      if (negocioEditar.negocio.logotipo) {
        setImagePreview(negocioEditar.negocio.logotipo);
      }
    } else {
      // Si es nuevo, cargar el próximo número anticipado
      const cargarProximoNumero = async () => {
        try {
          const { proximoNumero } = await negociosService.obtenerProximoNumeroNegocio();
          setFormData(prev => ({
            ...prev,
            negocio: {
              ...prev.negocio,
              numeronegocio: proximoNumero,
            },
          }));
        } catch (error) {
          console.error('Error al cargar próximo número:', error);
          // Si hay error, mostrar mensaje genérico
          setFormData(prev => ({
            ...prev,
            negocio: {
              ...prev.negocio,
              numeronegocio: 'Se generará automáticamente',
            },
          }));
        }
      };
      
      cargarProximoNumero();
    }
  }, [negocioEditar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleNegocioChange = (field: keyof Negocio, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      negocio: {
        ...prev.negocio,
        [field]: value,
      },
    }));
  };

  const handleParametrosChange = (field: keyof ParametrosNegocio, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      parametros: {
        ...prev.parametros,
        [field]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          negocio: {
            ...prev.negocio,
            logotipo: base64String,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      negocio: {
        ...prev.negocio,
        logotipo: null,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-negocio">
      <div className="formulario-header">
        <h2 className="formulario-titulo">
          <Building2 size={28} />
          {negocioEditar ? 'Editar Negocio' : 'Nuevo Negocio'}
        </h2>
      </div>

      <div className="formulario-contenido">
        {/* Sección: Información General */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <Store size={20} />
            Información General
          </h3>

          <div className="formulario-grid">
            <div className="form-group">
              <label htmlFor="numeronegocio">Número de Negocio *</label>
              <input
                id="numeronegocio"
                type="text"
                value={formData.negocio.numeronegocio || 'Cargando...'}
                readOnly
                disabled
                placeholder="Se generará automáticamente"
                className="input-readonly"
              />
              <small className="form-hint">
                {negocioEditar 
                  ? 'El número de negocio no puede modificarse'
                  : 'Número anticipado - Se confirmará al guardar'
                }
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="nombreNegocio">Nombre del Negocio *</label>
              <input
                id="nombreNegocio"
                type="text"
                value={formData.negocio.nombreNegocio}
                onChange={(e) => handleNegocioChange('nombreNegocio', e.target.value)}
                required
                placeholder="Ej: Restaurante Crumen"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rfcnegocio">RFC *</label>
              <input
                id="rfcnegocio"
                type="text"
                value={formData.negocio.rfcnegocio}
                onChange={(e) => handleNegocioChange('rfcnegocio', e.target.value)}
                required
                maxLength={13}
                placeholder="Ej: XAXX010101000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoNegocio">Tipo de Negocio *</label>
              <select
                id="tipoNegocio"
                value={formData.parametros.tipoNegocio}
                onChange={(e) => handleParametrosChange('tipoNegocio', e.target.value)}
                required
              >
                <option value="Alimentos">Alimentos</option>
                <option value="Abarrotes">Abarrotes</option>
                <option value="Granel">Granel</option>
                <option value="Novedades">Novedades</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="direccionfiscalnegocio">Dirección Fiscal *</label>
              <textarea
                id="direccionfiscalnegocio"
                value={formData.negocio.direccionfiscalnegocio}
                onChange={(e) => handleNegocioChange('direccionfiscalnegocio', e.target.value)}
                required
                rows={3}
                placeholder="Calle, número, colonia, ciudad, estado, CP"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="ubicacion">Ubicación (Mapa/Coordenadas)</label>
              <input
                id="ubicacion"
                type="text"
                value={formData.parametros.ubicacion}
                onChange={(e) => handleParametrosChange('ubicacion', e.target.value)}
                placeholder="Ej: https://maps.google.com/..."
              />
            </div>
          </div>
        </div>

        {/* Sección: Logotipo */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <ImageIcon size={20} />
            Logotipo del Negocio
          </h3>

          <div className="formulario-grid">
            <div className="form-group full-width">
              <label htmlFor="logotipo">Imagen del Logotipo</label>
              <div className="image-upload-container">
                <input
                  ref={fileInputRef}
                  id="logotipo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Vista previa del logotipo" className="image-preview" />
                    <div className="image-actions">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-change-image"
                      >
                        <Upload size={16} />
                        Cambiar Imagen
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn-remove-image"
                      >
                        <X size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={40} />
                    <p>Haz clic para seleccionar una imagen</p>
                    <small>Formatos: JPG, PNG, GIF (máx. 2MB)</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Contacto */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <Phone size={20} />
            Información de Contacto
          </h3>

          <div className="formulario-grid">
            <div className="form-group">
              <label htmlFor="contactonegocio">Persona de Contacto *</label>
              <input
                id="contactonegocio"
                type="text"
                value={formData.negocio.contactonegocio}
                onChange={(e) => handleNegocioChange('contactonegocio', e.target.value)}
                required
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonocontacto">Teléfono de Contacto *</label>
              <input
                id="telefonocontacto"
                type="tel"
                value={formData.negocio.telefonocontacto}
                onChange={(e) => handleNegocioChange('telefonocontacto', e.target.value)}
                required
                placeholder="Ej: 5512345678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoNegocio">Teléfono del Negocio</label>
              <input
                id="telefonoNegocio"
                type="tel"
                value={formData.parametros.telefonoNegocio}
                onChange={(e) => handleParametrosChange('telefonoNegocio', e.target.value)}
                placeholder="Ej: 5512345678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoPedidos">Teléfono para Pedidos</label>
              <input
                id="telefonoPedidos"
                type="tel"
                value={formData.parametros.telefonoPedidos}
                onChange={(e) => handleParametrosChange('telefonoPedidos', e.target.value)}
                placeholder="Ej: 5512345678"
              />
            </div>
          </div>
        </div>

        {/* Sección: Configuración de Impresión */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <Printer size={20} />
            Configuración de Impresión
          </h3>

          <div className="formulario-grid">
            <div className="form-group full-width">
              <label htmlFor="encabezado">Encabezado de Recibo</label>
              <textarea
                id="encabezado"
                value={formData.parametros.encabezado}
                onChange={(e) => handleParametrosChange('encabezado', e.target.value)}
                rows={3}
                placeholder="Texto que aparecerá al inicio del recibo"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="pie">Pie de Recibo</label>
              <textarea
                id="pie"
                value={formData.parametros.pie}
                onChange={(e) => handleParametrosChange('pie', e.target.value)}
                rows={3}
                placeholder="Texto que aparecerá al final del recibo (Ej: ¡Gracias por su compra!)"
              />
            </div>

            <div className="form-group-checkbox">
              <input
                id="impresionRecibo"
                type="checkbox"
                checked={formData.parametros.impresionRecibo === 1}
                onChange={(e) => handleParametrosChange('impresionRecibo', e.target.checked ? 1 : 0)}
              />
              <label htmlFor="impresionRecibo">
                <Check size={16} />
                Impresión de Recibo
              </label>
            </div>

            <div className="form-group-checkbox">
              <input
                id="impresionTablero"
                type="checkbox"
                checked={formData.parametros.impresionTablero === 1}
                onChange={(e) => handleParametrosChange('impresionTablero', e.target.checked ? 1 : 0)}
              />
              <label htmlFor="impresionTablero">
                <Check size={16} />
                Impresión en Tablero
              </label>
            </div>

            <div className="form-group-checkbox">
              <input
                id="impresionComanda"
                type="checkbox"
                checked={formData.parametros.impresionComanda === 1}
                onChange={(e) => handleParametrosChange('impresionComanda', e.target.checked ? 1 : 0)}
              />
              <label htmlFor="impresionComanda">
                <Check size={16} />
                Impresión de Comanda
              </label>
            </div>
          </div>
        </div>

        {/* Sección: Notificaciones */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <MessageSquare size={20} />
            Configuración de Notificaciones
          </h3>

          <div className="formulario-grid">
            <div className="form-group-checkbox">
              <input
                id="envioWhats"
                type="checkbox"
                checked={formData.parametros.envioWhats === 1}
                onChange={(e) => handleParametrosChange('envioWhats', e.target.checked ? 1 : 0)}
              />
              <label htmlFor="envioWhats">
                <Check size={16} />
                Envío por WhatsApp
              </label>
            </div>

            <div className="form-group-checkbox">
              <input
                id="envioMensaje"
                type="checkbox"
                checked={formData.parametros.envioMensaje === 1}
                onChange={(e) => handleParametrosChange('envioMensaje', e.target.checked ? 1 : 0)}
              />
              <label htmlFor="envioMensaje">
                <Check size={16} />
                Envío de Mensajes
              </label>
            </div>
          </div>
        </div>

        {/* Sección: Estado */}
        <div className="formulario-seccion">
          <h3 className="seccion-titulo">
            <FileText size={20} />
            Estado
          </h3>

          <div className="formulario-grid">
            <div className="form-group">
              <label htmlFor="estatusnegocio">Estado del Negocio</label>
              <select
                id="estatusnegocio"
                value={formData.negocio.estatusnegocio}
                onChange={(e) => handleNegocioChange('estatusnegocio', parseInt(e.target.value))}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="formulario-acciones">
        <button type="button" onClick={onCancel} className="btn-cancelar" disabled={loading}>
          <X size={20} />
          Cancelar
        </button>
        <button type="submit" className="btn-guardar" disabled={loading}>
          <Check size={20} />
          {loading ? 'Guardando...' : negocioEditar ? 'Actualizar' : 'Crear Negocio'}
        </button>
      </div>
    </form>
  );
};

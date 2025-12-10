import React, { useState, useMemo } from 'react';
import type { Cliente, ClienteCreate, CategoriaCliente, EstatusSeguimiento, MedioContacto } from '../../../types/cliente.types';
import { Save, X, User } from 'lucide-react';
import './FormularioCliente.css';

interface Props {
  clienteEditar: Cliente | null;
  onSubmit: (data: ClienteCreate) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const FormularioCliente: React.FC<Props> = ({ clienteEditar, onSubmit, onCancel, loading }) => {
  const datosIniciales = useMemo(() => {
    if (clienteEditar) {
      return {
        nombre: clienteEditar.nombre,
        referencia: clienteEditar.referencia || '',
        cumple: clienteEditar.cumple ? new Date(clienteEditar.cumple).toISOString().split('T')[0] : '',
        categoriacliente: clienteEditar.categoriacliente,
        satisfaccion: clienteEditar.satisfaccion || 0,
        comentarios: clienteEditar.comentarios || '',
        puntosfidelidad: clienteEditar.puntosfidelidad || 0,
        estatus_seguimiento: clienteEditar.estatus_seguimiento,
        responsable_seguimiento: clienteEditar.responsable_seguimiento || '',
        medio_contacto: clienteEditar.medio_contacto,
        observacionesseguimiento: clienteEditar.observacionesseguimiento || '',
        fechaultimoseguimiento: clienteEditar.fechaultimoseguimiento 
          ? new Date(clienteEditar.fechaultimoseguimiento).toISOString().split('T')[0] 
          : '',
        telefono: clienteEditar.telefono || '',
        email: clienteEditar.email || '',
        direccion: clienteEditar.direccion || '',
        estatus: clienteEditar.estatus,
        usuarioauditoria: clienteEditar.usuarioauditoria || ''
      };
    }
    return {
      nombre: '',
      referencia: '',
      cumple: '',
      categoriacliente: 'NUEVO' as CategoriaCliente,
      satisfaccion: 0,
      comentarios: '',
      puntosfidelidad: 0,
      estatus_seguimiento: 'NINGUNO' as EstatusSeguimiento,
      responsable_seguimiento: '',
      medio_contacto: 'WHATSAPP' as MedioContacto,
      observacionesseguimiento: '',
      fechaultimoseguimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      estatus: 1,
      usuarioauditoria: localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')!).alias 
        : ''
    };
  }, [clienteEditar]);

  const [formData, setFormData] = useState(datosIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let valorFinal: string | number = value;
    
    if (type === 'number') {
      valorFinal = value === '' ? 0 : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));

    if (errores[name]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (formData.satisfaccion && (formData.satisfaccion < 0 || formData.satisfaccion > 5)) {
      nuevosErrores.satisfaccion = 'La satisfacción debe estar entre 0 y 5';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en formulario:', error);
    }
  };

  return (
    <div className="formulario-cliente-container">
      <div className="formulario-header">
        <div className="header-icon">
          <User size={28} />
        </div>
        <div>
          <h2>{clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <p>Complete los datos del cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="formulario-cliente">
        <div className="form-scroll-container">
          {/* Información Básica */}
          <div className="form-section">
            <h3 className="section-title">Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errores.nombre ? 'error' : ''}
                  placeholder="Ej: Juan Pérez García"
                  maxLength={150}
                />
                {errores.nombre && <span className="error-message">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="referencia">Referencia</label>
                <input
                  type="text"
                  id="referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  placeholder="Ej: Referido por María"
                  maxLength={150}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cumple">Fecha de Cumpleaños</label>
                <input
                  type="date"
                  id="cumple"
                  name="cumple"
                  value={formData.cumple}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoriacliente">Categoría</label>
                <select
                  id="categoriacliente"
                  name="categoriacliente"
                  value={formData.categoriacliente}
                  onChange={handleChange}
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="RECURRENTE">Recurrente</option>
                  <option value="FRECUENTE">Frecuente</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="satisfaccion">
                  Satisfacción (0-5)
                </label>
                <input
                  type="number"
                  id="satisfaccion"
                  name="satisfaccion"
                  value={formData.satisfaccion}
                  onChange={handleChange}
                  className={errores.satisfaccion ? 'error' : ''}
                  min="0"
                  max="5"
                  step="1"
                />
                {errores.satisfaccion && <span className="error-message">{errores.satisfaccion}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="puntosfidelidad">Puntos de Fidelidad</label>
                <input
                  type="number"
                  id="puntosfidelidad"
                  name="puntosfidelidad"
                  value={formData.puntosfidelidad}
                  onChange={handleChange}
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="form-section">
            <h3 className="section-title">Información de Contacto</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 5512345678"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errores.email ? 'error' : ''}
                  placeholder="cliente@ejemplo.com"
                  maxLength={150}
                />
                {errores.email && <span className="error-message">{errores.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa del cliente"
                rows={2}
              />
            </div>
          </div>

          {/* Seguimiento */}
          <div className="form-section">
            <h3 className="section-title">Seguimiento y CRM</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estatus_seguimiento">Estatus de Seguimiento</label>
                <select
                  id="estatus_seguimiento"
                  name="estatus_seguimiento"
                  value={formData.estatus_seguimiento}
                  onChange={handleChange}
                >
                  <option value="NINGUNO">Ninguno</option>
                  <option value="EN_PROSPECCIÓN">En Prospección</option>
                  <option value="EN_NEGOCIACIÓN">En Negociación</option>
                  <option value="CERRADO">Cerrado</option>
                  <option value="PERDIDO">Perdido</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="responsable_seguimiento">Responsable</label>
                <input
                  type="text"
                  id="responsable_seguimiento"
                  name="responsable_seguimiento"
                  value={formData.responsable_seguimiento}
                  onChange={handleChange}
                  placeholder="Nombre del responsable"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="medio_contacto">Medio de Contacto Preferido</label>
                <select
                  id="medio_contacto"
                  name="medio_contacto"
                  value={formData.medio_contacto}
                  onChange={handleChange}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="LLAMADA">Llamada</option>
                  <option value="EMAIL">Email</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaultimoseguimiento">Último Seguimiento</label>
                <input
                  type="date"
                  id="fechaultimoseguimiento"
                  name="fechaultimoseguimiento"
                  value={formData.fechaultimoseguimiento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacionesseguimiento">Observaciones de Seguimiento</label>
              <textarea
                id="observacionesseguimiento"
                name="observacionesseguimiento"
                value={formData.observacionesseguimiento}
                onChange={handleChange}
                placeholder="Notas sobre el seguimiento del cliente"
                rows={3}
              />
            </div>
          </div>

          {/* Comentarios y Estado */}
          <div className="form-section">
            <h3 className="section-title">Comentarios y Estado</h3>
            
            <div className="form-group">
              <label htmlFor="comentarios">Comentarios</label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                placeholder="Comentarios generales sobre el cliente"
                rows={3}
              />
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="estatus"
                name="estatus"
                checked={formData.estatus === 1}
                onChange={(e) => setFormData(prev => ({ ...prev, estatus: e.target.checked ? 1 : 0 }))}
              />
              <label htmlFor="estatus">Cliente Activo</label>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancelar"
            disabled={loading}
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : clienteEditar ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCliente;

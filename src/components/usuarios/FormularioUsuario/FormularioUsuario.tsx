import React, { useState, useEffect, useMemo } from 'react';
import { User, Phone, Calendar, MessageSquare, Building2, Shield, TrendingUp, Users, Image } from 'lucide-react';
import type { Usuario, UsuarioFormData } from '../../../types/usuario.types';
import type { Negocio } from '../../../types/negocio.types';
import type { Rol } from '../../../types/rol.types';
import { negociosService } from '../../../services/negociosService';
import { rolesService } from '../../../services/rolesService';
import CargaImagen from './CargaImagen';
import './FormularioUsuario.css';

interface FormularioUsuarioProps {
  usuarioEditar?: Usuario | null;
  onSubmit: (usuario: UsuarioFormData) => void;
  onCancelar: () => void;
  loading?: boolean;
}

export const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({
  usuarioEditar,
  onSubmit,
  onCancelar,
  loading = false
}) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(true);

  // Obtener información del usuario autenticado
  const usuarioAutenticado = useMemo(() => {
    try {
      const usuarioStorage = localStorage.getItem('usuario');
      return usuarioStorage ? JSON.parse(usuarioStorage) : null;
    } catch (error) {
      console.error('Error al obtener usuario autenticado:', error);
      return null;
    }
  }, []);

  // Determinar si el usuario es superusuario
  const esSuperUsuario = useMemo(() => {
    return usuarioAutenticado?.idNegocio === 99999;
  }, [usuarioAutenticado]);

  const initialFormData = useMemo(() => {
    // Si estamos editando, usar los datos del usuario a editar
    // Si estamos creando, usar el idNegocio del usuario autenticado
    const idNegocioInicial = usuarioEditar?.idNegocio ?? usuarioAutenticado?.idNegocio;
    
    return {
      nombre: usuarioEditar?.nombre || '',
      alias: usuarioEditar?.alias || '',
      password: '', // No mostrar password por seguridad
      telefono: usuarioEditar?.telefono || '',
      cumple: usuarioEditar?.cumple || '',
      frasepersonal: usuarioEditar?.frasepersonal || '',
      idNegocio: idNegocioInicial,
      idRol: usuarioEditar?.idRol,
      desempeno: usuarioEditar?.desempeno || 0,
      popularidad: usuarioEditar?.popularidad || 0,
      estatus: usuarioEditar?.estatus || 1,
      usuarioauditoria: usuarioEditar?.usuarioauditoria || '',
      fotoine: usuarioEditar?.fotoine || undefined,
      fotopersona: usuarioEditar?.fotopersona || undefined,
      fotoavatar: usuarioEditar?.fotoavatar || undefined
    };
  }, [usuarioEditar, usuarioAutenticado]);

  const [formData, setFormData] = useState<UsuarioFormData>(initialFormData);

  // Cargar negocios y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [negociosData, rolesData] = await Promise.all([
          negociosService.obtenerNegocios(),
          rolesService.obtenerRoles()
        ]);
        setNegocios(negociosData);
        setRoles(rolesData.filter(rol => rol.estatus === 1)); // Solo roles activos
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener usuario de auditoría
    const usuarioStorage = localStorage.getItem('usuario');
    const usuarioAudit = usuarioStorage ? JSON.parse(usuarioStorage).alias : 'sistema';

    // Preparar datos para enviar
    const datosEnviar: UsuarioFormData = {
      ...formData,
      usuarioauditoria: usuarioAudit
    };

    // Si el password está vacío, no lo enviamos (solo en edición)
    if (usuarioEditar && !datosEnviar.password) {
      delete datosEnviar.password;
    }

    onSubmit(datosEnviar);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idNegocio' || name === 'idRol' || name === 'desempeno' || name === 'popularidad'
        ? value === '' ? undefined : Number(value)
        : name === 'estatus'
        ? Number(value)
        : value
    }));
  };

  const handleImagenChange = (imagen: string | null, tipo: string) => {
    setFormData(prev => ({
      ...prev,
      [tipo]: imagen || undefined
    }));
  };

  return (
    <div className="formulario-usuario-container">
      <form onSubmit={handleSubmit} className="formulario-usuario">
        <div className="formulario-usuario-header">
          <User className="header-icon" size={28} />
          <h2>{usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        </div>

        {/* Sección: Información Personal */}
        <div className="form-section">
          <div className="section-header">
            <User size={20} />
            <h3>Información Personal</h3>
          </div>
          
          <div className="form-grid">
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
                maxLength={150}
                required
                placeholder="Ingrese el nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="alias">
                Alias/Usuario <span className="required">*</span>
              </label>
              <input
                type="text"
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Nombre de usuario único"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                {usuarioEditar ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'} 
                {!usuarioEditar && <span className="required">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength={255}
                required={!usuarioEditar}
                placeholder="Ingrese la contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                <Phone size={16} className="inline-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                maxLength={150}
                placeholder="Número de teléfono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cumple">
                <Calendar size={16} className="inline-icon" />
                Fecha de Cumpleaños
              </label>
              <input
                type="date"
                id="cumple"
                name="cumple"
                value={formData.cumple}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="estatus">
                Estatus <span className="required">*</span>
              </label>
              <select
                id="estatus"
                name="estatus"
                value={formData.estatus}
                onChange={handleChange}
                required
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="frasepersonal">
              <MessageSquare size={16} className="inline-icon" />
              Frase Personal
            </label>
            <textarea
              id="frasepersonal"
              name="frasepersonal"
              value={formData.frasepersonal}
              onChange={handleChange}
              rows={3}
              placeholder="Una frase o lema personal..."
            />
          </div>
        </div>

        {/* Sección: Asignaciones */}
        <div className="form-section">
          <div className="section-header">
            <Building2 size={20} />
            <h3>Asignaciones</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="idNegocio">
                <Building2 size={16} className="inline-icon" />
                Negocio *
              </label>
              <select
                id="idNegocio"
                name="idNegocio"
                value={formData.idNegocio || ''}
                onChange={handleChange}
                required
                disabled={cargando || loading || !esSuperUsuario}
              >
                <option value="">Seleccione un negocio</option>
                {negocios.map((negocio) => (
                  <option key={negocio.idNegocio} value={negocio.idNegocio}>
                    {negocio.nombreNegocio}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                {esSuperUsuario 
                  ? 'Asignar usuario a un negocio específico' 
                  : 'Los usuarios solo pueden crear usuarios en su propio negocio'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="idRol">
                <Shield size={16} className="inline-icon" />
                Rol *
              </label>
              <select
                id="idRol"
                name="idRol"
                value={formData.idRol || ''}
                onChange={handleChange}
                required
                disabled={cargando || loading}
              >
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.nombreRol} - Nivel {rol.privilegio}
                  </option>
                ))}
              </select>
              <small className="form-hint">Definir el rol del usuario en el sistema</small>
            </div>
          </div>
        </div>

        {/* Sección: Imágenes */}
        <div className="form-section">
          <div className="section-header">
            <Image size={20} />
            <h3>Documentos e Imágenes</h3>
          </div>
          
          <div className="form-grid form-grid-imagenes">
            <CargaImagen
              label="INE / Identificación"
              tipoImagen="fotoine"
              imagenActual={
                usuarioEditar?.fotoine 
                  ? `data:image/jpeg;base64,${usuarioEditar.fotoine}` 
                  : null
              }
              onImagenSeleccionada={handleImagenChange}
              descripcion="Cargar imagen de identificación oficial"
            />

            <CargaImagen
              label="Foto Personal"
              tipoImagen="fotopersona"
              imagenActual={
                usuarioEditar?.fotopersona 
                  ? `data:image/jpeg;base64,${usuarioEditar.fotopersona}` 
                  : null
              }
              onImagenSeleccionada={handleImagenChange}
              descripcion="Fotografía personal del usuario"
            />

            <CargaImagen
              label="Avatar"
              tipoImagen="fotoavatar"
              imagenActual={
                usuarioEditar?.fotoavatar 
                  ? `data:image/jpeg;base64,${usuarioEditar.fotoavatar}` 
                  : null
              }
              onImagenSeleccionada={handleImagenChange}
              descripcion="Avatar o foto de perfil"
            />
          </div>
        </div>

        {/* Sección: Métricas de Desempeño */}
        <div className="form-section">
          <div className="section-header">
            <TrendingUp size={20} />
            <h3>Métricas de Desempeño</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="desempeno">
                <TrendingUp size={16} className="inline-icon" />
                Desempeño (0.00 - 99.99)
              </label>
              <input
                type="number"
                id="desempeno"
                name="desempeno"
                value={formData.desempeno}
                onChange={handleChange}
                min={0}
                max={99.99}
                step={0.01}
                placeholder="0.00"
              />
              <small className="form-hint">Calificación de desempeño del usuario</small>
            </div>

            <div className="form-group">
              <label htmlFor="popularidad">
                <Users size={16} className="inline-icon" />
                Popularidad (0.00 - 99.99)
              </label>
              <input
                type="number"
                id="popularidad"
                name="popularidad"
                value={formData.popularidad}
                onChange={handleChange}
                min={0}
                max={99.99}
                step={0.01}
                placeholder="0.00"
              />
              <small className="form-hint">Índice de popularidad entre usuarios</small>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancelar} 
            className="btn-cancelar"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (usuarioEditar ? 'Actualizar' : 'Crear Usuario')}
          </button>
        </div>
      </form>
    </div>
  );
};

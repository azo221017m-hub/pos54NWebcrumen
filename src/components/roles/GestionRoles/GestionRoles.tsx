import { useState, useEffect, useCallback } from 'react';
import { rolesService } from '../../../services/rolesService';
import type { Rol } from '../../../types/rol.types';
import { ListaRoles } from '../ListaRoles/ListaRoles';
import { FormularioRol } from '../FormularioRol/FormularioRol';
import './GestionRoles.css';
import { Plus, ArrowLeft } from 'lucide-react';

interface GestionRolesProps {
  onVistaChange?: (vista: 'lista' | 'formulario') => void;
}

export const GestionRoles = ({ onVistaChange }: GestionRolesProps = {}) => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario'>('lista');
  const [rolEditar, setRolEditar] = useState<Rol | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const cargarRoles = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando roles...');
      const data = await rolesService.obtenerRoles();
      console.log('✅ Roles cargados:', data);
      console.log('📊 Total de roles:', data.length);
      setRoles(data);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      mostrarMensaje('error', 'Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRoles();
  }, [cargarRoles]);

  // Notificar al padre cuando cambia la vista
  useEffect(() => {
    onVistaChange?.(vistaActual);
  }, [vistaActual, onVistaChange]);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleNuevoRol = () => {
    setRolEditar(null);
    setVistaActual('formulario');
  };

  const handleEditarRol = async (rol: Rol) => {
    try {
      if (!rol.idRol) return;
      
      setLoading(true);
      const rolCompleto = await rolesService.obtenerRolPorId(rol.idRol);
      setRolEditar(rolCompleto);
      setVistaActual('formulario');
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar el rol');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarRol = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      return;
    }

    try {
      await rolesService.eliminarRol(id);
      mostrarMensaje('success', 'Rol eliminado exitosamente');
      await cargarRoles();
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar el rol');
      console.error('Error:', error);
    }
  };

  const handleSubmitFormulario = async (data: Rol) => {
    try {
      // Validar nombre único
      const nombreDisponible = await rolesService.validarNombreUnico(
        data.nombreRol,
        rolEditar?.idRol
      );

      if (!nombreDisponible) {
        mostrarMensaje('error', 'Ya existe un rol con ese nombre');
        return;
      }

      // Obtener usuario de localStorage
      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      
      // Preparar datos limpios para enviar (sin campos de auditoría ni id en el body)
      const datosRol: Partial<Rol> = {
        nombreRol: data.nombreRol,
        descripcion: data.descripcion,
        privilegio: data.privilegio,
        estatus: data.estatus,
        usuarioauditoria: usuario?.alias || 'sistema',
      };

      console.log('💾 Guardando rol:', { 
        esEdicion: !!rolEditar?.idRol, 
        idRol: rolEditar?.idRol,
        datos: datosRol 
      });

      if (rolEditar?.idRol) {
        // Actualizar
        await rolesService.actualizarRol(rolEditar.idRol, datosRol as Rol);
        mostrarMensaje('success', 'Rol actualizado exitosamente');
      } else {
        // Crear
        await rolesService.crearRol(datosRol as Rol);
        mostrarMensaje('success', 'Rol creado exitosamente');
      }

      await cargarRoles();
      setVistaActual('lista');
      setRolEditar(null);
    } catch (error) {
      if (error instanceof Error) {
        mostrarMensaje('error', error.message);
      } else {
        mostrarMensaje('error', 'Error al guardar el rol');
      }
      console.error('Error:', error);
    }
  };

  const handleCancelar = () => {
    setVistaActual('lista');
    setRolEditar(null);
  };

  return (
    <div className="gestion-roles">
      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Vista Lista */}
      {vistaActual === 'lista' && (
        <>
          <div className="gestion-header">
            <div className="header-info">
              <h2>Gestión de Roles de Usuarios</h2>
              <div className="contadores-roles">
                <div className="contador-item">
                  <span className="contador-label">Total:</span>
                  <strong className="contador-valor total">{roles.length}</strong>
                </div>
                <div className="contador-item">
                  <span className="contador-label">Activos:</span>
                  <strong className="contador-valor activos">
                    {roles.filter(r => r.estatus === 1).length}
                  </strong>
                </div>
                <div className="contador-item">
                  <span className="contador-label">Inactivos:</span>
                  <strong className="contador-valor inactivos">
                    {roles.filter(r => r.estatus === 0).length}
                  </strong>
                </div>
              </div>
            </div>
            <button className="btn-nuevo" onClick={handleNuevoRol}>
              <Plus size={20} />
              Nuevo Rol
            </button>
          </div>

          <ListaRoles
            roles={roles}
            onEditar={handleEditarRol}
            onEliminar={handleEliminarRol}
            loading={loading}
          />
        </>
      )}

      {/* Vista Formulario */}
      {vistaActual === 'formulario' && (
        <>
          <div className="gestion-header">
            <button className="btn-volver" onClick={handleCancelar}>
              <ArrowLeft size={20} />
              Volver a la lista
            </button>
          </div>

          <FormularioRol
            rolEditar={rolEditar}
            rolesExistentes={roles}
            onSubmit={handleSubmitFormulario}
            onCancel={handleCancelar}
          />
        </>
      )}
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserCog } from 'lucide-react';
import { rolesService } from '../../services/rolesService';
import type { Rol } from '../../types/rol.types';
import { ListaRoles } from '../../components/roles/ListaRoles/ListaRoles';
import { FormularioRol } from '../../components/roles/FormularioRol/FormularioRol';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigRolUsuarios.css';

export const ConfigRolUsuarios = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleNuevoRol = () => {
    setRolEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarRol = async (rol: Rol) => {
    try {
      if (!rol.idRol) return;
      
      setLoading(true);
      const rolCompleto = await rolesService.obtenerRolPorId(rol.idRol);
      setRolEditar(rolCompleto);
      setMostrarFormulario(true);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar el rol');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFormulario = async (data: Rol) => {
    try {
      const nombreDisponible = await rolesService.validarNombreUnico(
        data.nombreRol,
        rolEditar?.idRol
      );

      if (!nombreDisponible) {
        mostrarMensaje('error', 'Ya existe un rol con ese nombre');
        return;
      }

      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      
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
        const rolActualizado = await rolesService.actualizarRol(rolEditar.idRol, datosRol as Rol);
        mostrarMensaje('success', 'Rol actualizado exitosamente');
        setRoles(prev =>
          prev.map(r =>
            r.idRol === rolActualizado.idRol ? rolActualizado : r
          )
        );
      } else {
        const nuevoRol = await rolesService.crearRol(datosRol as Rol);
        mostrarMensaje('success', 'Rol creado exitosamente');
        setRoles(prev => [...prev, nuevoRol]);
      }

      setMostrarFormulario(false);
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
    setMostrarFormulario(false);
    setRolEditar(null);
  };

  return (
    <div className="config-roles-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
          <div className="mensaje-contenido">
            <span className="mensaje-texto">{mensaje.texto}</span>
            <button
              className="mensaje-cerrar"
              onClick={() => setMensaje(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header con botones */}
      <div className="config-header">
        <button className="btn-volver" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <UserCog size={32} className="config-icon" />
            <div>
              <h1>Gestión de Roles de Usuarios</h1>
              <p>
                Total: {roles.length} | 
                Activos: {roles.filter(r => r.estatus === 1).length} | 
                Inactivos: {roles.filter(r => r.estatus === 0).length}
              </p>
            </div>
          </div>
          <button onClick={handleNuevoRol} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {loading ? (
          <LoadingSpinner size={48} message="Cargando roles..." />
        ) : (
          <ListaRoles
            roles={roles}
            onEditar={handleEditarRol}
            loading={loading}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioRol
          rolEditar={rolEditar}
          rolesExistentes={roles}
          onSubmit={handleSubmitFormulario}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigRolUsuarios;

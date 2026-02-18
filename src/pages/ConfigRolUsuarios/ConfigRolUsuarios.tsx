import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, Edit } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import { rolesService } from '../../services/rolesService';
import type { Rol } from '../../types/rol.types';
import { FormularioRol } from '../../components/roles/FormularioRol/FormularioRol';
import './ConfigRolUsuarios.css';

export const ConfigRolUsuarios = () => {
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

  const obtenerInfoNivel = (privilegio: string) => {
    const nivel = parseInt(privilegio) || 1;
    const colores = ['#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'];
    const niveles = ['Básico', 'Limitado', 'Intermedio', 'Avanzado', 'Total'];
    return {
      color: colores[nivel - 1] || colores[0],
      texto: niveles[nivel - 1] || niveles[0]
    };
  };

  return (
    <>
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Roles de Usuarios"
        headerSubtitle={`Total: ${roles.length} | Activos: ${roles.filter(r => r.estatus === 1).length} | Inactivos: ${roles.filter(r => r.estatus === 0).length}`}
        actionButton={{
          text: 'Nuevo Rol',
          icon: <Plus size={20} />,
          onClick: handleNuevoRol
        }}
        loading={loading}
        loadingMessage="Cargando roles..."
        isEmpty={roles.length === 0}
        emptyIcon={<Shield size={64} />}
        emptyMessage="No hay roles registrados."
      >
        <div className="standard-cards-grid">
          {roles.map((rol) => {
            const infoNivel = obtenerInfoNivel(rol.privilegio);
            
            return (
              <StandardCard
                key={rol.idRol}
                title={rol.nombreRol}
                fields={[
                  {
                    label: 'Descripción',
                    value: rol.descripcion || 'Sin descripción'
                  },
                  {
                    label: 'Nivel de Privilegio',
                    value: (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: infoNivel.color,
                        fontWeight: 600
                      }}>
                        <Shield size={14} />
                        Nivel {rol.privilegio} - {infoNivel.texto}
                      </span>
                    )
                  },
                  {
                    label: 'Estado',
                    value: (
                      <span style={{
                        color: rol.estatus === 1 ? '#10b981' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {rol.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    )
                  },
                  {
                    label: 'Usuario Auditoría',
                    value: rol.usuarioauditoria || 'N/A'
                  }
                ]}
                actions={[
                  {
                    label: 'Editar',
                    icon: <Edit size={16} />,
                    onClick: () => handleEditarRol(rol),
                    variant: 'edit'
                  }
                ]}
              />
            );
          })}
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
      </StandardPageLayout>
    </>
  );
};

export default ConfigRolUsuarios;

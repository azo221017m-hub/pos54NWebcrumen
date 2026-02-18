import { useState, useEffect, useCallback } from 'react';
import { Plus, Store, Edit, Trash2, Building2, Phone, MapPin } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import { negociosService } from '../../services/negociosService';
import type { Negocio, NegocioCompleto } from '../../types/negocio.types';
import { FormularioNegocio } from '../../components/negocios/FormularioNegocio/FormularioNegocio';
import '../../styles/StandardPageLayout.css';

export const ConfigNegocios = () => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [negocioEditar, setNegocioEditar] = useState<NegocioCompleto | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const cargarNegocios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando negocios...');
      const data = await negociosService.obtenerNegocios();
      console.log('✅ Negocios cargados:', data);
      console.log('📊 Total de negocios:', data.length);
      setNegocios(data);
    } catch (error) {
      console.error('❌ Error al cargar negocios:', error);
      mostrarMensaje('error', 'Error al cargar los negocios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarNegocios();
  }, [cargarNegocios]);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleNuevoNegocio = () => {
    setNegocioEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarNegocio = async (negocio: Negocio) => {
    try {
      if (!negocio.idNegocio) return;
      
      setLoading(true);
      const negocioCompleto = await negociosService.obtenerNegocioPorId(negocio.idNegocio);
      setNegocioEditar(negocioCompleto);
      setMostrarFormulario(true);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar el negocio');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarNegocio = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este negocio?')) {
      return;
    }

    try {
      const idEliminado = await negociosService.eliminarNegocio(id);
      mostrarMensaje('success', 'Negocio eliminado exitosamente');
      setNegocios(prev => prev.filter(n => n.idNegocio !== idEliminado));
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar el negocio');
      console.error('Error:', error);
    }
  };

  const handleSubmitFormulario = async (data: NegocioCompleto) => {
    try {
      const nombreDisponible = await negociosService.validarNombreUnico(
        data.negocio.nombreNegocio,
        negocioEditar?.negocio.idNegocio
      );

      if (!nombreDisponible) {
        mostrarMensaje('error', 'Ya existe un negocio con ese nombre');
        return;
      }

      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      
      data.negocio.usuarioauditoria = usuario?.alias || 'sistema';
      data.parametros.usuarioAuditoria = usuario?.alias || 'sistema';

      if (negocioEditar?.negocio.idNegocio) {
        const negocioActualizado = await negociosService.actualizarNegocio(negocioEditar.negocio.idNegocio, data);
        mostrarMensaje('success', 'Negocio actualizado exitosamente');
        setNegocios(prev =>
          prev.map(n =>
            n.idNegocio === negocioActualizado.idNegocio ? negocioActualizado : n
          )
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { numeronegocio, ...negocioSinNumero } = data.negocio;
        const dataNuevo = { ...data, negocio: negocioSinNumero };
        const nuevoNegocio = await negociosService.crearNegocio(dataNuevo);
        mostrarMensaje('success', 'Negocio creado exitosamente');
        setNegocios(prev => [...prev, nuevoNegocio]);
      }

      setMostrarFormulario(false);
      setNegocioEditar(null);
    } catch (error) {
      if (error instanceof Error) {
        mostrarMensaje('error', error.message);
      } else {
        mostrarMensaje('error', 'Error al guardar el negocio');
      }
      console.error('Error:', error);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setNegocioEditar(null);
  };

  const getSubtitle = () => {
    const total = negocios.length;
    const activos = negocios.filter(n => n.estatusnegocio === 1).length;
    const inactivos = negocios.filter(n => n.estatusnegocio === 0).length;
    return `Total: ${total} | Activos: ${activos} | Inactivos: ${inactivos}`;
  };

  return (
    <>
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
          <p>{mensaje.texto}</p>
          <button onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Negocios"
        headerSubtitle={getSubtitle()}
        actionButton={{
          text: 'Nuevo Negocio',
          icon: <Plus size={20} />,
          onClick: handleNuevoNegocio
        }}
        loading={loading}
        loadingMessage="Cargando negocios..."
        isEmpty={negocios.length === 0}
        emptyIcon={<Store size={80} />}
        emptyMessage="No hay negocios registrados"
      >
        <div className="standard-cards-grid">
          {negocios.map((negocio) => (
            <StandardCard
              key={negocio.idNegocio}
              title={negocio.nombreNegocio}
              fields={[
                {
                  label: 'Número',
                  value: `#${negocio.numeronegocio}`
                },
                {
                  label: 'RFC',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={14} />
                      {negocio.rfcnegocio}
                    </div>
                  )
                },
                {
                  label: 'Teléfono',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} />
                      {negocio.telefonocontacto}
                    </div>
                  )
                },
                {
                  label: 'Dirección',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {negocio.direccionfiscalnegocio.substring(0, 50)}...
                    </div>
                  )
                },
                {
                  label: 'Contacto',
                  value: negocio.contactonegocio
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: negocio.estatusnegocio === 1 ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {negocio.estatusnegocio === 1 ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  )
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={16} />,
                  onClick: () => handleEditarNegocio(negocio),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={16} />,
                  onClick: () => handleEliminarNegocio(negocio.idNegocio!),
                  variant: 'delete'
                }
              ]}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioNegocio
          negocioEditar={negocioEditar}
          onSubmit={handleSubmitFormulario}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigNegocios;

import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Tags } from 'lucide-react';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../../types/categoria.types';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/categoriasService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaCategorias from '../../components/categorias/ListaCategorias/ListaCategorias';
import FormularioCategoria from '../../components/categorias/FormularioCategoria/FormularioCategoria';
import './ConfigCategorias.css';

const ConfigCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
  const privilegio = Number(localStorage.getItem('privilegio') || '0');

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      mostrarMensaje('error', 'Error al cargar las categorías');
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const handleNuevo = () => {
    setCategoriaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEditar(categoria);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: CategoriaCreate | CategoriaUpdate) => {
    try {
      if (categoriaEditar) {
        const nombreDuplicado = categorias.some(
          cat =>
            cat.nombre.toLowerCase().trim() === data.nombre.toLowerCase().trim() &&
            cat.idCategoria !== categoriaEditar.idCategoria
        );
        if (nombreDuplicado) {
          mostrarMensaje('error', 'Ya existe una categoría con ese nombre');
          return;
        }
        const categoriaActualizada = await actualizarCategoria(categoriaEditar.idCategoria, data as CategoriaUpdate);
        mostrarMensaje('success', 'Categoría actualizada exitosamente');
        setMostrarFormulario(false);
        setCategoriaEditar(null);
        setCategorias(prev =>
          prev.map(cat =>
            cat.idCategoria === categoriaActualizada.idCategoria ? categoriaActualizada : cat
          )
        );
      } else {
        const nombreDuplicado = categorias.some(
          cat => cat.nombre.toLowerCase().trim() === data.nombre.toLowerCase().trim()
        );
        if (nombreDuplicado) {
          mostrarMensaje('error', 'Ya existe una categoría con ese nombre');
          return;
        }
        const nuevaCategoria = await crearCategoria(data as CategoriaCreate);
        mostrarMensaje('success', 'Categoría creada exitosamente');
        setMostrarFormulario(false);
        setCategorias(prev => [...prev, nuevaCategoria]);
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      mostrarMensaje('error', 'Error al guardar la categoría');
    }
  };

  const handleEliminar = async (id: number) => {
    if (privilegio < 5) {
      mostrarMensaje('error', 'No tiene privilegios suficientes para eliminar registros');
      return;
    }
    const categoria = categorias.find(c => c.idCategoria === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar la categoría "${categoria?.nombre}"?\n\nEsta acción desactivará la categoría.`
    )) {
      return;
    }

    try {
      const idEliminado = await eliminarCategoria(id);
      mostrarMensaje('success', 'Categoría eliminada exitosamente');
      setCategorias(prev => prev.filter(cat => cat.idCategoria !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      mostrarMensaje('error', 'Error al eliminar la categoría');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setCategoriaEditar(null);
  };

  return (
    <>
      {/* Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Categorías"
        headerSubtitle="Administra las categorías de productos"
        backButtonText="Regresa a DASHBOARD"
        backButtonPath="/dashboard"
        actionButton={{
          text: 'Nueva Categoría',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando categorías..."
        isEmpty={categorias.length === 0}
        emptyIcon={<Tags size={80} />}
        emptyMessage="No hay categorías registradas. Comienza agregando una nueva."
      >
        <ListaCategorias
          categorias={categorias}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCategoria
          categoria={categoriaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigCategorias;

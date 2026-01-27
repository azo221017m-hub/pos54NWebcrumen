import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Tags, Loader } from 'lucide-react';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../../types/categoria.types';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/categoriasService';
import ListaCategorias from '../../components/categorias/ListaCategorias/ListaCategorias';
import FormularioCategoria from '../../components/categorias/FormularioCategoria/FormularioCategoria';
import './ConfigCategorias.css';

const ConfigCategorias: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="config-categorias-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo}`}>
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
            <Tags size={32} className="config-icon" />
            <div>
              <h1>Gestión de Categorías</h1>
              <p>Administra las categorías de productos</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <ListaCategorias
            categorias={categorias}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCategoria
          categoria={categoriaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigCategorias;

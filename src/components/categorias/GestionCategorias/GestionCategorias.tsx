import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../../../types/categoria.types';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../../services/categoriasService';
import ListaCategorias from '../ListaCategorias/ListaCategorias';
import FormularioCategoria from '../FormularioCategoria/FormularioCategoria';
import './GestionCategorias.css';

const GestionCategorias: React.FC = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerCategorias(idnegocio);
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setCargando(false);
    }
  }, [idnegocio]);

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
        const exito = await actualizarCategoria(categoriaEditar.idCategoria, data as CategoriaUpdate);
        if (exito) {
          await cargarCategorias();
          setMostrarFormulario(false);
          setCategoriaEditar(null);
          alert('Categoría actualizada exitosamente');
        } else {
          alert('Error al actualizar la categoría');
        }
      } else {
        const resultado = await crearCategoria(data as CategoriaCreate);
        if (resultado.success) {
          await cargarCategorias();
          setMostrarFormulario(false);
          alert('Categoría creada exitosamente');
        } else {
          alert('Error al crear la categoría');
        }
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const exito = await eliminarCategoria(id);
      if (exito) {
        await cargarCategorias();
        alert('Categoría eliminada exitosamente');
      } else {
        alert('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setCategoriaEditar(null);
  };

  if (cargando) {
    return (
      <div className="gestion-categorias-cargando">
        <Loader2 size={48} className="spinner" />
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="gestion-categorias">
      <div className="gestion-categorias-header">
        <div className="header-content">
          <button className="btn-regresar" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Regresar al Dashboard
          </button>
          <h1>Gestión de Categorías</h1>
          <p className="subtitle">Administra las categorías de productos</p>
        </div>
        <button onClick={handleNuevo} className="btn-nueva-categoria">
          Nueva Categoría
        </button>
      </div>

      <div className="gestion-categorias-contenido">
        <ListaCategorias
          categorias={categorias}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </div>

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

export default GestionCategorias;

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ListaRecetas from '../ListaRecetas/ListaRecetas';
import FormularioReceta from '../FormularioReceta/FormularioReceta';
import type { Receta, RecetaCreate, RecetaUpdate } from '../../../types/receta.types';
import { obtenerRecetas, crearReceta, actualizarReceta, eliminarReceta } from '../../../services/recetasService';
import './GestionRecetas.css';

const GestionRecetas: React.FC = () => {
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);
  const [idnegocio, setIdnegocio] = useState<number>(1);

  useEffect(() => {
    const idnegocioStorage = localStorage.getItem('idnegocio');
    if (idnegocioStorage) {
      setIdnegocio(Number(idnegocioStorage));
    }
  }, []);

  const cargarRecetas = useCallback(async () => {
    console.log('🔷 GestionRecetas: Cargando recetas...');
    setCargando(true);
    try {
      const data = await obtenerRecetas(idnegocio);
      setRecetas(Array.isArray(data) ? data : []);
      console.log('🔷 GestionRecetas: Recetas cargadas:', data.length);
    } catch (error) {
      console.error('🔴 GestionRecetas: Error al cargar recetas:', error);
      setRecetas([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio]);

  useEffect(() => {
    cargarRecetas();
  }, [cargarRecetas]);

  const handleNuevo = () => {
    setRecetaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (receta: Receta) => {
    setRecetaEditar(receta);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: RecetaCreate | RecetaUpdate) => {
    try {
      if (recetaEditar) {
        const exito = await actualizarReceta(recetaEditar.idReceta, data as RecetaUpdate);
        if (exito) {
          await cargarRecetas();
          setMostrarFormulario(false);
          setRecetaEditar(null);
          alert('Receta actualizada exitosamente');
        } else {
          alert('Error al actualizar la receta');
        }
      } else {
        const resultado = await crearReceta(data as RecetaCreate);
        if (resultado.success) {
          await cargarRecetas();
          setMostrarFormulario(false);
          alert('Receta creada exitosamente');
        } else {
          alert('Error al crear la receta');
        }
      }
    } catch (error) {
      console.error('Error al guardar receta:', error);
      alert('Error al guardar la receta');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta receta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const exito = await eliminarReceta(id);
      if (exito) {
        await cargarRecetas();
        alert('Receta eliminada exitosamente');
      } else {
        alert('Error al eliminar la receta');
      }
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      alert('Error al eliminar la receta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setRecetaEditar(null);
  };

  return (
    <div className="gestion-recetas-container">
      {/* Header */}
      <div className="gestion-recetas-header">
        <div className="header-content">
          <button className="btn-regresar" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Regresar al Dashboard
          </button>
          <h1>Gestión de Recetas</h1>
          <p className="subtitle">{recetas.length} recetas registradas</p>
        </div>
        <button className="btn-nueva-receta" onClick={handleNuevo}>
          <Plus size={20} />
          Nueva Receta
        </button>
      </div>

      {/* Lista de Recetas */}
      {cargando ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando recetas...</p>
        </div>
      ) : (
        <ListaRecetas
          recetas={recetas}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioReceta
          receta={recetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default GestionRecetas;

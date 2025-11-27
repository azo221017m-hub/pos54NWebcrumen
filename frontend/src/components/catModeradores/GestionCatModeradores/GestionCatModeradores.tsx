import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import type { CatModerador, CatModeradorCreate, CatModeradorUpdate } from '../../../types/catModerador.types';
import { obtenerCatModeradores, crearCatModerador, actualizarCatModerador, eliminarCatModerador } from '../../../services/catModeradoresService';
import ListaCatModeradores from '../ListaCatModeradores/ListaCatModeradores';
import FormularioCatModerador from '../FormularioCatModerador/FormularioCatModerador';
import './GestionCatModeradores.css';

const GestionCatModeradores: React.FC = () => {
  const navigate = useNavigate();
  const [catModeradores, setCatModeradores] = useState<CatModerador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [catModeradorSeleccionada, setCatModeradorSeleccionada] = useState<CatModerador | null>(null);
  const idnegocio = 1; // TODO: Obtener del contexto de autenticación

  const cargarCatModeradores = async () => {
    try {
      setCargando(true);
      const data = await obtenerCatModeradores(idnegocio);
      setCatModeradores(data);
    } catch (error) {
      console.error('Error al cargar categorías moderador:', error);
      alert('Error al cargar las categorías moderador');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatModeradores();
  }, []);

  const handleNuevo = () => {
    setCatModeradorSeleccionada(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (catModerador: CatModerador) => {
    setCatModeradorSeleccionada(catModerador);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría moderador?')) {
      return;
    }

    try {
      await eliminarCatModerador(id);
      alert('Categoría moderador eliminada exitosamente');
      cargarCatModeradores();
    } catch (error) {
      console.error('Error al eliminar categoría moderador:', error);
      alert('Error al eliminar la categoría moderador');
    }
  };

  const handleSubmit = async (data: CatModeradorCreate | CatModeradorUpdate) => {
    try {
      if ('idmodref' in data) {
        await actualizarCatModerador(data);
        alert('Categoría moderador actualizada exitosamente');
      } else {
        await crearCatModerador(data);
        alert('Categoría moderador creada exitosamente');
      }
      setMostrarFormulario(false);
      setCatModeradorSeleccionada(null);
      cargarCatModeradores();
    } catch (error) {
      console.error('Error al guardar categoría moderador:', error);
      alert('Error al guardar la categoría moderador');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setCatModeradorSeleccionada(null);
  };

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-cat-moderadores">
      <div className="cat-moderadores-header">
        <div className="cat-moderadores-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="cat-moderadores-header-content">
          <div className="cat-moderadores-title">
            <Users size={32} className="cat-moderadores-icon" />
            <div>
              <h1>Categoría Moderadores</h1>
              <p>Gestión de categorías de moderadores</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="cat-moderadores-content">
        {cargando ? (
          <div className="cat-moderadores-cargando">
            <div className="spinner"></div>
            <p>Cargando categorías moderador...</p>
          </div>
        ) : (
          <ListaCatModeradores
            catModeradores={catModeradores}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {mostrarFormulario && (
        <FormularioCatModerador
          catModerador={catModeradorSeleccionada}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default GestionCatModeradores;

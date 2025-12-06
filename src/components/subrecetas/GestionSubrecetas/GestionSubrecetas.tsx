import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, ChefHat, Loader } from 'lucide-react';
import ListaSubrecetas from '../ListaSubrecetas/ListaSubrecetas';
import FormularioSubreceta from '../FormularioSubreceta/FormularioSubreceta';
import type { Subreceta, SubrecetaCreate, SubrecetaUpdate } from '../../../types/subreceta.types';
import { 
  obtenerSubrecetas,
  crearSubreceta,
  actualizarSubreceta,
  eliminarSubreceta 
} from '../../../services/subrecetasService';
import './GestionSubrecetas.css';

const GestionSubrecetas: React.FC = () => {
  const navigate = useNavigate();
  const [subrecetas, setSubrecetas] = useState<Subreceta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subrecetaEditar, setSubrecetaEditar] = useState<Subreceta | null>(null);
  const [idnegocio, setIdnegocio] = useState<number>(1);

  useEffect(() => {
    const idnegocioStorage = localStorage.getItem('idnegocio');
    if (idnegocioStorage) {
      setIdnegocio(Number(idnegocioStorage));
    }
  }, []);

  const cargarSubrecetas = useCallback(async () => {
    console.log('🔷 GestionSubrecetas: Cargando subrecetas...');
    setCargando(true);
    try {
      const data = await obtenerSubrecetas(idnegocio);
      setSubrecetas(Array.isArray(data) ? data : []);
      console.log('🔷 GestionSubrecetas: Subrecetas cargadas:', data.length);
    } catch (error) {
      console.error('🔴 GestionSubrecetas: Error al cargar subrecetas:', error);
      setSubrecetas([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio]);

  useEffect(() => {
    cargarSubrecetas();
  }, [cargarSubrecetas]);

  const handleNuevo = () => {
    setSubrecetaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (subreceta: Subreceta) => {
    setSubrecetaEditar(subreceta);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: SubrecetaCreate | SubrecetaUpdate) => {
    try {
      if (subrecetaEditar) {
        const exito = await actualizarSubreceta(subrecetaEditar.idSubReceta, data as SubrecetaUpdate);
        if (exito) {
          await cargarSubrecetas();
          setMostrarFormulario(false);
          setSubrecetaEditar(null);
          alert('Subreceta actualizada exitosamente');
        } else {
          alert('Error al actualizar la subreceta');
        }
      } else {
        const resultado = await crearSubreceta(data as SubrecetaCreate);
        if (resultado.success) {
          await cargarSubrecetas();
          setMostrarFormulario(false);
          alert('Subreceta creada exitosamente');
        } else {
          alert('Error al crear la subreceta');
        }
      }
    } catch (error) {
      console.error('Error al guardar subreceta:', error);
      alert('Error al guardar la subreceta');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta subreceta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const exito = await eliminarSubreceta(id);
      if (exito) {
        await cargarSubrecetas();
        alert('Subreceta eliminada exitosamente');
      } else {
        alert('Error al eliminar la subreceta');
      }
    } catch (error) {
      console.error('Error al eliminar subreceta:', error);
      alert('Error al eliminar la subreceta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setSubrecetaEditar(null);
  };

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-subrecetas">
      <div className="subrecetas-header">
        <div className="subrecetas-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="subrecetas-header-content">
          <div className="subrecetas-title">
            <ChefHat size={32} className="subrecetas-icon" />
            <div>
              <h1>Gestión de Subrecetas</h1>
              <p>{subrecetas.length} subreceta{subrecetas.length !== 1 ? 's' : ''} registrada{subrecetas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Subreceta
          </button>
        </div>
      </div>

      <div className="subrecetas-content">
        {cargando ? (
          <div className="subrecetas-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando subrecetas...</p>
          </div>
        ) : (
          <ListaSubrecetas
            subrecetas={subrecetas}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {mostrarFormulario && (
        <FormularioSubreceta
          subreceta={subrecetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default GestionSubrecetas;

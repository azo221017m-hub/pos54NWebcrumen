import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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

  if (cargando) {
    return (
      <div className="gestion-subrecetas-cargando">
        <div className="spinner"></div>
        <p>Cargando subrecetas...</p>
      </div>
    );
  }

  return (
    <div className="gestion-subrecetas">
      <div className="gestion-header">
        <div className="header-info">
          <h1>Gestión de Subrecetas</h1>
          <p className="header-subtitle">
            {subrecetas.length} subreceta{subrecetas.length !== 1 ? 's' : ''} registrada{subrecetas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-nuevo" onClick={handleNuevo}>
          <Plus size={20} />
          Nueva Subreceta
        </button>
      </div>

      <ListaSubrecetas
        subrecetas={subrecetas}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

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

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth'; // Importa el hook de autenticación
import '../styles/ConfigScreens.css';

// Define la interfaz para las categorías de moderadores
interface CategoriaModerador {
  idmodref: number;
  nombremodref: string;
  moderadores?: string;
}

// Componente para gestionar categorías de moderadores
const ConfigCategoriaModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Estados para el formulario de agregar categoría con moderadores
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState('');
  const [moderadores, setModeradores] = useState<{idmoderador:number, nombremoderador:string}[]>([]);
  const [moderadoresSeleccionados, setModeradoresSeleccionados] = useState<number[]>([]);

  const auth = useAuth(); // Accede al contexto de autenticación
  const [categorias, setCategorias] = useState<CategoriaModerador[]>([]);
  const [editCategoria, setEditCategoria] = useState<CategoriaModerador | null>(null);
  const [editNombre, setEditNombre] = useState('');
  useEffect(() => {
    fetch('/api/categorias-moderadores')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
      })
      .catch((err) => console.error('❌ Error al cargar categorías:', err));
    fetch(`/api/moderadores?idnegocio=${auth.user?.idNegocio ?? 1}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setModeradores(data.data);
      });
  }, [auth.user?.idNegocio]);

  useEffect(() => {
    console.log('📡 Cargando categorías de moderadores...');
    fetch('/pi/categorias-moderadores')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Categorías cargadas:', data);
        setCategorias(data);
      })
      .catch((err) => console.error('❌ Error al cargar categorías:', err));
  }, []);

  useEffect(() => {
    fetch(`/api/moderadores?idnegocio=${auth.user?.idNegocio ?? 1}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setModeradores(data.data);
      });
  }, [auth.user?.idNegocio]);


  return (
    <div className="config-screen">
      {/* Botón para regresar al tablero inicial */}
      <button onClick={onBack}>← Regresar a TableroInicial</button>


      <h2>Categorías de Moderadores</h2>
      <div className="moderadores-card-grid">
        {categorias.map((categoria) => (
          <div className="moderador-card" key={categoria.idmodref}>
            <div className="moderador-card-header">
              <div className="moderador-avatar">
                <span>{categoria.nombremodref.charAt(0).toUpperCase()}</span>
              </div>
              <div className="moderador-actions">
                <button className="btn-edit" title="Editar" onClick={() => {
                  setEditCategoria(categoria);
                  setEditNombre(categoria.nombremodref);
                }}><FaEdit /></button>
                <button className="btn-delete" title="Eliminar" onClick={() => {
                  if (window.confirm('¿Seguro que deseas eliminar esta categoría?')) {
                    fetch(`/api/categorias-moderadores/${categoria.idmodref}`, {
                      method: 'DELETE',
                    })
                      .then((res) => res.json())
                      .then(() => {
                        setCategorias(categorias.filter(c => c.idmodref !== categoria.idmodref));
                      })
                      .catch((err) => console.error('❌ Error al eliminar categoría:', err));
                  }
                }}><FaTrash /></button>
              </div>
            </div>
            <div className="moderador-card-body">
              <div className="moderador-nombre">{categoria.nombremodref}</div>
              <div className="moderador-meta">ID: {categoria.idmodref}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar una nueva categoría */}
  <button onClick={() => setShowCategoriaModal(true)}>Agregar Categoría Moderador</button>

      {/* Modal para agregar categoría con moderadores */}
      {showCategoriaModal && (
        <div className="modal">
          <h3>Agregar Categoría Moderador</h3>
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombreNuevaCategoria}
            onChange={e => setNombreNuevaCategoria(e.target.value)}
            style={{marginBottom: '1rem', width: '100%'}}
          />
          <div style={{marginBottom: '1rem'}}>
            <label style={{fontWeight: 600}}>Selecciona moderadores:</label>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.5rem'}}>
              {moderadores.map(mod => (
                <label key={mod.idmoderador} style={{display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={moderadoresSeleccionados.includes(mod.idmoderador)}
                    onChange={e => {
                      if (e.target.checked) {
                        setModeradoresSeleccionados(prev => [...prev, mod.idmoderador]);
                      } else {
                        setModeradoresSeleccionados(prev => prev.filter(id => id !== mod.idmoderador));
                      }
                    }}
                    style={{accentColor: '#6366f1', width: 22, height: 22}}
                  />
                  <span style={{fontWeight: 600}}>{mod.nombremoderador}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={async () => {
            if (!nombreNuevaCategoria.trim()) {
              alert('Debes ingresar el nombre de la categoría.');
              return;
            }
            // Validar nombre único (case-insensitive)
            if (categorias.some(c => c.nombremodref.trim().toLowerCase() === nombreNuevaCategoria.trim().toLowerCase())) {
              alert('Ya existe una categoría con ese nombre.');
              return;
            }
            if (moderadoresSeleccionados.length === 0) {
              alert('Selecciona al menos un moderador.');
              return;
            }
            // Construir string de moderadores
            const nombresModeradores = moderadores
              .filter(m => moderadoresSeleccionados.includes(m.idmoderador))
              .map(m => m.nombremoderador)
              .join('+');
            // Construir payload
            const payload = {
              nombremodref: nombreNuevaCategoria,
              moderadores: nombresModeradores,
              idnegocio: auth.user?.idNegocio ?? 1,
              usuarioauditoria: auth.user?.alias ?? '',
              estatus: 1
            };
            // POST al endpoint correspondiente
            const res = await fetch('/api/categorias-moderadores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.idmodref || data.success) {
              alert('Categoría de moderador guardada correctamente');
              setShowCategoriaModal(false);
              setNombreNuevaCategoria('');
              setModeradoresSeleccionados([]);
              // Recargar categorías
              fetch('/api/categorias-moderadores')
                .then(res => res.json())
                .then(data => setCategorias(data));
            } else {
              alert('Error al guardar la categoría: ' + (data.message || ''));
            }
          }}>Guardar</button>
          <button onClick={() => {
            setShowCategoriaModal(false);
            setNombreNuevaCategoria('');
            setModeradoresSeleccionados([]);
          }}>Cancelar</button>
        </div>
      )}

      {/* Modal para editar categoría */}
      {editCategoria && (
        <div className="modal">
          <h3>Editar Categoría</h3>
          <input
            type="text"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            style={{marginBottom: '1rem', width: '100%'}}
          />
          <div style={{marginBottom: '1rem'}}>
            <label style={{fontWeight: 600}}>Selecciona moderadores:</label>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.5rem'}}>
              {moderadores.map(mod => {
                // Determinar si el moderador está en la categoría actual
                let checked = false;
                if (editCategoria && editCategoria.moderadores) {
                  const mods = editCategoria.moderadores.split('+');
                  checked = mods.includes(mod.nombremoderador);
                }
                return (
                  <label key={mod.idmoderador} style={{display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        // Actualizar el array de moderadores seleccionados para edición
                        let nuevos;
                        if (e.target.checked) {
                          nuevos = [...(editCategoria.moderadores ? editCategoria.moderadores.split('+') : []), mod.nombremoderador];
                        } else {
                          nuevos = (editCategoria.moderadores ? editCategoria.moderadores.split('+') : []).filter(m => m !== mod.nombremoderador);
                        }
                        setEditCategoria({ ...editCategoria, moderadores: nuevos.join('+') });
                      }}
                      style={{accentColor: '#6366f1', width: 22, height: 22}}
                    />
                    <span style={{fontWeight: 600}}>{mod.nombremoderador}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <button onClick={() => {
            // Construir string de moderadores seleccionados
            const modsSeleccionados = moderadores
              .filter(mod => {
                let checked = false;
                if (editCategoria && editCategoria.moderadores) {
                  const mods = editCategoria.moderadores.split('+');
                  checked = mods.includes(mod.nombremoderador);
                }
                return checked;
              })
              .map(mod => mod.nombremoderador)
              .join('+');
            fetch(`/api/categorias-moderadores/${editCategoria.idmodref}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombremodref: editNombre, moderadores: modsSeleccionados }),
            })
              .then((res) => res.json())
              .then(() => {
                setCategorias(categorias.map(c => c.idmodref === editCategoria.idmodref ? { ...c, nombremodref: editNombre, moderadores: modsSeleccionados } : c));
                setEditCategoria(null);
              })
              .catch((err) => console.error('❌ Error al editar categoría:', err));
          }}>Guardar</button>
          <button onClick={() => setEditCategoria(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default ConfigCategoriaModeradores;
// src/components/ConfigInsumos.tsx
// Componente para gestión de insumos con tabla de datos y formulario de inserción

import React, { useState, useEffect } from 'react';
import type { Insumo, CreateInsumoData, ApiResponse, Usuario, Categoria } from '../types/index';
import { getInsumos, createInsumo, getCategoriasDropdown } from '../services/api';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaz para props del componente
interface ConfigInsumosProps {
  onNavigate: (screen: string) => void; // Función para navegar entre pantallas
  currentUser: Usuario; // Usuario autenticado actual
}

// Componente principal de configuración de insumos
const ConfigInsumos: React.FC<ConfigInsumosProps> = ({ onNavigate, currentUser }) => {
  // Estados para el manejo de datos y UI
  const [insumos, setInsumos] = useState<Insumo[]>([]); // Lista de insumos
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Lista de categorías para dropdown
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado de envío de formulario

  // Estados para el formulario de nuevo insumo
  const [formData, setFormData] = useState<CreateInsumoData>({
    nomInsumo: '',
    costoPromPond: 0,
    umInsumo: '',
    tipoInsumo: 'PIEZA',
    existencia: 0,
    stockMinimo: 0,
    precioVta: 0,
    idCategoria: 0,
    usuario: currentUser.usuario // Llenar automáticamente con el usuario logueado
  });

  // Estados para Toast de notificaciones
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar notificaciones
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-ocultar después de 3 segundos
    setTimeout(() => setShowToast(false), 3000);
  };

  // Función para cargar insumos desde la API
  const cargarInsumos = async () => {
    try {
      setLoading(true);
      console.log('Cargando insumos...');
      
      const response: ApiResponse<Insumo[]> = await getInsumos();
      console.log('Respuesta de insumos:', response);
      
      if (response.success && response.data) {
        setInsumos(response.data);
        mostrarToast(`${response.data.length} insumos cargados correctamente`, 'success');
      } else {
        setInsumos([]);
        mostrarToast(response.message || 'Error al cargar insumos', 'error');
      }
    } catch (error) {
      console.error('Error al cargar insumos:', error);
      setInsumos([]);
      mostrarToast('Error de conexión al cargar insumos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar categorías para el dropdown
  const cargarCategorias = async () => {
    try {
      console.log('Cargando categorías para dropdown...');
      
      const response: ApiResponse<Categoria[]> = await getCategoriasDropdown();
      console.log('Respuesta de categorías:', response);
      
      if (response.success && response.data) {
        setCategorias(response.data);
      } else {
        setCategorias([]);
        mostrarToast('Error al cargar categorías', 'error');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
      mostrarToast('Error de conexión al cargar categorías', 'error');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarInsumos();
    cargarCategorias();
  }, []);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['costoPromPond', 'existencia', 'stockMinimo', 'precioVta', 'idCategoria'].includes(name) 
        ? Number(value) 
        : value
    }));
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nomInsumo.trim()) {
      mostrarToast('El nombre del insumo es obligatorio', 'error');
      return;
    }

    if (!formData.umInsumo.trim()) {
      mostrarToast('La unidad de medida es obligatoria', 'error');
      return;
    }

    if (formData.idCategoria === 0) {
      mostrarToast('Debe seleccionar una categoría', 'error');
      return;
    }

    if (formData.costoPromPond < 0) {
      mostrarToast('El costo promedio ponderado no puede ser negativo', 'error');
      return;
    }

    if (formData.existencia < 0) {
      mostrarToast('La existencia no puede ser negativa', 'error');
      return;
    }

    if (formData.stockMinimo < 0) {
      mostrarToast('El stock mínimo no puede ser negativo', 'error');
      return;
    }

    if (formData.precioVta < 0) {
      mostrarToast('El precio de venta no puede ser negativo', 'error');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Enviando nuevo insumo:', formData);
      
      // Preparar datos con usuario automático
      const insumoData: CreateInsumoData = {
        ...formData,
        nomInsumo: formData.nomInsumo.trim(),
        umInsumo: formData.umInsumo.trim(),
        usuario: currentUser.usuario
      };

      const response: ApiResponse = await createInsumo(insumoData);
      console.log('Respuesta de creación:', response);
      
      if (response.success) {
        mostrarToast('Insumo creado exitosamente', 'success');
        
        // Limpiar formulario
        setFormData({
          nomInsumo: '',
          costoPromPond: 0,
          umInsumo: '',
          tipoInsumo: 'PIEZA',
          existencia: 0,
          stockMinimo: 0,
          precioVta: 0,
          idCategoria: 0,
          usuario: currentUser.usuario // Mantener el usuario logueado
        });
        
        // Recargar lista de insumos
        await cargarInsumos();
      } else {
        mostrarToast(response.message || 'Error al crear el insumo', 'error');
      }
    } catch (error) {
      console.error('Error al crear insumo:', error);
      mostrarToast('Error de conexión al crear insumo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear fecha para display
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  // Función para formatear números como moneda
  const formatearMoneda = (valor: any): string => {
    try {
      const numero = Number(valor);
      if (isNaN(numero)) return '$0.00';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero);
    } catch (error) {
      console.error('Error formateando moneda:', error);
      return '$0.00';
    }
  };

  // Función para formatear números decimales de forma segura
  const formatearDecimal = (valor: any, decimales: number = 3): string => {
    try {
      const numero = Number(valor);
      if (isNaN(numero)) return '0.000';
      return numero.toFixed(decimales);
    } catch (error) {
      console.error('Error formateando decimal:', error);
      return '0.000';
    }
  };

  // Función para comparar stock de forma segura
  const esStockBajo = (existencia: any, stockMinimo: any): boolean => {
    try {
      const exist = Number(existencia);
      const minimo = Number(stockMinimo);
      if (isNaN(exist) || isNaN(minimo)) return false;
      return exist <= minimo;
    } catch (error) {
      return false;
    }
  };

  // Función para obtener nombre de categoría
  const obtenerNombreCategoria = (idCategoria: number): string => {
    const categoria = categorias.find(c => c.idCategoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  return (
    <div className="config-screen">
      {/* Header con título y botón de regreso */}
      <div className="config-header">
        <div className="config-title-section">
          <h1 className="config-title">Gestión de Insumos</h1>
          <p className="config-subtitle">Administra los insumos del inventario</p>
        </div>
        <button 
          className="btn-secondary config-back-btn"
          onClick={() => onNavigate('home')}
          type="button"
        >
          ← Regresar al Inicio
        </button>
      </div>

      <div className="config-content">
        {/* Formulario de nuevo insumo */}
        <div className="config-form-section insumos-form-section">
          <h2 className="section-title insumos-section-title">Nuevo Insumo</h2>
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-grid insumos-form-grid">
              {/* Campo nombre del insumo */}
              <div className="form-group">
                <label htmlFor="nomInsumo" className="form-label">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  id="nomInsumo"
                  name="nomInsumo"
                  value={formData.nomInsumo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingrese el nombre del insumo"
                  maxLength={150}
                  required
                />
              </div>

              {/* Campo unidad de medida */}
              <div className="form-group">
                <label htmlFor="umInsumo" className="form-label">
                  Unidad de Medida *
                </label>
                <input
                  type="text"
                  id="umInsumo"
                  name="umInsumo"
                  value={formData.umInsumo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: kg, litros, piezas, metros"
                  maxLength={50}
                  required
                />
              </div>

              {/* Campo tipo de insumo */}
              <div className="form-group">
                <label htmlFor="tipoInsumo" className="form-label">
                  Tipo de Insumo *
                </label>
                <select
                  id="tipoInsumo"
                  name="tipoInsumo"
                  value={formData.tipoInsumo}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="PIEZA">PIEZA</option>
                  <option value="CONSUMO">CONSUMO</option>
                </select>
              </div>

              {/* Campo categoría */}
              <div className="form-group">
                <label htmlFor="idCategoria" className="form-label">
                  Categoría *
                </label>
                <select
                  id="idCategoria"
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value={0}>Seleccione una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo costo promedio ponderado */}
              <div className="form-group">
                <label htmlFor="costoPromPond" className="form-label">
                  Costo Promedio Ponderado
                </label>
                <input
                  type="number"
                  id="costoPromPond"
                  name="costoPromPond"
                  value={formData.costoPromPond}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.0001"
                />
              </div>

              {/* Campo existencia */}
              <div className="form-group">
                <label htmlFor="existencia" className="form-label">
                  Existencia Inicial
                </label>
                <input
                  type="number"
                  id="existencia"
                  name="existencia"
                  value={formData.existencia}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                  step="0.001"
                />
              </div>

              {/* Campo stock mínimo */}
              <div className="form-group">
                <label htmlFor="stockMinimo" className="form-label">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  id="stockMinimo"
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                  step="0.001"
                />
              </div>

              {/* Campo precio de venta */}
              <div className="form-group">
                <label htmlFor="precioVta" className="form-label">
                  Precio de Venta
                </label>
                <input
                  type="number"
                  id="precioVta"
                  name="precioVta"
                  value={formData.precioVta}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Campo usuario - oculto porque se llena automáticamente */}
            </div>

            {/* Botón de envío */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Insumo'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de insumos existentes */}
        <div className="config-table-section insumos-table-section">
          <h2 className="section-title insumos-section-title">
            Insumos Registrados ({insumos.length})
          </h2>
          
          {loading ? (
            <div className="loading-message">
              <p>Cargando insumos...</p>
            </div>
          ) : insumos.length === 0 ? (
            <div className="empty-message insumos-empty-message">
              <p className="insumos-empty-title">No hay insumos registrados</p>
              <p className="empty-subtitle insumos-empty-subtitle">Crea el primer insumo usando el formulario superior</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table insumos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Costo Prom.</th>
                    <th>Existencia</th>
                    <th>Stock Mín.</th>
                    <th>Precio Vta.</th>
                    <th>Fecha Registro</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map((insumo) => (
                    <tr key={insumo.idInsumo}>
                      <td className="text-center">{insumo.idInsumo}</td>
                      <td className="text-bold insumo-nombre">{insumo.nomInsumo}</td>
                      <td className="text-center insumo-unidad">{insumo.umInsumo}</td>
                      <td className="text-center">
                        <span className={`insumo-tipo-badge ${insumo.tipoInsumo.toLowerCase()}`}>
                          {insumo.tipoInsumo}
                        </span>
                      </td>
                      <td className="insumo-categoria">{obtenerNombreCategoria(insumo.idCategoria)}</td>
                      <td className="text-right insumo-costo">{formatearMoneda(insumo.costoPromPond)}</td>
                      <td className="text-right insumo-existencia">
                        <span className={esStockBajo(insumo.existencia, insumo.stockMinimo) ? 'stock-bajo' : ''}>
                          {formatearDecimal(insumo.existencia, 3)}
                        </span>
                      </td>
                      <td className="text-right insumo-stock-min">{formatearDecimal(insumo.stockMinimo, 3)}</td>
                      <td className="text-right insumo-precio">{formatearMoneda(insumo.precioVta)}</td>
                      <td className="text-date insumo-fecha">{formatearFecha(insumo.fechaRegistro)}</td>
                      <td className="insumo-usuario">{insumo.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Componente Toast para notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ConfigInsumos;
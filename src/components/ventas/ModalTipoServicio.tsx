import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { obtenerMesas } from '../../services/mesasService';
import { obtenerClientes } from '../../services/clientesService';
import type { Mesa } from '../../types/mesa.types';
import type { Cliente } from '../../types/cliente.types';
import './ModalTipoServicio.css';

export interface MesaFormData {
  idmesa: number | null;
  nombremesa: string;
}

export interface LlevarFormData {
  cliente: string;
  idcliente: number | null;
  fechaprogramadaventa: string;
}

export interface DomicilioFormData {
  cliente: string;
  idcliente: number | null;
  fechaprogramadaventa: string;
  direcciondeentrega: string;
  telefonodeentrega: string;
  contactodeentrega: string;
  observaciones: string;
}

type TipoServicio = 'Mesa' | 'Llevar' | 'Domicilio';

interface ModalTipoServicioProps {
  tipoServicio: TipoServicio;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MesaFormData | LlevarFormData | DomicilioFormData) => void;
  initialData?: MesaFormData | LlevarFormData | DomicilioFormData;
}

const ModalTipoServicio: React.FC<ModalTipoServicioProps> = ({
  tipoServicio,
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Form data for Mesa
  const [mesaFormData, setMesaFormData] = useState<MesaFormData>({
    idmesa: null,
    nombremesa: ''
  });

  // Form data for Llevar
  const [llevarFormData, setLlevarFormData] = useState<LlevarFormData>({
    cliente: '',
    idcliente: null,
    fechaprogramadaventa: ''
  });

  // Form data for Domicilio
  const [domicilioFormData, setDomicilioFormData] = useState<DomicilioFormData>({
    cliente: '',
    idcliente: null,
    fechaprogramadaventa: '',
    direcciondeentrega: '',
    telefonodeentrega: '',
    contactodeentrega: '',
    observaciones: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (tipoServicio === 'Mesa') {
        cargarMesas();
        if (initialData && 'idmesa' in initialData) {
          setMesaFormData(initialData as MesaFormData);
        }
      } else {
        cargarClientes();
        if (tipoServicio === 'Llevar' && initialData && 'fechaprogramadaventa' in initialData && !('direcciondeentrega' in initialData)) {
          setLlevarFormData(initialData as LlevarFormData);
        } else if (tipoServicio === 'Domicilio' && initialData && 'direcciondeentrega' in initialData) {
          setDomicilioFormData(initialData as DomicilioFormData);
        }
      }
    }
  }, [isOpen, tipoServicio, initialData]);

  const cargarMesas = async () => {
    try {
      const data = await obtenerMesas();
      // Filtrar solo mesas disponibles
      const mesasDisponibles = data.filter(m => m.estatusmesa === 'DISPONIBLE');
      setMesas(mesasDisponibles);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await obtenerClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleClienteInputChange = (value: string) => {
    if (tipoServicio === 'Llevar') {
      setLlevarFormData(prev => ({ ...prev, cliente: value, idcliente: null }));
    } else if (tipoServicio === 'Domicilio') {
      setDomicilioFormData(prev => ({ ...prev, cliente: value, idcliente: null }));
    }

    // Filtrar clientes
    if (value.trim()) {
      const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setClientesFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    if (tipoServicio === 'Llevar') {
      setLlevarFormData(prev => ({
        ...prev,
        cliente: cliente.nombre,
        idcliente: cliente.idCliente
      }));
    } else if (tipoServicio === 'Domicilio') {
      setDomicilioFormData(prev => ({
        ...prev,
        cliente: cliente.nombre,
        idcliente: cliente.idCliente,
        direcciondeentrega: cliente.direccion || '',
        telefonodeentrega: cliente.telefono || ''
      }));
    }
    setMostrarSugerencias(false);
  };

  const handleSave = () => {
    if (tipoServicio === 'Mesa') {
      if (!mesaFormData.idmesa) {
        alert('Por favor seleccione una mesa');
        return;
      }
      onSave(mesaFormData);
    } else if (tipoServicio === 'Llevar') {
      if (!llevarFormData.cliente.trim()) {
        alert('Por favor ingrese el nombre del cliente');
        return;
      }
      if (!llevarFormData.fechaprogramadaventa) {
        alert('Por favor seleccione la fecha y hora de entrega');
        return;
      }
      onSave(llevarFormData);
    } else if (tipoServicio === 'Domicilio') {
      if (!domicilioFormData.cliente.trim()) {
        alert('Por favor ingrese el nombre del cliente');
        return;
      }
      if (!domicilioFormData.fechaprogramadaventa) {
        alert('Por favor seleccione la fecha y hora de entrega');
        return;
      }
      if (!domicilioFormData.direcciondeentrega.trim()) {
        alert('Por favor ingrese la dirección de entrega');
        return;
      }
      if (!domicilioFormData.telefonodeentrega.trim()) {
        alert('Por favor ingrese el teléfono de contacto');
        return;
      }
      onSave(domicilioFormData);
    }
  };

  const handleCancel = () => {
    // Limpiar formularios
    setMesaFormData({ idmesa: null, nombremesa: '' });
    setLlevarFormData({ cliente: '', idcliente: null, fechaprogramadaventa: '' });
    setDomicilioFormData({
      cliente: '',
      idcliente: null,
      fechaprogramadaventa: '',
      direcciondeentrega: '',
      telefonodeentrega: '',
      contactodeentrega: '',
      observaciones: ''
    });
    setMostrarSugerencias(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-servicio" onClick={handleCancel}>
      <div className="modal-content-servicio" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-servicio">
          <h2>Configurar Servicio: {tipoServicio}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-servicio">
          {tipoServicio === 'Mesa' && (
            <div className="form-group">
              <label htmlFor="mesa">Seleccionar Mesa *</label>
              <select
                id="mesa"
                className="form-control"
                value={mesaFormData.idmesa || ''}
                onChange={(e) => {
                  const selectedMesa = mesas.find(m => m.idmesa === Number(e.target.value));
                  setMesaFormData({
                    idmesa: Number(e.target.value),
                    nombremesa: selectedMesa?.nombremesa || ''
                  });
                }}
              >
                <option value="">Seleccione una mesa</option>
                {mesas.map((mesa) => (
                  <option key={mesa.idmesa} value={mesa.idmesa}>
                    {mesa.nombremesa} - Mesa {mesa.numeromesa}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoServicio === 'Llevar' && (
            <>
              <div className="form-group">
                <label htmlFor="cliente">Nombre del Cliente *</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    id="cliente"
                    className="form-control"
                    value={llevarFormData.cliente}
                    onChange={(e) => handleClienteInputChange(e.target.value)}
                    onFocus={() => llevarFormData.cliente && setMostrarSugerencias(true)}
                    placeholder="Escriba o seleccione un cliente"
                  />
                  {mostrarSugerencias && clientesFiltrados.length > 0 && (
                    <div className="sugerencias-dropdown">
                      {clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.idCliente}
                          className="sugerencia-item"
                          onClick={() => seleccionarCliente(cliente)}
                        >
                          {cliente.nombre}
                          {cliente.telefono && <span className="cliente-info"> - {cliente.telefono}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fechaprogramada">Fecha y Hora de Entrega *</label>
                <input
                  type="datetime-local"
                  id="fechaprogramada"
                  className="form-control"
                  value={llevarFormData.fechaprogramadaventa}
                  onChange={(e) => setLlevarFormData(prev => ({ ...prev, fechaprogramadaventa: e.target.value }))}
                />
              </div>
            </>
          )}

          {tipoServicio === 'Domicilio' && (
            <>
              <div className="form-group">
                <label htmlFor="cliente-domicilio">Nombre del Cliente *</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    id="cliente-domicilio"
                    className="form-control"
                    value={domicilioFormData.cliente}
                    onChange={(e) => handleClienteInputChange(e.target.value)}
                    onFocus={() => domicilioFormData.cliente && setMostrarSugerencias(true)}
                    placeholder="Escriba o seleccione un cliente"
                  />
                  {mostrarSugerencias && clientesFiltrados.length > 0 && (
                    <div className="sugerencias-dropdown">
                      {clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.idCliente}
                          className="sugerencia-item"
                          onClick={() => seleccionarCliente(cliente)}
                        >
                          {cliente.nombre}
                          {cliente.telefono && <span className="cliente-info"> - {cliente.telefono}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fechaprogramada-domicilio">Fecha y Hora de Entrega *</label>
                <input
                  type="datetime-local"
                  id="fechaprogramada-domicilio"
                  className="form-control"
                  value={domicilioFormData.fechaprogramadaventa}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, fechaprogramadaventa: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección de Entrega *</label>
                <input
                  type="text"
                  id="direccion"
                  className="form-control"
                  value={domicilioFormData.direcciondeentrega}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, direcciondeentrega: e.target.value }))}
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono de Contacto *</label>
                <input
                  type="tel"
                  id="telefono"
                  className="form-control"
                  value={domicilioFormData.telefonodeentrega}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, telefonodeentrega: e.target.value }))}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contacto">Referencia del Cliente</label>
                <input
                  type="text"
                  id="contacto"
                  className="form-control"
                  value={domicilioFormData.contactodeentrega}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, contactodeentrega: e.target.value }))}
                  placeholder="Nombre de quien recibe, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Nota Adicional del Pedido</label>
                <textarea
                  id="observaciones"
                  className="form-control"
                  value={domicilioFormData.observaciones}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Instrucciones especiales, referencias de ubicación, etc."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer-servicio">
          <button className="btn-cancelar-servicio" onClick={handleCancel}>
            <X size={18} />
            Cancelar
          </button>
          <button className="btn-guardar-servicio" onClick={handleSave}>
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTipoServicio;

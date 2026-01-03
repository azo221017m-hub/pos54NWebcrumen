import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { obtenerMesas } from '../../services/mesasService';
import { obtenerClientes } from '../../services/clientesService';
import type { Mesa, TipoServicio } from '../../types/mesa.types';
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

interface ModalTipoServicioProps {
  tipoServicio: TipoServicio;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MesaFormData | LlevarFormData | DomicilioFormData) => void;
  initialData?: MesaFormData | LlevarFormData | DomicilioFormData;
}

// Initial form states
const INITIAL_MESA_DATA: MesaFormData = {
  idmesa: null,
  nombremesa: ''
};

const INITIAL_LLEVAR_DATA: LlevarFormData = {
  cliente: '',
  idcliente: null,
  fechaprogramadaventa: ''
};

const INITIAL_DOMICILIO_DATA: DomicilioFormData = {
  cliente: '',
  idcliente: null,
  fechaprogramadaventa: '',
  direcciondeentrega: '',
  telefonodeentrega: '',
  contactodeentrega: '',
  observaciones: ''
};

const ModalTipoServicio: React.FC<ModalTipoServicioProps> = ({
  tipoServicio,
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Form data states
  const [mesaFormData, setMesaFormData] = useState<MesaFormData>(INITIAL_MESA_DATA);
  const [llevarFormData, setLlevarFormData] = useState<LlevarFormData>(INITIAL_LLEVAR_DATA);
  const [domicilioFormData, setDomicilioFormData] = useState<DomicilioFormData>(INITIAL_DOMICILIO_DATA);

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

  const handleSave = () => {
    if (tipoServicio === 'Mesa') {
      if (!mesaFormData.idmesa) {
        alert('Por favor seleccione una mesa');
        return;
      }
      onSave(mesaFormData);
    } else if (tipoServicio === 'Llevar') {
      if (!llevarFormData.idcliente) {
        alert('Por favor seleccione un cliente');
        return;
      }
      if (!llevarFormData.fechaprogramadaventa) {
        alert('Por favor seleccione la fecha y hora de entrega');
        return;
      }
      onSave(llevarFormData);
    } else if (tipoServicio === 'Domicilio') {
      if (!domicilioFormData.idcliente) {
        alert('Por favor seleccione un cliente');
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
    // Reset all forms to initial state
    setMesaFormData(INITIAL_MESA_DATA);
    setLlevarFormData(INITIAL_LLEVAR_DATA);
    setDomicilioFormData(INITIAL_DOMICILIO_DATA);
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
                <select
                  id="cliente"
                  className="form-control"
                  value={llevarFormData.idcliente || ''}
                  onChange={(e) => {
                    const selectedCliente = clientes.find(c => c.idCliente === Number(e.target.value));
                    setLlevarFormData(prev => ({
                      ...prev,
                      cliente: selectedCliente?.nombre || '',
                      idcliente: selectedCliente?.idCliente || null
                    }));
                  }}
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.nombre}
                      {cliente.telefono && ` - ${cliente.telefono}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaprogramada">Fecha y Hora de Entrega *</label>
                <input
                  type="datetime-local"
                  id="fechaprogramada"
                  className="form-control"
                  value={llevarFormData.fechaprogramadaventa}
                  onChange={(e) => setLlevarFormData(prev => ({ ...prev, fechaprogramadaventa: e.target.value }))}
                  readOnly
                  onFocus={(e) => e.target.showPicker?.()}
                />
              </div>
            </>
          )}

          {tipoServicio === 'Domicilio' && (
            <>
              <div className="form-group">
                <label htmlFor="cliente-domicilio">Nombre del Cliente *</label>
                <select
                  id="cliente-domicilio"
                  className="form-control"
                  value={domicilioFormData.idcliente || ''}
                  onChange={(e) => {
                    const selectedCliente = clientes.find(c => c.idCliente === Number(e.target.value));
                    setDomicilioFormData(prev => ({
                      ...prev,
                      cliente: selectedCliente?.nombre || '',
                      idcliente: selectedCliente?.idCliente || null,
                      direcciondeentrega: selectedCliente?.direccion || '',
                      telefonodeentrega: selectedCliente?.telefono || ''
                    }));
                  }}
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.nombre}
                      {cliente.telefono && ` - ${cliente.telefono}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaprogramada-domicilio">Fecha y Hora de Entrega *</label>
                <input
                  type="datetime-local"
                  id="fechaprogramada-domicilio"
                  className="form-control"
                  value={domicilioFormData.fechaprogramadaventa}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, fechaprogramadaventa: e.target.value }))}
                  readOnly
                  onFocus={(e) => e.target.showPicker?.()}
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

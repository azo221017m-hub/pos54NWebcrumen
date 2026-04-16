import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Search } from 'lucide-react';
import { obtenerMesas, cambiarEstatusMesa } from '../../services/mesasService';
import { buscarClientesPorTelefono } from '../../services/clientesService';
import { verificarMesasOcupadas } from '../../services/ventasWebService';
import type { Mesa, TipoServicio } from '../../types/mesa.types';
import './ModalTipoServicio.css';

export interface MesaFormData {
  idmesa: number | null;
  nombremesa: string;
  telefonocontacto?: string;
}

export interface LlevarFormData {
  cliente: string;
  idcliente: number | null;
  fechaprogramadaventa: string;
  telefonocontacto?: string;
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

export interface ClientePreData {
  idcliente: number;
  nombre: string;
  telefono: string;
}

interface ClienteInfo {
  idCliente: number;
  referencia: string | null;
  cumple: Date | string | null;
  puntosfidelidad: number;
  direccion: string | null;
  telefono: string | null;
}

interface ModalTipoServicioProps {
  tipoServicio: TipoServicio;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MesaFormData | LlevarFormData | DomicilioFormData) => void;
  initialData?: MesaFormData | LlevarFormData | DomicilioFormData;
  clienteData?: ClientePreData;
}

const INITIAL_MESA_DATA: MesaFormData = {
  idmesa: null,
  nombremesa: '',
  telefonocontacto: ''
};

const INITIAL_LLEVAR_DATA: LlevarFormData = {
  cliente: '',
  idcliente: null,
  fechaprogramadaventa: '',
  telefonocontacto: ''
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
  initialData,
  clienteData
}) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [previousMesaId, setPreviousMesaId] = useState<number | null>(null);

  const [mesaFormData, setMesaFormData] = useState<MesaFormData>(INITIAL_MESA_DATA);
  const [llevarFormData, setLlevarFormData] = useState<LlevarFormData>(INITIAL_LLEVAR_DATA);
  const [domicilioFormData, setDomicilioFormData] = useState<DomicilioFormData>(INITIAL_DOMICILIO_DATA);

  // Cliente lookup states – DOMICILIO
  const [domicilioClienteInfo, setDomicilioClienteInfo] = useState<ClienteInfo | null>(null);
  const [domicilioSearching, setDomicilioSearching] = useState(false);
  const [domicilioClienteEncontrado, setDomicilioClienteEncontrado] = useState<boolean | null>(null);
  const domicilioSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cliente lookup states – LLEVAR
  const [llevarClienteInfo, setLlevarClienteInfo] = useState<ClienteInfo | null>(null);
  const [llevarSearching, setLlevarSearching] = useState(false);
  const [llevarClienteEncontrado, setLlevarClienteEncontrado] = useState<boolean | null>(null);
  const llevarSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cliente lookup states – MESA
  const [mesaClienteInfo, setMesaClienteInfo] = useState<ClienteInfo | null>(null);
  const [mesaSearching, setMesaSearching] = useState(false);
  const mesaSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const telefonoInputRef = useRef<HTMLInputElement>(null);

  const cargarMesas = async () => {
    try {
      const data = await obtenerMesas();
      const mesasInfo = data.map(m => ({ idmesa: m.idmesa, nombremesa: m.nombremesa }));
      const mesasOcupadasMap = await verificarMesasOcupadas(mesasInfo);
      const usuarioData = localStorage.getItem('usuario');
      if (!usuarioData) {
        console.warn('⚠️ Usuario no encontrado en localStorage. No se podrán actualizar estados de mesas.');
      }
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      const mesasValidadas = await Promise.all(
        data.map(async (mesa) => {
          const tieneVentaOrdenada = mesasOcupadasMap.get(mesa.nombremesa) || false;
          const estatusEsperado: 'OCUPADA' | 'DISPONIBLE' = tieneVentaOrdenada ? 'OCUPADA' : 'DISPONIBLE';
          if (mesa.estatusmesa !== estatusEsperado) {
            try {
              if (usuario) {
                await cambiarEstatusMesa(mesa.idmesa, estatusEsperado, usuario.alias || usuario.nombre);
                console.log(`Mesa ${mesa.nombremesa} actualizada a ${estatusEsperado}`);
                return { ...mesa, estatusmesa: estatusEsperado };
              } else {
                console.warn(`⚠️ No se pudo actualizar el estatus de la mesa ${mesa.nombremesa} porque no hay usuario autenticado.`);
              }
            } catch (error) {
              console.error(`Error al actualizar estatus de mesa ${mesa.nombremesa}:`, error);
            }
          }
          return mesa;
        })
      );
      const mesasDisponibles = mesasValidadas.filter(m => m.estatusmesa === 'DISPONIBLE');
      setMesas(mesasDisponibles);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  useEffect(() => {
    if (isOpen) {
      if (tipoServicio === 'Mesa') {
        cargarMesas();
        if (initialData && 'idmesa' in initialData) {
          setMesaFormData(initialData as MesaFormData);
          setPreviousMesaId(initialData.idmesa);
        } else {
          setMesaFormData(INITIAL_MESA_DATA);
        }
        setMesaClienteInfo(null);
      } else if (tipoServicio === 'Llevar') {
        if (initialData && 'fechaprogramadaventa' in initialData && !('direcciondeentrega' in initialData)) {
          setLlevarFormData(initialData as LlevarFormData);
        } else {
          setLlevarFormData({
            cliente: clienteData?.nombre || '',
            idcliente: clienteData?.idcliente ?? null,
            fechaprogramadaventa: getCurrentDateTime(),
            telefonocontacto: ''
          });
        }
        setLlevarClienteInfo(null);
        setLlevarClienteEncontrado(null);
      } else if (tipoServicio === 'Domicilio') {
        if (initialData && 'direcciondeentrega' in initialData) {
          setDomicilioFormData(initialData as DomicilioFormData);
          if ((initialData as DomicilioFormData).cliente) {
            setDomicilioClienteEncontrado(true);
          } else {
            setDomicilioClienteEncontrado(null);
          }
        } else {
          setDomicilioFormData({
            cliente: clienteData?.nombre || '',
            idcliente: clienteData?.idcliente ?? null,
            fechaprogramadaventa: getCurrentDateTime(),
            direcciondeentrega: '',
            telefonodeentrega: clienteData?.telefono || '',
            contactodeentrega: clienteData?.nombre || '',
            observaciones: ''
          });
          setDomicilioClienteEncontrado(clienteData?.nombre ? true : null);
        }
        setDomicilioClienteInfo(null);
      }
    }
  }, [isOpen, tipoServicio, initialData, clienteData]);

  useEffect(() => {
    if (isOpen && (tipoServicio === 'Domicilio' || tipoServicio === 'Llevar' || tipoServicio === 'Mesa')) {
      const timer = setTimeout(() => {
        telefonoInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tipoServicio]);

  const handleDomicilioTelefonoChange = (value: string) => {
    setDomicilioClienteEncontrado(null);
    setDomicilioClienteInfo(null);
    setDomicilioFormData(prev => ({
      ...prev,
      telefonodeentrega: value,
      cliente: '',
      idcliente: null,
      direcciondeentrega: ''
    }));

    if (domicilioSearchTimer.current) clearTimeout(domicilioSearchTimer.current);

    if (!value.trim()) {
      setDomicilioSearching(false);
      return;
    }

    setDomicilioSearching(true);
    domicilioSearchTimer.current = setTimeout(async () => {
      try {
        const resultados = await buscarClientesPorTelefono(value.trim());
        if (resultados.length > 0) {
          const c = resultados[0];
          setDomicilioClienteInfo({
            idCliente: c.idCliente,
            referencia: c.referencia ?? null,
            cumple: c.cumple ?? null,
            puntosfidelidad: c.puntosfidelidad ?? 0,
            direccion: c.direccion ?? null,
            telefono: c.telefono ?? null
          });
          setDomicilioFormData(prev => ({
            ...prev,
            telefonodeentrega: c.telefono || prev.telefonodeentrega,
            cliente: c.referencia || c.nombre || '',
            idcliente: c.idCliente,
            direcciondeentrega: c.direccion || ''
          }));
          setDomicilioClienteEncontrado(true);
        } else {
          setDomicilioClienteInfo(null);
          setDomicilioClienteEncontrado(false);
        }
      } catch {
        setDomicilioClienteInfo(null);
        setDomicilioClienteEncontrado(false);
      } finally {
        setDomicilioSearching(false);
      }
    }, 500);
  };

  const ejecutarBusquedaLlevar = async (telefono: string) => {
    if (!telefono.trim()) return;
    setLlevarSearching(true);
    try {
      const resultados = await buscarClientesPorTelefono(telefono.trim());
      if (resultados.length > 0) {
        const c = resultados[0];
        setLlevarClienteInfo({
          idCliente: c.idCliente,
          referencia: c.referencia ?? null,
          cumple: c.cumple ?? null,
          puntosfidelidad: c.puntosfidelidad ?? 0,
          direccion: c.direccion ?? null,
          telefono: c.telefono ?? null
        });
        setLlevarFormData(prev => ({
          ...prev,
          telefonocontacto: c.telefono || prev.telefonocontacto,
          cliente: c.referencia || c.nombre || 'mostrador',
          idcliente: c.idCliente
        }));
        setLlevarClienteEncontrado(true);
      } else {
        setLlevarClienteInfo(null);
        setLlevarClienteEncontrado(false);
        setLlevarFormData(prev => ({ ...prev, cliente: 'mostrador', idcliente: null }));
      }
    } catch {
      setLlevarClienteInfo(null);
      setLlevarClienteEncontrado(false);
      setLlevarFormData(prev => ({ ...prev, cliente: 'mostrador', idcliente: null }));
    } finally {
      setLlevarSearching(false);
    }
  };

  const handleLlevarTelefonoChange = (value: string) => {
    setLlevarFormData(prev => ({ ...prev, telefonocontacto: value, cliente: '', idcliente: null }));
    setLlevarClienteInfo(null);
    setLlevarClienteEncontrado(null);

    if (llevarSearchTimer.current) clearTimeout(llevarSearchTimer.current);

    if (!value.trim()) {
      setLlevarSearching(false);
      return;
    }

    setLlevarSearching(true);
    llevarSearchTimer.current = setTimeout(() => {
      ejecutarBusquedaLlevar(value);
    }, 500);
  };

  const handleLlevarTelefonoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (llevarSearchTimer.current) clearTimeout(llevarSearchTimer.current);
      ejecutarBusquedaLlevar(llevarFormData.telefonocontacto || '');
    }
  };

  const handleMesaTelefonoChange = (value: string) => {
    setMesaFormData(prev => ({ ...prev, telefonocontacto: value }));
    setMesaClienteInfo(null);

    if (mesaSearchTimer.current) clearTimeout(mesaSearchTimer.current);

    if (!value.trim()) {
      setMesaSearching(false);
      return;
    }

    setMesaSearching(true);
    mesaSearchTimer.current = setTimeout(async () => {
      try {
        const resultados = await buscarClientesPorTelefono(value.trim());
        if (resultados.length > 0) {
          const c = resultados[0];
          setMesaClienteInfo({
            idCliente: c.idCliente,
            referencia: c.referencia ?? null,
            cumple: c.cumple ?? null,
            puntosfidelidad: c.puntosfidelidad ?? 0,
            direccion: c.direccion ?? null,
            telefono: c.telefono ?? null
          });
          if (c.telefono) {
            setMesaFormData(prev => ({ ...prev, telefonocontacto: c.telefono! }));
          }
        } else {
          setMesaClienteInfo(null);
        }
      } catch {
        setMesaClienteInfo(null);
      } finally {
        setMesaSearching(false);
      }
    }, 500);
  };

  const handleSave = async () => {
    if (tipoServicio === 'Mesa') {
      if (!mesaFormData.idmesa) {
        alert('Por favor seleccione una mesa');
        return;
      }
      try {
        const usuarioData = localStorage.getItem('usuario');
        if (!usuarioData) {
          alert('Error: Usuario no autenticado');
          return;
        }
        const usuario = JSON.parse(usuarioData);
        await cambiarEstatusMesa(mesaFormData.idmesa, 'OCUPADA', usuario.alias || usuario.nombre);
        onSave(mesaFormData);
      } catch (error) {
        console.error('Error al actualizar estatus de mesa:', error);
        alert('Error al configurar la mesa. Por favor intente nuevamente.');
      }
    } else if (tipoServicio === 'Llevar') {
      if (!llevarFormData.fechaprogramadaventa) {
        alert('Por favor seleccione la fecha y hora de entrega');
        return;
      }
      const clienteNombre = llevarFormData.cliente.trim() || 'mostrador';
      onSave({ ...llevarFormData, cliente: clienteNombre });
    } else if (tipoServicio === 'Domicilio') {
      if (!domicilioFormData.telefonodeentrega.trim()) {
        alert('Por favor ingrese el teléfono del cliente');
        return;
      }
      if (domicilioClienteEncontrado !== true) {
        alert('No se encontró cliente con ese número de teléfono. Regístrelo primero en el módulo de Clientes.');
        return;
      }
      if (!domicilioFormData.fechaprogramadaventa) {
        alert('Por favor seleccione la fecha y hora de entrega');
        return;
      }
      const clienteNombre = domicilioFormData.cliente.trim() || 'mostrador';
      onSave({ ...domicilioFormData, cliente: clienteNombre });
    }
  };

  const handleCancel = async () => {
    try {
      if (tipoServicio === 'Mesa' && previousMesaId) {
        const usuarioData = localStorage.getItem('usuario');
        if (usuarioData) {
          const usuario = JSON.parse(usuarioData);
          await cambiarEstatusMesa(previousMesaId, 'DISPONIBLE', usuario.alias || usuario.nombre);
        }
      }
    } catch (error) {
      console.error('Error al actualizar estatus de mesa:', error);
    }
    setMesaFormData(INITIAL_MESA_DATA);
    setLlevarFormData(INITIAL_LLEVAR_DATA);
    setDomicilioFormData(INITIAL_DOMICILIO_DATA);
    setDomicilioClienteInfo(null);
    setDomicilioClienteEncontrado(null);
    setLlevarClienteInfo(null);
    setMesaClienteInfo(null);
    setPreviousMesaId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-servicio">
      <div className="modal-content-servicio">
        <div className="modal-header-servicio">
          <h2>Configurar Servicio: {tipoServicio}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-servicio">
          {/* ── MESA ── */}
          {tipoServicio === 'Mesa' && (
            <>
              <div className="form-group">
                <label htmlFor="mesa">Seleccionar Mesa *</label>
                <select
                  id="mesa"
                  className="form-control"
                  value={mesaFormData.idmesa || ''}
                  onChange={(e) => {
                    const selectedMesa = mesas.find(m => m.idmesa === Number(e.target.value));
                    setMesaFormData(prev => ({
                      ...prev,
                      idmesa: Number(e.target.value),
                      nombremesa: selectedMesa?.nombremesa || ''
                    }));
                  }}
                >
                  <option value="">Seleccione una mesa</option>
                  {mesas.map((mesa) => (
                    <option key={mesa.idmesa} value={mesa.idmesa}>
                      {mesa.numeromesa} {mesa.nombremesa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="telefono-mesa">Teléfono Cliente</label>
                <div className="input-search-wrapper">
                  <input
                    ref={telefonoInputRef}
                    type="tel"
                    id="telefono-mesa"
                    className="form-control"
                    value={mesaFormData.telefonocontacto || ''}
                    onChange={(e) => handleMesaTelefonoChange(e.target.value)}
                    placeholder="Buscar cliente por teléfono"
                  />
                  {mesaSearching && <Search size={16} className="search-spinner-icon" />}
                </div>
              </div>

              {mesaClienteInfo && (
                <div className="cliente-lookup-info">
                  <span className="cliente-lookup-nombre">{mesaClienteInfo.referencia || 'mostrador'}</span>
                  <span className="cliente-lookup-puntos">⭐ {mesaClienteInfo.puntosfidelidad} pts</span>
                  {mesaClienteInfo.telefono && (
                    <span className="cliente-lookup-telefono">📞 {mesaClienteInfo.telefono}</span>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── LLEVAR ── */}
          {tipoServicio === 'Llevar' && (
            <>
              <div className="form-group">
                <label htmlFor="telefono-llevar">Teléfono Cliente</label>
                <div className="input-search-wrapper">
                  <input
                    ref={telefonoInputRef}
                    type="tel"
                    id="telefono-llevar"
                    className="form-control"
                    value={llevarFormData.telefonocontacto || ''}
                    onChange={(e) => handleLlevarTelefonoChange(e.target.value)}
                    onKeyDown={handleLlevarTelefonoKeyDown}
                    placeholder="Buscar cliente por teléfono"
                  />
                  {llevarSearching
                    ? <Search size={16} className="search-spinner-icon" />
                    : (
                      <button
                        type="button"
                        className="btn-buscar-telefono"
                        onClick={() => {
                          if (llevarSearchTimer.current) clearTimeout(llevarSearchTimer.current);
                          ejecutarBusquedaLlevar(llevarFormData.telefonocontacto || '');
                        }}
                        title="Buscar cliente"
                      >
                        <Search size={16} />
                      </button>
                    )
                  }
                </div>
                {llevarClienteEncontrado === false && (llevarFormData.telefonocontacto || '').trim() !== '' && (
                  <span className="campo-error-msg">
                    ⚠ No se encontró cliente con ese teléfono. Regístrelo primero en el módulo de Clientes.
                  </span>
                )}
              </div>

              {llevarClienteInfo && (
                <div className="cliente-lookup-info">
                  <span className="cliente-lookup-nombre">{llevarClienteInfo.referencia || 'mostrador'}</span>
                  <span className="cliente-lookup-puntos">⭐ {llevarClienteInfo.puntosfidelidad} pts</span>
                  {llevarClienteInfo.telefono && (
                    <span className="cliente-lookup-telefono">📞 {llevarClienteInfo.telefono}</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cliente-llevar">Nombre del Cliente (auto)</label>
                <input
                  type="text"
                  id="cliente-llevar"
                  className="form-control form-control-readonly"
                  value={llevarFormData.cliente}
                  readOnly
                  placeholder="Se completa al buscar por teléfono"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fechaprogramada-llevar">Fecha y Hora de Entrega *</label>
                <input
                  type="datetime-local"
                  id="fechaprogramada-llevar"
                  className="form-control"
                  value={llevarFormData.fechaprogramadaventa}
                  onChange={(e) => setLlevarFormData(prev => ({ ...prev, fechaprogramadaventa: e.target.value }))}
                />
              </div>
            </>
          )}

          {/* ── DOMICILIO ── */}
          {tipoServicio === 'Domicilio' && (
            <>
              {/* 1. Teléfono del cliente – EDITABLE – PRIMER CAMPO */}
              <div className="form-group">
                <label htmlFor="telefono-domicilio">Teléfono del Cliente *</label>
                <div className="input-search-wrapper">
                  <input
                    ref={telefonoInputRef}
                    type="tel"
                    id="telefono-domicilio"
                    className="form-control"
                    value={domicilioFormData.telefonodeentrega}
                    onChange={(e) => handleDomicilioTelefonoChange(e.target.value)}
                    placeholder="Ingrese el teléfono para buscar cliente"
                  />
                  {domicilioSearching && <Search size={16} className="search-spinner-icon" />}
                </div>
                {domicilioClienteEncontrado === false && domicilioFormData.telefonodeentrega.trim() !== '' && (
                  <span className="campo-error-msg">
                    ⚠ No se encontró cliente con ese teléfono. Regístrelo primero en el módulo de Clientes.
                  </span>
                )}
                {domicilioClienteEncontrado === true && domicilioClienteInfo && (
                  <div className="cliente-lookup-info">
                    <span className="cliente-lookup-nombre">{domicilioClienteInfo.referencia || domicilioFormData.cliente}</span>
                    <span className="cliente-lookup-puntos">⭐ {domicilioClienteInfo.puntosfidelidad} pts</span>
                  </div>
                )}
              </div>

              {/* 2. Fecha y hora de entrega – EDITABLE */}
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

              {/* 3. Dirección de entrega – READ-ONLY */}
              <div className="form-group">
                <label htmlFor="direccion-domicilio">Dirección de Entrega</label>
                <input
                  type="text"
                  id="direccion-domicilio"
                  className="form-control form-control-readonly"
                  value={domicilioFormData.direcciondeentrega}
                  readOnly
                  placeholder="Se completa al encontrar cliente por teléfono"
                />
              </div>

              {/* 4. Nombre del cliente – READ-ONLY – en la posición antigua del teléfono */}
              <div className="form-group">
                <label htmlFor="cliente-domicilio">Nombre del Cliente</label>
                <input
                  type="text"
                  id="cliente-domicilio"
                  className="form-control form-control-readonly"
                  value={domicilioFormData.cliente}
                  readOnly
                  placeholder="Se completa al encontrar cliente por teléfono"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contacto-domicilio">Referencia del Cliente</label>
                <input
                  type="text"
                  id="contacto-domicilio"
                  className="form-control"
                  value={domicilioFormData.contactodeentrega}
                  onChange={(e) => setDomicilioFormData(prev => ({ ...prev, contactodeentrega: e.target.value }))}
                  placeholder="Nombre de quien recibe, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones-domicilio">Nota Adicional del Pedido</label>
                <textarea
                  id="observaciones-domicilio"
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

// src/components/ClienteForm.tsx
import React, { useState, useEffect } from "react";
import "./ClienteForm.css";

export interface Cliente {
  id_cliente?: number;
  numerodecliente: string;
  nombre_cliente: string;
  estado_activo: boolean;
  fecha_creacion?: string;
}

interface ClienteFormProps {
  visible: boolean;
  initialData?: Cliente;
  onSubmit: (cliente: Cliente) => void;
  onCancel?: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({
  visible,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [numerodecliente, setNumeroDeCliente] = useState("");
  const [nombre_cliente, setNombreCliente] = useState("");
  const [estado_activo, setEstadoActivo] = useState(true);
  const [errors, setErrors] = useState<{ numerodecliente?: string; nombre_cliente?: string }>({});

  useEffect(() => {
    if (initialData) {
      setNumeroDeCliente(initialData.numerodecliente);
      setNombreCliente(initialData.nombre_cliente);
      setEstadoActivo(initialData.estado_activo);
    } else {
      setNumeroDeCliente("");
      setNombreCliente("");
      setEstadoActivo(true);
    }
    setErrors({});
  }, [initialData, visible]);

  if (!visible) return null;

  const handleGuardar = async () => {
    const newErrors: typeof errors = {};
    if (!numerodecliente.trim()) newErrors.numerodecliente = "El número de cliente es obligatorio";
    if (!nombre_cliente.trim()) newErrors.nombre_cliente = "El nombre del cliente es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cliente: Cliente = {
      id_cliente: initialData?.id_cliente,
      numerodecliente,
      nombre_cliente,
      estado_activo,
      fecha_creacion: initialData?.fecha_creacion || new Date().toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validar-cliente`, {
        method: cliente.id_cliente ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });

      if (!response.ok) throw new Error("Error al guardar el cliente");

      const savedCliente = await response.json();
      onSubmit(savedCliente);

      // Limpiar formulario
      setNumeroDeCliente("");
      setNombreCliente("");
      setEstadoActivo(true);
      setErrors({});
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el cliente");
    }
  };

  const handleCancelar = () => {
    setNumeroDeCliente("");
    setNombreCliente("");
    setEstadoActivo(true);
    setErrors({});
    onCancel && onCancel();
  };

  return (
    <div className="cliente-form-container">
      <div className="cliente-form-card">
        {initialData?.id_cliente && (
          <div className="form-group">
            <label>ID Cliente</label>
            <input type="text" value={initialData.id_cliente} readOnly />
          </div>
        )}

        <div className="form-group">
          <label>Número de Cliente *</label>
          <input
            type="text"
            value={numerodecliente}
            onChange={(e) => setNumeroDeCliente(e.target.value)}
            className={errors.numerodecliente ? "error" : ""}
          />
          {errors.numerodecliente && <span className="error-msg">{errors.numerodecliente}</span>}
        </div>

        <div className="form-group">
          <label>Nombre del Cliente *</label>
          <input
            type="text"
            value={nombre_cliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className={errors.nombre_cliente ? "error" : ""}
          />
          {errors.nombre_cliente && <span className="error-msg">{errors.nombre_cliente}</span>}
        </div>

        <div className="form-group">
          <label>Activo</label>
          <input
            type="checkbox"
            checked={estado_activo}
            onChange={(e) => setEstadoActivo(e.target.checked)}
          />
        </div>

        {initialData?.fecha_creacion && (
          <div className="form-group">
            <label>Fecha Creación</label>
            <input type="text" value={initialData.fecha_creacion} readOnly />
          </div>
        )}

        <div className="form-buttons">
          <button type="button" className="btn-guardar" onClick={handleGuardar}>
            Guardar
          </button>
          <button type="button" className="btn-cancelar" onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteForm;

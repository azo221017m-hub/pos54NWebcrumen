import React, { useState } from "react";
import "./FormInsertNegocio.css";

interface FormInsertNegocioProps {
  usuario: string;
}

export const FormInsertNegocio: React.FC<FormInsertNegocioProps> = ({ usuario }) => {
  const [formData, setFormData] = useState({
    numerocliente: "",
    nombreNegocio: "",
    rfc: "",
    direccion: "",
    telefono: "",
  });

  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" | "warn" } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numerocliente || !formData.rfc || !formData.direccion || !formData.telefono) {
      setMensaje({ texto: "Por favor llena los campos obligatorios.", tipo: "warn" });
      setTimeout(() => setMensaje(null), 1500);
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/insertar`;
      console.log("🌐 Enviando datos a:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          usuario,
        }),
      });

      if (response.ok) {
        setMensaje({ texto: "Negocio guardado correctamente ✅", tipo: "ok" });
        setFormData({
          numerocliente: "",
          nombreNegocio: "",
          rfc: "",
          direccion: "",
          telefono: "",
        });
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      console.error("❌ Error al conectar con el servidor:", error);
      setMensaje({ texto: "Error al conectar con el servidor ❌", tipo: "error" });
    }

    setTimeout(() => setMensaje(null), 1500);
  };

  return (
    <div className="form-insert-container">
      <h2>Registrar Negocio</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="numerocliente"
          placeholder="Número de cliente *"
          value={formData.numerocliente}
          onChange={handleChange}
        />
        <input
          name="nombreNegocio"
          placeholder="Nombre del negocio"
          value={formData.nombreNegocio}
          onChange={handleChange}
        />
        <input name="rfc" placeholder="RFC *" value={formData.rfc} onChange={handleChange} />
        <textarea
          name="direccion"
          placeholder="Dirección *"
          value={formData.direccion}
          onChange={handleChange}
        ></textarea>
        <input name="telefono" placeholder="Teléfono *" value={formData.telefono} onChange={handleChange} />
        <button type="submit">Guardar</button>
      </form>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
    </div>
  );
};

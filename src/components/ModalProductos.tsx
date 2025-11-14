import React, { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  onClose: () => void;
}

export default function ModalProductos({ onClose }: Props) {
  const [categorias, setCategorias] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [form, setForm] = useState({
    idCategoria: "",
    idreferencia: "",
    nombre: "",
    descripcion: "",
    precio: "",
    porcentajeGanancia: "",
    estatus: 1,
    idmoderador: "",
    usuarioauditoria: "",
    idnegocio: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
      const [cat, ins] = await Promise.all([
        axios.get("/api/categorias"),
        axios.get("/api/insumos"),
      ]);
      setCategorias(cat.data.data || []);
      setInsumos(ins.data.data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "porcentajeGanancia" && form.precio) {
      const base = Number(form.precio);
      const pct = Number(e.target.value);
      setForm(f => ({ ...f, precio: (base * (1 + pct / 100)).toFixed(2) }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.descripcion) {
      setMsg("Nombre y descripción son obligatorios");
      return;
    }
    const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imagen) fd.append("imagenProducto", imagen);
    try {
      const res = await axios.post("/api/productos", fd);
      if (res.data.success) {
        setMsg("Producto guardado correctamente");
        setTimeout(onClose, 1000);
      } else {
        setMsg("Error al guardar producto");
      }
    } catch {
      setMsg("Error de red o servidor");
    }
  };

  return (
    <div className="modal-productos">
      <form className="productos-form" onSubmit={handleSubmit}>
        <h3>Agregar Producto</h3>
        <label>Categoría
          <select name="idCategoria" value={form.idCategoria} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {categorias.map((c: any) => (
              <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label>Referencia
          <select name="idreferencia" value={form.idreferencia} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {insumos.map((i: any) => (
              <option key={i.idreferencia} value={i.idreferencia}>{i.nombre}</option>
            ))}
          </select>
        </label>
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required style={{ resize: "none", height: 60 }} />
        </label>
        <label>Precio
          <input name="precio" value={form.precio} onChange={handleChange} required type="number" step="0.01" />
        </label>
        <label>% Ganancia
          <input name="porcentajeGanancia" value={form.porcentajeGanancia} onChange={handleChange} type="number" step="0.01" />
        </label>
        <label>Estatus
          <input type="checkbox" name="estatus" checked={form.estatus === 1} onChange={e => setForm(f => ({ ...f, estatus: e.target.checked ? 1 : 0 }))} />
          <span>{form.estatus === 1 ? "Activo" : "Inactivo"}</span>
        </label>
        <label>Imagen
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} id="imgprod" />
          <label htmlFor="imgprod" className="img-btn">📷</label>
          {preview && <img src={preview} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />}
        </label>
        <button type="submit" className="save-btn">Guardar</button>
        <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
        {msg && <div className="form-msg">{msg}</div>}
      </form>
    </div>
  );
}

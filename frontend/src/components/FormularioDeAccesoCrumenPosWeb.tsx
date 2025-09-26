// src/components/FormularioDeAccesoCrumenPosWeb.tsx
import React, { useState, useEffect } from "react";
import { validarCliente, validarUsuario } from "../services/apiAuth";
import "./FormularioDeAccesoCrumenPosWeb.css";
import LogoCrumen from '../assets/logoposweb-crumen.svg';

interface FormularioProps {
  onAccesoExitoso: () => void;
}

const FormularioDeAccesoCrumenPosWeb: React.FC<FormularioProps> = ({
  onAccesoExitoso,
}) => {
  const [numerodecliente, setNumerodecliente] = useState("");
  const [nombredeusuario, setNombredeusuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [accesoConcedido, setAccesoConcedido] = useState(false);
  const [popup, setPopup] = useState<{ mensaje: string; tipo: "success" | "error" } | null>(null);

  // Oculta popup después de 3s
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleIngreso = async () => {
    setError("");

    if (!accesoConcedido) {
      if (!numerodecliente) {
        setError("Por favor ingrese el número de cliente.");
        return;
      }
      const resp = await validarCliente(numerodecliente);
      if (resp.ok) {
        setAccesoConcedido(true);
        setPopup({ mensaje: "Cliente válido, ingrese usuario y contraseña", tipo: "success" });
      } else {
        setPopup({ mensaje: resp.error || "Cliente no encontrado", tipo: "error" });
      }
      return;
    }

    if (!nombredeusuario || !contrasenia) {
      setError("Por favor complete usuario y contraseña.");
      return;
    }

    const resp = await validarUsuario(nombredeusuario, contrasenia);
    if (resp.ok) {
      setPopup({ mensaje: "Acceso concedido", tipo: "success" });
      onAccesoExitoso();
    } else {
      setNombredeusuario("");
      setContrasenia("");
      setPopup({ mensaje: "Usuario o contraseña incorrectos", tipo: "error" });
    }
  };

  return (
    <section className="login-grid">
      {/* Panel Izquierdo */}
      <aside className="panel left">
        <img
          src={LogoCrumen}
          alt="Logo CRUMEN"
          className="logo"
        />
        <h1>Pos54nWeb</h1>
        <p>
          Más que una comanda digital,<br />
          es un sistema ligero para negocios locales.
        </p>
      </aside>

      {/* Panel Derecho */}
      <main className="panel right">
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            handleIngreso();
          }}
        >
          <h2>Iniciar sesión</h2>

          {/* Paso 1: Cliente */}
          {!accesoConcedido && (
            <label className="field">
              <span>Número de cliente</span>
              <input
                type="text"
                placeholder="Ej: 10023"
                value={numerodecliente}
                onChange={(e) => setNumerodecliente(e.target.value)}
              />
            </label>
          )}

          {/* Paso 2: Usuario */}
          {accesoConcedido && (
            <>
              <label className="field">
                <span>Usuario</span>
                <input
                  type="text"
                  placeholder="usuario@empresa"
                  value={nombredeusuario}
                  onChange={(e) => setNombredeusuario(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Contraseña</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                />
              </label>
            </>
          )}

          {error && <div className="toast error">{error}</div>}

          <button type="submit" className="btn">
            {accesoConcedido ? "Ingresar" : "Validar Cliente"}
          </button>

          {popup && (
            <div className={`toast ${popup.tipo}`} role="status">
              {popup.mensaje}
            </div>
          )}
        </form>

        <footer className="meta">
          <small>© {new Date().getFullYear()} POSW38Crum3n. Todos los derechos reservados.</small>
        </footer>
      </main>
    </section>
  );
};

export default FormularioDeAccesoCrumenPosWeb;

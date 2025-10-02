// src/components/FormularioDeAccesoCrumenPosWeb.tsx
import React, { useState, useEffect } from "react";
import { validarCliente, validarUsuario } from "../services/apiAuth";
import Pantalla from './Pantalla';
import "./FormularioDeAccesoCrumenPosWeb.css";


interface FormularioProps {
  onAccesoExitoso: () => void;
}

const FormularioDeAccesoCrumenPosWeb: React.FC<FormularioProps> = ({ onAccesoExitoso }) => {
  const [numerodecliente, setNumerodecliente] = useState("");
  const [nombredeusuario, setNombredeusuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [accesoConcedido, setAccesoConcedido] = useState(false);
  const [popup, setPopup] = useState<{ mensaje: string; tipo: "success" | "error" } | null>(null);
  const [mostrarPVenta, setMostrarPVenta] = useState(false);

  // Oculta popup después de 3s
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleIngreso = async () => {
    setError("");

    // Paso 1: validar cliente
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

    // Paso 2: validar usuario
    if (!nombredeusuario || !contrasenia) {
      setError("Por favor complete usuario y contraseña.");
      return;
    }

    const resp = await validarUsuario(nombredeusuario, contrasenia);
    if (resp.ok) {
      // Mostrar popup
     //420 setPopup({ mensaje: "Acceso concedid0 ✅", tipo: "success" });

      // Guardar usuario en sessionStorage
      sessionStorage.setItem(
        "texco_user",
        JSON.stringify({ user: nombredeusuario, role: resp.role || "usuario" })
      );

      // Mostrar pantalla PVenta
      setMostrarPVenta(true);

    } else {
      setNombredeusuario("");
      setContrasenia("");
      setPopup({ mensaje: "Usuario o contraseña incorrectos ❌", tipo: "error" });
    }
  };

  // ✅ Si ya se concedió acceso, mostrar PVentaCrumenPosWeb
  if (mostrarPVenta) {
    return (
      <>
                <Pantalla/>
      </>
    );
  }

  // Formulario de acceso
  return (
    <section className="login-grid">
      {/* Panel Izquierdo */}
      <aside className="panel left">
        <img
          src="/assets/logoposweb-crumen.svg"
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
      </main>

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} POSW38Crum3n. Todos los derechos reservados.</small>
      </footer>
    </section>
  );
};

export default FormularioDeAccesoCrumenPosWeb;

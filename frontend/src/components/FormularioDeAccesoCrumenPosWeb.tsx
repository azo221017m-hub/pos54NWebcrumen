import React, { useState, useEffect } from 'react';
import './FormularioDeAccesoCrumenPosWeb.css';
import { validarCliente, validarUsuario } from '../services/apiAuth';

interface FormularioProps {
  onAccesoExitoso: () => void;
}

const FormularioDeAccesoCrumenPosWeb: React.FC<FormularioProps> = ({ onAccesoExitoso }) => {
  const [numerodecliente, setNumerodecliente] = useState('');
  const [nombredeusuario, setNombredeusuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [accesoConcedido, setAccesoConcedido] = useState(false);

  const [popup, setPopup] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);

  // Desaparecer popup después de 3 segundos
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleIngreso = async () => {
    setError('');

    // Paso 1: validar cliente
    if (!accesoConcedido) {
      if (!numerodecliente) {
        setError('Por favor ingrese el número de cliente.');
        return;
      }

      console.log('[FRONT] Validando cliente:', numerodecliente);
      const resp = await validarCliente(numerodecliente);
      console.log('[FRONT] Respuesta validarCliente:', resp);

      if (resp.ok) {
        setAccesoConcedido(true);
        setPopup({ mensaje: 'Cliente válido, ingrese usuario y contraseña', tipo: 'success' });
      } else {
        setPopup({ mensaje: resp.error || 'Cliente no encontrado', tipo: 'error' });
      }

      return;
    }

    // Paso 2: validar usuario
    if (!nombredeusuario || !contrasenia) {
      setError('Por favor complete usuario y contraseña.');
      return;
    }

    console.log('[FRONT] Validando usuario:', nombredeusuario);
    const resp = await validarUsuario(nombredeusuario, contrasenia);
    console.log('[FRONT] Respuesta validarUsuario:', resp);

    if (resp.ok) {
      setPopup({ mensaje: 'Acceso concedido', tipo: 'success' });
      onAccesoExitoso(); // avisamos al componente padre
    } else {
      setNombredeusuario('');
      setContrasenia('');
      setPopup({ mensaje: 'Usuario no encontrado o contraseña incorrecta', tipo: 'error' });
    }
  };

  return (
    <div className="formulario-acceso">
      <input
        type="text"
        placeholder="Número de cliente"
        className="input-acceso"
        value={numerodecliente}
        onChange={(e) => setNumerodecliente(e.target.value)}
        disabled={accesoConcedido}
      />

      {accesoConcedido && (
        <>
          <input
            type="text"
            className="input-acceso"
            placeholder="Nombre de usuario"
            value={nombredeusuario}
            onChange={(e) => setNombredeusuario(e.target.value)}
          />
          <input
            type="password"
            className="input-acceso"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
        </>
      )}

      {error && <div className="error">{error}</div>}

      <button onClick={handleIngreso}>
        {accesoConcedido ? 'Ingresar Usuario' : 'Validar Cliente'}
      </button>

      {/* Popup */}
      {popup && (
        <div className={`popup ${popup.tipo}`}>
          {popup.mensaje}
        </div>
      )}
    </div>
  );
};

export default FormularioDeAccesoCrumenPosWeb;

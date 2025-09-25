import React, { useState } from 'react';
import { validarCliente, validarUsuario } from '../services/apiAuth'; // ajusta según tu archivo real
import './TestApi.css'; // CSS separado para mantener limpio el componente

const TestApi: React.FC = () => {
  const [cliente, setCliente] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [resultado, setResultado] = useState('');

  const testCliente = async () => {
    console.log('[TEST] Enviando validarCliente con:', cliente);
    const resp = await validarCliente(cliente);
    console.log('[TEST] Respuesta validarCliente:', resp);
    setResultado(JSON.stringify(resp, null, 2));
  };

  const testUsuario = async () => {
    console.log('[TEST] Enviando validarUsuario con:', { usuario, contrasenia });
    const resp = await validarUsuario(usuario, contrasenia);
    console.log('[TEST] Respuesta validarUsuario:', resp);
    setResultado(JSON.stringify(resp, null, 2));
  };

  return (
    <div className="test-container">
      <h2 className="title">💻 Test API CrumenPosWeb</h2>

      <div className="card">
        <h3>🔹 Validar Cliente</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Número de cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
          <button onClick={testCliente}>Test Cliente</button>
        </div>
      </div>

      <div className="card">
        <h3>🔹 Validar Usuario</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
          <button onClick={testUsuario}>Test Usuario</button>
        </div>
      </div>

      <div className="resultado-card">
        <h3>📝 Resultado:</h3>
        <pre>{resultado}</pre>
      </div>
    </div>
  );
};

export default TestApi;

import React, { useState } from 'react';
import { validarCliente, validarUsuario } from '../config/api';

const TestApi: React.FC = () => {
  const [cliente, setCliente] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [resultado, setResultado] = useState('');

  const testCliente = async () => {
    console.log('[TEST] Enviando validarCliente con:', cliente);
    const resp = await validarCliente(cliente);
    console.log('[TEST] Respuesta validarCliente:', resp);
    setResultado(JSON.stringify(resp));
  };

  const testUsuario = async () => {
    console.log('[TEST] Enviando validarUsuario con:', { usuario, contrasenia });
    const resp = await validarUsuario(usuario, contrasenia);
    console.log('[TEST] Respuesta validarUsuario:', resp);
    setResultado(JSON.stringify(resp));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test API CrumenPosWeb</h2>

      <div>
        <input
          type="text"
          placeholder="Número de cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
        <button onClick={testCliente}>Test Cliente</button>
      </div>

      <div style={{ marginTop: 10 }}>
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

      <div style={{ marginTop: 20 }}>
        <strong>Resultado:</strong>
        <pre>{resultado}</pre>
      </div>
    </div>
  );
};

export default TestApi;

import React, { useState, useEffect } from 'react';
import { crearTurno } from '../../services/turnosService';
import { getUsuarioData } from '../../services/sessionService';
import './ModalIniciaTurno.css';

interface ModalIniciaTurnoProps {
  isOpen: boolean;
  onTurnoIniciado: (turnoId: number, claveturno: string) => void;
  usuarioAlias?: string;
}

const ModalIniciaTurno: React.FC<ModalIniciaTurnoProps> = ({ 
  isOpen, 
  onTurnoIniciado,
  usuarioAlias = 'Usuario'
}) => {
  // Estado para los valores del formulario
  const [fondoCaja, setFondoCaja] = useState('');
  const [usaObjetivo, setUsaObjetivo] = useState(false);
  const [objetivoVenta, setObjetivoVenta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claveturno, setClaveturno] = useState<string>('');
  const [frasePersonalizada, setFrasePersonalizada] = useState<string>('');
  
  // Generate temporary ID preview and get user phrase
  useEffect(() => {
    if (isOpen) {
      // Generate temporary claveturno preview
      const now = new Date();
      const aa = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setClaveturno(`${aa}${mm}${dd}...`);

      // Get user data and frasepersonal
      const usuario = getUsuarioData();
      if (usuario && usuario.frasepersonal && typeof usuario.frasepersonal === 'string' && usuario.frasepersonal.trim() !== '') {
        setFrasePersonalizada(usuario.frasepersonal);
      } else {
        setFrasePersonalizada(`¡${usuarioAlias}, prepárate para un turno exitoso!`);
      }
    }
  }, [isOpen, usuarioAlias]);

  // Manejador para iniciar turno
  const handleIniciarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare metaturno value: only send if checkbox is checked and value is provided
      const metaturno = usaObjetivo && objetivoVenta ? parseFloat(objetivoVenta) : null;
      
      // Prepare fondoCaja value: parse the input value and validate it's a valid number
      const fondoCajaValue = fondoCaja ? parseFloat(fondoCaja) : 0;
      if (isNaN(fondoCajaValue) || fondoCajaValue < 0) {
        setError('El importe de fondo de caja debe ser un valor numérico válido.');
        setIsLoading(false);
        return;
      }
      
      // Call API to create turno with metaturno and fondoCaja
      const response = await crearTurno(metaturno, fondoCajaValue);
      console.log('Turno iniciado:', response);
      
      // Update claveturno display with actual value from server
      setClaveturno(response.claveturno);
      
      // Notify parent component
      onTurnoIniciado(response.idturno, response.claveturno);
    } catch (err) {
      console.error('Error al iniciar turno:', err);
      setError('Error al iniciar el turno. Por favor, intente nuevamente.');
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFondoCaja('');
      setUsaObjetivo(false);
      setObjetivoVenta('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-inicia-turno-overlay">
      <div className="modal-inicia-turno-content">
        <div className="inicia-turno-card-modal">
          {/* Encabezado */}
          <div className="turno-header">
            <div className="header-text">
              <h2>Usted está por iniciar el turno</h2>
            </div>
            <div className="header-id">
              <span className="id-label">ID:</span>
              <span className="id-value">{claveturno}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleIniciarTurno}>
            {/* Campo: Fondo de Caja */}
            <div className="form-group">
              <label htmlFor="fondoCaja" className="form-label">
                Ingrese importe de Fondo de Caja
              </label>
              <input
                type="number"
                id="fondoCaja"
                className="form-input"
                value={fondoCaja}
                onChange={(e) => setFondoCaja(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            {/* Objetivo de venta */}
            <div className="form-group">
              <div className="objetivo-container">
                <div className="objetivo-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="usaObjetivo"
                    className="form-checkbox"
                    checked={usaObjetivo}
                    onChange={(e) => {
                      setUsaObjetivo(e.target.checked);
                      if (!e.target.checked) {
                        setObjetivoVenta('');
                      }
                    }}
                    disabled={isLoading}
                  />
                  <label htmlFor="usaObjetivo" className="checkbox-label">
                    ¿Quiere trabajar con Objetivo de venta?
                  </label>
                </div>
                <div className="objetivo-input-wrapper">
                  <input
                    type="number"
                    id="objetivoVenta"
                    className="form-input objetivo-input"
                    value={objetivoVenta}
                    onChange={(e) => setObjetivoVenta(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={!usaObjetivo || isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Frase personalizada */}
            <div className="frase-personalizada">
              <p>{frasePersonalizada}</p>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando...' : 'Iniciar TURNO'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalIniciaTurno;

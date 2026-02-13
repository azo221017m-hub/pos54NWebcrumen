import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket, disconnectSocket, getSocket } from '../config/socket';
import type { Socket } from '../config/socket';
import {
  ventasWebKeys,
  dashboardKeys,
  turnosKeys,
  pagosKeys,
  gastosKeys,
  movimientosKeys,
  inventarioKeys,
  productosKeys,
  insumosKeys,
} from '../config/queryKeys';

/**
 * WebSocketListener Component
 * 
 * Este componente debe montarse UNA SOLA VEZ en la raíz de la aplicación (App.tsx).
 * Gestiona la conexión WebSocket y escucha todos los eventos del servidor,
 * invalidando las queries correspondientes de React Query para actualizar
 * automáticamente todos los componentes que muestran esos datos.
 * 
 * IMPORTANTE:
 * - No renderiza nada visualmente (null)
 * - Se monta al inicio de la aplicación
 * - Se desmonta al cerrar la aplicación
 * - Limpia todos los listeners en el cleanup
 */
export const WebSocketListener: React.FC = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('🔌 Iniciando WebSocketListener...');
    
    // Inicializar socket (solo una vez)
    const socket = initSocket();
    socketRef.current = socket;

    // Listeners de eventos - Invalidar queries correspondientes

    /**
     * Evento: ventas:updated
     * Invalida todas las queries relacionadas con ventas
     */
    const handleVentasUpdated = () => {
      console.log('📡 Evento recibido: ventas:updated');
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: venta:created
     * Invalida queries de listas y dashboard
     */
    const handleVentaCreated = () => {
      console.log('📡 Evento recibido: venta:created');
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: venta:updated
     * Invalida queries de listas y detalles
     */
    const handleVentaUpdated = () => {
      console.log('📡 Evento recibido: venta:updated');
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
    };

    /**
     * Evento: venta:cancelled
     * Invalida queries de ventas y dashboard
     */
    const handleVentaCancelled = () => {
      console.log('📡 Evento recibido: venta:cancelled');
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: dashboard:updated
     * Invalida todas las queries del dashboard
     */
    const handleDashboardUpdated = () => {
      console.log('📡 Evento recibido: dashboard:updated');
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: turnos:updated
     * Invalida queries de turnos
     */
    const handleTurnosUpdated = () => {
      console.log('📡 Evento recibido: turnos:updated');
      queryClient.invalidateQueries({ queryKey: turnosKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };

    /**
     * Evento: turno:opened
     * Invalida queries de turnos y turno abierto
     */
    const handleTurnoOpened = () => {
      console.log('📡 Evento recibido: turno:opened');
      queryClient.invalidateQueries({ queryKey: turnosKeys.all });
      queryClient.invalidateQueries({ queryKey: turnosKeys.abierto() });
    };

    /**
     * Evento: turno:closed
     * Invalida queries de turnos, dashboard y ventas
     */
    const handleTurnoClosed = () => {
      console.log('📡 Evento recibido: turno:closed');
      queryClient.invalidateQueries({ queryKey: turnosKeys.all });
      queryClient.invalidateQueries({ queryKey: turnosKeys.abierto() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.all });
    };

    /**
     * Evento: pagos:updated
     * Invalida queries de pagos y dashboard
     */
    const handlePagosUpdated = () => {
      console.log('📡 Evento recibido: pagos:updated');
      queryClient.invalidateQueries({ queryKey: pagosKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };

    /**
     * Evento: gastos:updated
     * Invalida queries de gastos y dashboard
     */
    const handleGastosUpdated = () => {
      console.log('📡 Evento recibido: gastos:updated');
      queryClient.invalidateQueries({ queryKey: gastosKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: movimientos:updated
     * Invalida queries de movimientos e inventario
     */
    const handleMovimientosUpdated = () => {
      console.log('📡 Evento recibido: movimientos:updated');
      queryClient.invalidateQueries({ queryKey: movimientosKeys.all });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: inventario:updated
     * Invalida queries de inventario e insumos
     */
    const handleInventarioUpdated = () => {
      console.log('📡 Evento recibido: inventario:updated');
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
      queryClient.invalidateQueries({ queryKey: insumosKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    /**
     * Evento: productos:updated
     * Invalida queries de productos
     */
    const handleProductosUpdated = () => {
      console.log('📡 Evento recibido: productos:updated');
      queryClient.invalidateQueries({ queryKey: productosKeys.all });
    };

    /**
     * Evento: insumos:updated
     * Invalida queries de insumos e inventario
     */
    const handleInsumosUpdated = () => {
      console.log('📡 Evento recibido: insumos:updated');
      queryClient.invalidateQueries({ queryKey: insumosKeys.all });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    };

    // Registrar todos los listeners
    socket.on('ventas:updated', handleVentasUpdated);
    socket.on('venta:created', handleVentaCreated);
    socket.on('venta:updated', handleVentaUpdated);
    socket.on('venta:cancelled', handleVentaCancelled);
    socket.on('dashboard:updated', handleDashboardUpdated);
    socket.on('turnos:updated', handleTurnosUpdated);
    socket.on('turno:opened', handleTurnoOpened);
    socket.on('turno:closed', handleTurnoClosed);
    socket.on('pagos:updated', handlePagosUpdated);
    socket.on('pago:created', handlePagosUpdated);
    socket.on('pago:updated', handlePagosUpdated);
    socket.on('gastos:updated', handleGastosUpdated);
    socket.on('gasto:created', handleGastosUpdated);
    socket.on('gasto:updated', handleGastosUpdated);
    socket.on('gasto:deleted', handleGastosUpdated);
    socket.on('movimientos:updated', handleMovimientosUpdated);
    socket.on('movimiento:created', handleMovimientosUpdated);
    socket.on('inventario:updated', handleInventarioUpdated);
    socket.on('productos:updated', handleProductosUpdated);
    socket.on('insumos:updated', handleInsumosUpdated);

    console.log('✅ WebSocketListener configurado correctamente');

    // Cleanup: Remover todos los listeners y desconectar socket
    return () => {
      console.log('🧹 Limpiando WebSocketListener...');
      
      const currentSocket = getSocket();
      if (currentSocket) {
        // Remover todos los listeners
        currentSocket.off('ventas:updated', handleVentasUpdated);
        currentSocket.off('venta:created', handleVentaCreated);
        currentSocket.off('venta:updated', handleVentaUpdated);
        currentSocket.off('venta:cancelled', handleVentaCancelled);
        currentSocket.off('dashboard:updated', handleDashboardUpdated);
        currentSocket.off('turnos:updated', handleTurnosUpdated);
        currentSocket.off('turno:opened', handleTurnoOpened);
        currentSocket.off('turno:closed', handleTurnoClosed);
        currentSocket.off('pagos:updated', handlePagosUpdated);
        currentSocket.off('pago:created', handlePagosUpdated);
        currentSocket.off('pago:updated', handlePagosUpdated);
        currentSocket.off('gastos:updated', handleGastosUpdated);
        currentSocket.off('gasto:created', handleGastosUpdated);
        currentSocket.off('gasto:updated', handleGastosUpdated);
        currentSocket.off('gasto:deleted', handleGastosUpdated);
        currentSocket.off('movimientos:updated', handleMovimientosUpdated);
        currentSocket.off('movimiento:created', handleMovimientosUpdated);
        currentSocket.off('inventario:updated', handleInventarioUpdated);
        currentSocket.off('productos:updated', handleProductosUpdated);
        currentSocket.off('insumos:updated', handleInsumosUpdated);
      }
      
      // Desconectar socket
      disconnectSocket();
      
      console.log('✅ WebSocketListener limpiado');
    };
  }, [queryClient]);

  // Este componente no renderiza nada
  return null;
};

export default WebSocketListener;

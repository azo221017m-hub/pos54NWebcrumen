import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

// Singleton WebSocket service for broadcasting dashboard events
class WebSocketService {
  private wss: WebSocketServer | null = null;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 WebSocket: cliente dashboard conectado');

      ws.on('close', () => {
        console.log('🔌 WebSocket: cliente dashboard desconectado');
      });

      ws.on('error', (err) => {
        console.error('⚠️  WebSocket error de cliente:', err.message);
      });
    });

    console.log('✅ WebSocket server iniciado en ruta /ws');
  }

  // Broadcast a message to all connected dashboard clients
  broadcast(data: Record<string, unknown>): void {
    if (!this.wss) return;

    const message = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Notify all dashboards about a new WEB/SOLICITADO order
  notifyNuevoPedidoWeb(idnegocio: number, folioventa: string, idventa: number): void {
    this.broadcast({
      type: 'nuevo_pedido_web',
      idnegocio,
      folioventa,
      idventa,
      timestamp: new Date().toISOString()
    });
  }

  // Notify clients about a WEB order state change (ORDENADO, EN_CAMINO, etc.)
  notifyEstadoCambioWeb(idventa: number, estado: string, origen: string, idnegocio: number): void {
    this.broadcast({
      type: 'estado_cambio_web',
      idventa,
      estado,
      origen,
      idnegocio,
      timestamp: new Date().toISOString()
    });
  }
}

export const websocketService = new WebSocketService();

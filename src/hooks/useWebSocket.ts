import { useEffect, useRef, useCallback } from 'react';

type WebSocketMessage = Record<string, unknown>;
type MessageHandler = (data: WebSocketMessage) => void;

interface UseWebSocketOptions {
  onMessage: MessageHandler;
  enabled?: boolean;
}

// Derive WebSocket URL from VITE_API_URL or default to localhost
function getWebSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    // Replace http(s):// with ws(s):// and remove /api suffix if present
    const base = apiUrl.replace(/\/api$/, '');
    const wsUrl = base.replace(/^http/, 'ws');
    return `${wsUrl}/ws`;
  }
  return 'ws://localhost:3000/ws';
}

const WS_URL = getWebSocketUrl();
const RECONNECT_DELAY_MS = 5000;

/**
 * Hook that maintains a persistent WebSocket connection to the backend.
 * Automatically reconnects on disconnect.
 * Calls `onMessage` for every message received.
 */
export function useWebSocket({ onMessage, enabled = true }: UseWebSocketOptions): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const onMessageRef = useRef<MessageHandler>(onMessage);

  // Keep handler ref up-to-date without re-triggering the effect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 Dashboard WebSocket conectado');
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as WebSocketMessage;
          onMessageRef.current(data);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log('🔌 Dashboard WebSocket desconectado, reconectando...');
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        console.error('⚠️  Dashboard WebSocket: error de conexión');
        ws.close();
      };
    } catch (err) {
      console.error('⚠️  No se pudo crear WebSocket:', err);
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);
}

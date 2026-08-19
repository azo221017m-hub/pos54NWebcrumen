import { QueryClient } from '@tanstack/react-query';

// staleTime alto para catálogo (categorías/platillos): cambia poco durante el turno y las
// pantallas de venta lo vuelven a montar constantemente al navegar entre pasos del flujo.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

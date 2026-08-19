import { useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerProductosWeb } from '../services/productosWebService';
import { obtenerCategorias } from '../services/categoriasService';

export const MENU_CATALOGO_QUERY_KEYS = {
  productosWeb: ['productos-web'] as const,
  categorias: ['categorias'] as const,
};

// Catálogo de venta (categorías + platillos). Cacheado con React Query para que navegar entre
// pasos del flujo de venta (PageVentas/PageVentasMobile) no vuelva a pedir todo el catálogo
// -incluyendo fotos en base64- cada vez que se monta la pantalla.
export const useProductosWebCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.productosWeb,
    queryFn: obtenerProductosWeb,
  });

export const useCategoriasCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.categorias,
    queryFn: obtenerCategorias,
  });

// Usado por las pantallas de administración (ConfigProductosWeb/ConfigCategorias) tras un
// create/update/delete, para que el catálogo cacheado en las pantallas de venta no quede obsoleto.
export const useInvalidateMenuCatalogo = () => {
  const queryClient = useQueryClient();
  return {
    invalidateProductosWeb: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.productosWeb }),
    invalidateCategorias: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.categorias }),
  };
};

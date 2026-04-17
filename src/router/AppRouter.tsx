import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ConfigNegocios from '../pages/ConfigNegocios/ConfigNegocios';
import ConfigRolUsuarios from '../pages/ConfigRolUsuarios/ConfigRolUsuarios';
import { ConfigUsuarios } from '../pages/ConfigUsuarios/ConfigUsuarios';
import { ConfigUMCompra } from '../pages/ConfigUMCompra/ConfigUMCompra';
import ConfigMesas from '../pages/ConfigMesas/ConfigMesas';
import ConfigDescuentos from '../pages/ConfigDescuentos/ConfigDescuentos';
import ConfigInsumos from '../pages/ConfigInsumos/ConfigInsumos';
import ConfigClientes from '../pages/ConfigClientes/ConfigClientes';
import ConfigGrupoMovimientos from '../pages/ConfigGrupoMovimientos/ConfigGrupoMovimientos';
import ConfigModeradores from '../pages/ConfigModeradores/ConfigModeradores';
import ConfigSubreceta from '../pages/ConfigSubreceta/ConfigSubreceta';
import ConfigCategorias from '../pages/ConfigCategorias/ConfigCategorias';
import ConfigRecetas from '../pages/ConfigRecetas/ConfigRecetas';
import ConfigCatModeradores from '../pages/ConfigCatModeradores/ConfigCatModeradores';
import ConfigProductosWeb from '../pages/ConfigProductosWeb/ConfigProductosWeb';
import ConfigProveedores from '../pages/ConfigProveedores/ConfigProveedores';
import ConfigTurnos from '../pages/ConfigTurnos/ConfigTurnos';
import ConfigAnuncios from '../pages/ConfigAnuncios/ConfigAnuncios';
import PageVentas from '../pages/PageVentas/PageVentas';
import PageClientes from '../pages/PageClientes/PageClientes';
import PageClientesMobile from '../pages/PageClientesMobile/PageClientesMobile';
import MovimientosInventario from '../pages/MovimientosInventario/MovimientosInventario';
import PageGastos from '../pages/PageGastos/PageGastos';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  // Rutas públicas (no requieren autenticación)
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/clientes',
    element: <PageClientes />,
  },
  {
    path: '/clientes-mobile',
    element: <PageClientesMobile />,
  },
  // Rutas protegidas (requieren sesión activa)
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/config-negocios',
    element: <ProtectedRoute><ConfigNegocios /></ProtectedRoute>,
  },
  {
    path: '/config-roles',
    element: <ProtectedRoute><ConfigRolUsuarios /></ProtectedRoute>,
  },
  {
    path: '/config-usuarios',
    element: <ProtectedRoute><ConfigUsuarios /></ProtectedRoute>,
  },
  {
    path: '/config-um-compra',
    element: <ProtectedRoute><ConfigUMCompra /></ProtectedRoute>,
  },
  {
    path: '/config-mesas',
    element: <ProtectedRoute><ConfigMesas /></ProtectedRoute>,
  },
  {
    path: '/config-descuentos',
    element: <ProtectedRoute><ConfigDescuentos /></ProtectedRoute>,
  },
  {
    path: '/config-insumos',
    element: <ProtectedRoute><ConfigInsumos /></ProtectedRoute>,
  },
  {
    path: '/config-clientes',
    element: <ProtectedRoute><ConfigClientes /></ProtectedRoute>,
  },
  {
    path: '/config-cuentas-contables',
    element: <ProtectedRoute><ConfigGrupoMovimientos /></ProtectedRoute>,
  },
  {
    path: '/config-moderadores',
    element: <ProtectedRoute><ConfigModeradores /></ProtectedRoute>,
  },
  {
    path: '/config-subrecetas',
    element: <ProtectedRoute><ConfigSubreceta /></ProtectedRoute>,
  },
  {
    path: '/config-recetas',
    element: <ProtectedRoute><ConfigRecetas /></ProtectedRoute>,
  },
  {
    path: '/config-categorias',
    element: <ProtectedRoute><ConfigCategorias /></ProtectedRoute>,
  },
  {
    path: '/config-cat-moderadores',
    element: <ProtectedRoute><ConfigCatModeradores /></ProtectedRoute>,
  },
  {
    path: '/config-productos',
    element: <ProtectedRoute><ConfigProductosWeb /></ProtectedRoute>,
  },
  {
    path: '/config-proveedores',
    element: <ProtectedRoute><ConfigProveedores /></ProtectedRoute>,
  },
  {
    path: '/config-turnos',
    element: <ProtectedRoute><ConfigTurnos /></ProtectedRoute>,
  },
  {
    path: '/config-anuncios',
    element: <ProtectedRoute><ConfigAnuncios /></ProtectedRoute>,
  },
  {
    path: '/ventas',
    element: <ProtectedRoute><PageVentas /></ProtectedRoute>,
  },
  {
    path: '/movimientos-inventario',
    element: <ProtectedRoute><MovimientosInventario /></ProtectedRoute>,
  },
  {
    path: '/gastos',
    element: <ProtectedRoute><PageGastos /></ProtectedRoute>,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

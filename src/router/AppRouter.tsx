import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import { ConfigNegocios } from '../pages/ConfigNegocios/ConfigNegocios';
import { ConfigRolUsuarios } from '../pages/ConfigRolUsuarios/ConfigRolUsuarios';
import { ConfigUsuarios } from '../pages/ConfigUsuarios/ConfigUsuarios';
import { ConfigUMCompra } from '../pages/ConfigUMCompra/ConfigUMCompra';
import ConfigMesas from '../pages/ConfigMesas/ConfigMesas';
import ConfigDescuentos from '../pages/ConfigDescuentos/ConfigDescuentos';
import { ConfigInsumos } from '../pages/ConfigInsumos/ConfigInsumos';
import { ConfigClientes } from '../pages/ConfigClientes/ConfigClientes';
import ConfigCuentaContable from '../pages/ConfigCuentaContable/ConfigCuentaContable';
import ConfigModeradores from '../pages/ConfigModeradores/ConfigModeradores';
import ConfigSubreceta from '../pages/ConfigSubreceta/ConfigSubreceta';
import ConfigCategorias from '../pages/ConfigCategorias/ConfigCategorias';
import GestionRecetas from '../components/recetas/GestionRecetas/GestionRecetas';
import GestionCatModeradores from '../components/catModeradores/GestionCatModeradores/GestionCatModeradores';
import GestionProductosWeb from '../components/productosWeb/GestionProductosWeb/GestionProductosWeb';
import { ConfigProveedores } from '../pages/ConfigProveedores/ConfigProveedores';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/config-negocios',
    element: <ConfigNegocios />,
  },
  {
    path: '/config-roles',
    element: <ConfigRolUsuarios />,
  },
  {
    path: '/config-usuarios',
    element: <ConfigUsuarios />,
  },
  {
    path: '/config-um-compra',
    element: <ConfigUMCompra />,
  },
  {
    path: '/config-mesas',
    element: <ConfigMesas />,
  },
  {
    path: '/config-descuentos',
    element: <ConfigDescuentos />,
  },
  {
    path: '/config-insumos',
    element: <ConfigInsumos />,
  },
  {
    path: '/config-clientes',
    element: <ConfigClientes />,
  },
  {
    path: '/config-cuentas-contables',
    element: <ConfigCuentaContable />,
  },
  {
    path: '/config-moderadores',
    element: <ConfigModeradores />,
  },
  {
    path: '/config-subrecetas',
    element: <ConfigSubreceta />,
  },
  {
    path: '/config-recetas',
    element: <GestionRecetas />,
  },
  {
    path: '/config-categorias',
    element: <ConfigCategorias />,
  },
  {
    path: '/config-cat-moderadores',
    element: <GestionCatModeradores />,
  },
  {
    path: '/config-productos',
    element: <GestionProductosWeb />,
  },
  {
    path: '/config-proveedores',
    element: <ConfigProveedores />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

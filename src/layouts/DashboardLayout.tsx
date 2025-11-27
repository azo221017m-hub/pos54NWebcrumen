import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal del dashboard
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>POS Crumen</h1>
        <nav>
          <a href="/productos">Productos</a>
          <a href="/ventas">Ventas</a>
          <a href="/inventario">Inventario</a>
        </nav>
      </header>
      
      <main className="dashboard-main">
        {children}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Web POS Crumen</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;

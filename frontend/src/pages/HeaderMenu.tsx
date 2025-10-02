// src/components/HeaderMenu.tsx
import React from "react";
import "./HeaderMenu.css";

interface HeaderMenuProps {
  onClientesClick?: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ onClientesClick }) => {
  return (
    <header className="header-menu">
      <ul className="menu-bar">
        {/* NEGOCIO */}
        <li className="menu-item">
          <span>NEGOCIO</span>
          <ul className="submenu">
            <li><span>Perfil</span></li>
            <li><span>Recibo</span></li>
            <li><span>Usuarios</span></li>
            <li><span>Productos</span></li>
          </ul>
        </li>

        {/* VENTAS */}
        <li className="menu-item">
          <span>VENTAS</span>
          <ul className="submenu">
            <li><span>Iniciar Venta</span></li>
          </ul>
        </li>

        {/* KPIs */}
        <li className="menu-item">
          <span>KPIs</span>
          <ul className="submenu">
            <li><span>Financieros</span></li>
            <li><span>Inventario</span></li>
          </ul>
        </li>

        {/* RH */}
        <li className="menu-item">
          <span>RH</span>
        </li>

        {/* Control */}
        <li className="menu-item">
          <span>Control</span>
        </li>

        {/* Clientes */}
        <li className="menu-item">
          <span style={{ cursor: "pointer" }} onClick={onClientesClick}>
            Clientes
          </span>
        </li>
      </ul>
    </header>
  );
};

export default HeaderMenu;

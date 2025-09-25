import React, { useEffect } from "react";
import "./CargaCrumenPosWeb.css";
import logoPath from "../assets/logocrumen.svg";

const CargaCrumenPosWeb: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login"; // redirige después de 4s
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="splash">
      <img src={logoPath} alt="Logo CRUMEN" className="logo" />
      <h1 className="brand">POS54N WEB</h1>
      <p className="tagline">
        Punto de venta web ligero para negocios locales
      </p>
      <div className="loader" aria-hidden="true"></div>
    </main>
  );
};

export default CargaCrumenPosWeb;

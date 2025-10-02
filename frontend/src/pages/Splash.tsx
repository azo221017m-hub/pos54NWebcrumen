import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

const frases = [
  "Punto de venta web ligero para negocios loca1es",
  "Vende más y administra fáci1 con CrumenPOS",
  "Tu negocio más ágil con nuestro POS digita1",
  "Tu negocio fluye, tu gente crece, con nuestro POS digita1."
];

const Splash: React.FC = () => {
  const [fraseIndex, setFraseIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (fraseIndex < frases.length - 1) {
      const timer = setTimeout(() => setFraseIndex(prev => prev + 1), 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [fraseIndex, navigate]);

  return (
    <div className="splash-container">
      <img src="/assets/logocrumen.svg" alt="Logo CRUMEN" className="logo" />
      <p className="frase">{frases[fraseIndex]}</p>
      <div className="loader"></div>
    </div>
  );
};

export default Splash;

import React from "react";
import ButtonLink from "./ButtonLink";



const Navigation: React.FC = () => {
 
  return (
    
    <nav className=" w-1/6 bg-Primary text-Neutral p-4">
      <ul className="space-y-4">
        {/* <ButtonLink to="/home" text="Inicio" /> */}
        <ButtonLink to="/Registro" text="Registro de Estudiantes" />
        <ButtonLink to="/Estudiantes" text="Estudiantes" />
        <ButtonLink to="/Factores" text="Factores de Riesgo" />
        <ButtonLink to="/Materias" text="Materias" />
        <ButtonLink to="/Carreras" text="Carreras" />
        <ButtonLink to="/Pareto" text="Pareto" />
        <ButtonLink to="/GraficoControl" text="Grafico de Control"/>
        <ButtonLink to="/Histograma" text="Histograma" />
        <ButtonLink to="/Dispersion" text="Dispersion" />
        <ButtonLink to="/Exportar" text="Exportar Datos" />
      </ul>
    </nav>
  );
};

export default Navigation;

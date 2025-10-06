import React from "react";
import { TablaNegocio } from "./TablaNegocio";
import { FormInsertNegocio } from "./FormInsertNegocio";


export const TablasDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
       <TablaNegocio/>
       <FormInsertNegocio usuario="Prueba "/>
    </div>
  );
};

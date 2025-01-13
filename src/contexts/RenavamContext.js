// RenavamContext.js
"use client";

import { createContext, useContext, useState } from "react";

// Criação do contexto
const RenavamContext = createContext();

// Provider para encapsular o app
export const RenavamProvider = ({ children }) => {
  const [data, setData] = useState(null);

  return (
    <RenavamContext.Provider value={{ data, setData }}>
      {children}
    </RenavamContext.Provider>
  );
};

// Hook para usar o contexto
export const useRenavam = () => useContext(RenavamContext);

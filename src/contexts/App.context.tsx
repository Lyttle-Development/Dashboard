import React, { createContext, useContext } from "react";

export interface AppContextInterface {}

export type AppContextType = AppContextInterface | null;
export const AppContext = createContext<AppContextType>(null);

export const useApp = () => useContext(AppContext);

export interface AppContextProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppContextProps) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

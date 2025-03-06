import { createContext, useContext } from "react";

export interface AppContextInterface {
  userId: string;
  userEmail?: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isOperationsManager: boolean;
}

export type AppContextType = AppContextInterface | null;
export const AppContext = createContext<AppContextType>(null);

export const useApp = () => useContext(AppContext);

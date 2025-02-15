import { createContext, useContext } from "react";

export interface AppContextInterface {
  userId: string;
  userEmail?: string | null;
}

export type AppContextType = AppContextInterface | null;
export const AppContext = createContext<AppContextType>(null);

export const useApp = () => useContext(AppContext);

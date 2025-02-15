import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppContext } from "./App.context";

export interface AppContextProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppContextProps) {
  const { session, isLoading, isAuthenticated, isAllowed } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAllowed) {
    return (
      <div>
        <h1>Forbidden</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{ userId: session!.user.id, userEmail: session!.user.email }}
    >
      {children}
    </AppContext.Provider>
  );
}

import React from 'react';
import {useAuth} from '@/hooks/useAuth';
import {AppContext} from './App.context';
import {isAdmin, isManager, isOperationsManager} from '@/lib/auth';
import {Loader} from '@/components/Loader';

export interface AppContextProps {
    children: React.ReactNode;
    skipAuth?: boolean;
}

export function AppProvider({children, skipAuth = false}: AppContextProps) {
    const {session, isLoading, isAuthenticated, isAllowed} = useAuth();

    if (isLoading) {
        return <Loader/>;
    }

    if (!skipAuth) {
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
    }

    return (
        <AppContext.Provider
            value={{
                userId: session!.user.id,
                userEmail: session!.user.email,
                isAdmin: isAdmin(session),
                isManager: isManager(session),
                isOperationsManager: isOperationsManager(session),
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

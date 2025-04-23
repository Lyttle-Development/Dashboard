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
    const {session, isLoading, isAuthenticated, isAllowed} = useAuth(skipAuth);

    if (isLoading) {
        return <Loader/>;
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
            value={{
                userId: session?.user?.id ?? null,
                userEmail: session?.user?.email ?? null,
                isAdmin: session ? isAdmin(session) : false,
                isManager: session ? isManager(session) : false,
                isOperationsManager: session ? isOperationsManager(session) : false,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

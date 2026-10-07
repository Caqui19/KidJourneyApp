import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    login as loginRequest,
    logout as logoutRequest,
    register as registerRequest,
    restoreSession,
    setSessionExpiredHandler,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const unsubscribe = setSessionExpiredHandler(() => {
            if (isMounted) setUser(null);
        });

        restoreSession()
            .then((restoredUser) => {
                if (isMounted) setUser(restoredUser);
            })
            .catch(() => {
                if (isMounted) setUser(null);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const login = useCallback(async (email, senha) => {
        const authenticatedUser = await loginRequest(email, senha);
        setUser(authenticatedUser);
        return authenticatedUser;
    }, []);

    const register = useCallback(async (nome, email, senha, aceite_termos) => {
        const authenticatedUser = await registerRequest(nome, email, senha, aceite_termos);
        setUser(authenticatedUser);
        return authenticatedUser;
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        return logoutRequest();
    }, []);

    const value = useMemo(() => ({
        user,
        isLoading,
        login,
        register,
        logout,
    }), [user, isLoading, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
    return context;
}

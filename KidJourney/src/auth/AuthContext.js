import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { cadastrar, entrar, recuperarSenha, sair } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const cadastroEmAndamento = useRef(false);

    useEffect(() => {
        return onAuthStateChanged(auth, (usuario) => {
            if (!cadastroEmAndamento.current) {
                setUser(usuario);
                setIsLoading(false);
            }
        });
    }, []);

    async function login(email, senha) {
        const conta = await entrar(email, senha);
        setUser(conta.user);
        return conta.user;
    }

    async function register(nome, email, senha, aceites) {
        cadastroEmAndamento.current = true;

        try {
            return await cadastrar(nome, email, senha, aceites, (usuario) => {
                setUser(usuario);
                cadastroEmAndamento.current = false;
            });
        } finally {
            cadastroEmAndamento.current = false;
        }
    }

    async function resetPassword(email) {
        return recuperarSenha(email);
    }

    async function logout() {
        await sair();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
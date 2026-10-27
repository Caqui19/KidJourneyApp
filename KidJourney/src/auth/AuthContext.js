import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { cadastrar, entrar, recuperarSenha, sair, validarPerfil } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const cadastroEmAndamento = useRef(false);
    const loginEmAndamento = useRef(false);

    useEffect(() => {
        return onAuthStateChanged(auth, async (usuario) => {
            if (cadastroEmAndamento.current || loginEmAndamento.current) {
                return;
            }

            if (!usuario) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                await validarPerfil(usuario);
                setUser(usuario);
            } catch {
                await sair().catch(() => { });
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        });
    }, []);

    async function login(email, senha) {
        loginEmAndamento.current = true;

        try {
            const conta = await entrar(email, senha);
            setUser(conta.user);
            return conta.user;
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            loginEmAndamento.current = false;
        }
    }

    async function register(nome, email, senha, politicaSegurancaAceita) {
        cadastroEmAndamento.current = true;

        try {
            return await cadastrar(nome, email, senha, politicaSegurancaAceita, (usuario) => {
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

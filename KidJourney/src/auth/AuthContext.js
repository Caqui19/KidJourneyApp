import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { cadastrar, entrar, recuperarSenha, sair, validarPerfil } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [premium, setPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const cadastroEmAndamento = useRef(false);
    const loginEmAndamento = useRef(false);
    const pararPremium = useRef(null);

    const acompanharPremium = useCallback((usuario) => {
        if (pararPremium.current) {
            pararPremium.current();
            pararPremium.current = null;
        }

        if (!usuario?.uid) {
            setPremium(false);
            return;
        }

        pararPremium.current = onSnapshot(doc(db, 'usuarios', usuario.uid), (perfil) => {
            setPremium(perfil.exists() && perfil.data().premium === true);
        }, () => {
            setPremium(false);
        });
    }, []);

    useEffect(() => {
        const pararAuth = onAuthStateChanged(auth, async (usuario) => {
            if (cadastroEmAndamento.current || loginEmAndamento.current) {
                return;
            }

            if (!usuario) {
                acompanharPremium(null);
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                await validarPerfil(usuario);
                setUser(usuario);
                acompanharPremium(usuario);
            } catch {
                acompanharPremium(null);
                await sair().catch(() => { });
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        });

        return () => {
            pararAuth();
            if (pararPremium.current) pararPremium.current();
        };
    }, [acompanharPremium]);

    async function login(email, senha) {
        loginEmAndamento.current = true;

        try {
            const conta = await entrar(email, senha);
            setUser(conta.user);
            acompanharPremium(conta.user);
            return conta.user;
        } catch (error) {
            acompanharPremium(null);
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
                acompanharPremium(usuario);
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
        acompanharPremium(null);
        await sair();
        setUser(null);
        setPremium(false);
    }

    return (
        <AuthContext.Provider value={{ user, premium, isLoading, login, register, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
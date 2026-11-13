import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TemaContext = createContext(null);

const coresClaras = {
    fundo: '#fff',
    cartao: '#fff',
    texto: '#111',
    textoSecundario: '#636363',
    titulo: '#326c00',
    acento: '#326c00',
    botao: '#BFDE6C',
    textoBotao: '#326c00',
    selecao: '#f7faef',
    borda: '#ccc',
    campo: '#fff',
    cabecalho: '#BFDE6C',
    textoCabecalho: '#326c00',
    barra: '#BFDE6C',
    fundoErro: '#fff2e8',
    textoErro: '#8a3b00',
    perigo: '#b42318',
};

const coresEscuras = {
    fundo: '#151812',
    cartao: '#20251e',
    texto: '#f5f5f5',
    textoSecundario: '#c4c9be',
    titulo: '#c6e777',
    acento: '#c6e777',
    botao: '#405a21',
    textoBotao: '#eef7dc',
    selecao: '#2d3c23',
    borda: '#485043',
    campo: '#252a22',
    cabecalho: '#22291e',
    textoCabecalho: '#d0eb86',
    barra: '#20261d',
    fundoErro: '#3b291e',
    textoErro: '#ffc28d',
    perigo: '#ff746c',
};

export function TemaProvider({ children }) {
    const [tema, setTema] = useState('Claro');
    const [carregandoTema, setCarregandoTema] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('@KidJourney:tema')
            .then((temaSalvo) => {
                if (temaSalvo === 'Escuro') setTema('Escuro');
            })
            .catch(() => {})
            .finally(() => setCarregandoTema(false));
    }, []);

    async function alterarTema(novoTema) {
        setTema(novoTema);
        try {
            await AsyncStorage.setItem('@KidJourney:tema', novoTema);
        } catch {
        }
    }

    const escuro = tema === 'Escuro';

    return (
        <TemaContext.Provider value={{ tema, escuro, cores: escuro ? coresEscuras : coresClaras, alterarTema, carregandoTema }}>
            {children}
        </TemaContext.Provider>
    );
}

export function useTema() {
    return useContext(TemaContext);
}

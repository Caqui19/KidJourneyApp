import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';

export default function AnotacoesScreen() {
    const { user } = useAuth();
    const [texto, setTexto] = useState('');
    const [anotacoes, setAnotacoes] = useState([]);

    useEffect(() => {
        if (!user?.uid) {
            setAnotacoes([]);
            return;
        }

        const caminho = collection(db, 'usuarios', user.uid, 'anotacoes');
        const consulta = query(caminho, orderBy('criadoEm', 'desc'));

        return onSnapshot(consulta, (resultado) => {
            setAnotacoes(resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data(),
            })));
        }, () => {
            Alert.alert('Não foi possível carregar', 'Tente novamente mais tarde.');
        });
    }, [user?.uid]);

    async function salvarAnotacao() {
        const textoSalvo = texto.trim();
        if (!textoSalvo || !user?.uid) return;

        try {
            await addDoc(collection(db, 'usuarios', user.uid, 'anotacoes'), {
                texto: textoSalvo,
                data: new Date().toLocaleDateString('pt-BR'),
                criadoEm: serverTimestamp(),
            });
            setTexto('');
        } catch {
            Alert.alert('Não foi possível salvar', 'Tente novamente mais tarde.');
        }
    }

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Suas anotações</Text>

            <View style={styles.formulario}>
                <TextInput
                    value={texto}
                    onChangeText={setTexto}
                    placeholder="Escreva uma anotação..."
                    multiline
                    style={styles.campo}
                />
                <TouchableOpacity
                    onPress={salvarAnotacao}
                    disabled={!texto.trim()}
                    style={[styles.botao, !texto.trim() && styles.botaoDesativado]}
                >
                    <Text style={styles.textoBotao}>Salvar anotação</Text>
                </TouchableOpacity>
            </View>

            {anotacoes.length === 0 ? (
                <Text style={styles.vazio}>Você ainda não adicionou nenhuma anotação.</Text>
            ) : (
                anotacoes.map((anotacao) => (
                    <View key={anotacao.id} style={styles.card}>
                        <Text style={styles.data}>{anotacao.data}</Text>
                        <Text style={styles.textoAnotacao}>{anotacao.texto}</Text>
                    </View>
                ))
            )}
            <Text style={styles.copyright}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    container: {
        padding: 18,
        paddingBottom: 20,
        gap: 12,
    },

    titulo: {
        color: '#326c00',
        fontSize: 24,
        fontFamily: 'Nunito_700Bold',
    },

    formulario: {
        gap: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
    },

    campo: {
        minHeight: 100,
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        textAlignVertical: 'top',
    },

    botao: {
        alignItems: 'center',
        backgroundColor: '#BFDE6C',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 24,
        paddingVertical: 9,
    },

    botaoDesativado: {
        opacity: 0.5,
    },

    textoBotao: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    vazio: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 12,
    },

    card: {
        gap: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 14,
    },

    data: {
        color: '#326c00',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },

    textoAnotacao: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },

    copyright: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 8,
    },
});

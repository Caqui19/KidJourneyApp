import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';

export default function AnotacoesScreen() {
    const { user } = useAuth();
    const { cores } = useTema();
    const [texto, setTexto] = useState('');
    const [anotacoes, setAnotacoes] = useState([]);
    const [editandoId, setEditandoId] = useState(null);

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
            if (editandoId) {
                await updateDoc(doc(db, 'usuarios', user.uid, 'anotacoes', editandoId), {
                    texto: textoSalvo,
                });
                setEditandoId(null);
            } else {
                await addDoc(collection(db, 'usuarios', user.uid, 'anotacoes'), {
                    texto: textoSalvo,
                    data: new Date().toLocaleDateString('pt-BR'),
                    criadoEm: serverTimestamp(),
                });
            }

            setTexto('');
        } catch {
            Alert.alert('Não foi possível salvar', 'Tente novamente mais tarde.');
        }
    }

    function editarAnotacao(anotacao) {
        setTexto(anotacao.texto);
        setEditandoId(anotacao.id);
    }

    function cancelarEdicao() {
        setTexto('');
        setEditandoId(null);
    }

    async function deletarAnotacao(id) {
        if (!user?.uid) return;

        try {
            await deleteDoc(doc(db, 'usuarios', user.uid, 'anotacoes', id));
            if (editandoId === id) cancelarEdicao();
        } catch {
            Alert.alert('Não foi possível deletar', 'Tente novamente mais tarde.');
        }
    }

    function confirmarDelecao(id) {
        Alert.alert('Deletar anotação?', 'Essa anotação será removida.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', style: 'destructive', onPress: () => deletarAnotacao(id) },
        ]);
    }

    function mostrarDataHora(anotacao) {
        let data = anotacao.criadoEm;

        if (data?.toDate) data = data.toDate();
        else if (data) data = new Date(data);

        if (data instanceof Date && !Number.isNaN(data.getTime())) {
            const dia = data.toLocaleDateString('pt-BR');
            const hora = data.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            });

            return `${dia} às ${hora}`;
        }

        return anotacao.data || '';
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.container}>
            <Text style={[styles.titulo, { color: cores.titulo }]}>Suas anotações</Text>

            <View style={[styles.formulario, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                <TextInput
                    value={texto}
                    onChangeText={setTexto}
                    placeholder={editandoId ? 'Edite sua anotação...' : 'Escreva uma anotação...'}
                    multiline
                    placeholderTextColor={cores.textoSecundario}
                    style={[styles.campo, { color: cores.texto, backgroundColor: cores.campo }]}
                />
                <TouchableOpacity
                    onPress={salvarAnotacao}
                    disabled={!texto.trim()}
                    style={[styles.botao, { backgroundColor: cores.botao, borderColor: cores.acento }, !texto.trim() && styles.botaoDesativado]}
                >
                    <Text style={[styles.textoBotao, { color: cores.textoBotao }]}>{editandoId ? 'Salvar alterações' : 'Salvar anotação'}</Text>
                </TouchableOpacity>
                {editandoId && (
                    <TouchableOpacity onPress={cancelarEdicao} style={[styles.botaoCancelar, { borderColor: cores.acento }]}>
                        <Text style={[styles.textoBotao, { color: cores.acento }]}>Cancelar edição</Text>
                    </TouchableOpacity>
                )}
            </View>

            {anotacoes.length === 0 ? (
                <Text style={[styles.vazio, { color: cores.textoSecundario }]}>Você ainda não adicionou nenhuma anotação.</Text>
            ) : (
                anotacoes.map((anotacao) => (
                    <View key={anotacao.id} style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoAnotacao}>
                            <Text style={[styles.data, { color: cores.acento }]}>{mostrarDataHora(anotacao)}</Text>
                            <TouchableOpacity
                                onPress={() => confirmarDelecao(anotacao.id)}
                                accessibilityLabel="Deletar anotação"
                                style={styles.botaoDeletar}
                            >
                                <Ionicons name="trash" size={24} color={cores.perigo} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.textoAnotacao, { color: cores.textoSecundario }]}>{anotacao.texto}</Text>
                        <View style={styles.acoes}>
                            <TouchableOpacity
                                onPress={() => editarAnotacao(anotacao)}
                                accessibilityLabel="Editar anotação"
                            >
                                <Ionicons name="create" size={24} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
            <Text style={[styles.copyright, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
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

    botaoCancelar: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 24,
        paddingVertical: 9,
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

    cabecalhoAnotacao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    data: {
        flex: 1,
        color: '#326c00',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },

    textoAnotacao: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },

    acoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },

    botaoDeletar: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderRadius: 18,
    },

    copyright: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 8,
    },
});

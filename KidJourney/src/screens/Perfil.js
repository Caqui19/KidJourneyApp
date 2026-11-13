import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { BotaoSecundario } from '../components/Botaosecundario';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';

export default function PerfilScreen({ navigation }) {
    const { user } = useAuth();
    const { cores } = useTema();
    const [nome, setNome] = useState(user?.displayName || user?.nome || '');
    const [editandoNome, setEditandoNome] = useState(false);
    const [salvandoNome, setSalvandoNome] = useState(false);

    function cancelarEdicao() {
        setNome(user?.displayName || user?.nome || '');
        setEditandoNome(false);
    }

    async function salvarNome() {
        const nomeSalvo = nome.trim();

        if (!nomeSalvo) {
            Alert.alert('Nome inválido', 'Informe seu nome para continuar.');
            return;
        }

        if (!user?.uid) {
            Alert.alert('Não foi possível alterar o nome', 'Entre na sua conta e tente novamente.');
            return;
        }

        setSalvandoNome(true);

        try {
            await updateDoc(doc(db, 'usuarios', user.uid), { nome: nomeSalvo });
            await updateProfile(user, { displayName: nomeSalvo });
            setNome(nomeSalvo);
            setEditandoNome(false);
            Alert.alert('Nome atualizado', 'Seu nome foi alterado.');
        } catch {
            Alert.alert('Não foi possível alterar o nome', 'Tente novamente mais tarde.');
        } finally {
            setSalvandoNome(false);
        }
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]}>
            <View style={[styles.container, { backgroundColor: cores.fundo }]}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: cores.selecao, width: 40, height: 40, borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color={cores.acento} />
                    </TouchableOpacity>
                    <Text style={[styles.titulo, { color: cores.titulo }]}>Seu Perfil</Text>
                </View>
                <Image source={require('../assets/perfil.png')} resizeMode="contain" style={styles.perfil} />
                <View style={styles.accountDetails}>
                    {editandoNome ? (
                        <View style={styles.edicaoNome}>
                            <TextInput
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome"
                                placeholderTextColor={cores.textoSecundario}
                                autoCapitalize="words"
                                maxLength={60}
                                style={[styles.campoNome, { borderColor: cores.acento, color: cores.texto, backgroundColor: cores.campo }]}
                            />
                            <View style={styles.acoesNome}>
                                <TouchableOpacity onPress={cancelarEdicao} disabled={salvandoNome} style={[styles.botaoCancelar, { borderColor: cores.acento }]}>
                                    <Text style={[styles.textoBotaoNome, { color: cores.acento }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={salvarNome}
                                    disabled={salvandoNome}
                                    style={[styles.botaoSalvar, { backgroundColor: cores.botao, borderColor: cores.acento }, salvandoNome && styles.botaoDesativado]}
                                >
                                    <Text style={[styles.textoBotaoNome, { color: cores.textoBotao }]}>{salvandoNome ? 'Salvando...' : 'Salvar'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.linhaNome}>
                            <Text style={[styles.accountName, { color: cores.titulo }]}>{nome || 'Responsável'}</Text>
                            <TouchableOpacity
                                onPress={() => setEditandoNome(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Alterar nome"
                                style={styles.botaoEditarNome}
                            >
                                <FontAwesome5 name="edit" size={16} color={cores.acento} solid />
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={[styles.accountEmail, { color: cores.textoSecundario }]}>{user?.email}</Text>
                </View>
                <BotaoSecundario texto='Acessar Configurações' onPress={() => navigation.navigate('Configuracoes')} />
                <Text style={[styles.texto2, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        gap: 20,
    },

    scrollContainer: {
        backgroundColor: '#fff',
        width: '100%',
    },

    titulo: {
        fontSize: 24,
        color: '#326c00',
        textAlign: 'left',
        fontFamily: 'Nunito_700Bold',
        marginBottom: -10,
    },

    texto: {
        fontSize: 16,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
    },

    accountDetails: {
        width: '100%',
        alignItems: 'center',
        gap: 4,
    },

    accountName: {
        fontSize: 20,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
        flexShrink: 1,
    },

    accountEmail: {
        fontSize: 14,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

    perfil: {
        borderRadius: 100,
        width: 150,
        height: 150,
    },

    linhaNome: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    botaoEditarNome: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    edicaoNome: {
        width: '100%',
        gap: 10,
    },

    campoNome: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 12,
        paddingHorizontal: 12,
        color: '#333',
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },

    acoesNome: {
        flexDirection: 'row',
        gap: 10,
    },

    botaoCancelar: {
        flex: 1,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 24,
    },

    botaoSalvar: {
        flex: 1,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#BFDE6C',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 24,
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoBotaoNome: {
        color: '#326c00',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },

});

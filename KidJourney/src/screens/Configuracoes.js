import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Linking, Modal, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { useTema } from '../TemaContext';

export default function ConfiguracoesScreen({ navigation }) {
    const { user, logout, resetPassword } = useAuth();
    const { tema, escuro, cores, alterarTema } = useTema();
    const [notificacoes, setNotificacoes] = useState('Sim');
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    async function trocarSenha() {
        if (!user?.email) {
            Alert.alert('Não foi possível trocar a senha', 'Não encontramos o email da sua conta.');
            return;
        }

        setIsSendingReset(true);

        try {
            await resetPassword(user.email);
            Alert.alert('Email enviado', 'Enviamos um link para trocar sua senha.');
        } catch {
            Alert.alert('Não foi possível enviar', 'Confira sua conexão e tente novamente.');
        } finally {
            setIsSendingReset(false);
        }
    }

    async function sairDaConta() {
        setIsSigningOut(true);

        try {
            await logout();
        } catch {
            Alert.alert('Não foi possível sair', 'Confira sua conexão e tente novamente.');
        } finally {
            setIsSigningOut(false);
        }
    }

    function abrirPolitica() {
        Linking.openURL('https://kidjourney-3cc97.web.app/politica-de-seguranca').catch(() => {
            Alert.alert('Não foi possível abrir', 'Tente novamente mais tarde.');
        });
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]}>
            <View style={[styles.container, { backgroundColor: cores.fundo }]}>
                <View style={styles.tituloLinha}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.voltar, { backgroundColor: cores.selecao }]}>
                        <Ionicons name="arrow-back" size={24} color={cores.acento} />
                    </TouchableOpacity>
                    <Text style={[styles.titulo, { color: cores.titulo }]}>Configurações</Text>
                </View>

                <View style={styles.listaConfiguracoes}>
                    <View style={[styles.linha, { borderBottomColor: cores.borda }]}>
                        <Text style={[styles.textoLinha, { color: cores.texto }]}>Alterar tema</Text>
                        <Seletor valor={tema} opcoes={['Claro', 'Escuro']} aoSelecionar={alterarTema} cores={cores} escuro={escuro} />
                    </View>

                    <View style={[styles.linha, { borderBottomColor: cores.borda }]}>
                        <Text style={[styles.textoLinha, { color: cores.texto }]}>Notificações</Text>
                        <Seletor valor={notificacoes} opcoes={['Sim', 'Não']} aoSelecionar={setNotificacoes} cores={cores} escuro={escuro} />
                    </View>

                    <Documento
                        titulo="Política de Segurança"
                        onPress={abrirPolitica}
                        cores={cores}
                    />
                </View>
                <View style={styles.acoesConta}>
                    <TouchableOpacity
                        onPress={trocarSenha}
                        disabled={isSendingReset}
                        accessibilityRole="button"
                        style={[styles.botaoConta, { borderColor: cores.acento, backgroundColor: cores.cartao }, isSendingReset && styles.botaoDesativado]}
                    >
                        <FontAwesome5 name="key" size={14} color={cores.acento} />
                        <Text style={[styles.textoBotaoConta, { color: cores.acento }]}>{isSendingReset ? 'Enviando...' : 'Trocar senha'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={sairDaConta}
                        disabled={isSigningOut}
                        accessibilityRole="button"
                        style={[styles.botaoConta, { borderColor: cores.acento, backgroundColor: cores.cartao }, isSigningOut && styles.botaoDesativado]}
                    >
                        <Text style={[styles.textoBotaoConta, { color: cores.acento }]}>{isSigningOut ? 'Saindo...' : 'Sair'}</Text>
                        <FontAwesome5 name="sign-out-alt" size={15} color={cores.acento} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.copyright, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
            </View>
        </ScrollView>
    );
}

function Documento({ titulo, onPress, cores }) {
    return (
        <TouchableOpacity style={[styles.linhaDocumento, { borderBottomColor: cores.borda }]} onPress={onPress}>
            <Text style={[styles.textoLinha, { color: cores.texto }]}>{titulo}</Text>
            <View style={styles.acessar}>
                <Text style={[styles.textoAcessar, { color: cores.acento } ]}>Acessar</Text>
                <Ionicons name="open-outline" size={16} color={cores.acento} />
            </View>
        </TouchableOpacity>
    );
}

function Seletor({ valor, opcoes, aoSelecionar, cores, escuro }) {
    const [aberto, setAberto] = useState(false);

    return (
        <>
            <TouchableOpacity style={[styles.seletor, { borderColor: cores.acento, backgroundColor: cores.cartao }]} onPress={() => setAberto(true)}>
                <Text style={[styles.valorSeletor, { color: cores.textoSecundario }]}>{valor}</Text>
                <Ionicons name="chevron-down" size={18} color={cores.acento} />
            </TouchableOpacity>

            <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
                <View style={[styles.modalFundo, escuro && styles.modalFundoEscuro]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setAberto(false)} />
                    <View style={[styles.opcoes, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        {opcoes.map((opcao) => (
                            <TouchableOpacity
                                key={opcao}
                                style={[styles.opcao, { borderBottomColor: cores.borda }]}
                                onPress={() => {
                                    aoSelecionar(opcao);
                                    setAberto(false);
                                }}
                            >
                                <Text style={[styles.valorSeletor, { color: cores.texto }]}>{opcao}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 0,
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

    tituloLinha: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    voltar: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        width: 40,
        height: 40,
        borderRadius: 100,
        backgroundColor: '#BFDE6C60',
        alignItems: 'center',
        justifyContent: 'center',
    },

    listaConfiguracoes: {
        width: '100%',
        alignSelf: 'stretch',
    },

    copyright: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

    linha: {
        width: '100%',
        alignSelf: 'stretch',
        minHeight: 88,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 20,
    },

    textoLinha: {
        color: '#111',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },

    seletor: {
        width: 135,
        height: 42,
        borderWidth: 2,
        borderColor: '#326c00',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },

    valorSeletor: {
        color: '#888',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },

    modalFundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    modalFundoEscuro: {
        backgroundColor: 'rgba(0,0,0,0.7)',
    },

    opcoes: {
        width: 180,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
    },

    opcao: {
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    linhaDocumento: {
        width: '100%',
        alignSelf: 'stretch',
        minHeight: 90,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 20,
    },

    acessar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    textoAcessar: {
        color: '#326c00',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },

    acoesConta: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
        paddingHorizontal: 20,
    },

    botaoConta: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 50,
    },

    textoBotaoConta: {
        color: '#326c00',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },

    botaoDesativado: {
        opacity: 0.6,
    },
});

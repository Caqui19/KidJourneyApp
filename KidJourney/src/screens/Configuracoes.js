import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Linking, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConfiguracoesScreen({ navigation }) {
    const [tema, setTema] = useState('Claro');
    const [notificacoes, setNotificacoes] = useState('Sim');

    function abrirPolitica() {
        Linking.openURL('https://kidjourney-3cc97.web.app/politica-de-seguranca').catch(() => {
            Alert.alert('Não foi possível abrir', 'Tente novamente mais tarde.');
        });
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.tituloLinha}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
                        <Ionicons name="arrow-back" size={24} color="#326c00" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Configurações</Text>
                </View>

                <View style={styles.listaConfiguracoes}>
                    <View style={styles.linha}>
                        <Text style={styles.textoLinha}>Alterar tema</Text>
                        <Seletor valor={tema} opcoes={['Claro', 'Escuro']} aoSelecionar={setTema} />
                    </View>

                    <View style={styles.linha}>
                        <Text style={styles.textoLinha}>Notificações</Text>
                        <Seletor valor={notificacoes} opcoes={['Sim', 'Não']} aoSelecionar={setNotificacoes} />
                    </View>

                    <Documento
                        titulo="Política de Segurança"
                        onPress={abrirPolitica}
                    />
                </View>
                <Text style={styles.copyright}>&copy; 2026 KidJourney</Text>
            </View>
        </ScrollView>
    );
}

function Documento({ titulo, onPress }) {
    return (
        <TouchableOpacity style={styles.linhaDocumento} onPress={onPress}>
            <Text style={styles.textoLinha}>{titulo}</Text>
            <View style={styles.acessar}>
                <Text style={styles.textoAcessar}>Acessar</Text>
                <Ionicons name="open-outline" size={16} color="#326c00" />
            </View>
        </TouchableOpacity>
    );
}

function Seletor({ valor, opcoes, aoSelecionar }) {
    const [aberto, setAberto] = useState(false);

    return (
        <>
            <TouchableOpacity style={styles.seletor} onPress={() => setAberto(true)}>
                <Text style={styles.valorSeletor}>{valor}</Text>
                <Ionicons name="chevron-down" size={18} color="#326c00" />
            </TouchableOpacity>

            <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
                <View style={styles.modalFundo}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setAberto(false)} />
                    <View style={styles.opcoes}>
                        {opcoes.map((opcao) => (
                            <TouchableOpacity
                                key={opcao}
                                style={styles.opcao}
                                onPress={() => {
                                    aoSelecionar(opcao);
                                    setAberto(false);
                                }}
                            >
                                <Text style={styles.valorSeletor}>{opcao}</Text>
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
});

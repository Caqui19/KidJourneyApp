import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTema } from '../TemaContext';

export function Crianca({ nome, sexo, idade, dataNascimento, especificidades = [], selecionada = false, onManage, onSelect }) {
    const [modalVisible, setModalVisible] = useState(false);
    const { cores } = useTema();
    return (
        <View>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }, selecionada && [styles.cardSelecionado, { backgroundColor: cores.selecao, borderColor: cores.acento }] ]}
                onPress={() => setModalVisible(true)}
            >
                <FontAwesome5 style={styles.icone} name="baby" size={50} color={cores.acento} solid />
                <View style={styles.informacoes}>
                    <Text style={[styles.titulo, { color: cores.titulo }]} numberOfLines={1}
                        ellipsizeMode="tail">{nome}</Text>
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]} numberOfLines={1}
                        ellipsizeMode="tail">Sexo: {sexo}</Text>
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]} numberOfLines={1}
                        ellipsizeMode="tail">Idade: {idade}</Text>
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]} numberOfLines={1}
                        ellipsizeMode="tail">Nascimento: {dataNascimento}</Text>
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]} numberOfLines={1} ellipsizeMode="tail">
                        Especificidades: {especificidades.join(', ') || 'Nenhuma'}
                    </Text>
                </View>
            </TouchableOpacity>
            <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.overlay}>
                    <View style={[styles.modalContainer, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'space-between', }}>
                            <Text style={[styles.tituloModal, { color: cores.texto }]}>{nome}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'center', width: '100%', }}>
                            <TouchableOpacity
                                style={[styles.botaoModal1, { backgroundColor: cores.cartao, borderColor: cores.acento }]}
                                onPress={() => {
                                    setModalVisible(false);
                                    onManage();
                                }}
                            >
                                <Text style={[styles.modalTexto, { color: cores.acento }]}>Gerenciar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoModal2, { backgroundColor: cores.botao, borderColor: cores.acento }]}
                                onPress={() => {
                                    setModalVisible(false);
                                    onSelect();
                                }}
                            >
                                <Text style={[styles.modalTexto, { color: cores.textoBotao }]}>{selecionada ? 'Desselecionar' : 'Selecionar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    titulo: {
        fontSize: 20,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 16,
        gap: 14,
    },

    cardSelecionado: {
        borderColor: '#326c00',
        borderWidth: 2,
        backgroundColor: '#f7faef',
    },

    informacoes: {
        flex: 1,
    },

    textoCard: {
        fontSize: 15,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        maxWidth: '100%',
    },

    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },

    modalContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 12,
        width: 'fit-content',
        maxWidth: '100%',
        gap: 10,
    },

    botaoModal1: {
        backgroundColor: '#fff',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#326c00',
    },

    botaoModal2: {
        backgroundColor: '#BFDE6C',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#326c00',
    },

    modalTexto: {
        fontSize: 16,
        color: '#326c00',
        fontFamily: 'Poppins_600SemiBold',
    },

    tituloModal: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'Poppins_400Regular',
    }
});

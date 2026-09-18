import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export function Crianca({ nome, sexo, idade, especificidade }) {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View>
            <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
                <FontAwesome5 style={styles.icone} name="baby" size={50} color="#326c00" solid />
                <View>
                    <Text style={styles.titulo} numberOfLines={1}
                        ellipsizeMode="tail">{nome}</Text>
                    <Text style={styles.textoCard} numberOfLines={1}
                        ellipsizeMode="tail">Sexo: {sexo}</Text>
                    <Text style={styles.textoCard} numberOfLines={1}
                        ellipsizeMode="tail">Idade: {idade}</Text>
                    <Text style={styles.textoCard} numberOfLines={1}
                        ellipsizeMode="tail">Especificidades: {especificidade}</Text>
                </View>
            </TouchableOpacity>
            <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'space-between', }}>
                            <Text style={styles.tituloModal}>{nome}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color="#326c00" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'center', width: '100%', }}>
                            <TouchableOpacity style={styles.botaoModal1}>
                                <Text style={styles.modalTexto}>Gerenciar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botaoModal2}>
                                <Text style={styles.modalTexto}>Selecionar</Text>
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

    textoCard: {
        flex: 1,
        fontSize: 15,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        maxWidth: '90%',
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
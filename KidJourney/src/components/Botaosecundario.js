import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

export function BotaoSecundario({ texto, onPress, style }) {
    return (
        <TouchableOpacity style={[styles.botaoSecundario, style]} onPress={onPress}>
            <Text style={styles.texto}>{texto}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botaoSecundario: {
        width: '100%',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#326c00',
        borderWidth: 1,
        borderRadius: 50,
    },

    texto: {
        color: '#326c00',
        fontSize: 16,
        fontWeight: 600,
        textAlign: 'center',
        fontFamily: 'Poppins_600SemiBold',
    }
});
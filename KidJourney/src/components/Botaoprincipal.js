import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

export function BotaoPrincipal({ texto, onPress, disabled = false }) {
    return (
        <TouchableOpacity
            style={[styles.botaoPrincipal, disabled && styles.desabilitado]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text style={styles.texto}>{texto}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botaoPrincipal: {
        width: '100%',
        padding: 10,
        backgroundColor: '#bfde6c',
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
    },
    desabilitado: {
        opacity: 0.6,
    }
});

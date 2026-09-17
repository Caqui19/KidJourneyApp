import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Input({
    texto,
    setTexto,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences'
}) {
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const senha = secureTextEntry;

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={texto}
                onChangeText={setTexto}
                placeholder={placeholder}
                placeholderTextColor="#999"
                secureTextEntry={senha && !mostrarSenha}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />

            {senha && (
                <TouchableOpacity style={styles.visualizar} onPress={() => setMostrarSenha(!mostrarSenha)}>
                    <Ionicons name={mostrarSenha ? 'eye' : 'eye-off'} size={25} color="#326c00" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
    },

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingRight: 50,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#333',
        backgroundColor: '#fff',
    },

    visualizar: {
        position: 'absolute',
        right: 14,
        height: 50,
        justifyContent: 'center',
    },
});
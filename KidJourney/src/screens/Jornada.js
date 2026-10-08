import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';

export default function JornadaScreen({ navigation }) {
    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.titulo}>Jornada de Lavínia</Text>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.titulo2}>Início</Text>
                    <Text style={styles.texto}>1 a 6 meses</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.titulo2}>Pré-intermediário</Text>
                    <Text style={styles.texto}>6 meses a 1 ano</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.titulo2}>Intermediário</Text>
                    <Text style={styles.texto}>1 a 2 anos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.titulo2}>Pré-avançado</Text>
                    <Text style={styles.texto}>2 a 3 anos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.titulo2}>Avançado</Text>
                    <Text style={styles.texto}>3 a 5 anos</Text>
                </TouchableOpacity>
                <Text style={styles.texto2}>&copy; 2026 KidJourney</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
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
    },

    titulo2: {
        fontSize: 18,
        color: '#326c00',
        textAlign: 'left',
        fontFamily: 'Nunito_700Bold',
    },

    texto: {
        fontSize: 16,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
    },

    link: {
        fontSize: 16,
        color: '#326c00',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 20,
        margin: 10,
        gap: 14,
        width: '100%',
    },
});
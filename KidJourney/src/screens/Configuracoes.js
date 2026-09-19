import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function ConfiguracoesScreen({ navigation }) {
    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: '#BFDE6C60', width: 40, height: 40, borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color="#326c00" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Configurações</Text>
                </View>
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
        marginBottom: -10,
    },

    texto: {
        fontSize: 16,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
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
});
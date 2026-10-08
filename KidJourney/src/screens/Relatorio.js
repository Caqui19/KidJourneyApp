import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RelatorioScreen({ navigation }) {
    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.titulo}>Relatório do dia 08/10/2026</Text>
                <View style={styles.card}>
                    <FontAwesome5 style={styles.icone} name="baby" size={50} color="#326c00" solid />
                    <View>
                        <Text style={styles.titulo} numberOfLines={1}
                            ellipsizeMode="tail">Lavínia</Text>
                        <Text style={styles.textoCard} numberOfLines={1}
                            ellipsizeMode="tail">Sexo: Feminino</Text>
                        <Text style={styles.textoCard} numberOfLines={1}
                            ellipsizeMode="tail">Idade: 1 ano</Text>
                        <Text style={styles.textoCard} numberOfLines={1}
                            ellipsizeMode="tail">Especificidades: Celíaca, TDHA, Autismo, Jebediah</Text>
                    </View>
                </View>
                <View>
                    <Text style={styles.titulo}>Adequação Geral</Text>
                    <Text style={styles.texto}><Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>95%</Text> de acordo com o desenvolvimento esperado para a idade e suas especificidades.</Text>
                </View>
                <View style={styles.card2}>
                    <Text style={styles.titulo}><FontAwesome5 style={styles.icone} name="utensils" size={25} color="#326c00" solid /> Alimentação</Text>
                    <Text style={styles.textoCard2}>Café da manhã: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>100%</Text></Text>
                    <Text style={styles.textoCard2}>Almoço: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>75%</Text></Text>
                    <Text style={styles.textoCard2}>Lanche: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>60%</Text></Text>
                    <Text style={styles.textoCard2}>Jantar: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>90%</Text></Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8} style={{ marginTop: 10 }}>
                        <Text style={styles.link}>Ver Recomendações</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.card2}>
                    <Text style={styles.titulo}><FontAwesome5 style={styles.icone} name="bed" size={25} color="#326c00" solid /> Sono</Text>
                    <Text style={styles.textoCard2}>Acordar: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>70%</Text></Text>
                    <Text style={styles.textoCard2}>Sonecas: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>80%</Text></Text>
                    <Text style={styles.textoCard2}>Dormir: <Text style={{ color: '#326c00', fontWeight: 'bold', fontSize: 18 }}>60%</Text></Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8} style={{ marginTop: 10 }}>
                        <Text style={styles.link}>Ver Recomendações</Text>
                    </TouchableOpacity>
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
        textDecorationLine: 'underline',
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
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 16,
        margin: 10,
        gap: 14,
        width: '100%',
    },

    card2: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 16,
        margin: 10,
        width: '100%',
    },

    textoCard: {
        flex: 1,
        fontSize: 15,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        maxWidth: '90%',
    },

    textoCard2: {
        fontSize: 15,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        maxWidth: '90%',
    },
});
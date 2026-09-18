import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.titulo}>Bem-vindo(a) ao KidJourney!</Text>
            <View style={{ gap: 10 }}>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="plus-circle" size={50} color="#326c00" solid />
                    <Text style={styles.textoCard}>Confira as mais atuais recomendações saudáveis para Lavínia na aba Recomendações.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Relatorio')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="chart-bar" size={50} color="#326c00" solid />
                    <Text style={styles.textoCard}>Abacate introduzido com sucesso na dieta de Lavínia. Confira o último relatório na aba Relatório.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Jornada')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="shoe-prints" size={50} color="#326c00" solid />
                    <Text style={styles.textoCard}>A Jornada de Lavínia está avançando, confira o que vem pela frente na aba Jornada.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Criancas')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="baby" size={50} color="#326c00" solid />
                    <Text style={styles.textoCard}>Gerencie o progresso de suas crianças, ou crie uma personalização na aba Crianças.</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.texto2}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    scrollContent: {
        padding: 20,
    },

    titulo: {
        fontSize: 24,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
        textAlign: 'center',
        marginBottom: 24,
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
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
    }
});
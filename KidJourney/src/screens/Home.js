import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTema } from '../TemaContext';

export default function HomeScreen({ navigation, criancaSelecionada }) {
    const nomeCrianca = criancaSelecionada?.nome;
    const { cores } = useTema();

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.titulo, { color: cores.titulo }]}>Bem-vindo(a) ao KidJourney!</Text>
            <View style={{ gap: 10 }}>
                <TouchableOpacity style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="plus-circle" size={50} color={cores.acento} solid />
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>
                        {nomeCrianca
                            ? `Confira as recomendações para ${nomeCrianca} na aba Recomendações.`
                            : 'Selecione uma criança para ver as recomendações personalizadas.'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => navigation.navigate('Relatorio')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="chart-bar" size={50} color={cores.acento} solid />
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>
                        {nomeCrianca
                            ? `Acompanhe os registros de ${nomeCrianca} no relatório.`
                            : 'Selecione uma criança para acompanhar os registros no relatório.'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => navigation.navigate('Jornada')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="shoe-prints" size={50} color={cores.acento} solid />
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>
                        {nomeCrianca
                            ? `Confira a jornada de ${nomeCrianca}.`
                            : 'Acompanhe as etapas da jornada infantil.'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => navigation.navigate('Criancas')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="baby" size={50} color={cores.acento} solid />
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>Gerencie o progresso de suas crianças, ou crie uma personalização na aba Crianças.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => navigation.navigate('Anotacoes')} activeOpacity={0.8}>
                    <FontAwesome5 style={styles.icone} name="sticky-note" size={50} color={cores.acento} solid />
                    <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>Registre observações importantes sobre a rotina da criança e consulte suas anotações quando precisar.</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.texto2, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
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

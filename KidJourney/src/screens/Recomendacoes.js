import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function RecomendacoesScreen() {
    const [pesquisa, setPesquisa] = useState('');
    const textoRecomendacao = 'introduzir alimentos complementares mantendo o leite materno ou fórmula como principal fonte de nutrição oferecer frutas amassadas ou em pedaços adequados';
    const encontrou = pesquisa.trim() && textoRecomendacao.includes(pesquisa.trim().toLowerCase());

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
            <View style={styles.pesquisaContainer}>
                <Ionicons name="search" size={24} color="#d0d0d0" />
                <TextInput
                    value={pesquisa}
                    onChangeText={setPesquisa}
                    placeholder="Pesquise aqui..."
                    placeholderTextColor="#888"
                    style={styles.campoPesquisa}
                />
                <TouchableOpacity onPress={() => setPesquisa('')} accessibilityLabel="Limpar pesquisa">
                    <Ionicons name="close" size={25} color="#d0d0d0" />
                </TouchableOpacity>
            </View>

            <Text style={styles.resultadoTitulo}>Resultados da pesquisa:</Text>
            <Text style={styles.resultadoTexto}>
                {encontrou ? '1 resultado encontrado.' : 'Nenhum resultado encontrado.'}
            </Text>

            <Text style={styles.titulo}>Alimentação</Text>
            <Text style={styles.subtitulo}>Intermediário | 7 meses | Nenhuma</Text>

            <View style={styles.lista}>
                <View style={styles.itemLista}>
                    <Text style={styles.ponto}>•</Text>
                    <Text style={styles.texto}>Introduzir alimentos complementares mantendo o leite materno ou fórmula como principal fonte de nutrição.</Text>
                </View>
                <View style={styles.itemLista}>
                    <Text style={styles.ponto}>•</Text>
                    <Text style={styles.texto}>Oferecer frutas amassadas ou em pedaços adequados.</Text>
                </View>
            </View>

            <View style={styles.imagemRecomendacao}>
                <FontAwesome5 name="baby" size={82} color="#326c00" />
                <Ionicons name="restaurant" size={74} color="#ed8746" />
            </View>
            <Text style={styles.legenda}>Dra. Barbara, Especialista em alimentação infantil.</Text>
            <Text style={styles.copyright}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        gap: 6,
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
        marginTop: 12,
    },

    subtitulo: {
        fontSize: 15,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
    },

    pesquisaContainer: {
        height: 48,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    campoPesquisa: {
        flex: 1,
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },

    resultadoTitulo: {
        color: '#111',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },

    resultadoTexto: {
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 8,
    },

    lista: {
        gap: 2,
        marginTop: 12,
        marginBottom: 18,
        paddingHorizontal: 20,
    },

    itemLista: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },

    ponto: {
        color: '#636363',
        fontSize: 20,
        lineHeight: 29,
    },

    texto: {
        flex: 1,
        color: '#636363',
        fontSize: 16,
        lineHeight: 25,
        fontFamily: 'Poppins_400Regular',
    },

    imagemRecomendacao: {
        height: 210,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        backgroundColor: '#f7f5ed',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        marginTop: 6,
    },

    legenda: {
        color: '#636363',
        fontSize: 14,
        lineHeight: 20,
    },

    copyright: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 14,
    },
});

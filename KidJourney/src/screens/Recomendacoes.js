import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../TemaContext';

export default function RecomendacoesScreen() {
    const { cores } = useTema();
    const [pesquisa, setPesquisa] = useState('');
    const textoRecomendacao = 'introduzir alimentos complementares mantendo o leite materno ou fórmula como principal fonte de nutrição oferecer frutas amassadas ou em pedaços adequados';
    const encontrou = pesquisa.trim() && textoRecomendacao.includes(pesquisa.trim().toLowerCase());

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={[styles.container, { backgroundColor: cores.fundo }]}>
            <View style={[styles.pesquisaContainer, { borderColor: cores.borda, backgroundColor: cores.cartao }]}>
                <Ionicons name="search" size={24} color={cores.textoSecundario} />
                <TextInput
                    value={pesquisa}
                    onChangeText={setPesquisa}
                    placeholder="Pesquise aqui..."
                    placeholderTextColor={cores.textoSecundario}
                    style={[styles.campoPesquisa, { color: cores.texto }]}
                />
                <TouchableOpacity onPress={() => setPesquisa('')} accessibilityLabel="Limpar pesquisa">
                    <Ionicons name="close" size={25} color={cores.textoSecundario} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.resultadoTitulo, { color: cores.texto }]}>Resultados da pesquisa:</Text>
            <Text style={[styles.resultadoTexto, { color: cores.textoSecundario }]}>
                {encontrou ? '1 resultado encontrado.' : 'Nenhum resultado encontrado.'}
            </Text>

            <Text style={[styles.titulo, { color: cores.titulo }]}>Alimentação</Text>
            <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>Intermediário | 7 meses | Nenhuma</Text>

            <View style={styles.lista}>
                <View style={styles.itemLista}>
                    <Text style={[styles.ponto, { color: cores.textoSecundario }]}>•</Text>
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Introduzir alimentos complementares mantendo o leite materno ou fórmula como principal fonte de nutrição.</Text>
                </View>
                <View style={styles.itemLista}>
                    <Text style={[styles.ponto, { color: cores.textoSecundario }]}>•</Text>
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Oferecer frutas amassadas ou em pedaços adequados.</Text>
                </View>
            </View>

            <Image
                source={require('../assets/recomendacaoAlimentacao.png')}
                style={[styles.imagemRecomendacao, { borderColor: cores.borda }]}
                resizeMode="cover"
                accessibilityLabel="Bebê sendo alimentado"
            />
            <Text style={[styles.legenda, { color: cores.textoSecundario }]}>Dra. Barbara, Especialista em alimentação infantil.</Text>
            <Text style={[styles.copyright, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
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

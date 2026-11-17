import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../TemaContext';

const siteKidJourney = 'https://kidjourney-3cc97.web.app/premium';

export function BloqueioPremium({ titulo, texto }) {
    const { cores } = useTema();

    function abrirSite() {
        Linking.openURL(siteKidJourney).catch(() => {
            Alert.alert('Não foi possível abrir o site', 'Tente novamente mais tarde.');
        });
    }

    return (
        <View style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <View style={styles.cabecalho}>
                <View style={[styles.icone, { backgroundColor: cores.selecao }]}>
                    <Ionicons name="lock-closed" size={22} color={cores.acento} />
                </View>
                <Text style={[styles.titulo, { color: cores.titulo }]}>{titulo}</Text>
            </View>

            <Text style={[styles.texto, { color: cores.textoSecundario }]}>{texto}</Text>

            <TouchableOpacity style={styles.link} onPress={abrirSite} accessibilityRole="link">
                <Text style={[styles.textoLink, { color: cores.acento }]}>Assine agora mesmo</Text>
                <Ionicons name="open-outline" size={16} color={cores.acento} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 18,
        marginBottom: 0,
    },
    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icone: {
        width: 42,
        height: 42,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    titulo: {
        flex: 1,
        fontSize: 17,
        fontFamily: 'Nunito_700Bold',
    },
    texto: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: 'Poppins_400Regular',
        marginTop: 12,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 12,
    },
    textoLink: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textDecorationLine: 'underline',
        marginRight: 5,
    },
});
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { Crianca } from '../components/Crianca';

export default function CriancasScreen({ navigation }) {
    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.titulo}>Suas Crianças</Text>
            <View style={{ gap: 10 }}>
                <Text style={styles.texto}>Você ainda não cadastrou nenhuma criança.</Text>
                <BotaoPrincipal texto="Cadastrar Criança" onPress={() => navigation.navigate('Cadastrocrianca')} />
                <Crianca nome="Lavínia" sexo="Feminino" idade="1 ano" especificidade="Celíaca, TDHA, Autismo, Jebediah" />
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
        marginBottom: 24,
    },

    texto: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
});
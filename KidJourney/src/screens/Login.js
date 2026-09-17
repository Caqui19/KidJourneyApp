import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { BotaoSecundario } from '../components/Botaosecundario';
import { Input } from '../components/Input';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
                <View style={styles.form}>
                    <Text style={styles.titulo}>Login</Text>
                    <Text style={styles.texto}>Entre na sua conta para acessar a plataforma.</Text>
                    <Input
                        texto={email}
                        placeholder="Endereço de Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        setTexto={setEmail}
                    />
                    <Input
                        texto={password}
                        setTexto={setPassword}
                        placeholder="Senha"
                        secureTextEntry={true}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('Esqueceu')}>
                        <Text style={styles.link}>Esqueceu a senha?</Text>
                    </TouchableOpacity>
                    <BotaoPrincipal texto="Entrar" onPress={() => navigation.navigate('Home')} />
                    <Text style={styles.texto2}>ou</Text>
                    <TouchableOpacity style={styles.botaoGoogle}>
                        <Image source={require('../assets/google.png')} resizeMode="contain" style={styles.google} />
                        <Text style={styles.textoGoogle}>Entre com Google Accounts</Text>
                    </TouchableOpacity>
                </View>
                <BotaoSecundario texto="Crie uma conta" style={{ marginTop: 80 }} onPress={() => navigation.navigate('Signup')} />
                <Text style={[styles.texto2, { marginTop: 20 }]}>&copy; 2026 KidJourney. Todos os direitos reservados.</Text>
            </View>
        </ScrollView >
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

    form: {
        width: '100%',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 10,
    },

    scrollContainer: {
        backgroundColor: '#fff',
        width: '100%',
    },

    logo: {
        width: 200,
        height: 80,
        marginBottom: 40,
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

    botaoGoogle: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },

    textoGoogle: {
        fontSize: 16,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
    },

    google: {
        width: 40,
        height: 40,
    },
});
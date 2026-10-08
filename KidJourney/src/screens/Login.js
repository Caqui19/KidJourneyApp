import React, { useState } from 'react';
import { View, ScrollView, Text, Image, Alert, StyleSheet } from 'react-native';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { BotaoSecundario } from '../components/Botaosecundario';
import { Input } from '../components/Input';
import { useAuth } from '../auth/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isLoading } = useAuth();

    async function handleLogin() {
        if (!email.trim() || !password) {
            Alert.alert('Campos obrigatórios', 'Informe seu email e sua senha.');
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email.trim(), password);
        } catch (error) {
            Alert.alert('Não foi possível entrar', error.message || 'Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

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
                        autoComplete="email"
                        textContentType="emailAddress"
                        maxLength={254}
                        setTexto={setEmail}
                    />
                    <Input
                        texto={password}
                        setTexto={setPassword}
                        placeholder="Senha"
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="current-password"
                        textContentType="password"
                        maxLength={72}
                    />
                    <BotaoPrincipal
                        texto={isSubmitting ? 'Entrando...' : 'Entrar'}
                        disabled={isSubmitting || isLoading}
                        onPress={handleLogin}
                    />
                </View>
                <BotaoSecundario texto="Crie uma conta" style={{ marginTop: 20 }} onPress={() => navigation.navigate('Signup')} />
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

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

});

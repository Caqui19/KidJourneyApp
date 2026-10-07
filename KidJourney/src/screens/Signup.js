import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { BotaoSecundario } from '../components/Botaosecundario';
import { Input } from '../components/Input';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';

export default function SignupScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [uso, setUso] = useState(false);
    const [servico, setServico] = useState(false);
    const [politica, setPolitica] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();

    async function handleRegister() {
        if (nome.trim().length < 2 || !email.trim() || password.length < 12) {
            Alert.alert(
                'Confira seus dados',
                'Informe seu nome, um email válido e uma senha com pelo menos 12 caracteres.'
            );
            return;
        }

        if (!uso || !servico || !politica) {
            Alert.alert('Aceite necessário', 'Aceite os três itens para criar sua conta.');
            return;
        }

        setIsSubmitting(true);

        try {
            await register(nome.trim(), email.trim(), password, true);
        } catch (error) {
            Alert.alert('Não foi possível cadastrar', error.message || 'Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: '#BFDE6C60', width: 40, height: 40, borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="#326c00" />
                </TouchableOpacity>
                <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
                <View style={styles.form}>
                    <Text style={styles.titulo}>Cadastro</Text>
                    <Text style={styles.texto}>Crie sua conta para acessar a plataforma.</Text>
                    <Input
                        texto={nome}
                        placeholder="Nome do Responsável"
                        keyboardType="default"
                        autoCapitalize="words"
                        autoComplete="name"
                        textContentType="name"
                        maxLength={100}
                        setTexto={setNome}
                    />
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
                        placeholder="Senha (mínimo de 12 caracteres)"
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        textContentType="newPassword"
                        maxLength={72}
                    />
                    <View style={styles.checkboxContainer}>
                        <Checkbox value={uso} onValueChange={setUso} color={uso ? '#326c00' : undefined} />
                        <TouchableOpacity onPress={() => setUso((value) => !value)}>
                            <Text style={styles.checkboxLabel}>Aceito os Termos de Uso</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <Checkbox value={servico} onValueChange={setServico} color={servico ? '#326c00' : undefined} />
                        <TouchableOpacity onPress={() => setServico((value) => !value)}>
                            <Text style={styles.checkboxLabel}>Aceito os Termos de Serviço</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <Checkbox value={politica} onValueChange={setPolitica} color={politica ? '#326c00' : undefined} />
                        <TouchableOpacity onPress={() => setPolitica((value) => !value)}>
                            <Text style={styles.checkboxLabel}>Aceito a Política de Privacidade</Text>
                        </TouchableOpacity>
                    </View>
                    <BotaoPrincipal
                        texto={isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        disabled={isSubmitting}
                        onPress={handleRegister}
                    />
                    <BotaoSecundario texto="Entre na sua Conta" onPress={() => navigation.navigate('Login')} />
                    <Text style={[styles.texto2, { marginTop: 20 }]}>&copy; 2026 KidJourney. Todos os direitos reservados.</Text>
                </View>
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

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    checkboxLabel: {
        color: '#326c00',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
});

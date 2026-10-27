import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { BotaoSecundario } from '../components/Botaosecundario';
import { Input } from '../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { mensagemErro } from '../services/auth';

export default function EsqueceuScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resetPassword } = useAuth();

    async function handleResetPassword() {
        if (!email.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Informe seu email para continuar.' });
            return;
        }

        setMensagem(null);
        setIsSubmitting(true);

        try {
            await resetPassword(email.trim());
            setMensagem({ tipo: 'sucesso', texto: 'Se esse email estiver cadastrado, enviaremos as instruções para redefinir sua senha.' });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setMensagem({ tipo: 'sucesso', texto: 'Se esse email estiver cadastrado, enviaremos as instruções para redefinir sua senha.' });
            } else {
                setMensagem({ tipo: 'erro', texto: mensagemErro(error) });
            }
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
                    <Text style={styles.titulo}>Esqueceu a Senha?</Text>
                    <Text style={styles.texto}>Insira seu Email para que possamos enviar a redefinição da senha.</Text>
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
                    {mensagem ? (
                        <View style={[styles.feedback, mensagem.tipo === 'erro' && styles.feedbackErro]}>
                            <Text style={[styles.feedbackTexto, mensagem.tipo === 'erro' && styles.feedbackErroTexto]}>{mensagem.texto}</Text>
                        </View>
                    ) : null}
                    <BotaoPrincipal texto={isSubmitting ? 'Enviando...' : 'Enviar Redefinição'} disabled={isSubmitting} onPress={handleResetPassword} />
                    <Text style={styles.texto2}>ou</Text>
                    <BotaoSecundario texto="Entre na sua Conta" onPress={() => navigation.navigate('Login')} />
                    <Text style={[styles.texto2, { marginTop: 10 }]}>&copy; 2026 KidJourney. Todos os direitos reservados.</Text>
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
        paddingTop: 40,
        paddingBottom: 20,
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

    feedback: {
        backgroundColor: '#BFDE6C60',
        borderColor: '#326c00',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },

    feedbackErro: {
        backgroundColor: '#fff2e8',
        borderColor: '#a64b00',
    },

    feedbackErroTexto: {
        color: '#8a3b00',
    },

    feedbackTexto: {
        color: '#326c00',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
});

import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BotaoSecundario } from '../components/Botaosecundario';
import { useAuth } from '../auth/AuthContext';

export default function PerfilScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function handleLogout() {
        setIsSigningOut(true);

        try {
            const result = await logout();
            if (!result.serverRevoked || !result.localCleared) {
                const warnings = [];
                if (!result.localCleared) {
                    warnings.push('O aparelho não confirmou a limpeza do token local.');
                }
                if (!result.serverRevoked) {
                    warnings.push('O servidor não confirmou o encerramento; a sessão expira em até 30 dias.');
                }

                Alert.alert(
                    'Você saiu deste aparelho',
                    warnings.join(' ')
                );
            }
        } catch {
            Alert.alert(
                'Sessão encerrada neste aparelho',
                'Não foi possível confirmar a limpeza segura da sessão local. Entre novamente quando houver conexão.'
            );
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: '#BFDE6C60', width: 40, height: 40, borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color="#326c00" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Seu Perfil</Text>
                </View>
                <Image source={require('../assets/perfil.png')} resizeMode="contain" style={styles.perfil} />
                <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{user?.nome}</Text>
                    <Text style={styles.accountEmail}>{user?.email}</Text>
                </View>
                <BotaoSecundario texto='Acessar Configurações' onPress={() => navigation.navigate('Configuracoes')} />
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', }}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isSigningOut}
                        accessibilityRole="button"
                        style={{
                            minWidth: 84,
                            paddingHorizontal: 10,
                            paddingVertical: 0,
                            borderWidth: 1,
                            borderColor: '#326c00',
                            borderRadius: 50,
                            opacity: isSigningOut ? 0.6 : 1,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={styles.link}>
                            {isSigningOut ? 'Saindo...' : 'Sair'} <FontAwesome5 name="sign-out-alt" size={15} color="#326c00" />
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.texto2}>&copy; 2026 KidJourney</Text>
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
        gap: 20,
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
        marginBottom: -10,
    },

    texto: {
        fontSize: 16,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
    },

    accountDetails: {
        alignItems: 'center',
        gap: 4,
    },

    accountName: {
        fontSize: 20,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
    },

    accountEmail: {
        fontSize: 14,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

    perfil: {
        borderRadius: 100,
        width: 150,
        height: 150,
    },

    link: {
        color: '#326c00',
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    }
});

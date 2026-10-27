import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Animated, Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './src/auth/AuthContext';

import LoginScreen from './src/screens/Login';
import SignupScreen from './src/screens/Signup';
import EsqueceuScreen from './src/screens/Esqueceu';
import HomeScreen from './src/screens/Home';
import CriancasScreen from './src/screens/Criancas';
import RelatorioScreen from './src/screens/Relatorio';
import JornadaScreen from './src/screens/Jornada';
import RecomendacoesScreen from './src/screens/Recomendacoes';
import AnotacoesScreen from './src/screens/Anotacoes';
import PerfilScreen from './src/screens/Perfil';
import ConfiguracoesScreen from './src/screens/Configuracoes';
import CadastrocriancaScreen from './src/screens/Cadastrocrianca';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SplashScreen() {
    const ponto1 = useRef(new Animated.Value(0)).current;
    const ponto2 = useRef(new Animated.Value(0)).current;
    const ponto3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animacoes = [ponto1, ponto2, ponto3].map((ponto, index) => {
            const animacao = Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 150),
                    Animated.timing(ponto, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(ponto, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.delay((2 - index) * 150),
                ])
            );

            animacao.start();
            return animacao;
        });

        return () => animacoes.forEach((animacao) => animacao.stop());
    }, [ponto1, ponto2, ponto3]);

    const pontos = [ponto1, ponto2, ponto3];

    return (
        <View style={styles.splash}>
            <Image source={require('./src/assets/logo.png')} resizeMode="contain" style={styles.splashLogo} />
            <View style={styles.pontos}>
                {pontos.map((ponto, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.ponto,
                            {
                                transform: [{
                                    translateY: ponto.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -9],
                                    }),
                                }],
                            },
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.splashCopyright}>&copy; 2026 KidJourney</Text>
        </View>
    );
}

function TabRoutes() {
    const [criancaSelecionada, setCriancaSelecionada] = useState(null);

    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
            header: ({ navigation }) => {
                let titulo = '';
                let subtitulo = 'Personalização para:';
                if (criancaSelecionada?.nome) {
                    subtitulo += ` ${criancaSelecionada.nome}`;
                }

                switch (route.name) {
                    case 'Criancas':
                        titulo = 'Crianças';
                        break;
                    case 'Relatorio':
                        titulo = 'Relatório';
                        break;
                    case 'Home':
                        titulo = 'Home';
                        break;
                    case 'Jornada':
                        titulo = 'Jornada';
                        break;
                    case 'Recomendacoes':
                        titulo = 'Recomendações';
                        break;
                    case 'Anotacoes':
                        titulo = 'Anotações';
                        break;
                }

                return (
                    <View style={styles.header}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>{titulo}</Text>
                            <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                                {subtitulo}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
                            <Ionicons name="person-circle-outline" size={42} color="#326c00" />
                        </TouchableOpacity>
                    </View>
                );
            },
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#326c00',
            tabBarInactiveTintColor: '#326c0090',
            tabBarStyle: {
                backgroundColor: '#BFDE6C',
                height: 70,
                borderTopWidth: 1,
                borderTopColor: '#326c00',
                paddingBottom: 10,
                paddingTop: 10,
                marginBottom: 40,
            },
            tabBarIcon: ({ color }) => {
                let nomeIcone;

                switch (route.name) {
                    case 'Criancas':
                        nomeIcone = 'baby';
                        break;
                    case 'Relatorio':
                        nomeIcone = 'chart-bar';
                        break;
                    case 'Home':
                        nomeIcone = 'home';
                        break;
                    case 'Jornada':
                        nomeIcone = 'shoe-prints';
                        break;
                    case 'Recomendacoes':
                        nomeIcone = 'plus-circle';
                        break;
                    case 'Anotacoes':
                        nomeIcone = 'sticky-note';
                        break;
                }
                return <FontAwesome5 name={nomeIcone} size={24} color={color} solid />;
            },
        })}>
            <Tab.Screen name="Criancas">
                {(props) => (
                    <CriancasScreen
                        {...props}
                        criancaSelecionada={criancaSelecionada}
                        aoSelecionarCrianca={setCriancaSelecionada}
                    />
                )}
            </Tab.Screen>
            <Tab.Screen name="Relatorio" component={RelatorioScreen} />
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Jornada" component={JornadaScreen} />
            <Tab.Screen name="Recomendacoes" component={RecomendacoesScreen} />
            <Tab.Screen name="Anotacoes" component={AnotacoesScreen} />
        </Tab.Navigator>
    );
}

export default function Routes({ fontsLoaded = true }) {
    const { user, isLoading } = useAuth();
    const [splashConcluida, setSplashConcluida] = useState(false);

    useEffect(() => {
        const tempo = setTimeout(() => setSplashConcluida(true), 3000);
        return () => clearTimeout(tempo);
    }, []);

    if (!fontsLoaded || isLoading || !splashConcluida) {
        return <SplashScreen />;
    }

    return user ? (
        <Stack.Navigator key="authenticated" initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Inicio" component={TabRoutes} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
            <Stack.Screen name="Cadastrocrianca" component={CadastrocriancaScreen} />
        </Stack.Navigator>
    ) : (
        <Stack.Navigator key="guest" initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Esqueceu" component={EsqueceuScreen} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    splashLogo: {
        width: 230,
        height: 100,
        marginBottom: 18,
    },

    pontos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    ponto: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#BFDE6C',
    },

    splashCopyright: {
        position: 'absolute',
        bottom: 20,
        color: '#636363',
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },

    header: {
        backgroundColor: '#BFDE6C',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#326c00',
    },

    headerTitle: {
        fontSize: 24,
        fontFamily: 'Nunito_700Bold',
        color: '#326c00',
    },

    headerInfo: {
        flex: 1,
        maxWidth: '80%',
        minWidth: 0,
        marginRight: 8,
    },

    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#326c00',
    }
});

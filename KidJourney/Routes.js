import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import LoginScreen from './src/screens/Login';
import SignupScreen from './src/screens/Signup';
import EsqueceuScreen from './src/screens/Esqueceu';
import HomeScreen from './src/screens/Home';
import CriancasScreen from './src/screens/Criancas';
import RelatorioScreen from './src/screens/Relatorio';
import JornadaScreen from './src/screens/Jornada';
import RecomendacoesScreen from './src/screens/Recomendacoes';
import PerfilScreen from './src/screens/Perfil';
import ConfiguracoesScreen from './src/screens/Configuracoes';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabRoutes() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
            header: ({ navigation }) => {
                let titulo = '';
                let subtitulo = 'Personalização para: Lavínia';

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
                }

                return (
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>{titulo}</Text>
                            <Text style={styles.headerSubtitle}>{subtitulo}</Text>
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
                }
                return <FontAwesome5 name={nomeIcone} size={24} color={color} solid />;
            },
        })}>
            <Tab.Screen name="Criancas" component={CriancasScreen} />
            <Tab.Screen name="Relatorio" component={RelatorioScreen} />
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Jornada" component={JornadaScreen} />
            <Tab.Screen name="Recomendacoes" component={RecomendacoesScreen} />
        </Tab.Navigator>
    );
}

export default function Routes() {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Esqueceu" component={EsqueceuScreen} />
            <Stack.Screen name="Home" component={TabRoutes} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
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

    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#326c00',
    }
});
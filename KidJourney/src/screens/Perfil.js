import React, { useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { BotaoSecundario } from '../components/Botaosecundario';

export default function PerfilScreen({ navigation }) {
    const [nome, setNome] = useState('');
    useEffect(() => {
        const carregarDados = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('responsaveis')
                    .select('*')
                    .eq('id_responsaveis', user.id)
                    .single();

                if (data) {
                    setNome(data.nome_responsavel);
                }
            }
        };

        carregarDados();
    }, []);

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: '#BFDE6C60', width: 40, height: 40, borderRadius: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color="#326c00" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Seu Perfil</Text>
                </View>
                <TouchableOpacity style={styles.fotoPerfilBotao}>
                    <Image source={require('../assets/perfil.png')} resizeMode="contain" style={styles.fotoPerfil} />
                </TouchableOpacity>
                <Input
                    texto={nome}
                    placeholder="Nome do Responsável"
                    keyboardType="default"
                    autoCapitalize="words"
                    setTexto={setNome}
                />
                <BotaoPrincipal texto='Atualizar' />
                <BotaoSecundario texto='Acessar Configurações' onPress={() => navigation.navigate('Configuracoes')} />
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', }}>
                    <TouchableOpacity>
                        <Text style={styles.link}>Alterar Senha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        width: 'fit-content',
                        paddingHorizontal: 10,
                        paddingVertical: 0,
                        borderWidth: 1,
                        borderColor: '#326c00',
                        borderRadius: 50,
                    }}>
                        <Text style={styles.link}>Sair <FontAwesome5 name="sign-out-alt" size={15} color="#326c00" /></Text>
                    </TouchableOpacity>
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

    fotoPerfil: {
        borderRadius: '100%',
        width: 150,
        height: 150,
    },
});
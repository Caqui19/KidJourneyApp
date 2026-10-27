import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { Crianca } from '../components/Crianca';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';

export default function CriancasScreen({ navigation, criancaSelecionada, aoSelecionarCrianca }) {
    const { user } = useAuth();
    const [criancaGerenciada, setCriancaGerenciada] = useState(null);
    const [criancas, setCriancas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setCriancas([]);
            setCarregando(false);
            return;
        }

        const caminho = collection(db, 'usuarios', user.uid, 'criancas');
        const consulta = query(caminho, orderBy('criadoEm', 'desc'));

        return onSnapshot(consulta, (resultado) => {
            setCriancas(resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data(),
            })));
            setCarregando(false);
        }, () => {
            Alert.alert('Não foi possível carregar', 'Confira o Firestore e tente novamente.');
            setCarregando(false);
        });
    }, [user?.uid]);

    async function deletarCrianca(crianca) {
        if (!user?.uid) return false;

        try {
            await deleteDoc(doc(db, 'usuarios', user.uid, 'criancas', crianca.id));
            if (criancaSelecionada?.id === crianca.id) {
                aoSelecionarCrianca(null);
            }
            setCriancaGerenciada(null);
            return true;
        } catch {
            Alert.alert('Não foi possível deletar', 'Tente novamente mais tarde.');
            return false;
        }
    }

    if (criancaGerenciada) {
        return (
            <GerenciarCrianca
                crianca={criancaGerenciada}
                voltar={() => setCriancaGerenciada(null)}
                aoDeletar={() => deletarCrianca(criancaGerenciada)}
            />
        );
    }

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.titulo}>Suas Crianças</Text>
            <View style={{ gap: 10 }}>
                <BotaoPrincipal texto="Cadastrar Criança" onPress={() => navigation.navigate('Cadastrocrianca')} />
                {carregando ? (
                    <Text style={styles.texto2}>Carregando crianças...</Text>
                ) : criancas.length === 0 ? (
                    <Text style={styles.texto2}>Você ainda não cadastrou nenhuma criança.</Text>
                ) : (
                    criancas.map((crianca) => (
                        <Crianca
                            key={crianca.id}
                            {...crianca}
                            selecionada={criancaSelecionada?.id === crianca.id}
                            onManage={() => setCriancaGerenciada(crianca)}
                            onSelect={() => aoSelecionarCrianca(
                                criancaSelecionada?.id === crianca.id ? null : crianca
                            )}
                        />
                    ))
                )}
            </View>
            <Text style={styles.texto2}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

function GerenciarCrianca({ crianca, voltar, aoDeletar }) {
    const [mostrarEspecificidades, setMostrarEspecificidades] = useState(false);
    const [mostrarModalDeletar, setMostrarModalDeletar] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const especificidades = crianca.especificidades?.length
        ? crianca.especificidades.join('\n')
        : 'Nenhuma';

    async function confirmarDelecao() {
        setDeletando(true);
        const deletada = await aoDeletar();
        if (!deletada) setDeletando(false);
    }

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.detalheContainer}>
            <View style={styles.dadosCrianca}>
                <View style={styles.voltarEIcone}>
                    <TouchableOpacity onPress={voltar} style={styles.voltar}>
                        <Ionicons name="arrow-back" size={30} color="#326c00" />
                    </TouchableOpacity>
                    <FontAwesome5 name="baby" size={34} color="#326c00" />
                </View>
                <View style={styles.dadosTexto}>
                    <Text style={styles.nomeCrianca} numberOfLines={1} ellipsizeMode="tail">{crianca.nome}</Text>
                    <Text style={styles.texto} numberOfLines={1} ellipsizeMode="tail">Sexo: {crianca.sexo}</Text>
                    <Text style={styles.texto} numberOfLines={1} ellipsizeMode="tail">Idade: {crianca.idade}</Text>
                    <Text style={styles.texto} numberOfLines={1} ellipsizeMode="tail">Nascimento: {crianca.dataNascimento}</Text>
                    <TouchableOpacity onPress={() => setMostrarEspecificidades(true)}>
                        <Text style={styles.textoEspecificidade} numberOfLines={1} ellipsizeMode="tail">
                            Especificidades: {crianca.especificidades?.join(', ') || 'Nenhuma'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={mostrarEspecificidades}
                transparent
                animationType="fade"
                onRequestClose={() => setMostrarEspecificidades(false)}
            >
                <View style={styles.popupFundo}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMostrarEspecificidades(false)}
                    />
                    <View style={styles.popupEspecificidades}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={styles.tituloPopup}>Especificidades</Text>
                            <TouchableOpacity onPress={() => setMostrarEspecificidades(false)}>
                                <FontAwesome5 name="times" size={20} color="#326c00" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.listaPopup}>
                            <Text style={styles.textoPopup}>{especificidades}</Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={mostrarModalDeletar}
                transparent
                animationType="fade"
                onRequestClose={() => setMostrarModalDeletar(false)}
            >
                <View style={styles.popupFundo}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMostrarModalDeletar(false)}
                    />
                    <View style={styles.popupEspecificidades}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={styles.tituloPopup}>Deletar Criança</Text>
                            <TouchableOpacity onPress={() => setMostrarModalDeletar(false)} disabled={deletando}>
                                <FontAwesome5 name="times" size={20} color="#326c00" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.textoPopup}>Deseja mesmo deletar {crianca.nome}?</Text>
                        <View style={styles.botoesPopup}>
                            <TouchableOpacity
                                style={styles.botaoCancelarPopup}
                                onPress={() => setMostrarModalDeletar(false)}
                                disabled={deletando}
                            >
                                <Text style={styles.textoCancelarPopup}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoDeletarPopup, deletando && styles.botaoDesativado]}
                                onPress={confirmarDelecao}
                                disabled={deletando}
                            >
                                <Text style={styles.textoDeletarPopup}>
                                    {deletando ? 'Deletando...' : 'Deletar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Text style={styles.tituloSecao}>Alimentação</Text>
            <View style={styles.card}>
                <FontAwesome5 name="calendar-alt" size={35} color="#326c00" />
                <View style={styles.refeicoes}>
                    <Text style={styles.texto}>Café da manhã: 5:00 - Frutas</Text>
                    <Text style={styles.texto}>Almoço: 12:00 - Leite m.</Text>
                    <Text style={styles.texto}>Lanche: 17:00 - Frutas</Text>
                    <Text style={styles.texto}>Jantar: 19:00</Text>
                    <TouchableOpacity
                        style={styles.botaoRotina}
                        onPress={() => Alert.alert('Horário da rotina', 'A edição de horários será adicionada depois.')}
                    >
                        <Ionicons name="add" size={26} color="#326c00" />
                        <Text style={styles.textoBotao}>Horário da rotina</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.tituloSecao}>Horário da rotina</Text>
            <View style={[styles.card, styles.cardRotina]}>
                <View style={styles.horarioItem}>
                    <Ionicons name="sunny" size={34} color="#f6a800" />
                    <View>
                        <Text style={styles.nomeHorario}>Acorda:</Text>
                        <Text style={styles.texto}>4:30</Text>
                    </View>
                </View>
                <View style={styles.horarioItem}>
                    <Ionicons name="moon" size={34} color="#666" />
                    <View>
                        <Text style={styles.nomeHorario}>Dormir:</Text>
                        <Text style={styles.texto}>13:50</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Horário da rotina', 'A edição de horários será adicionada depois.')}>
                    <Ionicons name="settings-sharp" size={24} color="#326c00" />
                </TouchableOpacity>
            </View>

            <View style={styles.separadorExcluir} />
            <TouchableOpacity style={styles.botaoExcluir} onPress={() => setMostrarModalDeletar(true)}>
                <Text style={styles.textoExcluir}>Deletar Criança</Text>
            </TouchableOpacity>
            <Text style={[styles.texto2, styles.copyrightDetalhe]}>&copy; 2026 KidJourney</Text>
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
        fontSize: 15,
        color: '#636363',
        textAlign: 'left',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
    },

    texto2: {
        fontSize: 14,
        color: '#636363',
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },

    copyrightDetalhe: {
        marginTop: 12,
    },

    detalheContainer: {
        paddingHorizontal: 14,
        paddingTop: 16,
        paddingBottom: 20,
        gap: 8,
    },

    dadosCrianca: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },

    voltarEIcone: {
        width: 116,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    voltar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#BFDE6C60',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dadosTexto: {
        flex: 1,
    },

    popupFundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    popupEspecificidades: {
        width: '90%',
        maxWidth: 360,
        maxHeight: '75%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 15,
        gap: 10,
        backgroundColor: '#fff',
    },

    cabecalhoPopup: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    tituloPopup: {
        color: '#326c00',
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },

    listaPopup: {
        maxHeight: 320,
    },

    textoPopup: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 24,
    },

    botoesPopup: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },

    botaoCancelarPopup: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#326c00',
        backgroundColor: '#BFDE6C',
    },

    textoCancelarPopup: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    botaoDeletarPopup: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#326c00',
        backgroundColor: '#fff',
    },

    textoDeletarPopup: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoEspecificidade: {
        color: '#326c00',
        fontSize: 15,
        textAlign: 'left',
        textDecorationLine: 'underline',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
    },

    nomeCrianca: {
        color: '#326c00',
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },

    tituloSecao: {
        color: '#326c00',
        fontSize: 22,
        fontFamily: 'Nunito_700Bold',
        marginTop: 8,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 14,
    },

    refeicoes: {
        flex: 1,
    },

    botaoRotina: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#BFDE6C60',
        borderColor: '#9fcb5f',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginTop: 8,
    },

    textoBotao: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    cardRotina: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },

    horarioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    nomeHorario: {
        color: '#326c00',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },

    botaoExcluir: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#b42318',
        borderRadius: 24,
        backgroundColor: '#fff',
        paddingVertical: 10,
    },

    separadorExcluir: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginTop: 12,
        paddingTop: 12,
    },

    textoExcluir: {
        color: '#b42318',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

});

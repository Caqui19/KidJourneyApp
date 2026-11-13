import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../TemaContext';

const fases = [
    {
        nome: 'Início',
        idade: '0 a 5 meses',
        minimo: 0,
        maximo: 5,
        alimentacao: [
            'O leite materno é recomendado como alimento exclusivo até os 6 meses.',
            'Quando o aleitamento materno não for possível, siga a orientação recebida para a alimentação da criança.',
            'A alimentação complementar começa por volta dos 6 meses.',
        ],
        sono: (meses) => meses < 4
            ? [
                'Para menores de 4 meses, não existe uma quantidade diária única de sono definida como recomendação.',
                'O sono varia bastante nessa fase; observe os sinais de sono da criança.',
                'Mantenha um ambiente seguro para todos os períodos de sono.',
            ]
            : [
                'A recomendação é de 12 a 16 horas de sono por dia, incluindo as sonecas.',
                'Mantenha oportunidades de sono ao longo do dia e uma rotina tranquila.',
                'Mantenha um ambiente seguro para todos os períodos de sono.',
            ],
    },
    {
        nome: 'Introdução alimentar',
        idade: '6 a 8 meses',
        minimo: 6,
        maximo: 8,
        alimentacao: [
            'Ofereça de 2 a 3 refeições complementares por dia.',
            'Comece com alimentos amassados e avance a consistência aos poucos.',
            'Continue oferecendo leite materno junto com os alimentos.',
        ],
        sono: () => [
            'A recomendação é de 12 a 16 horas de sono por dia, incluindo as sonecas.',
            'Uma rotina tranquila antes de dormir pode ajudar a criança a reconhecer o momento do sono.',
        ],
    },
    {
        nome: 'Ampliação alimentar',
        idade: '9 a 11 meses',
        minimo: 9,
        maximo: 11,
        alimentacao: [
            'Ofereça de 3 a 4 refeições complementares por dia; lanches podem ser incluídos quando necessário.',
            'Varie os alimentos e avance gradualmente as texturas, conforme a criança aceita.',
            'Continue oferecendo leite materno.',
        ],
        sono: () => [
            'A recomendação é de 12 a 16 horas de sono por dia, incluindo as sonecas.',
            'Tente manter horários e uma rotina de sono previsíveis.',
        ],
    },
    {
        nome: 'Transição para a comida da família',
        idade: '1 a 2 anos',
        minimo: 12,
        maximo: 23,
        alimentacao: [
            'Ofereça de 3 a 4 refeições por dia e 1 a 2 lanches, conforme a necessidade.',
            'A criança pode comer os alimentos da família em consistência segura e adequada para ela.',
            'O aleitamento materno pode continuar até 2 anos ou mais.',
        ],
        sono: () => [
            'A recomendação é de 11 a 14 horas de sono por dia, incluindo as sonecas.',
            'Mantenha uma rotina previsível para dormir e acordar.',
        ],
    },
    {
        nome: 'Autonomia',
        idade: '2 a 3 anos',
        minimo: 24,
        maximo: 35,
        alimentacao: [
            'Ofereça refeições variadas com alimentos in natura ou minimamente processados.',
            'Inclua frutas, legumes, feijão e outros alimentos da família ao longo da semana.',
            'Respeite os sinais de fome e saciedade da criança.',
        ],
        sono: () => [
            'A recomendação é de 11 a 14 horas de sono por dia, incluindo as sonecas.',
            'Uma rotina regular e um ambiente tranquilo ajudam a organizar o sono.',
        ],
    },
    {
        nome: 'Pré-escolar',
        idade: '3 a 5 anos',
        minimo: 36,
        maximo: 71,
        alimentacao: [
            'Ofereça refeições variadas com frutas, legumes, feijão e outros alimentos da família.',
            'Prefira alimentos in natura ou minimamente processados e limite ultraprocessados.',
            'Respeite a fome e a saciedade; incentive a criança a participar das refeições.',
        ],
        sono: () => [
            'A recomendação é de 10 a 13 horas de sono por dia, incluindo as sonecas.',
            'Mantenha horários regulares e uma rotina calma antes de dormir.',
        ],
    },
];

function idadeEmMeses(dataNascimento, hoje) {
    if (typeof dataNascimento !== 'string') return null;

    const partes = dataNascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) return null;

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);
    const nascimento = new Date(ano, mes - 1, dia);

    if (
        nascimento.getFullYear() !== ano
        || nascimento.getMonth() !== mes - 1
        || nascimento.getDate() !== dia
        || nascimento > hoje
    ) return null;

    let meses = (hoje.getFullYear() - ano) * 12 + hoje.getMonth() - (mes - 1);
    if (hoje.getDate() < dia) meses--;
    return meses;
}

function ListaRecomendacoes({ itens, cores }) {
    return (
        <View style={styles.lista}>
            {itens.map((item) => (
                <View key={item} style={styles.linhaRecomendacao}>
                    <View style={[styles.ponto, { backgroundColor: cores.acento }]} />
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>{item}</Text>
                </View>
            ))}
        </View>
    );
}

export default function JornadaScreen({ criancaSelecionada }) {
    const { cores } = useTema();
    const [hoje, setHoje] = useState(() => new Date());
    const meses = idadeEmMeses(criancaSelecionada?.dataNascimento, hoje);
    const faseAtual = meses === null
        ? -1
        : fases.findIndex((fase) => meses >= fase.minimo && meses <= fase.maximo);
    const [faseAberta, setFaseAberta] = useState(faseAtual);
    const titulo = criancaSelecionada?.nome
        ? `Jornada de ${criancaSelecionada.nome}`
        : 'Jornada infantil';
    const mensagemFase = !criancaSelecionada
        ? 'Selecione uma criança para ver a fase correspondente à idade.'
        : meses === null
            ? 'Não foi possível calcular a fase sem uma data de nascimento válida.'
            : `Fase atual: ${fases[faseAtual]?.nome || 'fora das faixas disponíveis'}`;

    useEffect(() => {
        setFaseAberta(faseAtual);
    }, [criancaSelecionada?.id, faseAtual]);

    useEffect(() => {
        const agora = new Date();
        const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
        const temporizador = setTimeout(() => setHoje(new Date()), meiaNoite - agora);

        return () => clearTimeout(temporizador);
    }, [hoje]);

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.container}>
            <Text style={[styles.titulo, { color: cores.titulo }]} numberOfLines={1} ellipsizeMode="tail">{titulo}</Text>
            <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>{mensagemFase}</Text>

            {fases.map((fase, indice) => {
                const selecionada = indice === faseAtual;
                const aberta = indice === faseAberta;

                return (
                    <View
                        key={fase.nome}
                        style={[
                            styles.card,
                            { backgroundColor: cores.cartao, borderColor: cores.borda },
                            selecionada && [styles.cardSelecionado, { backgroundColor: cores.selecao, borderColor: cores.acento }],
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.cabecalhoFase}
                            onPress={() => setFaseAberta(aberta ? -1 : indice)}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: aberta, selected: selecionada }}
                        >
                            <View style={styles.textosFase}>
                                <Text style={[styles.nomeFase, { color: cores.titulo }]}>{fase.nome}</Text>
                                <Text style={[styles.faixaEtaria, { color: cores.textoSecundario }]}>{fase.idade}</Text>
                            </View>
                            <View style={styles.iconesFase}>
                                {selecionada && <Ionicons name="checkmark-circle" size={22} color={cores.acento} />}
                                <Ionicons name={aberta ? 'chevron-up' : 'chevron-down'} size={22} color={cores.acento} />
                            </View>
                        </TouchableOpacity>

                        {aberta && (
                            <View style={styles.conteudoFase}>
                                <View style={styles.secao}>
                                    <View style={styles.tituloSecao}>
                                        <Ionicons name="restaurant" size={19} color={cores.acento} />
                                        <Text style={[styles.nomeSecao, { color: cores.titulo }]}>Alimentação</Text>
                                    </View>
                                    <ListaRecomendacoes itens={fase.alimentacao} cores={cores} />
                                </View>

                                <View style={styles.secao}>
                                    <View style={styles.tituloSecao}>
                                        <Ionicons name="moon" size={19} color={cores.acento} />
                                        <Text style={[styles.nomeSecao, { color: cores.titulo }]}>Sono</Text>
                                    </View>
                                    <ListaRecomendacoes itens={fase.sono(meses ?? fase.minimo)} cores={cores} />
                                </View>
                            </View>
                        )}
                    </View>
                );
            })}

            <Text style={[styles.copyright, { color: cores.textoSecundario }]}>© 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    container: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 20,
        gap: 12,
    },

    titulo: {
        width: '100%',
        fontSize: 24,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
    },

    subtitulo: {
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 4,
    },

    card: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },

    cardSelecionado: {
        borderWidth: 2,
        borderColor: '#326c00',
        backgroundColor: '#f7faef',
    },

    cabecalhoFase: {
        minHeight: 70,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    textosFase: {
        flex: 1,
        gap: 2,
    },

    nomeFase: {
        color: '#326c00',
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },

    faixaEtaria: {
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },

    iconesFase: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    conteudoFase: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        gap: 14,
    },

    secao: {
        gap: 7,
    },

    tituloSecao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    nomeSecao: {
        color: '#326c00',
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
    },

    lista: {
        gap: 6,
    },

    linhaRecomendacao: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 9,
    },

    ponto: {
        width: 6,
        height: 6,
        marginTop: 8,
        borderRadius: 3,
        backgroundColor: '#326c00',
    },

    texto: {
        flex: 1,
        color: '#636363',
        fontSize: 14,
        lineHeight: 21,
        fontFamily: 'Poppins_400Regular',
    },

    copyright: {
        color: '#636363',
        fontSize: 13,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 2,
    },
});

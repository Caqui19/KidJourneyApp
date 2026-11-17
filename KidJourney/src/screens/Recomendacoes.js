import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';

const faixasEtarias = [
    { nome: '0 a 5 meses', idadeInicial: 0, idadeFinal: 5 },
    { nome: '6 a 8 meses', idadeInicial: 6, idadeFinal: 8 },
    { nome: '9 a 11 meses', idadeInicial: 9, idadeFinal: 11 },
    { nome: '1 a 2 anos', idadeInicial: 12, idadeFinal: 23 },
    { nome: '2 a 3 anos', idadeInicial: 24, idadeFinal: 35 },
    { nome: '3 a 5 anos', idadeInicial: 36, idadeFinal: 60 },
];

const ordemCategorias = ['alimentacao', 'desenvolvimento', 'saude', 'produto', 'servico'];

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function calcularIdadeEmMeses(dataNascimento) {
    if (typeof dataNascimento !== 'string') return null;

    const partes = dataNascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) return null;

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);
    const nascimento = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    if (
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia ||
        nascimento > hoje
    ) {
        return null;
    }

    let meses = (hoje.getFullYear() - ano) * 12 + hoje.getMonth() - (mes - 1);
    if (hoje.getDate() < dia) meses--;

    return meses;
}

function normalizarEspecificidade(especificidade = '') {
    const nome = normalizarTexto(String(especificidade).split(':')[0]);

    if (nome.includes('aplv') || (nome.includes('alergia') && nome.includes('leite') && nome.includes('vaca'))) return 'aplv';
    if (nome.includes('alergia') && nome.includes('ovo')) return 'alergia ovo';
    if (nome.includes('alergia') && nome.includes('soja')) return 'alergia soja';
    if (nome.includes('alergia') && nome.includes('trigo')) return 'alergia trigo';
    if (nome.includes('alergia') && (nome.includes('amendoim') || nome.includes('castanha'))) return 'alergia amendoim castanhas';
    if (nome.includes('alergia') && (nome.includes('peixe') || nome.includes('fruto do mar'))) return 'alergia peixe frutos do mar';
    if (nome.includes('alergia') && nome.includes('outro alimento')) return 'alergia outro alimento';
    if (nome.includes('intolerancia') && nome.includes('lactose')) return 'intolerancia lactose';
    if (nome.includes('intolerancia') && nome.includes('frutose')) return 'intolerancia frutose';
    if (nome.includes('celiac')) return 'doenca celiaca';
    if (nome.includes('diabetes')) return 'diabetes tipo 1';
    if (nome.includes('refluxo')) return 'refluxo gastroesofagico';
    if (nome.includes('constipacao')) return 'constipacao cronica';
    if (nome.includes('seletividade')) return 'seletividade alimentar';
    if (nome.includes('neofobia')) return 'neofobia alimentar';
    if (nome.includes('mastigacao')) return 'dificuldade de mastigacao';
    if (nome.includes('degluticao')) return 'dificuldade de degluticao';
    if (nome.includes('gag')) return 'reflexo de gag sensivel';
    if (nome.includes('introducao alimentar')) return 'introducao alimentar';
    if (nome.includes('denticao')) return 'denticao';
    if (nome.includes('vegetarian')) return 'vegetarianismo';
    if (nome.includes('vegan')) return 'veganismo';
    if (nome.includes('acucar')) return 'sem acucar';

    return nome.replace(/[^a-z0-9]+/g, ' ').trim();
}

function publicacaoAtendeCrianca(publicacao, criancaSelecionada) {
    if (!criancaSelecionada) return true;

    const idade = calcularIdadeEmMeses(criancaSelecionada.dataNascimento);
    const nomeFaixa = normalizarTexto(publicacao.faixaEtaria);
    const faixaEtaria = faixasEtarias.find((item) =>
        nomeFaixa.includes(normalizarTexto(item.nome))
    );

    if (idade !== null && faixaEtaria) {
        if (idade < faixaEtaria.idadeInicial || idade > faixaEtaria.idadeFinal) {
            return false;
        }
    }

    const especificidadesPublicacao = Array.isArray(publicacao.especificidades)
        ? publicacao.especificidades.map(normalizarEspecificidade)
        : [];

    if (especificidadesPublicacao.length === 0) return true;

    const especificidadesCrianca = Array.isArray(criancaSelecionada.especificidades)
        ? criancaSelecionada.especificidades.map(normalizarEspecificidade)
        : [];

    return especificidadesPublicacao.some((item) =>
        especificidadesCrianca.includes(item)
    );
}

function calcularRelevancia(publicacao, criancaSelecionada) {
    if (!criancaSelecionada) return 0;

    const especificidadesCrianca = Array.isArray(criancaSelecionada.especificidades)
        ? criancaSelecionada.especificidades.map(normalizarEspecificidade)
        : [];
    const especificidadesPublicacao = Array.isArray(publicacao.especificidades)
        ? publicacao.especificidades.map(normalizarEspecificidade)
        : [];

    let pontos = 0;
    especificidadesPublicacao.forEach((item) => {
        if (especificidadesCrianca.includes(item)) pontos++;
    });

    return pontos;
}

function converterDataEmMilissegundos(data) {
    if (!data) return 0;

    let dataConvertida = data;
    if (typeof data.toDate === 'function') {
        dataConvertida = data.toDate();
    }

    const milissegundos = new Date(dataConvertida).getTime();
    return Number.isFinite(milissegundos) ? milissegundos : 0;
}

function organizarPublicacoesPorCategoria(publicacoes, criancaSelecionada) {
    const categorias = [];

    publicacoes.forEach((publicacao) => {
        const nomeCategoria = String(publicacao.categoria || 'Outros').trim();
        const chave = normalizarTexto(nomeCategoria);
        let categoria = categorias.find((item) => item.chave === chave);

        if (!categoria) {
            categoria = {
                chave,
                nome: nomeCategoria,
                publicacoes: [],
            };
            categorias.push(categoria);
        }

        categoria.publicacoes.push(publicacao);
    });

    categorias.forEach((categoria) => {
        categoria.publicacoes.sort((a, b) => {
            const relevanciaA = calcularRelevancia(a, criancaSelecionada);
            const relevanciaB = calcularRelevancia(b, criancaSelecionada);
            if (relevanciaA !== relevanciaB) return relevanciaB - relevanciaA;

            const visualizacoesA = Number(a.visualizacoes) || 0;
            const visualizacoesB = Number(b.visualizacoes) || 0;
            if (visualizacoesA !== visualizacoesB) return visualizacoesB - visualizacoesA;

            return converterDataEmMilissegundos(b.dataPublicacao)
                - converterDataEmMilissegundos(a.dataPublicacao);
        });

        categoria.publicacoes = categoria.publicacoes.slice(0, 5);
    });

    categorias.sort((a, b) => {
        const ordemA = ordemCategorias.indexOf(a.chave);
        const ordemB = ordemCategorias.indexOf(b.chave);

        if (ordemA === -1 && ordemB === -1) return 0;
        if (ordemA === -1) return 1;
        if (ordemB === -1) return -1;

        return ordemA - ordemB;
    });

    return categorias;
}

function formatarDataHora(data) {
    if (!data) return '';

    let dataPublicacao = data;
    if (typeof data.toDate === 'function') {
        dataPublicacao = data.toDate();
    } else {
        dataPublicacao = new Date(data);
    }

    if (Number.isNaN(dataPublicacao.getTime())) return '';

    const dia = dataPublicacao.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
    const hora = dataPublicacao.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return 'Publicado em ' + dia + ' às ' + hora;
}

function abrirLinkDaPublicidade(link) {
    const endereco = String(link || '').trim();
    if (!/^https?:\/\//i.test(endereco)) return;

    Linking.openURL(endereco).catch(() => {});
}

function Recomendacao({ publicacao, cores, escuro, foiVisualizada, salvandoVisualizacao, marcarComoVisto }) {
    const [textoExpandido, setTextoExpandido] = useState(false);
    const [mostrarLerMais, setMostrarLerMais] = useState(false);
    const [mostrarEspecificidades, setMostrarEspecificidades] = useState(false);
    const especificidades = Array.isArray(publicacao.especificidades)
        ? publicacao.especificidades
        : [];
    const texto = String(publicacao.texto || '').trim();
    const faixaEtaria = String(publicacao.faixaEtaria || '').split(':').pop().trim();
    const filtros = [];
    if (publicacao.etapa && publicacao.etapa !== 'Todas as etapas') {
        filtros.push(publicacao.etapa);
    }
    if (faixaEtaria) filtros.push(faixaEtaria);
    if (especificidades.length > 0) {
        filtros.push(especificidades.slice(0, 3).join(', '));
    } else {
        filtros.push('Geral');
    }
    const filtrosPublicacao = filtros.join(' | ');

    let nomeAutor = publicacao.autorNome || '';
    if (publicacao.autorProfissao) {
        nomeAutor = nomeAutor
            ? nomeAutor + ', ' + publicacao.autorProfissao
            : publicacao.autorProfissao;
    }    const visualizacoes = Math.max(0, Number(publicacao.visualizacoes) || 0);
    return (
        <View style={[styles.publicacao, { borderBottomColor: cores.borda }]}>
            {publicacao.tipo === 'publicidade' ? (
                <Text style={[styles.tipoPublicacao, { color: cores.titulo }]}>Publicidade</Text>
            ) : null}

            <Text
                style={[styles.tituloPublicacao, { color: cores.titulo }]}
                numberOfLines={3}
                ellipsizeMode="tail"
            >
                {publicacao.titulo || 'Publicação'}
            </Text>
            <Text
                style={[styles.subtitulo, { color: cores.textoSecundario }]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {filtrosPublicacao}
            </Text>
            {especificidades.length > 0 ? (
                <TouchableOpacity
                    style={styles.botaoVerEspecificidades}
                    onPress={() => setMostrarEspecificidades(true)}
                    accessibilityRole="button"
                >
                    <Text style={[styles.linkEspecificidades, { color: cores.acento }]}>
                        Ver especificidades
                    </Text>
                </TouchableOpacity>
            ) : null}

            {texto ? (
                <>
                    <Text
                        style={[styles.texto, { color: cores.textoSecundario }]}
                        numberOfLines={mostrarLerMais && !textoExpandido ? 10 : undefined}
                        ellipsizeMode="tail"
                        onTextLayout={(evento) => {
                            if (evento.nativeEvent.lines.length > 10) setMostrarLerMais(true);
                        }}
                    >
                        {texto}
                    </Text>

                    {mostrarLerMais ? (
                        <TouchableOpacity
                            style={styles.botaoLerMais}
                            onPress={() => setTextoExpandido(!textoExpandido)}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.textoLerMais, { color: cores.titulo }]}>
                                {textoExpandido ? 'Ler menos' : 'Ler mais'}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </>
            ) : null}

            {nomeAutor ? (
                <Text style={[styles.legenda, { color: cores.textoSecundario }]}>
                    {nomeAutor}
                </Text>
            ) : null}

            {publicacao.dataPublicacao ? (
                <Text style={[styles.dataPublicacao, { color: cores.textoSecundario }]}>
                    {formatarDataHora(publicacao.dataPublicacao)}
                </Text>
            ) : null}

            <View style={styles.linhaVisualizacoes}>
                <Text style={[styles.contadorVisualizacoes, { color: cores.textoSecundario }]}>
                    {visualizacoes} {visualizacoes === 1 ? 'visualização' : 'visualizações'}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.botaoVisualizacao,
                        {
                            backgroundColor: foiVisualizada ? cores.selecao : cores.botao,
                            borderColor: cores.acento,
                        },
                    ]}
                    onPress={marcarComoVisto}
                    disabled={foiVisualizada || salvandoVisualizacao}
                    accessibilityRole="button"
                >
                    <Text style={[styles.textoBotaoVisualizacao, { color: cores.titulo }]}>
                        {salvandoVisualizacao ? 'Registrando...' : foiVisualizada ? 'Visualizada' : 'Marcar como visto'}
                    </Text>
                </TouchableOpacity>
            </View>

            {publicacao.tipo === 'publicidade' && publicacao.link ? (
                <TouchableOpacity
                    style={styles.linkDivulgacao}
                    onPress={() => abrirLinkDaPublicidade(publicacao.link)}
                    accessibilityRole="link"
                >
                    <Text
                        style={[styles.textoLinkDivulgacao, { color: cores.acento }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {publicacao.link}
                    </Text>
                </TouchableOpacity>
            ) : null}

            <Modal
                visible={mostrarEspecificidades}
                transparent
                animationType="fade"
                onRequestClose={() => setMostrarEspecificidades(false)}
            >
                <View style={[styles.modalFundo, escuro && styles.modalFundoEscuro]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMostrarEspecificidades(false)}
                    />
                    <View style={[styles.modalEspecificidades, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoModal}>
                            <Text style={[styles.tituloModal, { color: cores.titulo }]}>Especificidades</Text>
                            <TouchableOpacity onPress={() => setMostrarEspecificidades(false)}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.listaModal}>
                            <Text style={[styles.textoModal, { color: cores.textoSecundario }]}>
                                {especificidades.join('\n')}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


export default function RecomendacoesScreen({ criancaSelecionada }) {
    const { cores, escuro } = useTema();
    const { user } = useAuth();
    const uid = user && user.uid;
    const [pesquisa, setPesquisa] = useState('');
    const [estadoPublicacoes, setEstadoPublicacoes] = useState({
        uid: null,
        publicacoes: [],
        carregando: true,
        erro: false,
    });

    const [estadoVisualizacoes, setEstadoVisualizacoes] = useState({ uid: null, ids: {} });
    const [idPublicacaoSendoMarcada, setIdPublicacaoSendoMarcada] = useState('');
    const [erroVisualizacao, setErroVisualizacao] = useState('');
    useEffect(() => {
        if (!uid) return undefined;

        const consulta = query(
            collection(db, 'publicacoes'),
            where('status', '==', 'Publicado')
        );

        return onSnapshot(
            consulta,
            (resultado) => {
                const publicacoes = resultado.docs.map((documento) => ({
                    id: documento.id,
                    ...documento.data(),
                }));

                setEstadoPublicacoes({
                    uid,
                    publicacoes,
                    carregando: false,
                    erro: false,
                });
            },
            () => {
                setEstadoPublicacoes({
                    uid,
                    publicacoes: [],
                    carregando: false,
                    erro: true,
                });
            }
        );
    }, [uid]);

    useEffect(() => {
        if (!uid) return undefined;

        return onSnapshot(
            collection(db, 'usuarios', uid, 'publicacoesVistas'),
            (resultado) => {
                const ids = {};
                resultado.docs.forEach((documento) => {
                    ids[documento.id] = true;
                });
                setEstadoVisualizacoes({ uid, ids });
            },
            () => {
                setEstadoVisualizacoes({ uid, ids: {} });
                setErroVisualizacao('Não foi possível carregar as visualizações marcadas.');
            }
        );
    }, [uid]);

    async function marcarPublicacaoComoVista(publicacao) {
        if (!uid || idPublicacaoSendoMarcada === publicacao.id) return;

        setErroVisualizacao('');
        setIdPublicacaoSendoMarcada(publicacao.id);

        try {
            await runTransaction(db, async (transacao) => {
                const visualizacaoRef = doc(db, 'usuarios', uid, 'publicacoesVistas', publicacao.id);
                const visualizacao = await transacao.get(visualizacaoRef);

                if (visualizacao.exists()) return;

                const publicacaoRef = doc(db, 'publicacoes', publicacao.id);
                const documento = await transacao.get(publicacaoRef);

                if (!documento.exists() || documento.data().status !== 'Publicado') {
                    throw new Error('Publicação não encontrada.');
                }

                const visualizacoes = Number(documento.data().visualizacoes) || 0;

                transacao.set(visualizacaoRef, {
                    publicacaoId: publicacao.id,
                    criadoEm: serverTimestamp(),
                });
                transacao.update(publicacaoRef, {
                    visualizacoes: visualizacoes + 1,
                });
            });

            setEstadoVisualizacoes((atual) => ({
                uid,
                ids: {
                    ...(atual.uid === uid ? atual.ids : {}),
                    [publicacao.id]: true,
                },
            }));
        } catch {
            setErroVisualizacao('Não foi possível registrar a visualização. Verifique as regras do Firestore.');
        } finally {
            setIdPublicacaoSendoMarcada('');
        }
    }

    const estadoPublicacoesAtual = uid && estadoPublicacoes.uid === uid
        ? estadoPublicacoes
        : null;
    const publicacoes = estadoPublicacoesAtual ? estadoPublicacoesAtual.publicacoes : [];
    const carregandoPublicacoes = Boolean(uid) && (!estadoPublicacoesAtual || estadoPublicacoesAtual.carregando);

    const publicacoesDaCrianca = publicacoes
        .filter((publicacao) => publicacaoAtendeCrianca(publicacao, criancaSelecionada))
        .sort((a, b) =>
            converterDataEmMilissegundos(b.dataPublicacao)
            - converterDataEmMilissegundos(a.dataPublicacao)
        );

    const pesquisaNormalizada = normalizarTexto(pesquisa);
    const publicacoesEncontradas = publicacoesDaCrianca.filter((publicacao) => {
        if (!pesquisaNormalizada) return true;

        const texto = normalizarTexto([
            publicacao.titulo,
            publicacao.texto,
            publicacao.categoria,
            publicacao.autorNome,
            publicacao.autorProfissao,
        ].join(' '));

        return texto.includes(pesquisaNormalizada);
    });

    const categorias = organizarPublicacoesPorCategoria(publicacoesEncontradas, criancaSelecionada);

    let mensagemPesquisa = '';
    if (pesquisa.trim()) {
        if (publicacoesEncontradas.length === 0) {
            mensagemPesquisa = 'Nenhum resultado encontrado.';
        } else if (publicacoesEncontradas.length === 1) {
            mensagemPesquisa = '1 resultado encontrado.';
        } else {
            mensagemPesquisa = publicacoesEncontradas.length + ' resultados encontrados.';
        }
    }

    let mensagemSemPublicacoes = 'Nenhuma publicação atende à idade e às especificidades desta criança.';
    if (pesquisa.trim()) mensagemSemPublicacoes = 'Nenhuma publicação encontrada.';

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: cores.fundo }]}
            contentContainerStyle={[styles.container, { backgroundColor: cores.fundo }]}
        >
            <View style={[styles.pesquisaContainer, { borderColor: cores.borda, backgroundColor: cores.cartao }]}>
                <Ionicons name="search" size={24} color={cores.textoSecundario} />
                <TextInput
                    value={pesquisa}
                    onChangeText={setPesquisa}
                    placeholder="Pesquise aqui..."
                    placeholderTextColor={cores.textoSecundario}
                    style={[styles.campoPesquisa, { color: cores.texto }]}
                />
                <TouchableOpacity onPress={() => setPesquisa('')} accessibilityLabel="Limpar pesquisa">
                    <Ionicons name="close" size={25} color={cores.textoSecundario} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.resultadoTitulo, { color: cores.texto }]}>Resultados da pesquisa:</Text>
            <Text style={[styles.resultadoTexto, { color: cores.textoSecundario }]}>
                {mensagemPesquisa}
            </Text>

            {!criancaSelecionada ? (
                <Text style={[styles.avisoPersonalizacao, { color: cores.textoSecundario }]}>
                    Selecione uma criança para personalizar as recomendações.
                </Text>
            ) : null}

            {!uid ? (
                <Text style={[styles.mensagemPublicacoes, { color: cores.textoSecundario }]}>
                    Entre na sua conta para ver as publicações.
                </Text>
            ) : null}

            {carregandoPublicacoes ? (
                <ActivityIndicator style={styles.carregando} color={cores.acento} />
            ) : null}

            {estadoPublicacoesAtual && estadoPublicacoesAtual.erro ? (
                <Text style={[styles.mensagemPublicacoes, { color: cores.textoSecundario }]}>
                    Não foi possível carregar as publicações. Tente novamente mais tarde.
                </Text>
            ) : null}

            {!carregandoPublicacoes && estadoPublicacoesAtual && !estadoPublicacoesAtual.erro && publicacoes.length === 0 ? (
                <Text style={[styles.mensagemPublicacoes, { color: cores.textoSecundario }]}>
                    Ainda não há publicações de parceiros.
                </Text>
            ) : null}

            {!carregandoPublicacoes && estadoPublicacoesAtual && !estadoPublicacoesAtual.erro && publicacoes.length > 0 && publicacoesEncontradas.length === 0 ? (
                <Text style={[styles.mensagemPublicacoes, { color: cores.textoSecundario }]}>
                    {mensagemSemPublicacoes}
                </Text>
            ) : null}

            {erroVisualizacao ? (
                <Text style={[styles.mensagemPublicacoes, { color: cores.textoSecundario }]}>
                    {erroVisualizacao}
                </Text>
            ) : null}

            {categorias.map((categoria) => (
                <View key={categoria.chave}>
                    <Text style={[styles.titulo, { color: cores.titulo }]}>{categoria.nome}</Text>
                    {categoria.publicacoes.map((publicacao) => (
                        <Recomendacao
                            key={publicacao.id}
                            publicacao={publicacao}
                            cores={cores}
                            foiVisualizada={Boolean(estadoVisualizacoes.uid === uid && estadoVisualizacoes.ids[publicacao.id])}
                            salvandoVisualizacao={idPublicacaoSendoMarcada === publicacao.id}
                            marcarComoVisto={() => marcarPublicacaoComoVista(publicacao)}
                            escuro={escuro}
                        />
                    ))}
                </View>
            ))}

            <Text style={[styles.copyright, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        gap: 6,
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
        marginTop: 12,
    },
    pesquisaContainer: {
        height: 48,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    campoPesquisa: {
        flex: 1,
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },
    resultadoTitulo: {
        color: '#111',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    resultadoTexto: {
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 8,
    },
    avisoPersonalizacao: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular',
    },
    carregando: {
        marginVertical: 14,
    },
    mensagemPublicacoes: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: 'Poppins_400Regular',
        marginVertical: 10,
    },
    tipoPublicacao: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 2,
    },
    tituloPublicacao: {
        fontSize: 18,
        lineHeight: 25,
        fontFamily: 'Nunito_700Bold',
        marginTop: 5,
    },
    subtitulo: {
        fontSize: 14,
        lineHeight: 20,
        color: '#636363',
        fontFamily: 'Poppins_400Regular',
    },
    texto: {
        color: '#636363',
        fontSize: 16,
        lineHeight: 25,
        fontFamily: 'Poppins_400Regular',
        marginTop: 8,
    },
    publicacao: {
        borderBottomWidth: 1,
        paddingBottom: 14,
        marginBottom: 8,
    },
    legenda: {
        color: '#636363',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Poppins_400Regular',
    },
    dataPublicacao: {
        color: '#636363',
        fontSize: 12,
        lineHeight: 18,
        fontFamily: 'Poppins_400Regular',
    },
    linhaVisualizacoes: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 8,
    },
    contadorVisualizacoes: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },
    botaoVisualizacao: {
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    textoBotaoVisualizacao: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
    },
    botaoLerMais: {
        alignSelf: 'flex-start',
        marginTop: 2,
        marginBottom: 8,
    },

    textoLerMais: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    linkEspecificidades: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },
    modalFundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalFundoEscuro: {
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
    modalEspecificidades: {
        width: '90%',
        maxWidth: 360,
        maxHeight: '75%',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        gap: 10,
    },
    cabecalhoModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tituloModal: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },
    listaModal: {
        maxHeight: 320,
    },
    textoModal: {
        fontSize: 15,
        lineHeight: 23,
        fontFamily: 'Poppins_400Regular',
    },
    linkDivulgacao: {
        alignSelf: 'flex-start',
        maxWidth: '100%',
        marginTop: 8,
    },
    textoLinkDivulgacao: {
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'Poppins_400Regular',
    },
    copyright: {
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 14,
    },
});

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { Crianca } from '../components/Crianca';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';

const alimentosBase = [
    { label: 'Leite materno', valor: 'Leite materno', minimoMeses: 0, leite: true, tags: [] },
    { label: 'Fórmula infantil indicada para a criança', valor: 'Fórmula infantil indicada para a criança', minimoMeses: 0, maximoMeses: 23, leite: true, tags: [] },

    { label: 'Banana amassada', valor: 'Banana amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Maçã cozida e amassada', valor: 'Maçã cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Pera cozida e amassada', valor: 'Pera cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Mamão amassado', valor: 'Mamão amassado', minimoMeses: 6, maximoMeses: 8, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Abacate amassado', valor: 'Abacate amassado', minimoMeses: 6, maximoMeses: 8, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Abóbora bem cozida e amassada', valor: 'Abóbora bem cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'vegetal', tags: ['macia'] },
    { label: 'Batata bem cozida e amassada', valor: 'Batata bem cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'raiz', tags: ['macia'] },
    { label: 'Mandioca bem cozida e amassada', valor: 'Mandioca bem cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'raiz', tags: ['macia'] },
    { label: 'Arroz e feijão bem cozidos e amassados', valor: 'Arroz e feijão bem cozidos e amassados', minimoMeses: 6, maximoMeses: 8, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Lentilha bem cozida e amassada', valor: 'Lentilha bem cozida e amassada', minimoMeses: 6, maximoMeses: 8, grupo: 'leguminosa', tags: ['macia'] },
    { label: 'Frango bem cozido e desfiado', valor: 'Frango bem cozido e desfiado', minimoMeses: 6, maximoMeses: 8, grupo: 'proteina', tags: ['carne', 'animal', 'macia'] },
    { label: 'Peixe bem cozido, sem espinhas e amassado', valor: 'Peixe bem cozido, sem espinhas e amassado', minimoMeses: 6, maximoMeses: 8, grupo: 'proteina', tags: ['peixe', 'animal', 'macia'] },
    { label: 'Ovo bem cozido e amassado', valor: 'Ovo bem cozido e amassado', minimoMeses: 6, maximoMeses: 8, grupo: 'proteina', tags: ['ovo', 'animal', 'macia'] },
    { label: 'Tofu amassado', valor: 'Tofu amassado', minimoMeses: 6, maximoMeses: 8, grupo: 'proteina', tags: ['soja', 'macia'] },

    { label: 'Banana em pedaços macios', valor: 'Banana em pedaços macios', minimoMeses: 9, maximoMeses: 11, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Mamão em pedaços macios', valor: 'Mamão em pedaços macios', minimoMeses: 9, maximoMeses: 11, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Arroz, feijão e legumes bem cozidos', valor: 'Arroz, feijão e legumes bem cozidos', minimoMeses: 9, maximoMeses: 11, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Arroz, feijão e frango desfiado', valor: 'Arroz, feijão e frango desfiado', minimoMeses: 9, maximoMeses: 11, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Lentilha bem cozida com legumes', valor: 'Lentilha bem cozida com legumes', minimoMeses: 9, maximoMeses: 11, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Carne moída bem cozida', valor: 'Carne moída bem cozida', minimoMeses: 9, maximoMeses: 11, grupo: 'proteina', tags: ['carne', 'animal', 'macia'] },
    { label: 'Macarrão bem cozido com legumes', valor: 'Macarrão bem cozido com legumes', minimoMeses: 9, maximoMeses: 11, grupo: 'refeicao', tags: ['trigo', 'gluten', 'macia'] },
    { label: 'Ovo bem cozido em pedaços pequenos', valor: 'Ovo bem cozido em pedaços pequenos', minimoMeses: 9, maximoMeses: 11, grupo: 'proteina', tags: ['ovo', 'animal', 'macia'] },

    { label: 'Fruta madura em pedaços pequenos', valor: 'Fruta madura em pedaços pequenos', minimoMeses: 12, maximoMeses: 23, grupo: 'fruta', tags: ['fruta', 'frutose', 'macia'] },
    { label: 'Arroz, feijão e frango em pedaços pequenos', valor: 'Arroz, feijão e frango em pedaços pequenos', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Arroz, feijão e legumes cozidos', valor: 'Arroz, feijão e legumes cozidos', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Arroz, feijão e carne moída', valor: 'Arroz, feijão e carne moída', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Lentilha bem cozida com arroz e legumes', valor: 'Lentilha bem cozida com arroz e legumes', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Tofu com arroz e legumes cozidos', valor: 'Tofu com arroz e legumes cozidos', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['soja', 'macia'] },
    { label: 'Macarrão bem cozido com carne e legumes', valor: 'Macarrão bem cozido com carne e legumes', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['trigo', 'gluten', 'carne', 'animal', 'macia'] },
    { label: 'Peixe bem cozido, sem espinhas, com arroz e legumes', valor: 'Peixe bem cozido, sem espinhas, com arroz e legumes', minimoMeses: 12, maximoMeses: 23, grupo: 'refeicao', tags: ['peixe', 'animal', 'macia'] },
    { label: 'Iogurte natural sem açúcar', valor: 'Iogurte natural sem açúcar', minimoMeses: 12, maximoMeses: 23, grupo: 'laticinio', tags: ['leiteVaca', 'lactose', 'animal', 'macia'] },
    { label: 'Leite de vaca', valor: 'Leite de vaca', minimoMeses: 12, maximoMeses: 23, grupo: 'laticinio', tags: ['leiteVaca', 'lactose', 'animal'] },

    { label: 'Arroz, feijão, frango e legumes', valor: 'Arroz, feijão, frango e legumes', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Arroz, feijão e legumes cozidos', valor: 'Arroz, feijão e legumes cozidos', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Arroz, feijão, carne e abóbora', valor: 'Arroz, feijão, carne e abóbora', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Macarrão com molho de tomate e carne moída', valor: 'Macarrão com molho de tomate e carne moída', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['trigo', 'gluten', 'carne', 'animal', 'macia'] },
    { label: 'Macarrão com lentilha e legumes', valor: 'Macarrão com lentilha e legumes', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['trigo', 'gluten', 'macia'] },
    { label: 'Ovo bem cozido com arroz e legumes', valor: 'Ovo bem cozido com arroz e legumes', minimoMeses: 24, maximoMeses: 35, grupo: 'refeicao', tags: ['ovo', 'animal', 'macia'] },
    { label: 'Iogurte natural com fruta', valor: 'Iogurte natural com fruta', minimoMeses: 24, maximoMeses: 35, grupo: 'laticinio', tags: ['leiteVaca', 'lactose', 'animal', 'fruta', 'frutose', 'macia'] },
    { label: 'Leite de vaca', valor: 'Leite de vaca', minimoMeses: 24, maximoMeses: 35, grupo: 'laticinio', tags: ['leiteVaca', 'lactose', 'animal'] },

    { label: 'Arroz, feijão, carne e salada picada', valor: 'Arroz, feijão, carne e salada picada', minimoMeses: 36, grupo: 'refeicao', tags: ['carne', 'animal'] },
    { label: 'Arroz, feijão, frango e legumes', valor: 'Arroz, feijão, frango e legumes', minimoMeses: 36, grupo: 'refeicao', tags: ['carne', 'animal', 'macia'] },
    { label: 'Arroz, feijão e legumes cozidos', valor: 'Arroz, feijão e legumes cozidos', minimoMeses: 36, grupo: 'refeicao', tags: ['macia'] },
    { label: 'Macarrão com molho de tomate e carne moída', valor: 'Macarrão com molho de tomate e carne moída', minimoMeses: 36, grupo: 'refeicao', tags: ['trigo', 'gluten', 'carne', 'animal', 'macia'] },
    { label: 'Macarrão com lentilha e legumes', valor: 'Macarrão com lentilha e legumes', minimoMeses: 36, grupo: 'refeicao', tags: ['trigo', 'gluten', 'macia'] },
    { label: 'Peixe bem cozido com arroz e legumes', valor: 'Peixe bem cozido com arroz e legumes', minimoMeses: 36, grupo: 'refeicao', tags: ['peixe', 'animal', 'macia'] },
    { label: 'Omelete com legumes', valor: 'Omelete com legumes', minimoMeses: 36, grupo: 'refeicao', tags: ['ovo', 'animal', 'macia'] },
    { label: 'Pão com ovo mexido', valor: 'Pão com ovo mexido', minimoMeses: 36, grupo: 'lanche', tags: ['trigo', 'gluten', 'ovo', 'animal'] },
    { label: 'Iogurte natural com fruta', valor: 'Iogurte natural com fruta', minimoMeses: 36, grupo: 'lanche', tags: ['leiteVaca', 'lactose', 'animal', 'fruta', 'frutose', 'macia'] },
    { label: 'Leite de vaca', valor: 'Leite de vaca', minimoMeses: 36, grupo: 'bebida', tags: ['leiteVaca', 'lactose', 'animal'] },
];

const filtrosDeAlimentos = {
    'Alergia ao Leite de Vaca (APLV)': ['leiteVaca'],
    'Alergia a Ovo': ['ovo'],
    'Alergia a Soja': ['soja'],
    'Alergia a Trigo': ['trigo', 'gluten'],
    'Alergia a Amendoim / Castanhas': ['amendoim', 'castanhas'],
    'Alergia a Peixes / Frutos do Mar': ['peixe', 'frutosMar'],
    'Intolerância a Lactose': ['lactose'],
    'Intolerância a Frutose': ['frutose'],
    'Doença Celíaca (Restrição a Glúten)': ['gluten'],
    'Vegetarianismo': ['carne', 'peixe', 'frutosMar'],
    'Veganismo': ['animal'],
    'Dificuldade de Mastigação': ['texturaDura'],
    'Dificuldade de Deglutição (Disfagia)': ['texturaDura'],
    'Reflexo de Gag Sensível': ['texturaDura'],
    'Fase de Dentição (Nascimento de Dentes)': ['texturaDura'],
    'Introdução Alimentar (Transição para Sólidos)': ['texturaDura'],
};

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

function alimentosPermitidos(especificidades = [], mesesDeIdade = null) {
    const bloqueios = new Set();
    const precisaDeTexturaMacia = especificidades.some((especificidade) => [
        'Dificuldade de Mastigação',
        'Dificuldade de Deglutição (Disfagia)',
        'Reflexo de Gag Sensível',
        'Fase de Dentição (Nascimento de Dentes)',
        'Introdução Alimentar (Transição para Sólidos)',
    ].includes(especificidade));

    especificidades.forEach((especificidade) => {
        (filtrosDeAlimentos[especificidade] || []).forEach((tag) => bloqueios.add(tag));
    });

    return alimentosBase.filter((alimento) => (
        (mesesDeIdade === null
            ? alimento.leite === true
            : mesesDeIdade >= alimento.minimoMeses
                && (alimento.maximoMeses === undefined || mesesDeIdade <= alimento.maximoMeses))
        && !alimento.tags.some((tag) => bloqueios.has(tag))
        && (!precisaDeTexturaMacia || alimento.tags.includes('macia') || [
            'Leite materno',
            'Fórmula infantil indicada para a criança',
        ].includes(alimento.valor))
        && (mesesDeIdade === null || mesesDeIdade >= 12 || !alimento.tags.includes('leiteVaca'))
    ));
}

function chaveDoDia(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function horaValida(hora) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

function horarioDoEvento(data) {
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function calcularIdade(dataNascimento, hoje) {
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

    let anos = hoje.getFullYear() - ano;
    let meses = hoje.getMonth() - (mes - 1);
    let dias = hoje.getDate() - dia;

    if (dias < 0) {
        meses--;
        dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    }
    if (meses < 0) {
        anos--;
        meses += 12;
    }

    const partesIdade = [];
    if (anos > 0) partesIdade.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
    if (meses > 0) partesIdade.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
    if (dias > 0 || partesIdade.length === 0) partesIdade.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);

    if (partesIdade.length === 1) return partesIdade[0];
    if (partesIdade.length === 2) return `${partesIdade[0]} e ${partesIdade[1]}`;
    return `${partesIdade[0]}, ${partesIdade[1]} e ${partesIdade[2]}`;
}

export default function CriancasScreen({ navigation, criancaSelecionada, aoSelecionarCrianca }) {
    const { user } = useAuth();
    const { cores } = useTema();
    const [criancaGerenciada, setCriancaGerenciada] = useState(null);
    const [criancas, setCriancas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [diaAtual, setDiaAtual] = useState(() => new Date());

    useEffect(() => {
        const agora = new Date();
        const proximaMeiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
        const temporizador = setTimeout(() => setDiaAtual(new Date()), proximaMeiaNoite - agora);

        return () => clearTimeout(temporizador);
    }, [diaAtual]);

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
            const caminhoRegistros = collection(db, 'usuarios', user.uid, 'criancas', crianca.id, 'registros');
            const registrosSalvos = await getDocs(caminhoRegistros);
            await Promise.all(registrosSalvos.docs.map((registro) => deleteDoc(registro.ref)));
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
                diaAtual={diaAtual}
                voltar={() => setCriancaGerenciada(null)}
                aoDeletar={() => deletarCrianca(criancaGerenciada)}
            />
        );
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.titulo, { color: cores.titulo }]}>Suas Crianças</Text>
            <View style={{ gap: 10 }}>
                <BotaoPrincipal texto="Cadastrar Criança" onPress={() => navigation.navigate('Cadastrocrianca')} />
                {carregando ? (
                    <Text style={[styles.texto2, { color: cores.textoSecundario }]}>Carregando crianças...</Text>
                ) : criancas.length === 0 ? (
                    <Text style={[styles.texto2, { color: cores.textoSecundario }]}>Você ainda não cadastrou nenhuma criança.</Text>
                ) : (
                    criancas.map((crianca) => (
                        <Crianca
                            key={crianca.id}
                            {...crianca}
                            idade={calcularIdade(crianca.dataNascimento, diaAtual) || crianca.idade}
                            selecionada={criancaSelecionada?.id === crianca.id}
                            onManage={() => setCriancaGerenciada(crianca)}
                            onSelect={() => aoSelecionarCrianca(
                                criancaSelecionada?.id === crianca.id ? null : crianca
                            )}
                        />
                    ))
                )}
            </View>
            <Text style={[styles.texto2, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

function GerenciarCrianca({ crianca, diaAtual, voltar, aoDeletar }) {
    const { user } = useAuth();
    const { cores, escuro } = useTema();
    const [registros, setRegistros] = useState([]);
    const [carregandoRegistros, setCarregandoRegistros] = useState(true);
    const [mostrarEspecificidades, setMostrarEspecificidades] = useState(false);
    const [mostrarModalDeletar, setMostrarModalDeletar] = useState(false);
    const [mostrarModalAlimentacao, setMostrarModalAlimentacao] = useState(false);
    const [mostrarModalSono, setMostrarModalSono] = useState(false);
    const [mostrarHora, setMostrarHora] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [refeicaoSelecionada, setRefeicaoSelecionada] = useState('');
    const [alimentoSelecionado, setAlimentoSelecionado] = useState('');
    const [eventoSono, setEventoSono] = useState('Acordou');
    const [horaSelecionada, setHoraSelecionada] = useState(() => new Date());
    const especificidades = crianca.especificidades?.length
        ? crianca.especificidades.join('\n')
        : 'Nenhuma';
    const idade = calcularIdade(crianca.dataNascimento, diaAtual) || crianca.idade;
    const mesesDeIdade = idadeEmMeses(crianca.dataNascimento, diaAtual);
    const alimentos = alimentosPermitidos(crianca.especificidades || [], mesesDeIdade);
    const dia = chaveDoDia(new Date());

    useEffect(() => {
        if (!user?.uid) {
            setRegistros([]);
            setCarregandoRegistros(false);
            return;
        }

        setRegistros([]);
        setCarregandoRegistros(true);
        const caminho = collection(db, 'usuarios', user.uid, 'criancas', crianca.id, 'registros');
        const consulta = query(caminho, where('dia', '==', dia));

        return onSnapshot(consulta, (resultado) => {
            setRegistros(resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data(),
            })).sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || ''))));
            setCarregandoRegistros(false);
        }, () => {
            Alert.alert('Não foi possível carregar', 'Confira as regras do Firestore e tente novamente.');
            setCarregandoRegistros(false);
        });
    }, [user?.uid, crianca.id, dia]);

    async function salvarRegistro(dados) {
        if (!user?.uid) return;

        setSalvando(true);
        try {
            await addDoc(collection(db, 'usuarios', user.uid, 'criancas', crianca.id, 'registros'), {
                ...dados,
                dia,
                horario: horarioDoEvento(horaSelecionada),
                criadoEm: serverTimestamp(),
            });
            setMostrarModalAlimentacao(false);
            setMostrarModalSono(false);
            setHoraSelecionada(new Date());
        } catch {
            Alert.alert('Não foi possível salvar', 'Confira as regras do Firestore e tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    async function salvarAlimentacao() {
        if (
            !refeicaoSelecionada
            ||
            !alimentos.some((alimento) => alimento.valor === alimentoSelecionado)
            || !horaValida(horarioDoEvento(horaSelecionada))
        ) {
            Alert.alert('Preencha os campos', 'Selecione a refeição, o alimento e o horário.');
            return;
        }

        await salvarRegistro({
            tipo: 'alimentacao',
            refeicao: refeicaoSelecionada,
            alimento: alimentoSelecionado,
            grupo: alimentos.find((alimento) => alimento.valor === alimentoSelecionado)?.grupo || '',
        });
    }

    async function salvarSono() {
        if (!horaValida(horarioDoEvento(horaSelecionada))) {
            Alert.alert('Horário inválido', 'Selecione um horário.');
            return;
        }

        await salvarRegistro({ tipo: 'sono', evento: eventoSono });
    }

    async function deletarRegistro(registro) {
        try {
            await deleteDoc(doc(db, 'usuarios', user.uid, 'criancas', crianca.id, 'registros', registro.id));
        } catch {
            Alert.alert('Não foi possível excluir', 'Tente novamente mais tarde.');
        }
    }

    async function confirmarDelecao() {
        setDeletando(true);
        const deletada = await aoDeletar();
        if (!deletada) setDeletando(false);
    }

    function abrirAlimentacao() {
        if (alimentos.length === 0) {
            Alert.alert('Sem opções disponíveis', 'Não há opções nesta lista para as especificidades e a idade cadastradas.');
            return;
        }

        setRefeicaoSelecionada('');
        setAlimentoSelecionado('');
        setHoraSelecionada(new Date());
        setMostrarModalAlimentacao(true);
    }

    function abrirSono() {
        setEventoSono('Acordou');
        setHoraSelecionada(new Date());
        setMostrarModalSono(true);
    }

    const dataExibida = formatarData(new Date());
    const eventosAlimentacao = registros.filter((registro) => registro.tipo === 'alimentacao');
    const eventosSono = registros.filter((registro) => registro.tipo === 'sono');

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.detalheContainer}>
            <View style={[styles.dadosCrianca, { borderBottomColor: cores.borda }]}>
                <View style={styles.voltarEIcone}>
                    <TouchableOpacity onPress={voltar} style={[styles.voltar, { backgroundColor: cores.selecao }]}>
                        <Ionicons name="arrow-back" size={30} color={cores.acento} />
                    </TouchableOpacity>
                    <FontAwesome5 name="baby" size={34} color={cores.acento} />
                </View>
                <View style={styles.dadosTexto}>
                    <Text style={[styles.nomeCrianca, { color: cores.titulo }]} numberOfLines={1} ellipsizeMode="tail">{crianca.nome}</Text>
                    <Text style={[styles.texto, { color: cores.textoSecundario }]} numberOfLines={1} ellipsizeMode="tail">Sexo: {crianca.sexo}</Text>
                    <Text style={[styles.texto, { color: cores.textoSecundario }]} numberOfLines={1} ellipsizeMode="tail">Idade: {idade}</Text>
                    <Text style={[styles.texto, { color: cores.textoSecundario }]} numberOfLines={1} ellipsizeMode="tail">Nascimento: {crianca.dataNascimento}</Text>
                    <TouchableOpacity onPress={() => setMostrarEspecificidades(true)}>
                        <Text style={[styles.textoEspecificidade, { color: cores.acento }]} numberOfLines={1} ellipsizeMode="tail">
                            Especificidades: {crianca.especificidades?.join(', ') || 'Nenhuma'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={mostrarEspecificidades} transparent animationType="fade" onRequestClose={() => setMostrarEspecificidades(false)}>
                <View style={[styles.popupFundo, escuro && styles.popupFundoEscuro]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMostrarEspecificidades(false)} />
                    <View style={[styles.popupEspecificidades, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={[styles.tituloPopup, { color: cores.titulo }]}>Especificidades</Text>
                            <TouchableOpacity onPress={() => setMostrarEspecificidades(false)}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.listaPopup}><Text style={[styles.textoPopup, { color: cores.textoSecundario }]}>{especificidades}</Text></ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={mostrarModalDeletar} transparent animationType="fade" onRequestClose={() => setMostrarModalDeletar(false)}>
                <View style={[styles.popupFundo, escuro && styles.popupFundoEscuro]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMostrarModalDeletar(false)} />
                    <View style={[styles.popupEspecificidades, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={[styles.tituloPopup, { color: cores.titulo }]}>Deletar Criança</Text>
                            <TouchableOpacity onPress={() => setMostrarModalDeletar(false)} disabled={deletando}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.textoPopup, { color: cores.textoSecundario }]}>Deseja mesmo deletar {crianca.nome}?</Text>
                        <View style={styles.botoesPopup}>
                            <TouchableOpacity style={[styles.botaoCancelarPopup, { backgroundColor: cores.botao, borderColor: cores.acento }]} onPress={() => setMostrarModalDeletar(false)} disabled={deletando}>
                                <Text style={[styles.textoCancelarPopup, { color: cores.textoBotao }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoDeletarPopup, { backgroundColor: cores.cartao, borderColor: cores.acento }, deletando && styles.botaoDesativado]} onPress={confirmarDelecao} disabled={deletando}>
                                <Text style={[styles.textoDeletarPopup, { color: cores.acento }]}>{deletando ? 'Deletando...' : 'Deletar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={mostrarModalAlimentacao} transparent animationType="fade" onRequestClose={() => setMostrarModalAlimentacao(false)}>
                <View style={[styles.popupFundo, escuro && styles.popupFundoEscuro]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMostrarModalAlimentacao(false)} disabled={salvando} />
                    <View style={[styles.popupEspecificidades, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={[styles.tituloPopup, { color: cores.titulo }]}>O que comeu?</Text>
                            <TouchableOpacity onPress={() => setMostrarModalAlimentacao(false)} disabled={salvando}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.rotuloCampo, { color: cores.textoSecundario }]}>Refeição</Text>
                        <View style={[styles.seletorFormulario, { backgroundColor: cores.campo, borderColor: cores.borda }]}>
                            <Picker selectedValue={refeicaoSelecionada} onValueChange={setRefeicaoSelecionada} mode="dropdown" style={[styles.pickerFormulario, { color: cores.texto, backgroundColor: cores.campo }]} dropdownIconColor={cores.acento}>
                                <Picker.Item label="Selecione uma refeição" value="" />
                                <Picker.Item label="Café da manhã" value="Café da manhã" />
                                <Picker.Item label="Lanche da manhã" value="Lanche da manhã" />
                                <Picker.Item label="Almoço" value="Almoço" />
                                <Picker.Item label="Lanche da tarde" value="Lanche da tarde" />
                                <Picker.Item label="Jantar" value="Jantar" />
                                <Picker.Item label="Ceia" value="Ceia" />
                            </Picker>
                        </View>
                        <Text style={[styles.rotuloCampo, { color: cores.textoSecundario }]}>Alimento</Text>
                        <View style={[styles.seletorFormulario, { backgroundColor: cores.campo, borderColor: cores.borda }]}>
                            <Picker selectedValue={alimentoSelecionado} onValueChange={setAlimentoSelecionado} mode="dropdown" style={[styles.pickerFormulario, { color: cores.texto, backgroundColor: cores.campo }]} dropdownIconColor={cores.acento}>
                                <Picker.Item label="Selecione um alimento" value="" />
                                {alimentos.map((alimento) => (
                                    <Picker.Item key={alimento.valor} label={alimento.label} value={alimento.valor} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={[styles.rotuloCampo, { color: cores.textoSecundario }]}>Horário</Text>
                        <TouchableOpacity style={[styles.botaoHorario, { borderColor: cores.borda, backgroundColor: cores.campo }]} onPress={() => setMostrarHora(true)}>
                            <Ionicons name="time-outline" size={20} color={cores.acento} />
                            <Text style={[styles.texto, { color: cores.texto }]}>{horarioDoEvento(horaSelecionada)}</Text>
                        </TouchableOpacity>
                        <View style={styles.botoesPopup}>
                            <TouchableOpacity style={[styles.botaoCancelarEdicao, { backgroundColor: cores.cartao, borderColor: cores.acento }]} onPress={() => setMostrarModalAlimentacao(false)} disabled={salvando}>
                                <Text style={[styles.textoAcaoPopup, { color: cores.acento }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoSalvarEdicao, { backgroundColor: cores.botao, borderColor: cores.acento }, salvando && styles.botaoDesativado]} onPress={salvarAlimentacao} disabled={salvando}>
                                <Text style={[styles.textoAcaoPopup, { color: cores.textoBotao }]}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={mostrarModalSono} transparent animationType="fade" onRequestClose={() => setMostrarModalSono(false)}>
                <View style={[styles.popupFundo, escuro && styles.popupFundoEscuro]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMostrarModalSono(false)} disabled={salvando} />
                    <View style={[styles.popupEspecificidades, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoPopup}>
                            <Text style={[styles.tituloPopup, { color: cores.titulo }]}>Registrar sono</Text>
                            <TouchableOpacity onPress={() => setMostrarModalSono(false)} disabled={salvando}>
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.rotuloCampo, { color: cores.textoSecundario }]}>O que aconteceu?</Text>
                        <View style={[styles.seletorFormulario, { backgroundColor: cores.campo, borderColor: cores.borda }]}>
                            <Picker selectedValue={eventoSono} onValueChange={setEventoSono} mode="dropdown" style={[styles.pickerFormulario, { color: cores.texto, backgroundColor: cores.campo }]} dropdownIconColor={cores.acento}>
                                <Picker.Item label="Acordou" value="Acordou" />
                                <Picker.Item label="Dormiu" value="Dormiu" />
                                <Picker.Item label="Começou a soneca" value="Começou a soneca" />
                                <Picker.Item label="Acordou da soneca" value="Acordou da soneca" />
                            </Picker>
                        </View>
                        <Text style={[styles.rotuloCampo, { color: cores.textoSecundario }]}>Horário</Text>
                        <TouchableOpacity style={[styles.botaoHorario, { borderColor: cores.borda, backgroundColor: cores.campo }]} onPress={() => setMostrarHora(true)}>
                            <Ionicons name="time-outline" size={20} color={cores.acento} />
                            <Text style={[styles.texto, { color: cores.texto }]}>{horarioDoEvento(horaSelecionada)}</Text>
                        </TouchableOpacity>
                        <View style={styles.botoesPopup}>
                            <TouchableOpacity style={[styles.botaoCancelarEdicao, { backgroundColor: cores.cartao, borderColor: cores.acento }]} onPress={() => setMostrarModalSono(false)} disabled={salvando}>
                                <Text style={[styles.textoAcaoPopup, { color: cores.acento }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoSalvarEdicao, { backgroundColor: cores.botao, borderColor: cores.acento }, salvando && styles.botaoDesativado]} onPress={salvarSono} disabled={salvando}>
                                <Text style={[styles.textoAcaoPopup, { color: cores.textoBotao }]}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <DateTimePickerModal
                isVisible={mostrarHora}
                mode="time"
                date={horaSelecionada}
                isDarkModeEnabled={escuro}
                is24Hour
                confirmTextIOS="Confirmar"
                cancelTextIOS="Cancelar"
                onConfirm={(hora) => {
                    setHoraSelecionada(hora);
                    setMostrarHora(false);
                }}
                onCancel={() => setMostrarHora(false)}
            />

            <Text style={[styles.textoData, { color: cores.textoSecundario }]}>{dataExibida}</Text>
            <Text style={[styles.tituloSecao, { color: cores.titulo }]}>Alimentação</Text>
            <View style={[styles.cardRegistros, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                <View style={styles.topoCardRegistros}>
                    <FontAwesome5 name="utensils" size={21} color={cores.acento} solid />
                    <TouchableOpacity style={[styles.botaoRotina, { backgroundColor: cores.botao, borderColor: cores.acento }]} onPress={abrirAlimentacao}>
                        <Ionicons name="add" size={24} color={cores.acento} />
                        <Text style={[styles.textoBotao, { color: cores.textoBotao }]}>Registrar alimento</Text>
                    </TouchableOpacity>
                </View>
                {carregandoRegistros ? (
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Carregando registros...</Text>
                ) : eventosAlimentacao.length === 0 ? (
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Ainda não há alimentos registrados hoje.</Text>
                ) : eventosAlimentacao.map((registro) => (
                    <View key={registro.id} style={[styles.linhaRegistro, { borderBottomColor: cores.borda }]}>
                        <Text style={[styles.textoRegistro, { color: cores.textoSecundario }]}>
                            {registro.horario} · {registro.refeicao ? `${registro.refeicao}: ` : ''}{registro.alimento}
                        </Text>
                        <TouchableOpacity onPress={() => deletarRegistro(registro)} accessibilityLabel="Excluir registro">
                            <Ionicons name="trash" size={20} color={cores.perigo} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <Text style={[styles.tituloSecao, { color: cores.titulo }]}>Sono</Text>
            <View style={[styles.cardRegistros, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                <View style={styles.topoCardRegistros}>
                    <FontAwesome5 name="bed" size={22} color={cores.acento} solid />
                    <TouchableOpacity style={[styles.botaoRotina, { backgroundColor: cores.botao, borderColor: cores.acento }]} onPress={abrirSono}>
                        <Ionicons name="add" size={24} color={cores.acento} />
                        <Text style={[styles.textoBotao, { color: cores.textoBotao }]}>Registrar sono</Text>
                    </TouchableOpacity>
                </View>
                {carregandoRegistros ? (
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Carregando registros...</Text>
                ) : eventosSono.length === 0 ? (
                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Ainda não há horários de sono registrados hoje.</Text>
                ) : eventosSono.map((registro) => (
                    <View key={registro.id} style={[styles.linhaRegistro, { borderBottomColor: cores.borda }]}>
                        <Text style={[styles.textoRegistro, { color: cores.textoSecundario }]}>{registro.horario} · {registro.evento}</Text>
                        <TouchableOpacity onPress={() => deletarRegistro(registro)} accessibilityLabel="Excluir registro">
                            <Ionicons name="trash" size={20} color={cores.perigo} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={[styles.separadorExcluir, { borderTopColor: cores.borda }]} />
            <TouchableOpacity style={[styles.botaoExcluir, { borderColor: cores.perigo, backgroundColor: cores.cartao }]} onPress={() => setMostrarModalDeletar(true)}>
                <Text style={[styles.textoExcluir, { color: cores.perigo }]}>Deletar Criança</Text>
            </TouchableOpacity>
            <Text style={[styles.texto2, styles.copyrightDetalhe, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
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

    popupFundoEscuro: {
        backgroundColor: 'rgba(0,0,0,0.75)',
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

    blocoRefeicao: {
        gap: 6,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    tituloRefeicao: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    linhaCampos: {
        flexDirection: 'row',
        gap: 8,
    },

    campoHorario: {
        width: 112,
        gap: 4,
    },

    campoAlimento: {
        flex: 1,
        gap: 4,
    },

    rotuloCampo: {
        color: '#636363',
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },

    seletorFormulario: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },

    pickerFormulario: {
        width: '100%',
        height: 50,
        color: '#333',
    },

    formularioRotina: {
        gap: 12,
    },

    campoRotina: {
        gap: 4,
    },

    botaoCancelarEdicao: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 8,
        backgroundColor: '#fff',
    },

    botaoSalvarEdicao: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 8,
        backgroundColor: '#BFDE6C',
    },

    textoAcaoPopup: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    textoPopup: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 24,
    },

    textoOrientacao: {
        color: '#636363',
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 18,
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

    topoCardRegistros: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

    textoData: {
        width: '100%',
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginTop: 4,
    },

    cardRegistros: {
        width: '100%',
        gap: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
    },

    linhaRegistro: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    textoRegistro: {
        flex: 1,
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },

    botaoHorario: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },

    botaoRotina: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#BFDE6C60',
        borderColor: '#9fcb5f',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginTop: 0,
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

    horariosRotina: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },

    horarioItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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

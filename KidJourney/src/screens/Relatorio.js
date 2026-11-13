import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';

const gruposDoPrato = [
    { nome: 'Cereal, raiz ou tubérculo', valor: 'cerealRaiz' },
    { nome: 'Feijão ou outra leguminosa', valor: 'feijao' },
    { nome: 'Legumes ou verduras', valor: 'vegetal' },
    { nome: 'Fonte de proteína', valor: 'proteina' },
];

const gruposPorAlimento = {
    'Banana amassada': 'fruta',
    'Maçã cozida e amassada': 'fruta',
    'Pera cozida e amassada': 'fruta',
    'Mamão amassado': 'fruta',
    'Abacate amassado': 'fruta',
    'Arroz bem cozido': 'cereal',
    'Milho bem cozido': 'cereal',
    'Batata amassada': 'raiz',
    'Mandioca amassada': 'raiz',
    'Abóbora amassada': 'vegetal',
    'Cenoura bem cozida e amassada': 'vegetal',
    'Abobrinha bem cozida e amassada': 'vegetal',
    'Feijão amassado': 'feijao',
    'Lentilha bem cozida': 'feijao',
    'Frango desfiado': 'proteina',
    'Carne desfiada': 'proteina',
    'Ovo bem cozido': 'proteina',
    'Peixe bem cozido e sem espinhas': 'proteina',
    'Tofu (soja)': 'proteina',
    'Pasta de amendoim sem pedaços': 'proteina',
    'Pasta de castanhas sem pedaços': 'proteina',
    'Camarão bem picado': 'proteina',
};

function chaveDoDia(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function moverDia(data, quantidade) {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + quantidade);
    return novaData;
}

function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function idadeEmMeses(dataNascimento, dataRelatorio) {
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
        || nascimento > dataRelatorio
    ) return null;

    let meses = (dataRelatorio.getFullYear() - ano) * 12 + dataRelatorio.getMonth() - (mes - 1);
    if (dataRelatorio.getDate() < dia) meses--;
    return meses;
}

function referenciaSono(meses) {
    if (meses === null || meses < 4) return null;
    if (meses < 12) return { minimo: 12, maximo: 16 };
    if (meses < 36) return { minimo: 11, maximo: 14 };
    return { minimo: 10, maximo: 13 };
}

function referenciaAlimentacao(meses) {
    if (meses === null) return null;
    if (meses < 6) return { tipo: 'leite', texto: 'Leite registrado conforme a rotina da criança' };
    if (meses <= 8) return { tipo: 'ocasioes', minimo: 2, maximo: 3, texto: '2 a 3 refeições complementares' };
    if (meses <= 23) return { tipo: 'bebes', minimoRefeicoes: 3, maximoRefeicoes: 4, minimoLanches: 1, maximoLanches: 2 };
    return { tipo: 'maiores', minimoRefeicoes: 3, minimoLanches: 2 };
}

function refeicaoDoRegistro(registro) {
    if (registro.refeicao) return registro.refeicao;

    const hora = Number(String(registro.horario || '').slice(0, 2));
    if (hora < 10) return 'Café da manhã';
    if (hora < 11) return 'Lanche da manhã';
    if (hora < 14) return 'Almoço';
    if (hora < 17) return 'Lanche da tarde';
    if (hora < 20) return 'Jantar';
    return 'Ceia';
}

function analisarAlimentacao(registros, especificidades = []) {
    const refeicoes = {};

    registros.forEach((registro) => {
        const nomeRefeicao = refeicaoDoRegistro(registro);
        if (!refeicoes[nomeRefeicao]) refeicoes[nomeRefeicao] = new Set();

        if (['Leite materno', 'Fórmula indicada para a criança'].includes(registro.alimento)) return;

        const grupo = registro.grupo || gruposPorAlimento[registro.alimento];
        if (!grupo) return;
        if (grupo === 'cereal' || grupo === 'raiz') refeicoes[nomeRefeicao].add('cerealRaiz');
        else {
            refeicoes[nomeRefeicao].add(grupo);
            if (
                grupo === 'feijao'
                && especificidades.some((item) => ['Vegetarianismo', 'Veganismo'].includes(item))
            ) refeicoes[nomeRefeicao].add('proteina');
        }
    });

    const principais = ['Café da manhã', 'Almoço', 'Jantar'];
    const lanches = ['Lanche da manhã', 'Lanche da tarde', 'Ceia'];
    const refeicoesComComida = Object.keys(refeicoes).filter((nome) => refeicoes[nome].size > 0);

    return {
        refeicoes: refeicoesComComida.filter((nome) => principais.includes(nome)).length,
        lanches: refeicoesComComida.filter((nome) => lanches.includes(nome)).length,
        ocasioes: refeicoesComComida.length,
        gruposPorRefeicao: refeicoes,
    };
}

function dataComHora(dia, horario) {
    if (!dia || !horario) return null;
    const [ano, mes, numeroDia] = dia.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);
    return new Date(ano, mes - 1, numeroDia, hora, minuto);
}

function analisarSono(registros, diaAlvo) {
    const [ano, mes, dia] = diaAlvo.split('-').map(Number);
    const inicioDia = new Date(ano, mes - 1, dia).getTime();
    const fimDia = new Date(ano, mes - 1, dia + 1).getTime();
    let inicioNoite = null;
    let inicioSoneca = null;
    let minutos = 0;
    let intervalos = 0;
    let intervalosNoturnos = 0;

    const eventos = registros
        .filter((registro) => registro.tipo === 'sono')
        .map((registro) => ({ ...registro, momento: dataComHora(registro.dia, registro.horario) }))
        .filter((registro) => registro.momento)
        .sort((a, b) => a.momento - b.momento);

    function somarIntervalo(inicio, fim, noturno = false) {
        if (!inicio || fim <= inicio) return;
        const comeco = Math.max(inicio.getTime(), inicioDia);
        const final = Math.min(fim.getTime(), fimDia);
        if (final <= comeco) return;
        minutos += Math.floor((final - comeco) / 60000);
        intervalos++;
        if (noturno) intervalosNoturnos++;
    }

    eventos.forEach((evento) => {
        if (evento.evento === 'Dormiu') inicioNoite = evento.momento;
        if (evento.evento === 'Acordou') {
            somarIntervalo(inicioNoite, evento.momento, true);
            inicioNoite = null;
        }
        if (evento.evento === 'Começou a soneca') inicioSoneca = evento.momento;
        if (evento.evento === 'Acordou da soneca') {
            somarIntervalo(inicioSoneca, evento.momento);
            inicioSoneca = null;
        }
    });

    return {
        minutos,
        intervalos,
        intervalosNoturnos,
        intervaloAberto: Boolean(inicioNoite || inicioSoneca),
    };
}

function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return `${horas}h ${String(resto).padStart(2, '0')}min`;
}

function statusNaFaixa(atual, minimo, maximo) {
    if (atual < minimo) return 'Abaixo da referência';
    if (maximo !== null && atual > maximo) return 'Acima da referência';
    return 'Dentro da referência';
}

function percentualDaFaixa(atual, minimo, maximo) {
    if (atual < minimo) return Math.max(0, Math.min(100, Math.round((atual / minimo) * 100)));
    if (atual > maximo) return Math.max(0, Math.min(100, Math.round((maximo / atual) * 100)));
    return 100;
}

function percentualAteMeta(atual, minimo) {
    if (minimo <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((atual / minimo) * 100)));
}

function Medidor({ titulo, percentual }) {
    const { cores } = useTema();
    if (percentual === null) return null;

    return (
        <View style={[styles.medidor, { backgroundColor: cores.selecao }]}>
            <View style={styles.medidorTopo}>
                <Text style={[styles.rotuloMedidor, { color: cores.textoSecundario }]}>{titulo}</Text>
                <Text style={[styles.percentual, { color: cores.titulo }]}>{percentual}%</Text>
            </View>
            <View style={styles.pontosMedidor}>
                {[20, 40, 60, 80, 100].map((ponto) => (
                    <View
                        key={ponto}
                        style={[styles.pontoMedidor, { backgroundColor: cores.borda }, percentual >= ponto && [styles.pontoAtivo, { backgroundColor: cores.acento }]]}
                    />
                ))}
            </View>
            <View style={[styles.fundoMedidor, { backgroundColor: cores.borda }]}>
                <View style={[styles.progressoMedidor, { width: `${percentual}%`, backgroundColor: cores.acento }]} />
            </View>
        </View>
    );
}

export default function RelatorioScreen({ navigation, criancaSelecionada }) {
    const { user } = useAuth();
    const { cores, escuro } = useTema();
    const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
    const [mostrarData, setMostrarData] = useState(false);
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const dia = chaveDoDia(dataSelecionada);
    const diaAnterior = chaveDoDia(moverDia(dataSelecionada, -1));
    const diaSeguinte = chaveDoDia(moverDia(dataSelecionada, 1));

    useEffect(() => {
        if (!user?.uid || !criancaSelecionada?.id) {
            setRegistros([]);
            setCarregando(false);
            return;
        }

        setRegistros([]);
        setCarregando(true);
        const caminho = collection(db, 'usuarios', user.uid, 'criancas', criancaSelecionada.id, 'registros');
        const consulta = query(caminho, where('dia', 'in', [diaAnterior, dia, diaSeguinte]));

        return onSnapshot(consulta, (resultado) => {
            setRegistros(resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data(),
            })));
            setCarregando(false);
        }, () => {
            Alert.alert('Não foi possível carregar', 'Confira as regras do Firestore e tente novamente.');
            setCarregando(false);
        });
    }, [user?.uid, criancaSelecionada?.id, dia, diaAnterior, diaSeguinte]);

    const idade = idadeEmMeses(criancaSelecionada?.dataNascimento, dataSelecionada);
    const idadeEmAnos = idade === null ? null : Math.floor(idade / 12);
    const idadeCorrigidaPrecisa = criancaSelecionada?.especificidades?.includes('Prematuridade (Idade Corrigida)');
    const alimentacao = registros.filter((registro) => registro.tipo === 'alimentacao' && registro.dia === dia);
    const sonoHoje = registros.filter((registro) => registro.tipo === 'sono' && registro.dia === dia)
        .sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')));
    const refeicoes = analisarAlimentacao(alimentacao, criancaSelecionada?.especificidades || []);
    const sono = analisarSono(registros, dia);
    const idealSono = idadeCorrigidaPrecisa ? null : referenciaSono(idade);
    const idealAlimentacao = idadeCorrigidaPrecisa ? null : referenciaAlimentacao(idade);
    const diaEmAndamento = dia === chaveDoDia(new Date());
    const podeCompararSono = !diaEmAndamento && sono.intervalosNoturnos > 0 && !sono.intervaloAberto;
    const pontuacaoAlimentacao = (() => {
        if (!idealAlimentacao || alimentacao.length === 0 || idealAlimentacao.tipo === 'leite') return null;

        const pontuacoes = [];
        if (idealAlimentacao.tipo === 'ocasioes') {
            pontuacoes.push(diaEmAndamento
                ? percentualAteMeta(refeicoes.ocasioes, idealAlimentacao.minimo)
                : percentualDaFaixa(refeicoes.ocasioes, idealAlimentacao.minimo, idealAlimentacao.maximo));
        } else {
            pontuacoes.push(diaEmAndamento
                ? percentualAteMeta(refeicoes.refeicoes, idealAlimentacao.minimoRefeicoes)
                : percentualDaFaixa(refeicoes.refeicoes, idealAlimentacao.minimoRefeicoes, idealAlimentacao.maximoRefeicoes || idealAlimentacao.minimoRefeicoes));
            pontuacoes.push(diaEmAndamento
                ? percentualAteMeta(refeicoes.lanches, idealAlimentacao.minimoLanches)
                : percentualDaFaixa(refeicoes.lanches, idealAlimentacao.minimoLanches, idealAlimentacao.maximoLanches || idealAlimentacao.minimoLanches));
        }

        const pratosRegistrados = ['Almoço', 'Jantar']
            .map((nome) => refeicoes.gruposPorRefeicao[nome])
            .filter((grupos) => grupos?.size > 0);

        if (pratosRegistrados.length > 0) {
            const pontuacaoDosPratos = pratosRegistrados.map((grupos) => (
                Math.round((gruposDoPrato.filter((grupo) => grupos.has(grupo.valor)).length / gruposDoPrato.length) * 100)
            ));
            pontuacoes.push(pontuacaoDosPratos.reduce((total, valor) => total + valor, 0) / pontuacaoDosPratos.length);
        }

        return Math.round(pontuacoes.reduce((total, valor) => total + valor, 0) / pontuacoes.length);
    })();
    const pontuacaoSono = !idealSono || sono.intervalos === 0
        ? null
        : diaEmAndamento
            ? percentualAteMeta(sono.minutos / 60, idealSono.minimo)
            : podeCompararSono
                ? percentualDaFaixa(sono.minutos / 60, idealSono.minimo, idealSono.maximo)
                : null;

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.container}>
            <Text style={[styles.titulo, { color: cores.titulo }]}>Relatório do dia {formatarData(dataSelecionada)}</Text>
            <TouchableOpacity style={styles.botaoData} onPress={() => setMostrarData(true)}>
                <Ionicons name="calendar-outline" size={22} color={cores.acento} />
                <Text style={[styles.textoBotaoData, { color: cores.acento }]}>Escolher outro dia</Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={mostrarData}
                mode="date"
                date={dataSelecionada}
                isDarkModeEnabled={escuro}
                maximumDate={new Date()}
                confirmTextIOS="Confirmar"
                cancelTextIOS="Cancelar"
                onConfirm={(data) => {
                    setDataSelecionada(data);
                    setMostrarData(false);
                }}
                onCancel={() => setMostrarData(false)}
            />

            {!criancaSelecionada ? (
                <View style={[styles.cardVazio, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                    <FontAwesome5 name="baby" size={38} color={cores.acento} solid />
                    <Text style={[styles.textoVazio, { color: cores.textoSecundario }]}>Selecione uma criança na aba Crianças para ver o relatório.</Text>
                </View>
            ) : (
                <>
                    <View style={[styles.cardCrianca, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <FontAwesome5 name="baby" size={42} color={cores.acento} solid />
                        <View style={styles.infoCrianca}>
                            <Text style={[styles.nomeCrianca, { color: cores.titulo }]} numberOfLines={1} ellipsizeMode="tail">{criancaSelecionada.nome}</Text>
                            <Text style={[styles.textoCard, { color: cores.textoSecundario }]}>
                                Idade: {idadeEmAnos === null
                                    ? 'Não informada'
                                    : idadeEmAnos === 0
                                        ? 'Menos de 1 ano'
                                        : `${idadeEmAnos} ${idadeEmAnos === 1 ? 'ano' : 'anos'}`}
                            </Text>
                            <Text style={[styles.textoCard, { color: cores.textoSecundario }]} numberOfLines={2} ellipsizeMode="tail">
                                Especificidades: {criancaSelecionada.especificidades?.join(', ') || 'Nenhuma'}
                            </Text>
                        </View>
                    </View>

                    {carregando ? (
                        <Text style={[styles.texto, { color: cores.textoSecundario }]}>Carregando registros...</Text>
                    ) : (
                        <>
                            <View style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                                <Text style={[styles.tituloSecao, { color: cores.titulo }]}>
                                    <FontAwesome5 name="utensils" size={22} color={cores.acento} solid />  Alimentação
                                </Text>
                                <Medidor
                                    titulo={diaEmAndamento ? 'Progresso registrado até agora' : 'Aproximação da referência'}
                                    percentual={pontuacaoAlimentacao}
                                />
                                {idealAlimentacao?.tipo === 'leite' ? (
                                    <>
                                        <Text style={[styles.textoResumo, { color: cores.titulo }]}>Referência: sem meta fixa de refeições complementares nesta faixa.</Text>
                                        <Text style={[styles.texto, { color: cores.textoSecundario }]}>Atual: {alimentacao.length} registros de alimentação no dia.</Text>
                                    </>
                                ) : idealAlimentacao?.tipo === 'ocasioes' ? (
                                    <>
                                        <Text style={[styles.textoResumo, { color: cores.titulo }]}>Ideal de referência: {idealAlimentacao.texto}</Text>
                                        <Text style={[styles.texto, { color: cores.textoSecundario }]}>Atual: {refeicoes.ocasioes} ocasiões com alimentos registrados.</Text>
                                        <Text style={[styles.status, { color: cores.acento }]}>
                                            {diaEmAndamento
                                                ? 'Dia em andamento'
                                                : statusNaFaixa(refeicoes.ocasioes, idealAlimentacao.minimo, idealAlimentacao.maximo)}
                                        </Text>
                                    </>
                                ) : idealAlimentacao ? (
                                    <>
                                        <Text style={[styles.textoResumo, { color: cores.titulo }]}>
                                            Ideal de referência: {idealAlimentacao.tipo === 'maiores'
                                                ? '3 refeições principais e 2 lanches.'
                                                : `${idealAlimentacao.minimoRefeicoes} a ${idealAlimentacao.maximoRefeicoes} refeições e ${idealAlimentacao.minimoLanches} a ${idealAlimentacao.maximoLanches} lanches.`}
                                        </Text>
                                        <Text style={[styles.texto, { color: cores.textoSecundario }]}>Atual: {refeicoes.refeicoes} refeições principais e {refeicoes.lanches} lanches com alimentos registrados.</Text>
                                        <Text style={[styles.status, { color: cores.acento }]}>
                                            Refeições: {diaEmAndamento
                                                ? 'Dia em andamento'
                                                : statusNaFaixa(refeicoes.refeicoes, idealAlimentacao.minimoRefeicoes, idealAlimentacao.maximoRefeicoes || null)}
                                        </Text>
                                        <Text style={[styles.status, { color: cores.acento }]}>
                                            Lanches: {diaEmAndamento
                                                ? 'Dia em andamento'
                                                : statusNaFaixa(refeicoes.lanches, idealAlimentacao.minimoLanches, idealAlimentacao.maximoLanches || null)}
                                        </Text>
                                    </>
                                ) : idadeCorrigidaPrecisa ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Idade corrigida não calculada: o cadastro não informa as semanas de gestação.</Text>
                                ) : (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Não foi possível calcular uma referência pela data de nascimento.</Text>
                                )}

                                {!idadeCorrigidaPrecisa && idade !== null && idade >= 6 && (
                                    <View style={[styles.gruposContainer, { borderTopColor: cores.borda }]}>
                                        <Text style={[styles.subtitulo, { color: cores.titulo }]}>Composição registrada no almoço e jantar</Text>
                                        {['Almoço', 'Jantar'].map((nome) => {
                                            const grupos = refeicoes.gruposPorRefeicao[nome] || new Set();
                                            const presentes = gruposDoPrato.filter((grupo) => grupos.has(grupo.valor));
                                            const faltantes = gruposDoPrato.filter((grupo) => !grupos.has(grupo.valor));
                                            const temRegistro = grupos.size > 0;

                                            return (
                                                <View key={nome} style={[styles.linhaComparacao, { borderBottomColor: cores.borda }]}>
                                                    <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>{nome}</Text>
                                                    {!temRegistro ? (
                                                        <Text style={[styles.texto, { color: cores.textoSecundario }]}>Sem registros</Text>
                                                    ) : (
                                                        <>
                                                            <Text style={[styles.texto, { color: cores.textoSecundario }]}>{presentes.length}/4 grupos registrados</Text>
                                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                                {presentes.length > 0 ? `Atual: ${presentes.map((grupo) => grupo.nome).join(', ')}.` : 'Nenhum grupo do prato foi identificado.'}
                                                            </Text>
                                                            {faltantes.length > 0 && (
                                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>Não registrados: {faltantes.map((grupo) => grupo.nome).join(', ')}.</Text>
                                                            )}
                                                        </>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {alimentacao.length === 0 ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Nenhum alimento registrado neste dia.</Text>
                                ) : alimentacao.map((registro) => (
                                    <Text key={registro.id} style={[styles.textoRegistro, { color: cores.textoSecundario }]}>
                                        {registro.horario} · {refeicaoDoRegistro(registro)}: {registro.alimento}
                                    </Text>
                                ))}
                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>A comparação usa os horários, refeições e grupos de alimentos registrados.</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8}>
                                    <Text style={[styles.link, { color: cores.acento }]}>Ver recomendações personalizadas</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                                <Text style={[styles.tituloSecao, { color: cores.titulo }]}>
                                    <FontAwesome5 name="bed" size={22} color={cores.acento} solid />  Sono
                                </Text>
                                <Medidor
                                    titulo={diaEmAndamento ? 'Progresso registrado até agora' : 'Aproximação da referência'}
                                    percentual={pontuacaoSono}
                                />
                                {idealSono ? (
                                    <>
                                        <Text style={[styles.textoResumo, { color: cores.titulo }]}>Ideal de referência: {idealSono.minimo} a {idealSono.maximo} horas em 24 horas.</Text>
                                        {sono.intervalos > 0 ? (
                                            <>
                                                <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                                    {diaEmAndamento ? 'Atual registrado até agora' : 'Atual registrado'}: {formatarDuracao(sono.minutos)}.
                                                </Text>
                                                {podeCompararSono ? (
                                                    <Text style={[styles.status, { color: cores.acento }]}>
                                                        {statusNaFaixa(sono.minutos / 60, idealSono.minimo, idealSono.maximo)}
                                                    </Text>
                                                ) : (
                                                    <Text style={[styles.status, { color: cores.acento }]}>
                                                        {diaEmAndamento ? 'Dia em andamento' : 'Registre o período principal completo para comparar com a referência.'}
                                                    </Text>
                                                )}
                                            </>
                                        ) : (
                                            <Text style={[styles.texto, { color: cores.textoSecundario }]}>Atual: faltam registros completos de dormir e acordar para calcular a duração.</Text>
                                        )}
                                    </>
                                ) : idadeCorrigidaPrecisa ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Idade corrigida não calculada: o cadastro não informa as semanas de gestação.</Text>
                                ) : idade !== null && idade < 4 ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Ainda não há uma faixa de referência definida para esta idade.</Text>
                                ) : (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Não foi possível calcular a faixa pela data de nascimento.</Text>
                                )}
                                <Text style={[styles.textoResumo, { color: cores.titulo }]}>Registros do dia: {sonoHoje.length}</Text>
                                {sonoHoje.length === 0 ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>Nenhum horário de sono registrado neste dia.</Text>
                                ) : sonoHoje.map((registro) => (
                                    <Text key={registro.id} style={[styles.textoRegistro, { color: cores.textoSecundario }]}>
                                        {registro.horario} · {registro.evento}
                                    </Text>
                                ))}
                            </View>
                        </>
                    )}
                </>
            )}

            <Text style={[styles.copyright, { color: cores.textoSecundario }]}>&copy; 2026 KidJourney</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    container: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 16,
        gap: 12,
    },

    titulo: {
        width: '100%',
        fontSize: 22,
        color: '#326c00',
        fontFamily: 'Nunito_700Bold',
    },

    botaoData: {
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    textoBotaoData: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        textDecorationLine: 'underline',
    },

    cardCrianca: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 14,
    },

    infoCrianca: {
        flex: 1,
    },

    nomeCrianca: {
        color: '#326c00',
        fontSize: 19,
        fontFamily: 'Nunito_700Bold',
    },

    textoCard: {
        color: '#636363',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 21,
    },

    card: {
        width: '100%',
        gap: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 14,
    },

    tituloSecao: {
        color: '#326c00',
        fontSize: 20,
        fontFamily: 'Nunito_700Bold',
    },

    subtitulo: {
        color: '#326c00',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },

    texto: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
    },

    textoResumo: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
        lineHeight: 22,
    },

    status: {
        color: '#326c00',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },

    medidor: {
        gap: 7,
        marginVertical: 4,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#BFDE6C30',
    },

    medidorTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    rotuloMedidor: {
        flex: 1,
        color: '#636363',
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },

    percentual: {
        color: '#326c00',
        fontSize: 20,
        fontFamily: 'Nunito_700Bold',
    },

    pontosMedidor: {
        flexDirection: 'row',
        gap: 7,
    },

    pontoMedidor: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#c8c8c8',
    },

    pontoAtivo: {
        backgroundColor: '#326c00',
    },

    fundoMedidor: {
        height: 7,
        overflow: 'hidden',
        borderRadius: 4,
        backgroundColor: '#ddd',
    },

    progressoMedidor: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#8dbd36',
    },

    gruposContainer: {
        gap: 8,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },

    linhaComparacao: {
        gap: 2,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    rotuloComparacao: {
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },

    textoDetalhe: {
        color: '#636363',
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 19,
    },

    textoRegistro: {
        color: '#636363',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
    },

    link: {
        marginTop: 6,
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        textDecorationLine: 'underline',
    },

    cardVazio: {
        width: '100%',
        minHeight: 150,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 18,
    },

    textoVazio: {
        color: '#636363',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },

    copyright: {
        marginTop: 6,
        color: '#636363',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
    },
});

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, StyleSheet, Modal } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';
import { useTema } from '../TemaContext';
import { BloqueioPremium } from '../components/BloqueioPremium';
import { alimentosPermitidos } from './Criancas';

const gruposDoPrato = [
    { nome: 'Cereal, raiz ou tubérculo', valor: 'cerealRaiz' },
    { nome: 'Feijão ou outra leguminosa', valor: 'feijao' },
    { nome: 'Legumes ou verduras', valor: 'vegetal' },
    { nome: 'Fonte de proteína', valor: 'proteina' },
];

const faixasHorarioRefeicao = {
    'Café da manhã': { inicio: 5 * 60, fim: 10 * 60 + 59, texto: '05:00–10:59' },
    'Lanche da manhã': { inicio: 8 * 60, fim: 11 * 60 + 59, texto: '08:00–11:59' },
    Almoço: { inicio: 11 * 60, fim: 14 * 60 + 59, texto: '11:00–14:59' },
    'Lanche da tarde': { inicio: 14 * 60, fim: 17 * 60 + 59, texto: '14:00–17:59' },
    Jantar: { inicio: 17 * 60, fim: 21 * 60 + 59, texto: '17:00–21:59' },
    Ceia: { inicio: 20 * 60, fim: 23 * 60 + 59, texto: '20:00–23:59' },
};

const alimentosDeLeite = [
    'Leite materno',
    'Fórmula indicada para a criança',
    'Fórmula infantil indicada para a criança',
    'Fórmula infantil sem lactose indicada pelo profissional',
    'Leite sem lactose indicado pelo profissional',
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

function organizarAlimentosPorCategoria(alimentos, meses) {
    const categoriasComExemplos = [];
    const leites = alimentos
        .filter((alimento) => alimento.leite)
        .map((alimento) => alimento.label);

    if (leites.length > 0) {
        categoriasComExemplos.push({
            nome: 'Leites indicados',
            exemplos: leites,
        });
    }

    if (meses < 6) return categoriasComExemplos;

    const alimentosComplementares = alimentos.filter((alimento) => !alimento.leite);
    const categorias = [
        { nome: meses < 12 ? 'Refeições da fase' : 'Comida da família', grupos: ['refeicao'] },
        { nome: 'Cereais, raízes e tubérculos', grupos: ['cereal', 'raiz'] },
        { nome: 'Feijões e outras leguminosas', grupos: ['feijao', 'leguminosa'] },
        { nome: 'Legumes e verduras', grupos: ['vegetal'] },
        { nome: 'Fontes de proteína', grupos: ['proteina'] },
        { nome: 'Frutas', grupos: ['fruta'] },
        { nome: 'Laticínios', grupos: ['laticinio', 'bebida'] },
        { nome: 'Lanches', grupos: ['lanche'] },
    ];

    categorias.forEach((categoria) => {
        const exemplos = alimentosComplementares
            .filter((alimento) => categoria.grupos.includes(alimento.grupo))
            .map((alimento) => alimento.label)
            .slice(0, 8);

        if (exemplos.length > 0) {
            categoriasComExemplos.push({
                nome: categoria.nome,
                exemplos,
            });
        }
    });

    return categoriasComExemplos;
}

function textoAlimentacaoPorFase(meses) {
    if (meses < 6) {
        return 'Nesta fase, o relatório não compara refeições complementares.';
    }
    if (meses < 12) {
        return 'As refeições são introduzidas aos poucos. Respeite os sinais de fome e saciedade da criança.';
    }
    return 'A referência considera variedade de alimentos e preparo adequado à fase da criança.';
}

function alternativasDaRefeicao(nome, meses) {
    if (meses < 6 || nome === 'Ceia') return [];

    if (meses === 6 && nome === 'Jantar') {
        return [['leite']];
    }

    if (nome === 'Almoço' || nome === 'Jantar') {
        return [gruposDoPrato.map((grupo) => grupo.valor)];
    }

    if (nome === 'Café da manhã') {
        if (meses < 12) {
            return [['leite'], ['fruta', 'cerealRaiz']];
        }

        return [
            ['fruta', 'cerealRaiz'],
            ['fruta', 'laticinio'],
            ['cerealRaiz', 'laticinio'],
            ['leite', 'fruta'],
            ['leite', 'cerealRaiz'],
        ];
    }

    if (nome === 'Lanche da manhã' || nome === 'Lanche da tarde') {
        return [['fruta'], ['leite'], ['laticinio'], ['cerealRaiz']];
    }

    return [];
}

function pontuacaoDaRefeicao(nome, grupos, meses) {
    const alternativas = alternativasDaRefeicao(nome, meses);
    if (alternativas.length === 0) return null;

    const resultados = alternativas.map((gruposIdeais) => {
        const presentes = gruposIdeais.filter((grupo) => grupos.has(grupo)).length;
        return {
            percentual: Math.round((presentes / gruposIdeais.length) * 100),
            presentes,
            total: gruposIdeais.length,
            faltam: gruposIdeais.filter((grupo) => !grupos.has(grupo)),
        };
    });

    return resultados.sort((a, b) => b.percentual - a.percentual)[0];
}

function analisarHorarioRefeicao(nome, registros) {
    const faixa = faixasHorarioRefeicao[nome];
    const registrosDeComida = registros.filter((registro) => (
        !alimentosDeLeite.includes(registro.alimento)
    ));

    if (!faixa || registros.length === 0) {
        return {
            registrado: false,
            avaliado: false,
            somenteLeite: false,
            fora: false,
            percentual: null,
            horarios: [],
            faixa: faixa?.texto || '',
        };
    }

    const horarios = [...new Set(registrosDeComida
        .map((registro) => registro.horario)
        .filter((horario) => minutosDoHorario(horario) !== null))];

    if (registrosDeComida.length === 0 || horarios.length === 0) {
        return {
            registrado: true,
            avaliado: false,
            somenteLeite: registrosDeComida.length === 0,
            fora: false,
            percentual: null,
            horarios: [],
            faixa: faixa.texto,
        };
    }

    const fora = horarios.some((horario) => {
        const minutos = minutosDoHorario(horario);
        return minutos < faixa.inicio || minutos > faixa.fim;
    });

    return {
        registrado: true,
        avaliado: true,
        fora,
        percentual: fora ? 0 : 100,
        horarios,
        faixa: faixa.texto,
    };
}

function resumoPorRefeicao(registros, gruposPorRefeicao, meses) {
    if (meses === null || meses < 6) return [];

    const nomes = [];
    registros.forEach((registro) => {
        const nome = refeicaoDoRegistro(registro);
        if (!nomes.includes(nome)) nomes.push(nome);
    });

    const ordem = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
    const nomesOrdenados = [
        ...ordem.filter((nome) => nomes.includes(nome)),
        ...nomes.filter((nome) => !ordem.includes(nome)),
    ];

    return nomesOrdenados.map((nome) => {
        const registrosDoPeriodo = registros.filter((registro) => refeicaoDoRegistro(registro) === nome);
        const grupos = gruposPorRefeicao[nome] || new Set();

        return {
            nome,
            grupos,
            quantidade: registrosDoPeriodo.length,
            progresso: pontuacaoDaRefeicao(nome, grupos, meses),
            horario: analisarHorarioRefeicao(nome, registrosDoPeriodo),
        };
    });
}

function montarRefeicoesIdeais(meses) {
    const gruposPrato = [
        'Cereais, raízes e tubérculos',
        'Feijões e outras leguminosas',
        'Legumes e verduras',
        'Fontes de proteína',
    ];

    let refeicoes = [
        {
            nome: 'Café da manhã',
            texto: 'Opções simples, de acordo com a fase.',
            categorias: meses < 12
                ? ['Leites indicados']
                : ['Leites indicados', 'Frutas', 'Cereais, raízes e tubérculos', 'Laticínios'],
        },
        {
            nome: 'Lanche da manhã',
            texto: 'A fruta pode fazer parte do lanche; o leite materno pode continuar conforme a vontade da criança.',
            categorias: ['Frutas', 'Leites indicados'],
        },
        {
            nome: 'Almoço',
            texto: 'A composição de referência reúne os grupos abaixo, com alimentos variados.',
            categorias: gruposPrato,
        },
        {
            nome: 'Lanche da tarde',
            texto: 'A fruta pode fazer parte do lanche; o leite materno pode continuar conforme a vontade da criança.',
            categorias: ['Frutas', 'Leites indicados'],
        },
        {
            nome: 'Jantar',
            texto: 'A refeição pode seguir a mesma variedade de grupos do almoço.',
            categorias: gruposPrato,
        },
    ];

    if (meses === 6) {
        refeicoes[4] = {
            nome: 'Jantar',
            texto: 'No início da introdução alimentar, a rotina pode ser gradual; o leite materno segue conforme a vontade da criança.',
            categorias: ['Leites indicados'],
        };
    }

    if (meses < 6) return [];

    return refeicoes.map((refeicao) => ({
        ...refeicao,
        horario: faixasHorarioRefeicao[refeicao.nome]?.texto || '',
    }));
}

function nomeDaCategoriaDoGrupo(grupo) {
    const categorias = {
        cerealRaiz: 'Cereais, raízes e tubérculos',
        feijao: 'Feijões e outras leguminosas',
        vegetal: 'Legumes e verduras',
        proteina: 'Fontes de proteína',
        fruta: 'Frutas',
        laticinio: 'Laticínios',
        leite: 'Leites indicados',
    };
    return categorias[grupo] || '';
}

function montarRecomendacoesAlimentacao(resumo, categorias, meses, especificidades = []) {
    const especificidadesTexto = especificidades.map((item) => normalizarAlimento(item.split(':')[0]));
    const precisaOrientacaoIndividual = especificidadesTexto.some((item) => [
        'diabetes tipo 1',
        'refluxo gastroesofagico',
        'constipacao cronica',
        'outra condicao com dieta orientada por profissional',
    ].includes(item));
    const temDisfagia = especificidadesTexto.includes('dificuldade de degluticao');
    const temSeletividade = especificidadesTexto.some((item) => (
        item === 'seletividade alimentar'
        || item === 'neofobia alimentar (recusa de alimentos novos)'
    ));

    if (meses === null) return ['Informe a data de nascimento para comparar a alimentação.'];
    if (meses < 6) {
        return ['Nesta fase não há meta de refeições complementares. Registre apenas os alimentos adequados à orientação da criança.'];
    }
    if (!resumo.some((refeicao) => refeicao.quantidade > 0)) {
        return ['Nenhuma refeição foi registrada neste dia. Se a criança comeu, registre os alimentos e horários para comparar com as referências.'];
    }
    if (temDisfagia) {
        return ['A dificuldade de deglutição exige orientação individual sobre consistência. O app não recomenda texturas automaticamente.'];
    }

    const recomendacoes = [];

    resumo.forEach((refeicao) => {
        if (refeicao.quantidade === 0) return;

        if (refeicao.progresso && refeicao.progresso.faltam.length > 0) {
            const faltam = refeicao.progresso.faltam.map((grupo) => {
                const nomeCategoria = nomeDaCategoriaDoGrupo(grupo);
                const categoria = categorias.find((item) => item.nome === nomeCategoria);
                const exemplos = categoria ? categoria.exemplos.slice(0, 3).join(', ') : '';
                return exemplos ? nomeCategoria + ': ' + exemplos : nomeCategoria;
            });

            recomendacoes.push(
                refeicao.nome + ': faltam grupos na referência registrada. Você pode variar com ' + faltam.join('; ') + '.'
            );
        }

        if (refeicao.horario.registrado && refeicao.horario.fora) {
            recomendacoes.push(
                refeicao.nome + ': horário registrado (' + refeicao.horario.horarios.join(', ')
                + ') fora da faixa de referência do app (' + refeicao.horario.faixa + ').'
            );
        }
    });

    if (recomendacoes.length === 0) {
        recomendacoes.push('As refeições registradas alcançaram a composição de referência do app.');
        recomendacoes.push('Continue variando os alimentos e respeitando os sinais de fome e saciedade.');
    }

    if (temSeletividade) {
        recomendacoes.push('Para seletividade ou recusa de alimentos novos, ofereça variedade aos poucos, junto de opções familiares, sem pressionar a criança.');
    }

    if (precisaOrientacaoIndividual) {
        recomendacoes.push('Como há uma condição que pode exigir cuidado alimentar, siga também a orientação do profissional da criança.');
    }

    recomendacoes.push('As faixas de horário são referências flexíveis do app, não regras fixas.');
    return recomendacoes;
}

function montarRecomendacoesSono(sono, ideal, diaEmAndamento, horariosFora = []) {
    if (!ideal) return ['Não há uma faixa de horas calculada para esta idade.'];
    if (sono.intervalos === 0) {
        if (sono.periodosAbertos.length > 0) {
            return ['O sono está em andamento. Registre também quando a criança acordar para calcular a duração.'];
        }
        return ['Nenhum período completo foi registrado neste dia. Registre quando a criança dormiu e acordou para acompanhar as horas e os horários.'];
    }

    const horas = sono.minutos / 60;
    const recomendacoes = [];

    if (horas < ideal.minimo) {
        const faltam = formatarDuracao(Math.ceil((ideal.minimo - horas) * 60));
        recomendacoes.push(
            diaEmAndamento
                ? 'Até agora foram registradas ' + formatarDuracao(sono.minutos) + '. Faltam cerca de '
                    + faltam + ' para alcançar o início da faixa diária; o total pode mudar ao longo do dia.'
                : 'Nesse dia o total ficou ' + faltam + ' abaixo do início da faixa de referência, que começa em '
                    + ideal.minimo + ' horas.'
        );
    } else if (horas > ideal.maximo) {
        recomendacoes.push('O total ficou acima da faixa de referência. Observe o padrão da criança e converse com o profissional se houver preocupação.');
    } else {
        recomendacoes.push(
            diaEmAndamento
                ? 'O total registrado está dentro da faixa até agora; ainda pode mudar ao longo do dia.'
                : 'O total registrado está dentro da faixa de referência.'
        );
    }

    if (horariosFora.length > 0) {
        recomendacoes.push('Os horários de dormir ou acordar ficaram fora da faixa geral usada pelo app. Observe a rotina da criança; não existe um horário único para todas.');
    } else {
        recomendacoes.push('Manter uma rotina regular para dormir e acordar ajuda a acompanhar os hábitos da criança.');
    }

    return recomendacoes;
}

function BarraProgresso({ valor, cores }) {
    const progresso = Math.max(0, Math.min(100, valor || 0));

    return (
        <View style={[styles.barraFundo, { backgroundColor: cores.borda }]}>
            <View style={[styles.barraValor, { width: String(progresso) + '%', backgroundColor: cores.acento }]} />
        </View>
    );
}

function normalizarAlimento(alimento) {
    return String(alimento || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function minutosDoHorario(horario) {
    const partes = String(horario || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!partes) return null;

    const horas = Number(partes[1]);
    const minutos = Number(partes[2]);
    if (horas > 23 || minutos > 59) return null;

    return horas * 60 + minutos;
}

function referenciaSono(meses) {
    if (meses === null || meses < 4) return null;
    if (meses < 12) return { minimo: 12, maximo: 16 };
    if (meses < 36) return { minimo: 11, maximo: 14 };
    return { minimo: 10, maximo: 13 };
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
    const especificidadesTexto = especificidades.map((item) => normalizarAlimento(item.split(':')[0]));
    const eVegetariano = especificidadesTexto.includes('vegetarianismo')
        || especificidadesTexto.includes('veganismo');

    registros.forEach((registro) => {
        const nomeRefeicao = refeicaoDoRegistro(registro);
        if (!refeicoes[nomeRefeicao]) refeicoes[nomeRefeicao] = new Set();

        if (alimentosDeLeite.includes(registro.alimento)) {
            refeicoes[nomeRefeicao].add('leite');
            return;
        }

        const alimento = normalizarAlimento(registro.alimento);
        const grupo = registro.grupo || gruposPorAlimento[registro.alimento];
        const grupos = new Set();

        if (/\b(arroz|milho|macarrao|batata|mandioca|inhame|pao|aveia|quinoa|cuscuz|polenta|tapioca)\b/.test(alimento)) {
            grupos.add('cerealRaiz');
        }
        if (/\b(feijao|lentilha|grao.?de.?bico|ervilha)\b/.test(alimento)) {
            grupos.add('feijao');
        }
        if (/\b(legumes|verduras|abobora|cenoura|abobrinha|salada|brocolis|espinafre|couve|vagem|chuchu|beterraba|tomate|pepino)\b/.test(alimento)) {
            grupos.add('vegetal');
        }
        if (/\b(banana|maca|pera|mamao|abacate|manga|melao|goiaba|morango|melancia|uva|fruta)\b/.test(alimento)) {
            grupos.add('fruta');
        }
        if (/\b(iogurte|queijo|leite|laticinio)\b/.test(alimento)) {
            grupos.add('laticinio');
        }
        if (/\b(frango|carne|peixe|ovo|tofu|camarao|salmao|suina|peru|amendoim|castanha)\b/.test(alimento)) {
            grupos.add('proteina');
        }

        if (grupo === 'cereal' || grupo === 'raiz') grupos.add('cerealRaiz');
        if (grupo === 'leguminosa') grupos.add('feijao');
        if (grupo === 'vegetal') grupos.add('vegetal');
        if (grupo === 'fruta') grupos.add('fruta');
        if (grupo === 'proteina') grupos.add('proteina');
        if (grupo === 'laticinio' || grupo === 'bebida') grupos.add('laticinio');

        if (eVegetariano && grupos.has('feijao')) grupos.add('proteina');

        grupos.forEach((item) => refeicoes[nomeRefeicao].add(item));
    });

    return refeicoes;
}

function dataComHora(dia, horario) {
    if (!dia || !horario) return null;
    const [ano, mes, numeroDia] = dia.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);
    return new Date(ano, mes - 1, numeroDia, hora, minuto);
}

function periodoDoDia(data) {
    const hora = data.getHours();
    if (hora < 5) return 'madrugada';
    if (hora < 12) return 'manhã';
    if (hora < 17) return 'tarde';
    return 'noite';
}

function descricaoPeriodoDoDia(data) {
    const periodo = periodoDoDia(data);
    if (periodo === 'madrugada') return 'de madrugada';
    if (periodo === 'manhã') return 'pela manhã';
    if (periodo === 'tarde') return 'à tarde';
    return 'à noite';
}

function analisarHorarioSono(periodo) {
    const inicio = descricaoPeriodoDoDia(periodo.inicio);
    const fim = descricaoPeriodoDoDia(periodo.fim);

    if (periodo.nome === 'Soneca') {
        const inicioDuranteODia = inicio === 'pela manhã' || inicio === 'à tarde';
        const fimDuranteODia = fim === 'pela manhã' || fim === 'à tarde';
        const fora = !inicioDuranteODia || !fimDuranteODia;

        return {
            texto: fora ? 'Fora da faixa diurna geral do app.' : inicio + ' → ' + fim,
            fora,
            percentual: fora ? 0 : 100,
        };
    }

    const inicioDuranteANoite = inicio === 'à noite';
    const despertarPelaManha = fim === 'de madrugada' || fim === 'pela manhã';
    const fora = !inicioDuranteANoite || !despertarPelaManha;

    return {
        texto: fora ? 'Fora da faixa noturna geral do app.' : inicio + ' → ' + fim,
        fora,
        percentual: fora ? 0 : 100,
    };
}

function analisarInicioSono(periodo) {
    const inicio = descricaoPeriodoDoDia(periodo.inicio);
    const fora = periodo.nome === 'Soneca'
        ? inicio === 'de madrugada' || inicio === 'à noite'
        : inicio !== 'à noite';

    return {
        texto: fora
            ? periodo.nome === 'Soneca' ? 'Fora da faixa diurna geral do app.' : 'Fora da faixa noturna geral do app.'
            : 'Começou ' + inicio + '.',
        fora,
        percentual: fora ? 0 : 100,
    };
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
    const periodos = [];
    const periodosAbertos = [];
    const eventosPareados = new Set();

    const eventos = registros
        .filter((registro) => registro.tipo === 'sono')
        .map((registro) => ({ ...registro, momento: dataComHora(registro.dia, registro.horario) }))
        .filter((registro) => registro.momento)
        .sort((a, b) => a.momento - b.momento);

    function somarIntervalo(eventoInicio, eventoFim, noturno = false) {
        if (!eventoInicio || !eventoFim) return;

        const inicio = eventoInicio.momento;
        const fim = eventoFim.momento;
        if (fim <= inicio) return;

        eventosPareados.add(eventoInicio);
        eventosPareados.add(eventoFim);

        const comeco = Math.max(inicio.getTime(), inicioDia);
        const final = Math.min(fim.getTime(), fimDia);
        if (final <= comeco) return;

        const minutosDoPeriodo = Math.floor((fim - inicio) / 60000);
        const minutosNoDia = Math.floor((final - comeco) / 60000);
        minutos += minutosNoDia;
        intervalos++;
        if (noturno) intervalosNoturnos++;

        periodos.push({
            nome: noturno ? 'Sono noturno' : 'Soneca',
            inicio,
            fim,
            minutos: minutosDoPeriodo,
            minutosNoDia,
        });
    }

    eventos.forEach((evento) => {
        if (evento.evento === 'Dormiu') inicioNoite = evento;
        if (evento.evento === 'Acordou') {
            somarIntervalo(inicioNoite, evento, true);
            inicioNoite = null;
        }
        if (evento.evento === 'Começou a soneca') inicioSoneca = evento;
        if (evento.evento === 'Acordou da soneca') {
            somarIntervalo(inicioSoneca, evento);
            inicioSoneca = null;
        }
    });

    const agora = new Date();
    const diaAtual = chaveDoDia(agora);

    if (inicioNoite && inicioNoite.momento.getTime() < fimDia) {
        const inicioNoiteNoDia = Math.max(inicioNoite.momento.getTime(), inicioDia);
        const fimNoiteNoDia = Math.min(agora.getTime(), fimDia);
        const minutosAteAgora = diaAlvo === diaAtual && fimNoiteNoDia > inicioNoiteNoDia
            ? Math.floor((fimNoiteNoDia - inicioNoiteNoDia) / 60000)
            : 0;

        if (minutosAteAgora > 0) {
            minutos += minutosAteAgora;
            intervalos++;
            intervalosNoturnos++;
        }

        periodosAbertos.push({
            nome: 'Sono noturno',
            inicio: inicioNoite.momento,
            minutosAteAgora,
        });
        eventosPareados.add(inicioNoite);
    }
    if (inicioSoneca && inicioSoneca.momento.getTime() < fimDia) {
        const inicioSonecaNoDia = Math.max(inicioSoneca.momento.getTime(), inicioDia);
        const fimSonecaNoDia = Math.min(agora.getTime(), fimDia);
        const minutosAteAgora = diaAlvo === diaAtual && fimSonecaNoDia > inicioSonecaNoDia
            ? Math.floor((fimSonecaNoDia - inicioSonecaNoDia) / 60000)
            : 0;

        if (minutosAteAgora > 0) {
            minutos += minutosAteAgora;
            intervalos++;
        }

        periodosAbertos.push({
            nome: 'Soneca',
            inicio: inicioSoneca.momento,
            minutosAteAgora,
        });
        eventosPareados.add(inicioSoneca);
    }

    periodos.sort((a, b) => a.inicio - b.inicio);
    periodosAbertos.sort((a, b) => a.inicio - b.inicio);

    const eventosSemPar = eventos.filter((evento) => (
        evento.momento.getTime() >= inicioDia
        && evento.momento.getTime() < fimDia
        && !eventosPareados.has(evento)
    ));

    return {
        minutos,
        intervalos,
        intervalosNoturnos,
        intervaloAberto: periodosAbertos.length > 0,
        periodos,
        periodosAbertos,
        eventosSemPar,
    };
}

function formatarHorarioSono(data, diaAlvo) {
    const horario = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    if (chaveDoDia(data) === diaAlvo) return horario;

    const dataCurta = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });
    return horario + ' (' + dataCurta + ')';
}

function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return `${horas}h ${String(resto).padStart(2, '0')}min`;
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

export default function RelatorioScreen({ navigation, criancaSelecionada }) {
    const { user, premium } = useAuth();
    const { cores, escuro } = useTema();
    const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
    const [agora, setAgora] = useState(() => new Date());
    const [diaAutomatico, setDiaAutomatico] = useState(true);
    const [mostrarData, setMostrarData] = useState(false);
    const [mostrarIdealAlimentacao, setMostrarIdealAlimentacao] = useState(false);
    const [mostrarIdealSono, setMostrarIdealSono] = useState(false);
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const dia = chaveDoDia(dataSelecionada);
    const diaAnterior = chaveDoDia(moverDia(dataSelecionada, -1));
    const diaSeguinte = chaveDoDia(moverDia(dataSelecionada, 1));

    useEffect(() => {
        const temporizador = setInterval(() => setAgora(new Date()), 60000);
        const agoraAtual = new Date();
        const meiaNoite = new Date(
            agoraAtual.getFullYear(),
            agoraAtual.getMonth(),
            agoraAtual.getDate() + 1
        );
        const temporizadorDaVirada = setTimeout(() => {
            const dataAtual = new Date();
            setAgora(dataAtual);
            if (diaAutomatico) setDataSelecionada(dataAtual);
        }, meiaNoite.getTime() - agoraAtual.getTime());

        return () => {
            clearInterval(temporizador);
            clearTimeout(temporizadorDaVirada);
        };
    }, [diaAutomatico]);

    useEffect(() => {
        if (!user?.uid || !premium || !criancaSelecionada?.id) {
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
    }, [user?.uid, premium, criancaSelecionada?.id, dia, diaAnterior, diaSeguinte]);

    const idade = idadeEmMeses(criancaSelecionada?.dataNascimento, dataSelecionada);
    const idadeEmAnos = idade === null ? null : Math.floor(idade / 12);
    const idadeCorrigidaPrecisa = criancaSelecionada?.especificidades?.includes('Prematuridade (Idade Corrigida)');
    const alimentacao = registros.filter((registro) => registro.tipo === 'alimentacao' && registro.dia === dia);
    const refeicoes = analisarAlimentacao(alimentacao, criancaSelecionada?.especificidades || []);
    const sono = analisarSono(registros, dia);
    const idealSono = idadeCorrigidaPrecisa ? null : referenciaSono(idade);
    const categoriasAlimentares = idade === null || idadeCorrigidaPrecisa
        ? []
        : organizarAlimentosPorCategoria(
            alimentosPermitidos(criancaSelecionada?.especificidades || [], idade),
            idade
        );
    const resumoRefeicoes = resumoPorRefeicao(alimentacao, refeicoes, idade);
    const diaEmAndamento = dia === chaveDoDia(agora);
    const podeCompararSono = !diaEmAndamento && sono.intervalos > 0 && !sono.intervaloAberto;
    const pontuacaoSono = !idealSono || sono.intervalos === 0
        ? null
        : diaEmAndamento
            ? percentualAteMeta(sono.minutos / 60, idealSono.minimo)
            : podeCompararSono
                ? percentualDaFaixa(sono.minutos / 60, idealSono.minimo, idealSono.maximo)
                : null;

    const especificidades = criancaSelecionada?.especificidades || [];
    const recomendacoesAlimentacao = montarRecomendacoesAlimentacao(
        resumoRefeicoes,
        categoriasAlimentares,
        idade,
        especificidades
    );
    const horariosSonoFora = [
        ...sono.periodos.filter((periodo) => analisarHorarioSono(periodo).fora),
        ...sono.periodosAbertos.filter((periodo) => analisarInicioSono(periodo).fora),
    ];
    const recomendacoesSono = montarRecomendacoesSono(
        sono,
        idealSono,
        diaEmAndamento,
        horariosSonoFora
    );

    if (!premium) {
        return (
            <ScrollView style={[styles.scrollContainer, { backgroundColor: cores.fundo }]} contentContainerStyle={styles.container}>
                <BloqueioPremium
                    titulo="Relatório Premium bloqueado"
                    texto="Acompanhe o progresso diário de alimentação e sono e confira referências e recomendações personalizadas."
                />
            </ScrollView>
        );
    }

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
                    setDiaAutomatico(chaveDoDia(data) === chaveDoDia(new Date()));
                    setMostrarData(false);
                }}
                onCancel={() => setMostrarData(false)}
            />

            <Modal
                visible={premium && mostrarIdealAlimentacao}
                transparent
                animationType="fade"
                onRequestClose={() => setMostrarIdealAlimentacao(false)}
            >
                <View style={styles.modalFundo}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMostrarIdealAlimentacao(false)}
                    />
                    <View style={[styles.modalConteudo, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoModal}>
                            <Text style={[styles.tituloModal, { color: cores.titulo }]}>
                                Refeições de referência
                            </Text>
                            <TouchableOpacity
                                style={styles.botaoFecharModal}
                                onPress={() => setMostrarIdealAlimentacao(false)}
                            >
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.listaModal} showsVerticalScrollIndicator={false}>
                            {idadeCorrigidaPrecisa ? (
                                <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                    A idade corrigida não foi calculada. Confira a fase alimentar com o profissional que acompanha a criança.
                                </Text>
                            ) : idade === null ? (
                                <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                    Informe a data de nascimento para ver as referências.
                                </Text>
                            ) : (
                                <>
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                        {textoAlimentacaoPorFase(idade)}
                                    </Text>
                                    {idade < 6 ? (
                                        categoriasAlimentares.map((categoria) => (
                                            <View key={categoria.nome} style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                                <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                                    {categoria.nome}
                                                </Text>
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                    {categoria.exemplos.join(', ')}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        montarRefeicoesIdeais(idade).map((periodo) => {
                                            const refeicaoAtual = resumoRefeicoes.find((item) => item.nome === periodo.nome);
                                            return (
                                                <View key={periodo.nome} style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                                    <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                                        {periodo.nome}
                                                    </Text>
                                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                        {periodo.texto}
                                                    </Text>
                                                    {periodo.horario && (
                                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                            Faixa de horário do app: {periodo.horario}
                                                        </Text>
                                                    )}
                                                    {refeicaoAtual?.progresso && (
                                                        <>
                                                            <Text style={[styles.textoDetalhe, { color: cores.acento }]}>
                                                                {refeicaoAtual.quantidade === 0
                                                                    ? 'Ainda não foi registrada neste dia.'
                                                                    : 'Registrado neste dia: ' + refeicaoAtual.progresso.percentual + '% da composição de referência.'}
                                                            </Text>
                                                            {refeicaoAtual.quantidade > 0 && refeicaoAtual.progresso.faltam.length > 0 && (
                                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                                    Falta incluir: {refeicaoAtual.progresso.faltam.map(nomeDaCategoriaDoGrupo).join(', ')}.
                                                                </Text>
                                                            )}
                                                            {refeicaoAtual.horario.avaliado && (
                                                                <Text style={[styles.textoDetalhe, { color: refeicaoAtual.horario.fora ? cores.perigo : cores.textoSecundario }]}>
                                                                    Horários registrados: {refeicaoAtual.horario.horarios.join(', ')} · {refeicaoAtual.horario.fora ? 'fora da faixa do app' : 'na faixa do app'}.
                                                                </Text>
                                                            )}
                                                        </>
                                                    )}
                                                    {periodo.categorias.map((nomeCategoria) => {
                                                        const categoria = categoriasAlimentares.find((item) => item.nome === nomeCategoria);
                                                        if (!categoria) return null;
                                                        return (
                                                            <Text key={nomeCategoria} style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                                {categoria.nome}: {categoria.exemplos.join(', ')}
                                                            </Text>
                                                        );
                                                    })}
                                                </View>
                                            );
                                        })
                                    )}
                                    <View style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                        <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                            Recomendações deste dia
                                        </Text>
                                        {recomendacoesAlimentacao.map((recomendacao, index) => (
                                            <Text key={index} style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                • {recomendacao}
                                            </Text>
                                        ))}
                                    </View>
                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                        As faixas de horário são referências flexíveis do app. Mamadas não têm uma faixa fixa, e a comparação usa somente os registros deste dia, das 00:00 às 23:59.
                                    </Text>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={premium && mostrarIdealSono}
                transparent
                animationType="fade"
                onRequestClose={() => setMostrarIdealSono(false)}
            >
                <View style={styles.modalFundo}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMostrarIdealSono(false)}
                    />
                    <View style={[styles.modalConteudo, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                        <View style={styles.cabecalhoModal}>
                            <Text style={[styles.tituloModal, { color: cores.titulo }]}>
                                Referência de sono
                            </Text>
                            <TouchableOpacity
                                style={styles.botaoFecharModal}
                                onPress={() => setMostrarIdealSono(false)}
                            >
                                <FontAwesome5 name="times" size={20} color={cores.acento} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.listaModal} showsVerticalScrollIndicator={false}>
                            {idadeCorrigidaPrecisa ? (
                                <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                    A idade corrigida não foi calculada. Confira a referência de sono com o profissional que acompanha a criança.
                                </Text>
                            ) : idade === null ? (
                                <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                    Informe a data de nascimento para ver a referência.
                                </Text>
                            ) : (
                                <>
                                    <View style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                        <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                            {idealSono
                                                ? idealSono.minimo + ' a ' + idealSono.maximo + ' horas em 24 horas'
                                                : 'Sem faixa de horas calculada para esta idade'}
                                        </Text>
                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                            A soma considera o sono noturno e as sonecas entre 00:00 e 23:59. Períodos que cruzam a meia-noite são divididos entre os dois dias.
                                        </Text>
                                        {sono.intervalos > 0 && (
                                            <>
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                    Registrado: {formatarDuracao(sono.minutos)}
                                                </Text>
                                                {pontuacaoSono !== null && (
                                                    <>
                                                        <BarraProgresso valor={pontuacaoSono} cores={cores} />
                                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                            {sono.minutos / 60 < idealSono.minimo
                                                                ? 'Faltam cerca de ' + formatarDuracao(Math.ceil(idealSono.minimo * 60 - sono.minutos)) + ' para a faixa mínima.'
                                                                : sono.minutos / 60 > idealSono.maximo
                                                                    ? 'O total passou da faixa de referência.'
                                                                    : 'O total está dentro da faixa de referência.'}
                                                        </Text>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </View>
                                    <View style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                        <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                            Horários registrados
                                        </Text>
                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                            O app considera os horários para acompanhar a rotina, sem definir uma hora fixa para todas as crianças.
                                        </Text>
                                        {sono.periodos.map((periodo) => {
                                            const analiseHorario = analisarHorarioSono(periodo);
                                            return (
                                                <View key={periodo.nome + periodo.inicio.getTime()}>
                                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                        {periodo.nome}: {formatarHorarioSono(periodo.inicio, dia)} → {formatarHorarioSono(periodo.fim, dia)} · {formatarDuracao(periodo.minutosNoDia)} neste dia
                                                    </Text>
                                                    {idealSono ? (
                                                        <View>
                                                            <Text style={[styles.textoDetalhe, { color: analiseHorario.fora ? cores.perigo : cores.textoSecundario }]}>{analiseHorario.texto} · {analiseHorario.percentual}%</Text>
                                                            <BarraProgresso valor={analiseHorario.percentual} cores={cores} />
                                                        </View>
                                                    ) : (
                                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>Sem faixa de horário calculada para esta idade.</Text>
                                                    )}
                                                </View>
                                            );
                                        })}
                                        {sono.periodosAbertos.map((periodo) => {
                                            const analiseHorario = analisarInicioSono(periodo);
                                            return (
                                                <View key={periodo.nome + periodo.inicio.getTime()}>
                                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                        {periodo.nome} em andamento desde {formatarHorarioSono(periodo.inicio, dia)}
                                                        {periodo.minutosAteAgora > 0 ? ' · ' + formatarDuracao(periodo.minutosAteAgora) : ''}
                                                    </Text>
                                                    {idealSono ? (
                                                        <View>
                                                            <Text style={[styles.textoDetalhe, { color: analiseHorario.fora ? cores.perigo : cores.textoSecundario }]}>{analiseHorario.texto} · {analiseHorario.percentual}%</Text>
                                                            <BarraProgresso valor={analiseHorario.percentual} cores={cores} />
                                                        </View>
                                                    ) : (
                                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>Sem faixa de horário calculada para esta idade.</Text>
                                                    )}
                                                </View>
                                            );
                                        })}
                                        {sono.eventosSemPar.map((evento) => (
                                            <Text key={evento.id} style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                {evento.evento} · {formatarHorarioSono(evento.momento, dia)}
                                            </Text>
                                        ))}
                                        {sono.periodos.length === 0 && sono.periodosAbertos.length === 0 && sono.eventosSemPar.length === 0 && (
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                Nenhum horário registrado neste dia.
                                            </Text>
                                        )}
                                    </View>
                                    <View style={[styles.periodoModal, { borderColor: cores.borda }]}>
                                        <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                            Recomendações deste dia
                                        </Text>
                                        {recomendacoesSono.map((recomendacao, index) => (
                                            <Text key={index} style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                • {recomendacao}
                                            </Text>
                                        ))}
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
                                {idadeCorrigidaPrecisa ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                        Idade corrigida não calculada.
                                    </Text>
                                ) : idade === null ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                        Idade não informada.
                                    </Text>
                                ) : idade < 6 ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                        Sem meta de refeições complementares nesta fase.
                                    </Text>
                                ) : resumoRefeicoes.length === 0 ? (
                                    <Text style={[styles.texto, { color: cores.textoSecundario }]}>
                                        Nenhuma refeição registrada neste dia.
                                    </Text>
                                ) : resumoRefeicoes.map((refeicao) => (
                                    <View key={refeicao.nome} style={[styles.linhaComparacao, { borderBottomColor: cores.borda }]}>
                                        <View style={styles.topoPercentual}>
                                            <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                                {refeicao.nome}
                                            </Text>
                                            <Text style={[styles.textoResumo, { color: cores.titulo }]}>
                                                {refeicao.progresso
                                                    ? refeicao.progresso.percentual + '%'
                                                    : 'Sem meta fixa'}
                                            </Text>
                                        </View>
                                        {refeicao.progresso && (
                                            <>
                                                <BarraProgresso valor={refeicao.progresso.percentual} cores={cores} />
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                    {refeicao.progresso.presentes} de {refeicao.progresso.total} grupos
                                                    {refeicao.progresso.faltam.length > 0
                                                        ? ' · faltam: ' + refeicao.progresso.faltam.map(nomeDaCategoriaDoGrupo).join(', ')
                                                        : ' · referência alcançada'}
                                                </Text>
                                            </>
                                        )}
                                        {refeicao.horario.avaliado ? (
                                            <>
                                                <Text style={[styles.textoDetalhe, { color: refeicao.horario.fora ? cores.perigo : cores.textoSecundario }]}>
                                                    Horário · {refeicao.horario.horarios.join(', ')} · {refeicao.horario.fora ? 'fora da faixa do app' : 'na faixa do app'}
                                                </Text>
                                                <BarraProgresso valor={refeicao.horario.percentual} cores={cores} />
                                            </>
                                        ) : refeicao.horario.registrado && refeicao.horario.somenteLeite ? (
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                Horário registrado · leite sem faixa fixa
                                            </Text>
                                        ) : refeicao.horario.registrado ? (
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                Horário ainda sem comparação
                                            </Text>
                                        ) : (
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                Sem horário registrado
                                            </Text>
                                        )}
                                    </View>
                                ))}
                                <TouchableOpacity
                                    onPress={() => setMostrarIdealAlimentacao(true)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.link, { color: cores.acento }]}>
                                        Confira o que seria ideal
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8}>
                                    <Text style={[styles.link, { color: cores.acento }]}>
                                        Ver recomendações personalizadas
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
                                <Text style={[styles.tituloSecao, { color: cores.titulo }]}>
                                    <FontAwesome5 name="bed" size={22} color={cores.acento} solid />  Sono
                                </Text>
                                {sono.intervalos > 0 ? (
                                    <>
                                        <Text style={[styles.textoResumo, { color: cores.titulo }]}>
                                            {diaEmAndamento ? 'Até agora' : 'Total'} · {formatarDuracao(sono.minutos)}
                                            {idealSono ? ' / ' + idealSono.minimo + '–' + idealSono.maximo + ' h' : ''}
                                            {pontuacaoSono === null ? '' : ' · ' + pontuacaoSono + '%'}
                                        </Text>
                                        {pontuacaoSono !== null && (
                                            <>
                                                <BarraProgresso valor={pontuacaoSono} cores={cores} />
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                    {sono.minutos / 60 < idealSono.minimo
                                                        ? (diaEmAndamento ? 'Faltam ' : 'Abaixo da faixa por ')
                                                            + formatarDuracao(Math.ceil(idealSono.minimo * 60 - sono.minutos))
                                                            + (diaEmAndamento ? ' para a faixa mínima' : '')
                                                        : sono.minutos / 60 > idealSono.maximo
                                                            ? 'Acima da faixa por ' + formatarDuracao(Math.ceil(sono.minutos - idealSono.maximo * 60))
                                                            : 'Dentro da faixa de referência'}
                                                </Text>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                        Nenhum período completo registrado neste dia.
                                    </Text>
                                )}
                                {idadeCorrigidaPrecisa && (
                                    <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                        Idade corrigida não calculada.
                                    </Text>
                                )}
                                {sono.periodos.map((periodo) => {
                                    const analiseHorario = analisarHorarioSono(periodo);
                                    return (
                                        <View
                                            key={periodo.nome + '-' + periodo.inicio.getTime()}
                                            style={[styles.linhaComparacao, { borderBottomColor: cores.borda }]}
                                        >
                                            <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                                {periodo.nome}
                                            </Text>
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                {formatarHorarioSono(periodo.inicio, dia)} → {formatarHorarioSono(periodo.fim, dia)} · {formatarDuracao(periodo.minutosNoDia)} neste dia
                                            </Text>
                                            {idealSono ? (
                                                <View>
                                                    <Text style={[styles.textoDetalhe, { color: analiseHorario.fora ? cores.perigo : cores.textoSecundario }]}>{analiseHorario.texto} · {analiseHorario.percentual}%</Text>
                                                    <BarraProgresso valor={analiseHorario.percentual} cores={cores} />
                                                </View>
                                            ) : (
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>Sem faixa de horário calculada para esta idade.</Text>
                                            )}
                                        </View>
                                    );
                                })}
                                {sono.periodosAbertos.map((periodo) => {
                                    const analiseHorario = analisarInicioSono(periodo);
                                    return (
                                        <View
                                            key={periodo.nome + '-' + periodo.inicio.getTime()}
                                            style={[styles.linhaComparacao, { borderBottomColor: cores.borda }]}
                                        >
                                            <Text style={[styles.rotuloComparacao, { color: cores.acento }]}>
                                                {periodo.nome} em andamento
                                            </Text>
                                            <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                                Início · {formatarHorarioSono(periodo.inicio, dia)}
                                                {periodo.minutosAteAgora > 0 ? ' · ' + formatarDuracao(periodo.minutosAteAgora) : ''}
                                            </Text>
                                            {idealSono ? (
                                                <View>
                                                    <Text style={[styles.textoDetalhe, { color: analiseHorario.fora ? cores.perigo : cores.textoSecundario }]}>{analiseHorario.texto} · {analiseHorario.percentual}%</Text>
                                                    <BarraProgresso valor={analiseHorario.percentual} cores={cores} />
                                                </View>
                                            ) : (
                                                <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>Sem faixa de horário calculada para esta idade.</Text>
                                            )}
                                        </View>
                                    );
                                })}
                                {sono.eventosSemPar.map((evento) => (
                                    <Text key={evento.id} style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                        {evento.evento} · {formatarHorarioSono(evento.momento, dia)}
                                    </Text>
                                ))}
                                {sono.periodos.length === 0
                                    && sono.periodosAbertos.length === 0
                                    && sono.eventosSemPar.length === 0
                                    && sono.intervalos === 0 && (
                                        <Text style={[styles.textoDetalhe, { color: cores.textoSecundario }]}>
                                            Nenhum horário registrado.
                                        </Text>
                                    )}
                                <TouchableOpacity
                                    onPress={() => setMostrarIdealSono(true)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.link, { color: cores.acento }]}>
                                        Confira o que seria ideal
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Recomendacoes')} activeOpacity={0.8}>
                                    <Text style={[styles.link, { color: cores.acento }]}>
                                        Ver recomendações personalizadas
                                    </Text>
                                </TouchableOpacity>
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

    link: {
        marginTop: 6,
        color: '#326c00',
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        textDecorationLine: 'underline',
    },

    barraFundo: {
        width: '100%',
        height: 8,
        overflow: 'hidden',
        borderRadius: 4,
        marginTop: 4,
    },

    barraValor: {
        height: '100%',
        borderRadius: 4,
    },

    topoPercentual: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    modalFundo: {
        flex: 1,
        justifyContent: 'center',
        padding: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    modalConteudo: {
        width: '100%',
        maxHeight: '85%',
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
    },

    cabecalhoModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    tituloModal: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },

    botaoFecharModal: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    listaModal: {
        flexShrink: 1,
    },

    periodoModal: {
        gap: 4,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
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

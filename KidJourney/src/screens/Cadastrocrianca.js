import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { BotaoPrincipal } from '../components/Botaoprincipal';
import { RadioButton } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { db } from '../config/firebase';

const opcoesEspecificidades = [
    'Alergia ao Leite de Vaca (APLV)',
    'Alergia a Ovo',
    'Alergia a Soja',
    'Alergia a Trigo',
    'Alergia a Amendoim / Castanhas',
    'Alergia a Peixes / Frutos do Mar',
    'Intolerância a Lactose',
    'Intolerância a Frutose',
    'Doença Celíaca (Restrição a Glúten)',
    'Diabetes Infantil (Tipo 1)',
    'Refluxo Gastroesofágico',
    'Constipação Crônica',
    'Prematuridade (Idade Corrigida)',
    'Seletividade Alimentar Sensorial (TEA)',
    'Dificuldade de Foco / Agitação (TDAH)',
    'Dificuldade de Mastigação',
    'Dificuldade de Deglutição (Disfagia)',
    'Reflexo de Gag Sensível',
    'Fase de Dentição (Nascimento de Dentes)',
    'Neofobia Alimentar (Rejeição a Novos Alimentos)',
    'Vegetarianismo',
    'Veganismo',
    'Dieta Sem Açúcar',
    'Introdução Alimentar (Transição para Sólidos)',
];

export default function CadastrocriancaScreen({ navigation }) {
    const { user } = useAuth();
    const [nome, setNome] = useState('');
    const [value, setValue] = useState('');
    const [dateText, setDateText] = useState('');
    const [idadeDetalhada, setIdadeDetalhada] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    const [especificidade, setEspecificidade] = useState('');
    const [especificidades, setEspecificidades] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const calcularIdadeExata = (dataNascimento) => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);

        let anos = hoje.getFullYear() - nascimento.getFullYear();
        let meses = hoje.getMonth() - nascimento.getMonth();
        let dias = hoje.getDate() - nascimento.getDate();

        if (dias < 0) {
            meses--;
            const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
            dias += ultimoDiaMesAnterior;
        }
        if (meses < 0) {
            anos--;
            meses += 12;
        }
        return { anos, meses, dias };
    };

    const handleConfirm = (date) => {
        const formattedDate = date.toLocaleDateString('pt-BR');
        setDateText(formattedDate);
        const resultadoIdade = calcularIdadeExata(date);
        setIdadeDetalhada(resultadoIdade);
        hideDatePicker();
    };

    function adicionarEspecificidade() {
        if (!especificidade || especificidades.includes(especificidade)) return;
        setEspecificidades([...especificidades, especificidade]);
        setEspecificidade('');
    }

    const renderTextoIdade = () => {
        if (!idadeDetalhada) return null;
        const { anos, meses, dias } = idadeDetalhada;
        const partes = [];
        if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
        if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
        if (dias > 0 || partes.length === 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
        if (partes.length === 1) return partes[0];
        if (partes.length === 2) return `${partes[0]} e ${partes[1]}`;
        return `${partes[0]}, ${partes[1]} e ${partes[2]}`;
    };

    async function cadastrarCrianca() {
        if (!nome.trim() || !value || !dateText) {
            Alert.alert('Faltam informações', 'Preencha o nome, sexo e data de nascimento.');
            return;
        }

        if (!user?.uid) {
            Alert.alert('Não foi possível cadastrar', 'Entre na sua conta e tente novamente.');
            return;
        }

        const listaEspecificidades = [...especificidades];
        if (especificidade && !listaEspecificidades.includes(especificidade)) {
            listaEspecificidades.push(especificidade);
        }

        setSalvando(true);

        try {
            await addDoc(collection(db, 'usuarios', user.uid, 'criancas'), {
                nome: nome.trim(),
                sexo: value === 'masculino' ? 'Masculino' : 'Feminino',
                dataNascimento: dateText,
                idade: renderTextoIdade(),
                especificidades: listaEspecificidades,
                criadoEm: serverTimestamp(),
            });
            navigation.goBack();
        } catch {
            Alert.alert('Não foi possível cadastrar', 'Confira o Firestore e tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, backgroundColor: '#BFDE6C60', width: 40, height: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="arrow-back" size={24} color="#326c00" />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>Cadastro Criança</Text>
                </View>
                <FontAwesome5 name="baby" size={100} color="#326c00" />
                <Input
                    texto={nome}
                    placeholder="Nome da Criança"
                    keyboardType="default"
                    autoCapitalize="words"
                    setTexto={setNome}
                />
                <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
                    <View style={{ flexDirection: 'row', gap: 50, }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="masculino" />
                            <Text style={styles.link}>Masculino</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <RadioButton value="feminino" />
                            <Text style={styles.link}>Feminino</Text>
                        </View>
                    </View>
                </RadioButton.Group>
                <TouchableOpacity onPress={showDatePicker} style={{ width: '100%', }}>
                    <View pointerEvents="none" style={{ width: '100%', }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Data de Nascimento"
                            placeholderTextColor="#999"
                            value={dateText}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    confirmTextIOS="Confirmar"
                    cancelTextIOS="Cancelar"
                    maximumDate={new Date()}
                />
                {idadeDetalhada !== null && (
                    <Text style={styles.resultado}>
                        A criança tem <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#326c00' }}>{renderTextoIdade()}</Text>.
                    </Text>
                )}
                <View style={styles.containerPicker}>
                    <Picker selectedValue={especificidade} onValueChange={setEspecificidade} style={styles.picker}>
                        <Picker.Item label="Selecione uma especificidade..." value="" enabled={false} />
                        {opcoesEspecificidades.map((opcao) => (
                            <Picker.Item key={opcao} label={opcao} value={opcao} />
                        ))}
                    </Picker>
                </View>
                <TouchableOpacity style={styles.addBotao} onPress={adicionarEspecificidade}>
                    <Text style={styles.addTexto}>Adicionar Especificidade +</Text>
                </TouchableOpacity>
                <View style={styles.especificidadesContainer}>
                    {especificidades.length === 0 ? (
                        <Text style={[styles.texto2, { textAlign: 'left', }]}>Você não adicionou nenhuma especificidade ainda.</Text>
                    ) : (
                        especificidades.map((item) => (
                            <Text key={item} style={[styles.texto2, { textAlign: 'left' }]}>{item}</Text>
                        ))
                    )}
                </View>
                <BotaoPrincipal texto={salvando ? 'Cadastrando...' : 'Cadastrar'} onPress={cadastrarCrianca} disabled={salvando} />
                <Text style={styles.texto2}>&copy; 2026 KidJourney</Text>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        paddingBottom: 20,
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

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 12,
        paddingHorizontal: 10,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#333',
        backgroundColor: '#fff',
    },

    resultado: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins_400Regular',
        marginTop: 10,
        textAlign: 'center'
    },

    containerPicker: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 12,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },

    picker: {
        width: '100%',
        color: '#333',
    },

    especificidadesContainer: {
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 12,
        padding: 10,
        borderStyle: 'dashed',
    },

    addBotao: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: '#bfde6c90',
        borderWidth: 1,
        borderColor: '#326c00',
        borderRadius: 50,
        alignSelf: 'flex-end',
    },

    addTexto: {
        color: '#326c00',
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    }
});

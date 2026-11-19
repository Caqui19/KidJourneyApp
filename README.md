# KidJourney — Aplicativo móvel

## Apresentação

O KidJourney é um aplicativo móvel de apoio a pais, mães e responsáveis durante os primeiros anos de vida da criança. Ele reúne recursos para organizar informações da criança, acompanhar aspectos da alimentação e do sono e consultar recomendações relacionadas à etapa de desenvolvimento e às especificidades registradas no perfil.

## Problema e objetivo

Encontrar orientações adequadas para cada criança pode ser difícil, especialmente para famílias que estão passando pela primeira experiência de cuidado. O objetivo do KidJourney é apoiar esse acompanhamento com informações organizadas e recomendações personalizadas, considerando dados como idade, etapa e especificidades alimentares. O aplicativo também permite registrar informações da rotina para que a família acompanhe os dados e consulte relatórios.

## Público-alvo

- Pais, mães e responsáveis por crianças de 0 a 5 anos, especialmente aqueles que estão vivendo a primeira experiência de cuidado;
- Profissionais parceiros que produzem recomendações para as famílias por meio da plataforma KidJourney.

## Principais funcionalidades

- Cadastro, login e recuperação de senha;
- Perfil de usuário e gerenciamento de uma ou mais crianças;
- Registro de idade e especificidades alimentares da criança;
- Sugestões de alimentos relacionadas à faixa etária e às especificidades cadastradas;
- Registro de refeições e informações de sono;
- Relatórios diários com indicadores relacionados aos registros e aos horários informados;
- Consulta, por meio de modal, de referências sobre alimentação e sono;
- Recomendações publicadas por profissionais parceiros, filtradas conforme a idade e as especificidades da criança;
- Registro de visualizações de recomendações;
- Anotações para organização da família;
- Recursos Premium identificados pelo perfil do usuário.

Os registros de alimentação, sono e relatórios são recursos Premium. O projeto prevê a identificação desse acesso pelo campo **premium** no perfil do usuário. O aplicativo não realiza cobrança de assinatura por uma plataforma de pagamento.

## Tecnologias e ferramentas

- **React Native** para desenvolvimento da interface móvel;
- **Expo** para execução e gerenciamento do aplicativo;
- **React Navigation** para navegação entre telas;
- **Firebase Authentication** para cadastro e autenticação;
- **Cloud Firestore** para perfis, dados das crianças, registros e recomendações;
- **AsyncStorage** para persistência local utilizada pelo aplicativo e pela autenticação no React Native;
- **React Native Paper**, **Expo Vector Icons** e componentes do React Native para elementos visuais;
- **Git e GitHub** para versionamento e disponibilização do código.

## Integrantes do grupo

- **Alvaro Takeshi Kawaguti Barbosa** — design técnico, organização e correção de problemas;
- **André Luíz Alves dos Santos Souza** — cofundador e idealizador; design, comunicação e coleta de dados;
- **Denis de Lucas Reis Silva** — idealizador; design, organização de arquivos, pesquisa de campo e análise de dados;
- **Isaac Alamos Oliveira** — desenvolvimento, organização e ajustes técnicos do aplicativo;
- **João Vitor Gonçalves Canuto** — design, documentação, ideias, divulgação e coleta por formulário.

## Instalação e execução

### Pré-requisitos

- Node.js e npm;
- Expo Go em um dispositivo móvel ou um emulador Android configurado;
- Projeto Firebase configurado com Authentication e Cloud Firestore.

### Configuração

Na raiz do repositório, acesse a pasta do aplicativo e instale as dependências:

```bash
cd KidJourney
npm install
```

Crie um arquivo **.env** dentro da pasta **KidJourney** e informe os dados de configuração do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_DATABASE_URL=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Os valores devem ser obtidos na configuração do projeto Firebase. Não adicione o arquivo **.env** ao GitHub. As variáveis com o prefixo **EXPO*PUBLIC*** são incluídas no aplicativo; a proteção dos dados deve ser feita pelas regras de segurança do Firebase.

### Iniciar o aplicativo

```bash
npm start
```

O Expo exibirá um QR Code. Leia-o com o Expo Go para abrir o aplicativo em um dispositivo compatível.

Para iniciar diretamente em um emulador Android:

```bash
npm run android
```

Para executar a versão web:

```bash
npm run web
```

O comando **npm run ios** está disponível, mas a execução nativa para iOS requer macOS e Xcode.

## Estrutura do repositório

```text
README.md
KidJourney/
├── src/
├── App.js
├── Routes.js
├── app.json
├── eas.json
├── package.json
└── .env                 # configuração local; não deve ser enviada ao GitHub
```

## Observação sobre dados e segurança

O aplicativo utiliza Firebase Authentication e Cloud Firestore. As permissões para acessar perfis, crianças, registros e publicações devem ser aplicadas nas regras do Firestore. A configuração do Firebase usada no aplicativo não substitui essas regras, que são responsáveis por controlar o acesso aos dados.

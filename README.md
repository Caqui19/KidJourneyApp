# KidJourney

Aplicativo Expo com API Node/Express e MySQL. O cadastro cria a conta e inicia a sessão; o login autentica o usuário; o logout encerra a sessão no servidor e apaga os tokens locais.

## Configuração local

1. Crie um banco MySQL para o app.
2. Copie `backend/.env.example` para `backend/.env` e preencha os dados do banco. Gere `JWT_SECRET` com um gerador criptográfico; por exemplo, execute `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` e use o resultado.
3. No diretório `backend`, execute `npm install` e depois `npm run dev`.
4. Copie `KidJourney/.env.example` para `KidJourney/.env`. Configure `EXPO_PUBLIC_API_URL` com o endereço do computador na rede local, como `http://192.168.0.10:3000`.
5. No diretório `KidJourney`, execute `npm install` e `npx expo start --tunnel`. O túnel do Expo conecta o celular ao Metro; a API também precisa estar acessível na rede. Libere a porta 3000 no firewall local se necessário.

Use `localhost` apenas quando o app e a API estiverem no mesmo dispositivo. Em um aparelho físico, use o IP local do computador. HTTP é aceito apenas durante o desenvolvimento; versões publicadas exigem HTTPS.

## Sessões e segurança

- As senhas são armazenadas com bcrypt e nunca retornadas pela API.
- O access token expira em 15 minutos. O refresh token é aleatório, rotativo, armazenado apenas como hash no banco e expira em 30 dias.
- O app salva tokens no Keychain do iOS e no armazenamento protegido pelo Android Keystore. Na versão web, a sessão fica apenas na memória e termina ao recarregar a página.
- As rotas do app só são mostradas depois da validação da sessão. A API também verifica o token e a sessão ativa em cada rota protegida.
- Configure `CORS_ORIGINS` com as origens exatas da versão web e `TRUST_PROXY_HOPS` conforme a quantidade de proxies HTTPS confiáveis. Não habilite curingas.
- Em produção, use `DB_SSL=true` para criptografar a conexão com o MySQL.
- O limitador de tentativas usa armazenamento em memória por processo. Para múltiplas instâncias de produção, conecte um armazenamento compartilhado ao limitador e configure alertas, backups e atualização regular das dependências.
- O app ainda não confirma a posse do email, não oferece recuperação de senha nem login Google. Antes de publicar, configure confirmação e recuperação por email e associe cada aceite a termos e política acessíveis, guardando a versão e a data.

`sequelize.sync()` cria as tabelas que ainda não existem; ele não altera automaticamente uma tabela existente. Prepare uma migração de banco antes de mudar o esquema em uma instalação já ativa.

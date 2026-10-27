import {
    createUserWithEmailAndPassword,
    deleteUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function validarPerfil(usuario) {
    const referenciaPerfil = doc(db, 'usuarios', usuario.uid);
    const perfilSalvo = await getDoc(referenciaPerfil);

    if (!perfilSalvo.exists()) {
        const error = new Error('Não encontramos os dados dessa conta.');
        error.code = 'auth/profile-not-found';
        throw error;
    }

    const dados = perfilSalvo.data();

    if (!dados.perfil) {
        await setDoc(referenciaPerfil, {
            nome: usuario.displayName || dados.nome || '',
            email: usuario.email,
            perfil: 'cliente',
            aprovado: false,
        }, { merge: true });
        return usuario;
    }

    if (dados.perfil === 'cliente' && dados.aprovado !== false) {
        await setDoc(referenciaPerfil, { aprovado: false }, { merge: true });
        return usuario;
    }

    if (dados.perfil !== 'cliente') {
        const error = new Error('Esta conta não tem acesso a este aplicativo.');
        error.code = 'auth/role-not-allowed';
        throw error;
    }

    return usuario;
}

export async function cadastrar(nome, email, senha, politicaSegurancaAceita, aoCriarConta) {
    if (senha.length < 8) {
        const error = new Error('A senha precisa ter pelo menos 8 caracteres.');
        error.code = 'auth/weak-password';
        throw error;
    }

    if (politicaSegurancaAceita !== true) {
        const error = new Error('Leia e aceite a Política de Segurança para criar sua conta.');
        error.code = 'policy/not-accepted';
        throw error;
    }

    const conta = await createUserWithEmailAndPassword(auth, email.trim(), senha);

    try {
        await updateProfile(conta.user, { displayName: nome.trim() });
        await setDoc(doc(db, 'usuarios', conta.user.uid), {
            nome: nome.trim(),
            email: conta.user.email,
            perfil: 'cliente',
            aprovado: false,
            politicaSegurancaAceita: true,
            aceitoEm: serverTimestamp(),
        });
        aoCriarConta(conta.user);
    } catch (error) {
        await deleteUser(conta.user).catch(() => { });
        await signOut(auth).catch(() => { });
        throw error;
    }

    return conta.user;
}

export async function entrar(email, senha) {
    const conta = await signInWithEmailAndPassword(auth, email.trim(), senha);

    try {
        await validarPerfil(conta.user);
        return conta;
    } catch (error) {
        await signOut(auth).catch(() => { });
        throw error;
    }
}

export async function recuperarSenha(email) {
    return sendPasswordResetEmail(auth, email.trim());
}

export async function sair() {
    return signOut(auth);
}

export function mensagemErro(error) {
    const mensagens = {
        'auth/email-already-in-use': 'Esse email já está cadastrado. Entre na sua conta.',
        'auth/invalid-email': 'Confira se o email está escrito corretamente.',
        'auth/weak-password': 'A senha precisa ter pelo menos 8 caracteres.',
        'auth/invalid-credential': 'Email ou senha incorretos.',
        'auth/invalid-login-credentials': 'Email ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/profile-not-found': 'Não encontramos os dados dessa conta. Entre em contato para recuperar o acesso.',
        'auth/role-not-allowed': 'Esta conta não tem acesso a este aplicativo.',
        'policy/not-accepted': 'Leia e aceite a Política de Segurança para criar sua conta.',
    };

    return mensagens[error.code] || 'Não foi possível concluir agora. Tente novamente.';
}

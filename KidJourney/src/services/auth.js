import {
    createUserWithEmailAndPassword,
    deleteUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function cadastrar(nome, email, senha, aceites, aoCriarConta) {
    if (senha.length < 8) {
        const error = new Error('A senha precisa ter pelo menos 8 caracteres.');
        error.code = 'auth/weak-password';
        throw error;
    }

    if (!aceites.termosUsoAceito || !aceites.termosServicoAceito || !aceites.politicaPrivacidadeAceita) {
        const error = new Error('Aceite os termos e a política para criar sua conta.');
        error.code = 'terms/not-accepted';
        throw error;
    }

    const conta = await createUserWithEmailAndPassword(auth, email.trim(), senha);

    try {
        await updateProfile(conta.user, { displayName: nome.trim() });
        aoCriarConta(conta.user);
        await setDoc(doc(db, 'usuarios', conta.user.uid), {
            nome: nome.trim(),
            email: conta.user.email,
            termosUsoAceito: true,
            termosServicoAceito: true,
            politicaPrivacidadeAceita: true,
            aceitoEm: serverTimestamp(),
        });
    } catch (error) {
        await deleteUser(conta.user).catch(() => {});
        await signOut(auth).catch(() => {});
        throw error;
    }

    return conta.user;
}

export async function entrar(email, senha) {
    return signInWithEmailAndPassword(auth, email.trim(), senha);
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
        'auth/user-not-found': 'Email ou senha incorretos.',
        'auth/wrong-password': 'Email ou senha incorretos.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
        'auth/network-request-failed': 'Confira sua conexão e tente novamente.',
        'auth/operation-not-allowed': 'Ative email e senha nos métodos de login do Firebase.',
        'terms/not-accepted': 'Aceite os termos e a política para criar sua conta.',
        'permission-denied': 'Não foi possível salvar seus dados. Confira as regras do Firebase.',
        'failed-precondition': 'Ative o Firestore no projeto Firebase antes de cadastrar.',
    };

    return mensagens[error.code] || 'Não foi possível concluir agora. Tente novamente.';
}